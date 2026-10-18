/**
 * agentService.js  —  Real Multi-Agent Orchestration with Google Gemini
 *
 * Architecture:
 *  - Each agent has a unique persona, system prompt, and set of tools
 *  - Agents run via Gemini function-calling (tool-use) loop
 *  - An event bus allows agents to publish messages to each other
 *  - The Orchestrator delegates tasks to the right agent and coordinates results
 */

import { geminiWithTools, geminiGenerate, isApiKeySet } from "./geminiService.js";
import { searchKnowledgeBase, syncLiveKnowledgeFromBackend } from "./ragService.js";
import { getAllAssessments, getQuestionsByAssessment, getUserAttempts } from "./assessmentService.js";
import { getCurrentUser } from "./userService.js";
import { getMyCourses } from "./enrollmentService.js";
import { getUserCertificates } from "./certificateService.js";
import { getAllCourses } from "./courseService.js";
import { getProgress } from "./progressService.js";
import { sendJsonRpcRequest } from "./mcpService.js";

// ─── Agent Personas ───────────────────────────────────────────────────────────
export const AGENT_PERSONAS = {
  orchestrator: {
    id: "orchestrator",
    name: "Orchestrator",
    role: "Multi-agent coordinator",
    description: "Coordinates all agents, delegates tasks, and synthesizes their outputs into a cohesive answer.",
    color: "violet",
    tools: ["delegate_to_agent"],
  },
  rag: {
    id: "rag",
    name: "RAG Mentor",
    role: "Knowledge retrieval & synthesis",
    description: "Retrieves relevant content from the course knowledge base and generates grounded answers using Gemini.",
    color: "blue",
    tools: ["search_knowledge_base", "fetch_course_details"],
  },
  assessment: {
    id: "assessment",
    name: "Assessment Agent",
    role: "Quiz & assessment intelligence",
    description: "Fetches live assessments, generates quiz questions, and evaluates learner performance.",
    color: "emerald",
    tools: ["find_assessments", "get_assessment_questions"],
  },
  skillgap: {
    id: "skillgap",
    name: "Skill Gap Agent",
    role: "Learning analytics & gaps",
    description: "Analyzes enrolled courses, progress, assessment attempts, and certificates to identify skill gaps.",
    color: "purple",
    tools: ["review_learning_record", "analyze_skill_gaps"],
  },
  career: {
    id: "career",
    name: "Career Pathfinder",
    role: "Course & career path advisor",
    description: "Searches the live course catalog to build personalized career learning paths.",
    color: "amber",
    tools: ["find_courses", "build_learning_path"],
  },
  socratic: {
    id: "socratic",
    name: "Socratic Debater",
    role: "Critical thinking coach",
    description: "Engages in Socratic questioning to deepen understanding of course concepts.",
    color: "rose",
    tools: ["search_knowledge_base"],
  },
  mcp: {
    id: "mcp",
    name: "MCP Gateway Agent",
    role: "Model Context Protocol Client",
    description: "Queries live MCP servers (Catalog, Analytics, Assessments, RAG) via JSON-RPC 2.0 wire protocol.",
    color: "cyan",
    tools: ["execute_mcp_tool", "read_mcp_resource"],
  },
};

// ─── Agent-to-Agent Event Bus ─────────────────────────────────────────────────
class AgentBus {
  constructor() {
    this.listeners = {};
    this.messageLog = [];
  }

  on(agentId, handler) {
    if (!this.listeners[agentId]) this.listeners[agentId] = [];
    this.listeners[agentId].push(handler);
    return () => {
      this.listeners[agentId] = this.listeners[agentId].filter((h) => h !== handler);
    };
  }

  emit(fromAgent, toAgent, message) {
    const event = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      from: fromAgent,
      to: toAgent,
      message,
      timestamp: new Date().toISOString(),
    };
    this.messageLog.push(event);
    if (this.listeners[toAgent]) {
      this.listeners[toAgent].forEach((h) => h(event));
    }
    return event;
  }

  broadcast(fromAgent, message) {
    Object.keys(AGENT_PERSONAS)
      .filter((id) => id !== fromAgent)
      .forEach((id) => this.emit(fromAgent, id, message));
  }

  getLog(limit = 50) {
    return this.messageLog.slice(-limit);
  }

  clear() {
    this.messageLog = [];
  }
}

export const agentBus = new AgentBus();

// ─── Tool Implementations ─────────────────────────────────────────────────────
const TOOLS = {
  async search_knowledge_base({ query, limit = 5 }) {
    const results = await searchKnowledgeBase({ query, limit });
    return {
      found: results.length,
      chunks: results.map((r) => ({ title: r.title, source: r.source, excerpt: r.content.slice(0, 300) })),
    };
  },

  async fetch_course_details({ courseId }) {
    const courses = await getAllCourses();
    const course = courses.find((c) => String(c.id) === String(courseId));
    return course || { error: "Course not found" };
  },

  async find_assessments({ topic = "" }) {
    const assessments = await getAllAssessments();
    const lower = topic.toLowerCase();
    const filtered = assessments.filter(
      (a) => !lower || `${a.title || ""} ${a.description || ""}`.toLowerCase().includes(lower)
    );
    return { count: filtered.length, assessments: filtered.slice(0, 5).map((a) => ({ id: a.id, title: a.title, description: a.description })) };
  },

  async get_assessment_questions({ assessmentId }) {
    const questions = await getQuestionsByAssessment(assessmentId);
    return {
      count: questions.length,
      questions: questions.slice(0, 10).map((q) => ({
        id: q.id,
        question: q.questionText || q.question,
        options: [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean),
        correctAnswer: q.correctAnswer,
      })),
    };
  },

  async review_learning_record({ }) {
    const user = await getCurrentUser();
    if (!user?.id) return { error: "No signed-in learner found." };
    const [enrollments, attempts, certs] = await Promise.all([
      getMyCourses(user.id),
      getUserAttempts(user.id),
      getUserCertificates(user.id),
    ]);
    const progressData = await Promise.all(
      enrollments.map(async (e) => {
        const courseId = e.courseId ?? e.course?.id;
        const prog = courseId ? await getProgress(user.id, courseId).catch(() => null) : null;
        return { course: e.courseTitle || e.title || `Course ${courseId}`, progress: prog?.completionPercentage || 0, completed: prog?.completed || false };
      })
    );
    return {
      learner: { id: user.id, name: user.fullName, email: user.email },
      enrolledCount: enrollments.length,
      completedCount: progressData.filter((p) => p.completed).length,
      certificatesCount: certs.length,
      assessmentAttempts: attempts.length,
      passedCount: attempts.filter((a) => a.passed || Number(a.percentage) >= 60).length,
      courses: progressData.slice(0, 8),
    };
  },

  async analyze_skill_gaps({ learnerData }) {
    // Takes output from review_learning_record and produces gap analysis
    if (!learnerData) return { error: "No learner data provided." };
    const gaps = (learnerData.courses || [])
      .filter((c) => !c.completed && c.progress < 100)
      .map((c) => ({ course: c.course, completion: `${c.progress}%`, status: "In Progress" }));
    const strengths = (learnerData.courses || [])
      .filter((c) => c.completed)
      .map((c) => ({ course: c.course, status: "Completed" }));
    return { gaps, strengths, certificatesEarned: learnerData.certificatesCount };
  },

  async find_courses({ query = "", limit = 6 }) {
    const courses = await getAllCourses();
    const lower = query.toLowerCase();
    const matches = courses.filter(
      (c) => !lower || `${c.title || ""} ${c.description || ""} ${c.category || ""}`.toLowerCase().includes(lower)
    );
    return {
      count: matches.length,
      courses: matches.slice(0, limit).map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        level: c.level,
        description: (c.description || "").slice(0, 150),
      })),
    };
  },

  async build_learning_path({ targetRole, availableCourses }) {
    // Will be enriched by Gemini
    return {
      targetRole,
      availableCourses: availableCourses?.slice(0, 5) || [],
      note: "Path generated based on course catalog.",
    };
  },

  async execute_mcp_tool({ serverUri, toolName, args }) {
    const resp = await sendJsonRpcRequest(serverUri || "mcp://dlm.lms/catalog", "tools/call", {
      name: toolName,
      arguments: typeof args === "string" ? JSON.parse(args || "{}") : (args || {}),
    });
    return resp.result || resp.error;
  },

  async read_mcp_resource({ serverUri, uri }) {
    const resp = await sendJsonRpcRequest(serverUri || "mcp://dlm.lms/catalog", "resources/read", { uri });
    return resp.result || resp.error;
  },
};

// ─── Tool Declarations (Gemini schema) ────────────────────────────────────────
const TOOL_DECLARATIONS = {
  search_knowledge_base: {
    name: "search_knowledge_base",
    description: "Search the LMS course knowledge base (course descriptions, modules, lessons) for content relevant to a query.",
    parameters: {
      type: "OBJECT",
      properties: { query: { type: "STRING", description: "The search query" }, limit: { type: "INTEGER", description: "Max results (default 5)" } },
      required: ["query"],
    },
  },
  fetch_course_details: {
    name: "fetch_course_details",
    description: "Fetch full details for a specific course by its ID.",
    parameters: {
      type: "OBJECT",
      properties: { courseId: { type: "STRING", description: "The course ID to fetch" } },
      required: ["courseId"],
    },
  },
  find_assessments: {
    name: "find_assessments",
    description: "Find published LMS assessments matching a given topic.",
    parameters: {
      type: "OBJECT",
      properties: { topic: { type: "STRING", description: "Topic or subject to search assessments for" } },
      required: [],
    },
  },
  get_assessment_questions: {
    name: "get_assessment_questions",
    description: "Get the questions for a specific assessment by its ID.",
    parameters: {
      type: "OBJECT",
      properties: { assessmentId: { type: "STRING", description: "The assessment ID" } },
      required: ["assessmentId"],
    },
  },
  review_learning_record: {
    name: "review_learning_record",
    description: "Review the currently signed-in learner's enrolled courses, progress, certificates, and assessment attempts.",
    parameters: { type: "OBJECT", properties: {} },
  },
  analyze_skill_gaps: {
    name: "analyze_skill_gaps",
    description: "Analyze the learner's skill gaps based on their learning record data.",
    parameters: {
      type: "OBJECT",
      properties: { learnerData: { type: "OBJECT", description: "Data from review_learning_record" } },
    },
  },
  find_courses: {
    name: "find_courses",
    description: "Search the live LMS course catalog for courses matching a topic, role, or skill.",
    parameters: {
      type: "OBJECT",
      properties: { query: { type: "STRING", description: "Search query" }, limit: { type: "INTEGER" } },
    },
  },
  build_learning_path: {
    name: "build_learning_path",
    description: "Build a structured learning path for a target role from available courses.",
    parameters: {
      type: "OBJECT",
      properties: {
        targetRole: { type: "STRING", description: "The target job role or career goal" },
        availableCourses: { type: "ARRAY", items: { type: "OBJECT" }, description: "List of available courses" },
      },
    },
  },
  execute_mcp_tool: {
    name: "execute_mcp_tool",
    description: "Call an MCP tool on a specified MCP server using standard Model Context Protocol JSON-RPC 2.0.",
    parameters: {
      type: "OBJECT",
      properties: {
        serverUri: { type: "STRING", description: "Server URI, e.g., mcp://dlm.lms/catalog or mcp://dlm.lms/analytics" },
        toolName: { type: "STRING", description: "Name of the MCP tool to call (e.g. list_courses, get_student_enrollments)" },
        args: { type: "OBJECT", description: "Arguments object for the tool" },
      },
      required: ["toolName"],
    },
  },
  read_mcp_resource: {
    name: "read_mcp_resource",
    description: "Read an MCP resource URI using standard Model Context Protocol JSON-RPC 2.0.",
    parameters: {
      type: "OBJECT",
      properties: {
        serverUri: { type: "STRING", description: "Server URI" },
        uri: { type: "STRING", description: "Resource URI, e.g. lms://catalog/all-courses or lms://learner/profile" },
      },
      required: ["uri"],
    },
  },
};

// ─── Per-agent system prompts ─────────────────────────────────────────────────
const SYSTEM_PROMPTS = {
  rag: `You are a RAG Mentor AI for an enterprise LMS. Use your tools to search the knowledge base and provide precise, grounded answers from actual course content. Always cite your sources. If you cannot find relevant content, say so clearly. Be educational and structured in your responses.`,

  assessment: `You are an Assessment Intelligence Agent for an enterprise LMS. Use your tools to find real assessments and their questions from the LMS. Present quiz questions clearly and help learners understand their performance. Never fabricate questions—only use what you retrieve from the actual LMS data.`,

  skillgap: `You are a Learning Analytics Agent. Use your tools to fetch the learner's real LMS data (enrollments, progress, certificates, assessments). Analyze skill gaps objectively and provide actionable recommendations. Be data-driven and specific.`,

  career: `You are a Career Pathfinder Agent for an enterprise LMS. Search the real course catalog and design personalized learning paths for specific career goals. Present paths in a clear, milestone-based format. Only recommend courses that actually exist in the catalog.`,

  socratic: `You are a Socratic learning coach. Use retrieved course content to guide the learner through deep questioning rather than giving direct answers. Ask probing questions, challenge assumptions, and help them discover understanding themselves.`,

  mcp: `You are an MCP Gateway Agent operating over the Model Context Protocol (v2024-11-05). Use your execute_mcp_tool and read_mcp_resource tools to query connected MCP servers (Catalog, Analytics, Assessments, RAG Knowledge) and return structured, authoritative LMS results.`,

  orchestrator: `You are the Orchestrator agent coordinating a team of AI agents: RAG Mentor, Assessment Agent, Skill Gap Agent, Career Pathfinder, Socratic Debater, and MCP Gateway Agent. When given a complex question, decompose it, delegate to appropriate agents, and synthesize their findings into a comprehensive, coherent answer.`,
};

// ─── Execute a single agent ───────────────────────────────────────────────────
export async function runAgent({ agentId, prompt, context = "", onToolCall = null }) {
  const persona = AGENT_PERSONAS[agentId];
  if (!persona) throw new Error(`Unknown agent: ${agentId}`);

  // Emit start event on the bus
  agentBus.emit("system", agentId, `Task received: "${prompt.slice(0, 100)}..."`);

  if (!isApiKeySet()) {
    // Fallback without Gemini
    const fallbackResult = await runFallbackAgent(agentId, prompt);
    agentBus.emit(agentId, "system", `Completed (fallback mode): ${fallbackResult.text.slice(0, 80)}...`);
    return { ...fallbackResult, agent: persona, toolLog: [] };
  }

  // Build tools for this agent
  const agentTools = (persona.tools || [])
    .filter((name) => TOOL_DECLARATIONS[name] && TOOLS[name])
    .map((name) => ({
      declaration: TOOL_DECLARATIONS[name],
      handler: async (args) => {
        const result = await TOOLS[name](args);
        if (onToolCall) onToolCall({ name, args, result, agentId });
        agentBus.emit(agentId, "system", `Tool called: ${name}(${JSON.stringify(args).slice(0, 60)})`);
        return result;
      },
    }));

  const systemPrompt = [
    SYSTEM_PROMPTS[agentId] || "",
    context ? `\n\nAdditional context:\n${context}` : "",
  ].join("");

  const { text, toolLog } = await geminiWithTools({
    systemInstruction: systemPrompt,
    messages: [{ role: "user", content: prompt }],
    tools: agentTools,
    maxToolRounds: 5,
  });

  agentBus.emit(agentId, "system", `Completed: ${text.slice(0, 80)}...`);

  return { text, toolLog, agent: persona, timestamp: new Date().toISOString() };
}

// ─── Orchestrator: coordinates multiple agents ────────────────────────────────
export async function runOrchestration({ prompt, onStep = null }) {
  const steps = [];
  const emit = (type, data) => {
    const step = { type, ...data, timestamp: new Date().toISOString() };
    steps.push(step);
    if (onStep) onStep(step);
    return step;
  };

  emit("orchestrator_start", { message: `Analyzing task: "${prompt}"` });

  // Step 1: Let Gemini decide which agents are needed
  let agentPlan = [];
  if (isApiKeySet()) {
    const planResult = await geminiGenerate({
      systemInstruction: `You are a task planner for a multi-agent AI system. Given a user prompt, decide which agents to use and in what order.
Available agents: rag (knowledge retrieval), assessment (quiz/tests), skillgap (progress analysis), career (course catalog and paths), socratic (deep questioning).
Respond ONLY with a JSON array of agent IDs in order. Example: ["rag", "skillgap"]
Use at most 3 agents. Only include agents whose capabilities are truly needed.`,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });
    try {
      const cleaned = planResult.text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) agentPlan = parsed.filter((id) => AGENT_PERSONAS[id]);
    } catch {
      // fallback
    }
  }

  if (!agentPlan.length) {
    // Simple fallback routing
    const lower = prompt.toLowerCase();
    if (/quiz|assessment|test/.test(lower)) agentPlan = ["assessment"];
    else if (/skill gap|my progress|my record/.test(lower)) agentPlan = ["skillgap"];
    else if (/career|path|roadmap|become/.test(lower)) agentPlan = ["career"];
    else if (/debate|question|why|explain/.test(lower)) agentPlan = ["rag", "socratic"];
    else agentPlan = ["rag"];
  }

  emit("plan_decided", { agents: agentPlan, message: `Will consult: ${agentPlan.map((id) => AGENT_PERSONAS[id]?.name).join(", ")}` });

  // Step 2: Run agents sequentially (each can use previous output as context)
  const agentResults = [];
  let accumulatedContext = "";

  for (const agentId of agentPlan) {
    emit("agent_start", { agentId, agentName: AGENT_PERSONAS[agentId]?.name, message: `Starting ${AGENT_PERSONAS[agentId]?.name}...` });

    // Notify other agents via bus
    agentBus.emit("orchestrator", agentId, `Please handle: ${prompt}${accumulatedContext ? `\n\nPrevious context:\n${accumulatedContext.slice(0, 500)}` : ""}`);

    const result = await runAgent({
      agentId,
      prompt,
      context: accumulatedContext,
      onToolCall: (toolInfo) => {
        emit("tool_call", { agentId, agentName: AGENT_PERSONAS[agentId]?.name, ...toolInfo });
      },
    });

    agentResults.push({ agentId, ...result });
    accumulatedContext += `\n\n=== ${result.agent?.name} Output ===\n${result.text}`;

    emit("agent_complete", {
      agentId,
      agentName: result.agent?.name,
      text: result.text,
      toolLog: result.toolLog,
      message: `${result.agent?.name} completed.`,
    });
  }

  // Step 3: Synthesize if multiple agents ran
  let finalAnswer = agentResults[agentResults.length - 1]?.text || "";
  if (agentResults.length > 1 && isApiKeySet()) {
    emit("synthesis_start", { message: "Synthesizing results from all agents..." });
    const synthResult = await geminiGenerate({
      systemInstruction: `You are a synthesis coordinator. Combine the outputs from multiple AI agents into a single, coherent, well-structured response for the learner. Remove redundancy, maintain all key insights, and present clearly.`,
      messages: [
        {
          role: "user",
          content: `Original question: ${prompt}\n\n${accumulatedContext}\n\nPlease synthesize the above agent outputs into a single comprehensive answer.`,
        },
      ],
      temperature: 0.4,
    });
    finalAnswer = synthResult.text;
    emit("synthesis_complete", { message: "Synthesis complete." });
  }

  emit("orchestration_complete", { finalAnswer, agentsUsed: agentPlan });

  // Broadcast completion
  agentBus.broadcast("orchestrator", `Orchestration complete for: "${prompt.slice(0, 60)}"`);

  return { finalAnswer, steps, agentsUsed: agentPlan, agentResults };
}

// ─── Fallback (no Gemini key) ─────────────────────────────────────────────────
async function runFallbackAgent(agentId, prompt) {
  const lower = prompt.toLowerCase();
  let text = "Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your .env file to enable AI responses.";

  try {
    if (agentId === "rag") {
      const sources = await searchKnowledgeBase({ query: prompt, limit: 3 });
      text = sources.length
        ? `Retrieved ${sources.length} matching content sections:\n\n${sources.map((s) => `**${s.title}**\n${s.matchedExcerpt}`).join("\n\n")}`
        : "No matching course content found.";
    } else if (agentId === "assessment") {
      const assessments = await getAllAssessments();
      const topic = lower.replace(/quiz|test|assessment|find|show|create|generate/g, "").trim();
      const matches = assessments.filter((a) => !topic || `${a.title} ${a.description}`.toLowerCase().includes(topic));
      text = matches.length
        ? `Found ${matches.length} assessment(s): ${matches.slice(0, 3).map((a) => a.title).join(", ")}`
        : "No matching assessments found.";
    } else if (agentId === "skillgap") {
      const record = await TOOLS.review_learning_record({});
      text = `Learner: ${record.learner?.name}. Enrolled: ${record.enrolledCount} courses. Completed: ${record.completedCount}. Certificates: ${record.certificatesCount}.`;
    } else if (agentId === "career") {
      const courses = await getAllCourses();
      const q = lower.replace(/career|path|roadmap|become|find|courses|for/g, "").trim();
      const matches = courses.filter((c) => !q || `${c.title} ${c.description}`.toLowerCase().includes(q));
      text = matches.length
        ? `Found ${matches.length} relevant courses: ${matches.slice(0, 4).map((c) => c.title).join(", ")}`
        : "No matching courses found in catalog.";
    }
  } catch (e) {
    text = `Error: ${e.message}`;
  }

  return { text, timestamp: new Date().toISOString() };
}

// ─── Legacy compat ────────────────────────────────────────────────────────────
export async function runAgentExecution({ agentId = "rag", prompt = "" }) {
  const result = await runAgent({ agentId, prompt });
  return {
    agent: result.agent,
    prompt,
    response: result.text,
    toolCall: { tool: "gemini", status: "SUCCESS", result: { text: result.text } },
    toolLog: result.toolLog,
    timestamp: result.timestamp,
  };
}

export const TOOL_DEFINITIONS = Object.values(TOOL_DECLARATIONS);
