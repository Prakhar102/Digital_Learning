import { getAllCourses, getCourseDetails } from "./courseService.js";
import { getMyCourses } from "./enrollmentService.js";
import { getCurrentUser } from "./userService.js";
import { getUserAttempts } from "./assessmentService.js";
import { getUserCertificates } from "./certificateService.js";
import { getProgress } from "./progressService.js";
import { searchKnowledgeBase } from "./ragService.js";

// This is a browser-side JSON-RPC adapter over the LMS client services. The
// repository does not configure remote MCP servers or an MCP transport.
const schema = (properties, required = []) => ({ type: "object", properties, required });
const courseIdSchema = { courseId: { type: "string", description: "Course identifier from the LMS catalog" } };
export const MCP_SERVERS = [
  {
    id: "lms-server", uri: "mcp://dlm-lms-service", name: "LMS API Adapter", version: "browser-adapter",
    description: "Client-side JSON-RPC adapter that reads signed-in learner records from configured LMS APIs.",
    status: "CLIENT ADAPTER", latency: null,
    capabilities: { tools: true, resources: true },
    tools: [
      { name: "get_student_enrollments", description: "Read the signed-in learner's enrollments and current progress.", inputSchema: schema({}) },
      { name: "query_gradebook", description: "Read the signed-in learner's assessment attempts and certificates.", inputSchema: schema({}) },
      { name: "get_course_progress", description: "Read this learner's progress record for a catalog course.", inputSchema: schema(courseIdSchema, ["courseId"]) },
    ],
    resources: [
      { uri: "mcp://dlm-lms-service/resources/active_catalogs", name: "Course catalog", mimeType: "application/json" },
      { uri: "mcp://dlm-lms-service/resources/learner_record", name: "Signed-in learner record", mimeType: "application/json" },
    ],
  },
  {
    id: "content-server", uri: "mcp://dlm-content-service", name: "Course Content API Adapter", version: "browser-adapter",
    description: "Client-side adapter over catalog/module APIs and course text search. No remote vector database is configured.",
    status: "CLIENT ADAPTER", latency: null,
    capabilities: { tools: true, resources: true },
    tools: [
      { name: "get_curriculum_tree", description: "Read the actual course and module/lesson records.", inputSchema: schema(courseIdSchema, ["courseId"]) },
      { name: "search_course_material", description: "Search indexed course descriptions and lesson text currently available to the client.", inputSchema: schema({ query: { type: "string", description: "Search phrase" } }, ["query"]) },
    ],
    resources: [
      { uri: "mcp://dlm-content-service/resources/catalog", name: "Course catalog", mimeType: "application/json" },
    ],
  },
];

const nowMeta = (start, serverUri, extra = {}) => ({ latencyMs: Math.round(performance.now() - start), timestamp: new Date().toISOString(), serverUri, ...extra });

export async function sendJsonRpcRequest(serverUri, method, params = {}) {
  const start = performance.now();
  const id = `req_${globalThis.crypto?.randomUUID?.() || Date.now()}`;
  const server = MCP_SERVERS.find((item) => item.uri === serverUri || item.id === serverUri);
  const response = (body) => ({ jsonrpc: "2.0", id, ...body, meta: nowMeta(start, server?.uri || serverUri) });
  if (!server) return response({ error: { code: -32601, message: `No local adapter is configured for ${serverUri}` } });
  try {
    if (method === "initialize") return response({ result: { protocolVersion: "2024-11-05", serverInfo: { name: server.name, version: server.version }, capabilities: server.capabilities } });
    if (method === "tools/list") return response({ result: { tools: server.tools } });
    if (method === "resources/list") return response({ result: { resources: server.resources } });
    if (method === "tools/call") {
      const tool = server.tools.find((item) => item.name === params.name);
      if (!tool) return response({ error: { code: -32601, message: `Tool not found: ${params.name}` } });
      const result = await executeTool(server.id, tool.name, params.arguments || {});
      return response({ result: { content: [{ type: "text", text: JSON.stringify(result, null, 2) }], isError: false } });
    }
    if (method === "resources/read") {
      const resource = server.resources.find((item) => item.uri === params.uri);
      if (!resource) return response({ error: { code: -32602, message: `Resource not found: ${params.uri}` } });
      const contents = await readResource(resource.uri);
      return response({ result: { contents: [{ uri: resource.uri, mimeType: resource.mimeType, text: JSON.stringify(contents, null, 2) }] } });
    }
    return response({ error: { code: -32601, message: `Method not found: ${method}` } });
  } catch (error) {
    return response({ error: { code: -32000, message: error?.message || "The underlying LMS API request failed." } });
  }
}

async function learnerRecord() {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("No signed-in learner record is available.");
  return user;
}

async function executeTool(serverId, name, args) {
  if (serverId === "lms-server") {
    const user = await learnerRecord();
    if (name === "get_student_enrollments") {
      const enrollments = await getMyCourses(user.id);
      const progress = await Promise.all(enrollments.map(async (enrollment) => {
        const courseId = enrollment.courseId ?? enrollment.course?.id;
        return { enrollment, progress: courseId == null ? null : await getProgress(user.id, courseId) };
      }));
      return { learner: { id: user.id, name: user.fullName || user.name || null, email: user.email || null }, enrollments: progress };
    }
    if (name === "query_gradebook") {
      const [attempts, certificates] = await Promise.all([getUserAttempts(user.id), getUserCertificates(user.id)]);
      return { learnerId: user.id, attempts, certificates };
    }
    if (name === "get_course_progress") {
      if (!args.courseId) throw new Error("courseId is required.");
      return { learnerId: user.id, courseId: args.courseId, progress: await getProgress(user.id, args.courseId) };
    }
  }
  if (serverId === "content-server") {
    if (name === "get_curriculum_tree") {
      if (!args.courseId) throw new Error("courseId is required.");
      const detail = await getCourseDetails(args.courseId);
      if (!detail?.id) throw new Error("Course not found in the LMS catalog.");
      return detail;
    }
    if (name === "search_course_material") return searchKnowledgeBase({ query: args.query || "", limit: 10 });
  }
  throw new Error(`Tool ${name} is not implemented by this adapter.`);
}

async function readResource(uri) {
  if (uri.endsWith("/active_catalogs") || uri.endsWith("/catalog")) return { courses: await getAllCourses() };
  if (uri.endsWith("/learner_record")) {
    const user = await learnerRecord();
    const [enrollments, attempts, certificates] = await Promise.all([getMyCourses(user.id), getUserAttempts(user.id), getUserCertificates(user.id)]);
    return { learner: { id: user.id, name: user.fullName || user.name || null, email: user.email || null }, enrollments, attempts, certificates };
  }
  throw new Error(`Resource not found: ${uri}`);
}
