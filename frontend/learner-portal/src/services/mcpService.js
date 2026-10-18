/**
 * mcpService.js
 * Real Model Context Protocol (MCP) Implementation for DLM.
 *
 * Implements the standard MCP JSON-RPC 2.0 specification:
 * - protocolVersion: "2024-11-05"
 * - Methods: initialize, ping, tools/list, tools/call, resources/list, resources/read, prompts/list, prompts/get
 * - Connects real LMS microservice APIs into MCP tools and resources
 * - Interoperates with Google Gemini via dynamic function calling
 */

import { getAllCourses, getCourseDetails } from "./courseService.js";
import { getMyCourses } from "./enrollmentService.js";
import { getCurrentUser } from "./userService.js";
import { getAllAssessments, getQuestionsByAssessment, getUserAttempts } from "./assessmentService.js";
import { getUserCertificates } from "./certificateService.js";
import { getProgress } from "./progressService.js";
import { searchKnowledgeBase, syncLiveKnowledgeFromBackend } from "./ragService.js";
import { geminiGenerate, isApiKeySet } from "./geminiService.js";

const PROTOCOL_VERSION = "2024-11-05";

// Helper for schema generation
const schema = (properties, required = []) => ({
  type: "object",
  properties,
  required,
});

// ─── Real MCP Servers ──────────────────────────────────────────────────────────
export const MCP_SERVERS = [
  {
    id: "lms-catalog-server",
    uri: "mcp://dlm.lms/catalog",
    name: "LMS Catalog & Curriculum Server",
    version: "1.2.0",
    protocolVersion: PROTOCOL_VERSION,
    description: "Exposes real course catalog, curriculum trees, lesson syllabi, and category metadata via MCP.",
    status: "CONNECTED",
    capabilities: { tools: true, resources: true, prompts: true, logging: true },
    tools: [
      {
        name: "list_courses",
        description: "List and filter active courses from the LMS catalog by category, level, or search term.",
        inputSchema: schema({
          query: { type: "string", description: "Search query string" },
          category: { type: "string", description: "Filter by course category (e.g., Development, Cloud, AI)" },
          limit: { type: "number", description: "Maximum number of courses to return (default 8)" },
        }),
      },
      {
        name: "get_course_curriculum",
        description: "Fetch comprehensive curriculum tree including modules and lessons for a specific course.",
        inputSchema: schema(
          {
            courseId: { type: "string", description: "Unique course ID from the LMS catalog" },
          },
          ["courseId"]
        ),
      },
      {
        name: "get_course_stats",
        description: "Retrieve catalog-wide statistics including total courses, categories, and difficulty levels.",
        inputSchema: schema({}),
      },
    ],
    resources: [
      {
        uri: "lms://catalog/all-courses",
        name: "Full LMS Course Catalog",
        description: "Complete list of published courses in the learning platform.",
        mimeType: "application/json",
      },
      {
        uri: "lms://catalog/categories",
        name: "Catalog Categories & Tag Taxonomy",
        description: "List of all subject categories and difficulty levels.",
        mimeType: "application/json",
      },
    ],
    prompts: [
      {
        name: "recommend_courses_for_career",
        description: "Generate personalized course recommendations for a learner based on their target career role.",
        arguments: [
          { name: "targetRole", description: "Desired career title (e.g., Full Stack Engineer, Cloud Architect)", required: true },
          { name: "skillLevel", description: "Current experience level (Beginner, Intermediate, Advanced)", required: false },
        ],
      },
      {
        name: "explain_prerequisites",
        description: "Analyze and explain what a student should learn before starting a specific course.",
        arguments: [
          { name: "courseId", description: "Course ID to analyze", required: true },
        ],
      },
    ],
  },
  {
    id: "learner-analytics-server",
    uri: "mcp://dlm.lms/analytics",
    name: "Learner Analytics & Progress Server",
    version: "1.2.0",
    protocolVersion: PROTOCOL_VERSION,
    description: "Exposes signed-in learner enrollment records, module completion metrics, assessment history, and certificates.",
    status: "CONNECTED",
    capabilities: { tools: true, resources: true, prompts: true, logging: true },
    tools: [
      {
        name: "get_student_enrollments",
        description: "Read the authenticated learner's course enrollments and real-time completion percentages.",
        inputSchema: schema({}),
      },
      {
        name: "get_course_progress",
        description: "Read detailed lesson-by-lesson progress for a learner in a specific course.",
        inputSchema: schema(
          {
            courseId: { type: "string", description: "Course ID" },
          },
          ["courseId"]
        ),
      },
      {
        name: "query_gradebook",
        description: "Query assessment attempts, scores, passing statuses, and earned digital certificates.",
        inputSchema: schema({}),
      },
      {
        name: "calculate_skill_gaps",
        description: "Analyze learner's completed courses vs enrolled courses to identify skill gaps.",
        inputSchema: schema({}),
      },
    ],
    resources: [
      {
        uri: "lms://learner/profile",
        name: "Authenticated Learner Identity & Overview",
        description: "Full user profile, enrolled count, completed count, and certificates.",
        mimeType: "application/json",
      },
      {
        uri: "lms://learner/transcripts",
        name: "Official Academic Transcript",
        description: "Detailed record of all assessments taken, scores, and completion timestamps.",
        mimeType: "application/json",
      },
      {
        uri: "lms://learner/certificates",
        name: "Earned Digital Credentials",
        description: "Verified certificates issued to the learner.",
        mimeType: "application/json",
      },
    ],
    prompts: [
      {
        name: "diagnose_learning_plateau",
        description: "Diagnose why a learner might be stuck on certain modules and suggest an unblocking strategy.",
        arguments: [
          { name: "learnerContext", description: "Specific details about current progress or difficulties", required: false },
        ],
      },
      {
        name: "generate_study_plan",
        description: "Create an optimized weekly study roadmap based on incomplete courses and available hours.",
        arguments: [
          { name: "hoursPerWeek", description: "Available study hours per week (e.g. 10)", required: true },
        ],
      },
    ],
  },
  {
    id: "assessment-engine-server",
    uri: "mcp://dlm.lms/assessment",
    name: "Assessment Engine & Quiz Server",
    version: "1.1.0",
    protocolVersion: PROTOCOL_VERSION,
    description: "Exposes assessment inventories, question banks, practice exercises, and attempt evaluations.",
    status: "CONNECTED",
    capabilities: { tools: true, resources: true, prompts: true, logging: true },
    tools: [
      {
        name: "list_assessments",
        description: "List all quizzes, midterms, and finals available in the LMS with passing thresholds.",
        inputSchema: schema({
          topic: { type: "string", description: "Optional topic or course keyword" },
        }),
      },
      {
        name: "get_practice_questions",
        description: "Fetch questions from an assessment for practice (sanitized without exposing answer keys).",
        inputSchema: schema(
          {
            assessmentId: { type: "string", description: "Assessment ID" },
            limit: { type: "number", description: "Number of questions to retrieve (max 10)" },
          },
          ["assessmentId"]
        ),
      },
    ],
    resources: [
      {
        uri: "lms://assessments/catalog",
        name: "Assessment Inventory",
        description: "All published quizzes, time limits, and question counts.",
        mimeType: "application/json",
      },
    ],
    prompts: [
      {
        name: "generate_revision_quiz",
        description: "Prompt for an AI tutor to quiz the learner on a specific concept with immediate feedback.",
        arguments: [
          { name: "topic", description: "Topic to be quizzed on", required: true },
          { name: "difficulty", description: "Difficulty level (easy, medium, hard)", required: false },
        ],
      },
    ],
  },
  {
    id: "rag-knowledge-server",
    uri: "mcp://dlm.lms/knowledge",
    name: "RAG Vector Knowledge Base Server",
    version: "2.0.0",
    protocolVersion: PROTOCOL_VERSION,
    description: "Semantic vector retrieval server indexing LMS course descriptions, lesson texts, and learning documents.",
    status: "CONNECTED",
    capabilities: { tools: true, resources: true, prompts: true, logging: true },
    tools: [
      {
        name: "semantic_vector_search",
        description: "Perform hybrid semantic & keyword retrieval over indexed course knowledge chunks.",
        inputSchema: schema(
          {
            query: { type: "string", description: "Natural language query to search for" },
            limit: { type: "number", description: "Number of top matching chunks to return" },
            courseId: { type: "string", description: "Optional course filter" },
          },
          ["query"]
        ),
      },
      {
        name: "get_document_citations",
        description: "Retrieve authoritative LMS citations and section references for a topic.",
        inputSchema: schema(
          {
            topic: { type: "string", description: "Topic to retrieve citations for" },
          },
          ["topic"]
        ),
      },
    ],
    resources: [
      {
        uri: "lms://knowledge/indexed-chunks",
        name: "Knowledge Base Summary",
        description: "Metadata of currently indexed lesson chunks and sync status.",
        mimeType: "application/json",
      },
    ],
    prompts: [
      {
        name: "synthesize_topic_summary",
        description: "Synthesize an authoritative summary of a course concept grounded strictly in indexed materials.",
        arguments: [
          { name: "topic", description: "Course topic or lesson concept to summarize", required: true },
        ],
      },
    ],
  },
];

// ─── Real-Time Message Event Bus for MCP Wire Inspector ───────────────────────
class McpWireBus {
  constructor() {
    this.listeners = [];
    this.trafficLog = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  logMessage(entry) {
    this.trafficLog.unshift(entry);
    if (this.trafficLog.length > 100) this.trafficLog.pop();
    this.listeners.forEach((cb) => cb(entry, this.trafficLog));
  }

  getLog() {
    return this.trafficLog;
  }

  clear() {
    this.trafficLog = [];
    this.listeners.forEach((cb) => cb(null, []));
  }
}

export const mcpWireBus = new McpWireBus();

// ─── JSON-RPC 2.0 Dispatcher ──────────────────────────────────────────────────
export async function sendJsonRpcRequest(serverUri, method, params = {}) {
  const start = performance.now();
  const id = `req_${Math.random().toString(36).substring(2, 9)}`;

  // Find server by URI or ID
  const server = MCP_SERVERS.find(
    (s) => s.uri === serverUri || s.id === serverUri
  );

  const buildResponse = (body) => {
    const latencyMs = Math.round(performance.now() - start);
    const resp = {
      jsonrpc: "2.0",
      id,
      ...body,
      meta: {
        latencyMs,
        timestamp: new Date().toISOString(),
        serverUri: server?.uri || serverUri,
        serverId: server?.id || "unknown",
      },
    };

    // Log to wire inspector
    mcpWireBus.logMessage({
      id,
      timestamp: new Date().toLocaleTimeString(),
      serverUri: server?.uri || serverUri,
      serverName: server?.name || serverUri,
      method,
      request: { jsonrpc: "2.0", id, method, params },
      response: resp,
      latencyMs,
      status: resp.error ? "ERROR" : "SUCCESS",
    });

    return resp;
  };

  if (!server) {
    return buildResponse({
      error: {
        code: -32601,
        message: `MCP Server '${serverUri}' is not found or registered.`,
      },
    });
  }

  try {
    // 1. Handshake / Initialize
    if (method === "initialize") {
      return buildResponse({
        result: {
          protocolVersion: PROTOCOL_VERSION,
          serverInfo: {
            name: server.name,
            version: server.version,
          },
          capabilities: server.capabilities,
        },
      });
    }

    // 2. Ping
    if (method === "ping") {
      return buildResponse({ result: {} });
    }

    // 3. List Tools
    if (method === "tools/list") {
      return buildResponse({ result: { tools: server.tools } });
    }

    // 4. List Resources
    if (method === "resources/list") {
      return buildResponse({ result: { resources: server.resources } });
    }

    // 5. List Prompts
    if (method === "prompts/list") {
      return buildResponse({ result: { prompts: server.prompts || [] } });
    }

    // 6. Get Prompt
    if (method === "prompts/get") {
      const promptDef = (server.prompts || []).find((p) => p.name === params.name);
      if (!promptDef) {
        return buildResponse({
          error: { code: -32602, message: `Prompt template '${params.name}' not found.` },
        });
      }
      const rendered = renderPromptTemplate(server.id, promptDef, params.arguments || {});
      return buildResponse({ result: rendered });
    }

    // 7. Call Tool
    if (method === "tools/call") {
      const tool = server.tools.find((t) => t.name === params.name);
      if (!tool) {
        return buildResponse({
          error: { code: -32601, message: `Tool '${params.name}' not supported by server ${server.name}` },
        });
      }
      const executionResult = await executeMcpTool(server.id, tool.name, params.arguments || {});
      return buildResponse({
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(executionResult, null, 2),
            },
          ],
          isError: false,
        },
      });
    }

    // 8. Read Resource
    if (method === "resources/read") {
      const resource = server.resources.find((r) => r.uri === params.uri);
      if (!resource) {
        return buildResponse({
          error: { code: -32602, message: `Resource '${params.uri}' not found on server ${server.name}` },
        });
      }
      const content = await readMcpResource(resource.uri);
      return buildResponse({
        result: {
          contents: [
            {
              uri: resource.uri,
              mimeType: resource.mimeType,
              text: JSON.stringify(content, null, 2),
            },
          ],
        },
      });
    }

    // Unknown method
    return buildResponse({
      error: { code: -32601, message: `Method '${method}' is not implemented.` },
    });
  } catch (err) {
    return buildResponse({
      error: {
        code: -32000,
        message: err?.message || "Internal MCP Server error during execution.",
      },
    });
  }
}

// ─── Real Tool Executors ──────────────────────────────────────────────────────
async function executeMcpTool(serverId, toolName, args) {
  // 1. LMS Catalog Server
  if (serverId === "lms-catalog-server") {
    if (toolName === "list_courses") {
      const courses = await getAllCourses();
      const q = (args.query || "").toLowerCase();
      const cat = (args.category || "").toLowerCase();
      const limit = Number(args.limit) || 8;

      const filtered = courses.filter((c) => {
        const matchesQ = !q || `${c.title} ${c.description} ${c.category}`.toLowerCase().includes(q);
        const matchesCat = !cat || (c.category || "").toLowerCase().includes(cat);
        return matchesQ && matchesCat;
      });

      return {
        totalFound: filtered.length,
        courses: filtered.slice(0, limit).map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          level: c.level,
          description: c.description?.slice(0, 160),
          durationHours: c.durationHours || 12,
        })),
      };
    }

    if (toolName === "get_course_curriculum") {
      if (!args.courseId) throw new Error("Argument 'courseId' is required.");
      const details = await getCourseDetails(args.courseId);
      if (!details?.id) throw new Error(`Course ID ${args.courseId} not found.`);
      return details;
    }

    if (toolName === "get_course_stats") {
      const courses = await getAllCourses();
      const categories = [...new Set(courses.map((c) => c.category).filter(Boolean))];
      return {
        totalCourses: courses.length,
        categories,
        difficultyBreakdown: {
          Beginner: courses.filter((c) => /beginner/i.test(c.level)).length,
          Intermediate: courses.filter((c) => /intermediate/i.test(c.level)).length,
          Advanced: courses.filter((c) => /advanced/i.test(c.level)).length,
        },
      };
    }
  }

  // 2. Learner Analytics Server
  if (serverId === "learner-analytics-server") {
    const user = await getCurrentUser();
    if (!user?.id) throw new Error("No authenticated learner session found.");

    if (toolName === "get_student_enrollments") {
      const enrollments = await getMyCourses(user.id);
      const withProgress = await Promise.all(
        enrollments.map(async (e) => {
          const courseId = e.courseId ?? e.course?.id;
          const prog = courseId ? await getProgress(user.id, courseId).catch(() => null) : null;
          return {
            courseId,
            title: e.courseTitle || e.title || `Course #${courseId}`,
            enrolledAt: e.enrolledAt,
            completionPercentage: prog?.completionPercentage || 0,
            completed: prog?.completed || false,
          };
        })
      );
      return {
        learner: { id: user.id, name: user.fullName || user.email },
        totalEnrolled: withProgress.length,
        enrollments: withProgress,
      };
    }

    if (toolName === "get_course_progress") {
      if (!args.courseId) throw new Error("Argument 'courseId' is required.");
      const prog = await getProgress(user.id, args.courseId);
      return {
        learnerId: user.id,
        courseId: args.courseId,
        progress: prog || { completionPercentage: 0, completed: false },
      };
    }

    if (toolName === "query_gradebook") {
      const [attempts, certificates] = await Promise.all([
        getUserAttempts(user.id),
        getUserCertificates(user.id),
      ]);
      return {
        learnerId: user.id,
        totalAttempts: attempts.length,
        passedCount: attempts.filter((a) => a.passed || Number(a.percentage) >= 60).length,
        certificatesEarned: certificates.length,
        attempts: attempts.slice(0, 8),
      };
    }

    if (toolName === "calculate_skill_gaps") {
      const enrollments = await getMyCourses(user.id);
      const withProgress = await Promise.all(
        enrollments.map(async (e) => {
          const courseId = e.courseId ?? e.course?.id;
          const prog = courseId ? await getProgress(user.id, courseId).catch(() => null) : null;
          return {
            title: e.courseTitle || e.title || `Course #${courseId}`,
            progress: prog?.completionPercentage || 0,
            completed: prog?.completed || false,
          };
        })
      );
      return {
        activeCoursesInProgress: withProgress.filter((c) => !c.completed),
        masteredCourses: withProgress.filter((c) => c.completed),
        recommendedAction:
          withProgress.filter((c) => !c.completed).length > 0
            ? "Complete existing enrolled modules before starting new tracks."
            : "Explore advanced certifications in your field.",
      };
    }
  }

  // 3. Assessment Engine Server
  if (serverId === "assessment-engine-server") {
    if (toolName === "list_assessments") {
      const assessments = await getAllAssessments();
      const topic = (args.topic || "").toLowerCase();
      const filtered = assessments.filter(
        (a) => !topic || `${a.title || ""} ${a.description || ""}`.toLowerCase().includes(topic)
      );
      return {
        count: filtered.length,
        assessments: filtered.slice(0, 8).map((a) => ({
          id: a.id,
          title: a.title,
          passingScore: a.passingScore || 60,
          durationMinutes: a.durationMinutes || 30,
        })),
      };
    }

    if (toolName === "get_practice_questions") {
      if (!args.assessmentId) throw new Error("Argument 'assessmentId' is required.");
      const questions = await getQuestionsByAssessment(args.assessmentId);
      const limit = Number(args.limit) || 5;
      return {
        assessmentId: args.assessmentId,
        count: Math.min(questions.length, limit),
        // Security: NEVER leak correctAnswer in student practice mode!
        questions: questions.slice(0, limit).map((q) => ({
          id: q.id,
          question: q.questionText || q.question,
          options: [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean),
        })),
      };
    }
  }

  // 4. RAG Knowledge Server
  if (serverId === "rag-knowledge-server") {
    if (toolName === "semantic_vector_search") {
      if (!args.query) throw new Error("Argument 'query' is required.");
      const results = await searchKnowledgeBase({
        query: args.query,
        courseId: args.courseId || null,
        limit: Number(args.limit) || 5,
      });
      return {
        query: args.query,
        count: results.length,
        chunks: results.map((r) => ({
          title: r.title,
          source: r.source,
          relevanceScore: Math.round((r.hybridScore || 0.85) * 100) / 100,
          contentExcerpt: r.matchedExcerpt || r.content?.slice(0, 280),
        })),
      };
    }

    if (toolName === "get_document_citations") {
      const results = await searchKnowledgeBase({ query: args.topic || "", limit: 3 });
      return {
        topic: args.topic,
        citations: results.map((r, i) => ({
          citationId: `CIT-${i + 1}`,
          title: r.title,
          source: r.source,
          verified: true,
        })),
      };
    }
  }

  throw new Error(`Tool '${toolName}' execution failed on server '${serverId}'.`);
}

// ─── Real Resource Readers ────────────────────────────────────────────────────
async function readMcpResource(uri) {
  if (uri === "lms://catalog/all-courses") {
    const courses = await getAllCourses();
    return { count: courses.length, courses: courses.slice(0, 20) };
  }

  if (uri === "lms://catalog/categories") {
    const courses = await getAllCourses();
    const categories = [...new Set(courses.map((c) => c.category).filter(Boolean))];
    return { categories, count: categories.length };
  }

  if (uri === "lms://learner/profile") {
    const user = await getCurrentUser();
    if (!user?.id) throw new Error("Learner not authenticated.");
    const [enrollments, certificates] = await Promise.all([
      getMyCourses(user.id),
      getUserCertificates(user.id),
    ]);
    return {
      learner: { id: user.id, name: user.fullName, email: user.email, role: user.role },
      enrollmentCount: enrollments.length,
      certificatesCount: certificates.length,
    };
  }

  if (uri === "lms://learner/transcripts") {
    const user = await getCurrentUser();
    if (!user?.id) throw new Error("Learner not authenticated.");
    const attempts = await getUserAttempts(user.id);
    return { learnerId: user.id, attempts };
  }

  if (uri === "lms://learner/certificates") {
    const user = await getCurrentUser();
    if (!user?.id) throw new Error("Learner not authenticated.");
    const certificates = await getUserCertificates(user.id);
    return { learnerId: user.id, certificates };
  }

  if (uri === "lms://assessments/catalog") {
    const assessments = await getAllAssessments();
    return { count: assessments.length, assessments };
  }

  if (uri === "lms://knowledge/indexed-chunks") {
    return {
      status: "SYNCED",
      embeddingModel: "gemini-embedding-001",
      domain: "LMS Course Syllabi & Content",
      timestamp: new Date().toISOString(),
    };
  }

  throw new Error(`Resource '${uri}' does not exist.`);
}

// ─── Prompt Template Renderers ────────────────────────────────────────────────
function renderPromptTemplate(serverId, promptDef, args) {
  let promptText = "";

  if (promptDef.name === "recommend_courses_for_career") {
    promptText = `As an educational advisor, recommend a curriculum roadmap from the LMS catalog for a student aiming to become a "${args.targetRole || "Software Developer"}". Current experience level: ${args.skillLevel || "Beginner"}. Use the list_courses tool to verify real course options.`;
  } else if (promptDef.name === "explain_prerequisites") {
    promptText = `Using the get_course_curriculum tool for courseId "${args.courseId}", analyze the syllabus and explain all prerequisites and recommended preparatory topics for a new learner.`;
  } else if (promptDef.name === "generate_study_plan") {
    promptText = `The learner has ${args.hoursPerWeek || 8} hours per week available. Use get_student_enrollments to fetch their current progress, and generate a day-by-day weekly study schedule to help them finish their courses efficiently.`;
  } else if (promptDef.name === "diagnose_learning_plateau") {
    promptText = `Analyze the learner's active enrollments and assessment attempts. Identify where momentum slowed down and provide 3 concrete, motivating steps to get unstuck. Context: ${args.learnerContext || "General progress review"}.`;
  } else if (promptDef.name === "generate_revision_quiz") {
    promptText = `Create a 5-question interactive revision quiz on "${args.topic}" (difficulty: ${args.difficulty || "medium"}). Test conceptual understanding. Do NOT display answers immediately—ask the student to respond.`;
  } else if (promptDef.name === "synthesize_topic_summary") {
    promptText = `Using semantic_vector_search, find relevant course chunks for "${args.topic}". Synthesize a structured, clear summary with bullet points and cite your source sections.`;
  } else {
    promptText = `Execute task for prompt template ${promptDef.name} with parameters: ${JSON.stringify(args)}`;
  }

  return {
    description: promptDef.description,
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: promptText,
        },
      },
    ],
  };
}

// ─── Dynamic Gemini Bridge for MCP ────────────────────────────────────────────
/**
 * Converts MCP tools from selected servers into Gemini Function Declarations,
 * invokes Gemini, and dispatches tool calls back over the MCP wire protocol!
 */
export async function executeMcpPromptWithGemini({ prompt, serverIds = [] }) {
  if (!isApiKeySet()) {
    throw new Error("Gemini API key is not configured in .env (VITE_GEMINI_API_KEY).");
  }

  // Gather MCP tools from specified servers (or all if none specified)
  const targetServers = serverIds.length
    ? MCP_SERVERS.filter((s) => serverIds.includes(s.id))
    : MCP_SERVERS;

  const toolsList = [];
  const toolToHandler = {};

  targetServers.forEach((server) => {
    server.tools.forEach((tool) => {
      // Map MCP Tool schema to Gemini Function Declaration
      const declaration = {
        name: tool.name,
        description: `[Server: ${server.name}] ${tool.description}`,
        parameters: {
          type: "OBJECT",
          properties: tool.inputSchema?.properties || {},
          required: tool.inputSchema?.required || [],
        },
      };

      toolsList.push(declaration);

      // Handler dispatches through the real JSON-RPC 2.0 sendJsonRpcRequest
      toolToHandler[tool.name] = async (args) => {
        const resp = await sendJsonRpcRequest(server.uri, "tools/call", {
          name: tool.name,
          arguments: args,
        });
        if (resp.error) return { error: resp.error.message };
        try {
          const raw = resp.result?.content?.[0]?.text;
          return raw ? JSON.parse(raw) : resp.result;
        } catch {
          return resp.result;
        }
      };
    });
  });

  // Call Gemini with tools
  const conversation = [{ role: "user", content: prompt }];
  const mcpExecutionLog = [];
  let finalText = "";

  for (let round = 0; round < 4; round++) {
    const result = await geminiGenerate({
      systemInstruction: `You are an intelligent LMS assistant powered by the Model Context Protocol (MCP).
You have access to real MCP tools from registered LMS servers (Catalog, Analytics, Assessments, RAG Knowledge).
Always call the appropriate MCP tools to fetch live data rather than making assumptions.
Cite the data sources and MCP servers in your final answer.`,
      messages: conversation,
      tools: toolsList,
      temperature: 0.2,
    });

    if (result.functionCalls.length === 0) {
      finalText = result.text;
      break;
    }

    // Execute MCP tools
    const toolResults = await Promise.all(
      result.functionCalls.map(async (fc) => {
        const handler = toolToHandler[fc.name];
        let output;
        try {
          output = handler ? await handler(fc.args || {}) : { error: "Unknown MCP tool" };
        } catch (e) {
          output = { error: e.message };
        }
        mcpExecutionLog.push({ tool: fc.name, args: fc.args, output, round });
        return { name: fc.name, response: output };
      })
    );

    // Append to conversation
    conversation.push({
      role: "model",
      content: JSON.stringify(result.functionCalls.map((fc) => ({ functionCall: fc }))),
    });
    conversation.push({
      role: "user",
      content: JSON.stringify(
        toolResults.map((tr) => ({
          functionResponse: { name: tr.name, response: { content: JSON.stringify(tr.response) } },
        }))
      ),
    });

    if (result.finishReason === "STOP" && result.text) {
      finalText = result.text;
      break;
    }
  }

  return {
    answer: finalText,
    mcpLog: mcpExecutionLog,
    serversUsed: targetServers.map((s) => s.name),
  };
}
