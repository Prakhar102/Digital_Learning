/**
 * ragService.js  —  Real RAG (Retrieval-Augmented Generation)
 *
 * Pipeline:
 *  1. RETRIEVE  – Pull live course/module/lesson content from LMS backend
 *  2. CHUNK     – Split into overlapping text chunks (400 tokens ~= 1600 chars)
 *  3. RANK      – BM25-style TF-IDF scoring + Gemini embedding cosine similarity
 *  4. AUGMENT   – Build a grounded context prompt with the top-k chunks
 *  5. GENERATE  – Send to Gemini 1.5 Flash and stream back the answer
 */

import { getAllCourses, getCourseDetails } from "./courseService.js";
import { getLearnerRagContext } from "./learnerRagContext.js";
import { getCurrentUser } from "./userService.js";
import { geminiGenerate, geminiEmbed, isApiKeySet } from "./geminiService.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const CHUNK_SIZE = 1600;   // characters per chunk (~400 tokens)
const CHUNK_OVERLAP = 200; // overlap between chunks
const TOP_K = 6;           // chunks passed to the LLM

const DOMAIN_METADATA = [
  { id: "course-materials", title: "Course Materials", description: "Course, module, and lesson content from the LMS." },
];

// ─── In-memory stores ─────────────────────────────────────────────────────────
let documentChunks = [];       // {id, title, source, content, courseId, tags}[]
let embeddingCache = {};       // chunkId -> Float32Array
let lastSyncAt = null;

// ─── Text helpers ─────────────────────────────────────────────────────────────
const asArray = (v) => (Array.isArray(v) ? v : []);
const textOf = (...vals) =>
  vals.find((v) => typeof v === "string" && v.trim())?.trim() || "";

/** Split a long text into overlapping chunks */
function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size - overlap;
  }
  return chunks;
}

// ─── 1. RETRIEVE + CHUNK ──────────────────────────────────────────────────────
export const syncLiveKnowledgeFromBackend = async () => {
  const courses = asArray(await getAllCourses());
  const details = await Promise.all(
    courses.map((c) => getCourseDetails(c.id).catch(() => c))
  );

  documentChunks = [];

  details.forEach((course) => {
    const courseTitle = textOf(course.title) || `Course #${course.id}`;
    const category = typeof course.category === "string" ? course.category : course.category?.name;
    const tags = [category, course.level].filter(Boolean);

    const addChunks = (rawText, srcTitle, srcLabel) => {
      if (!rawText) return;
      chunkText(rawText).forEach((chunk, i) => {
        documentChunks.push({
          id: `${course.id}-${srcLabel}-${i}`,
          title: srcTitle,
          source: `${courseTitle} · ${srcTitle}`,
          content: chunk,
          courseId: course.id,
          tags,
          domain: "course-materials",
        });
      });
    };

    addChunks(
      textOf(course.description, course.summary, course.content),
      courseTitle,
      "overview"
    );

    asArray(course.modules).forEach((mod) => {
      const modTitle = textOf(mod.title, mod.name) || `Module in ${courseTitle}`;
      const modText = textOf(mod.description, mod.summary, mod.content, mod.notes);
      addChunks([modTitle, modText].filter(Boolean).join("\n\n"), modTitle, `mod-${mod.id}`);

      asArray(mod.lessons).forEach((lesson) => {
        const lessonTitle = textOf(lesson.title, lesson.name) || `Lesson`;
        const lessonText = textOf(
          lesson.description,
          lesson.summary,
          lesson.content,
          lesson.notes,
          lesson.transcript
        );
        addChunks(
          [lessonTitle, lessonText].filter(Boolean).join("\n\n"),
          lessonTitle,
          `lesson-${lesson.id}`
        );
      });
    });
  });

  lastSyncAt = new Date().toISOString();
  return documentChunks;
};

// ─── 2. BM25-style Lexical Scoring ───────────────────────────────────────────
function bm25Score(query, chunk, k1 = 1.5, b = 0.75, avgLen = 800) {
  const terms = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 1);
  const docLen = chunk.content.length;
  const text = `${chunk.title} ${chunk.content} ${chunk.tags.join(" ")}`.toLowerCase();

  let score = 0;
  for (const term of terms) {
    const tf = (text.split(term).length - 1);
    if (!tf) continue;
    const idf = Math.log((documentChunks.length + 1) / (1 + documentChunks.filter((c) => c.content.toLowerCase().includes(term)).length));
    score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLen / avgLen))));
    // Title boost
    if (chunk.title.toLowerCase().includes(term)) score += 2;
  }
  return score;
}

// ─── 3. Cosine similarity (for embeddings) ───────────────────────────────────
function cosineSim(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

// ─── 4. Hybrid Retrieve ──────────────────────────────────────────────────────
export const searchKnowledgeBase = async ({
  query,
  domain = "all",
  courseId = null,
  limit = TOP_K,
  useEmbeddings = false,
}) => {
  if (!documentChunks.length) await syncLiveKnowledgeFromBackend();

  const candidates = documentChunks.filter(
    (c) =>
      (domain === "all" || c.domain === domain) &&
      (!courseId || String(c.courseId) === String(courseId))
  );

  // BM25 lexical scoring (always)
  const withScores = candidates.map((c) => ({
    ...c,
    bm25: bm25Score(query, c),
  }));

  // Optionally add embedding-based semantic similarity
  if (useEmbeddings && isApiKeySet()) {
    try {
      const queryEmbedding = await geminiEmbed(query);
      for (const chunk of withScores) {
        if (!embeddingCache[chunk.id]) {
          embeddingCache[chunk.id] = await geminiEmbed(chunk.content.slice(0, 500));
        }
        chunk.embeddingSim = cosineSim(queryEmbedding, embeddingCache[chunk.id]);
      }
      // Hybrid score = 0.5 * BM25 (normalised) + 0.5 * embedding cosine
      const maxBm25 = Math.max(...withScores.map((c) => c.bm25), 1);
      withScores.forEach((c) => {
        c.hybridScore = 0.5 * (c.bm25 / maxBm25) + 0.5 * (c.embeddingSim || 0);
      });
    } catch {
      withScores.forEach((c) => { c.hybridScore = c.bm25; });
    }
  } else {
    withScores.forEach((c) => { c.hybridScore = c.bm25; });
  }

  return withScores
    .filter((c) => c.hybridScore > 0)
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, limit)
    .map((c) => ({
      ...c,
      matchedExcerpt: c.content.slice(0, 400),
      citation: `${c.title} (${c.source})`,
      searchScore: c.hybridScore,
      matchedTermCount: query.toLowerCase().split(/\s+/).filter((t) => c.content.toLowerCase().includes(t)).length,
    }));
};

// ─── 5. RAG Answer Generation ─────────────────────────────────────────────────
const RAG_SYSTEM_PROMPT = `You are an expert AI learning mentor for an enterprise Learning Management System (LMS).
You answer based ONLY on the retrieved course content provided in the context.
Always be precise, educational, and well-structured in your responses.
If the context doesn't contain enough information, say so clearly.
Format your answers in clear paragraphs. Cite the source titles when referencing specific material.
Never fabricate information not present in the context.`;

export const askRAGMentor = async ({
  query,
  courseId = null,
  domain = "all",
  learnerId = null,
  learner = null,
  chatHistory = [],
}) => {
  // ── Personal query path (learner's own data) ──
  const isPersonal = /\b(my|mine|i |i'm|myself|mera|meri|apna)\b/i.test(query);
  if (isPersonal) {
    let activeLearner = learner;
    let activeId = learnerId;
    if (!activeId) {
      activeLearner = activeLearner || (await getCurrentUser());
      activeId = activeLearner?.id;
    }
    if (activeId) {
      const context = await getLearnerRagContext(activeId, activeLearner);
      const personalContext = context.sources
        .map((s) => `## ${s.title}\n${s.content}`)
        .join("\n\n");

      if (isApiKeySet()) {
        const historyMessages = chatHistory.map((h) => ({
          role: h.sender === "user" ? "user" : "model",
          content: h.text,
        }));

        const result = await geminiGenerate({
          systemInstruction: `${RAG_SYSTEM_PROMPT}\n\nYou have access to the learner's personal LMS records:\n\n${personalContext}`,
          messages: [...historyMessages, { role: "user", content: query }],
          temperature: 0.4,
        });
        return { answer: result.text, sources: context.sources, generatedAt: new Date().toISOString(), model: "gemini-3.8-flash" };
      }

      // Fallback without Gemini
      const totals = context.totals;
      return {
        answer: `Enrolled: ${totals.enrolledCourses} courses (${totals.completedCourses} completed). Certificates: ${totals.certificates}. Assessments passed: ${totals.passedAssessments}.`,
        sources: context.sources,
        generatedAt: new Date().toISOString(),
        model: "fallback",
      };
    }
  }

  // ── Knowledge base RAG path ──
  const sources = await searchKnowledgeBase({ query, domain, courseId, limit: TOP_K });

  if (!isApiKeySet()) {
    // No Gemini key — return raw retrieval
    const answer = sources.length
      ? `Retrieved ${sources.length} relevant sections:\n\n${sources.map((s) => `**${s.title}**\n${s.matchedExcerpt}`).join("\n\n---\n\n")}`
      : "No matching content found in the course materials. Ensure course descriptions and module content are populated in the LMS.";
    return { answer, sources, generatedAt: new Date().toISOString(), model: "retrieval-only" };
  }

  if (!sources.length) {
    return {
      answer: "I couldn't find relevant content in the available course materials for this query. Try rephrasing or check if the topic is covered in your enrolled courses.",
      sources: [],
      generatedAt: new Date().toISOString(),
      model: "gemini-3.8-flash",
    };
  }

  // Build grounded context
  const contextBlocks = sources
    .map((s, i) => `[Source ${i + 1}: ${s.title}]\n${s.content}`)
    .join("\n\n---\n\n");

  const historyMessages = chatHistory.map((h) => ({
    role: h.sender === "user" ? "user" : "model",
    content: h.text,
  }));

  const augmentedQuery = `Based on the following course material context, answer the learner's question.\n\n=== CONTEXT ===\n${contextBlocks}\n\n=== QUESTION ===\n${query}`;

  const result = await geminiGenerate({
    systemInstruction: RAG_SYSTEM_PROMPT,
    messages: [...historyMessages, { role: "user", content: augmentedQuery }],
    temperature: 0.3,
    maxOutputTokens: 1024,
  });

  return {
    answer: result.text || "Unable to generate a response. Please try again.",
    sources,
    generatedAt: new Date().toISOString(),
    model: "gemini-3.8-flash",
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const getAllKnowledgeDomains = () =>
  DOMAIN_METADATA.map((d) => ({ ...d, count: documentChunks.filter((c) => c.domain === d.id).length }));

export const getKnowledgeLastSyncAt = () => lastSyncAt;

export const getKnowledgeByDomain = (key) =>
  documentChunks.filter((c) => c.domain === key);
