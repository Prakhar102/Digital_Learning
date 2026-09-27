import { getAllCourses } from "./courseService.js";
import { getCurrentUser } from "./userService.js";
import { getMyCourses } from "./enrollmentService.js";
import { getUserAttempts } from "./assessmentService.js";
import { getUserCertificates } from "./certificateService.js";
import { getLearnerSubmissions } from "./assignmentService.js";
import { getProgress } from "./progressService.js";

// Registry entries describe UI work areas only. No LLM/agent provider is
// configured in this project, so the UI must not claim models are running.
export const AGENT_REGISTRY = {
  LMS_DATA: { id: "lms_data", name: "LMS Data Review", role: "Signed-in learner records", avatar: "📚", model: "LMS APIs", status: "CONFIGURED" },
  COURSE_CATALOG: { id: "course_catalog", name: "Course Catalog", role: "Available course content", avatar: "🎓", model: "LMS APIs", status: "CONFIGURED" },
};

export async function runMultiAgentCollaborationWorkflow(workflowType, learnerContext = {}, onStepCallback) {
  const traces = [];
  const started = performance.now();
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("No signed-in learner record is available.");
  const log = async (agentKey, action, toolCall, load) => {
    const agent = AGENT_REGISTRY[agentKey];
    const start = performance.now();
    const output = await load();
    const trace = {
      traceId: `api_${Date.now()}_${traces.length}`,
      stepIndex: traces.length + 1,
      agentId: agent.id,
      agentName: agent.name,
      agentRole: agent.role,
      avatar: agent.avatar,
      model: agent.model,
      action,
      thought: `Read data returned by ${toolCall}. This view reports the source response; it does not generate AI reasoning.`,
      toolCall: { tool: toolCall, learnerId: user.id },
      output,
      latencyMs: Math.round(performance.now() - start),
      tokens: null,
      timestamp: new Date().toISOString(),
    };
    traces.push(trace);
    onStepCallback?.(trace, [...traces]);
    return output;
  };

  const [courses, enrollments, attempts, certificates, submissions] = await Promise.all([
    log("COURSE_CATALOG", "READ_COURSE_CATALOG", "GET /api/courses", () => getAllCourses()),
    log("LMS_DATA", "READ_ENROLLMENTS", "GET learner enrollments", () => getMyCourses(user.id)),
    log("LMS_DATA", "READ_ASSESSMENT_ATTEMPTS", "GET learner attempts", () => getUserAttempts(user.id)),
    log("LMS_DATA", "READ_CERTIFICATES", "GET learner certificates", () => getUserCertificates(user.id)),
    log("LMS_DATA", "READ_ASSIGNMENT_SUBMISSIONS", "GET learner submissions", () => getLearnerSubmissions(user.id)),
  ]);

  const progress = await log("LMS_DATA", "READ_COURSE_PROGRESS", "GET learner course progress", async () => Promise.all(
    enrollments.map(async (entry) => {
      const courseId = entry.courseId ?? entry.course?.id;
      if (courseId == null) return { enrollment: entry, progress: null };
      return { enrollment: entry, progress: await getProgress(user.id, courseId) };
    })
  ));
  const summary = {
    workflowStatus: "COMPLETED",
    totalSteps: traces.length,
    totalLatencyMs: Math.round(performance.now() - started),
    learnerId: user.id,
    recordsRead: { courses: courses.length, enrollments: enrollments.length, attempts: attempts.length, certificates: certificates.length, submissions: submissions.length },
  };
  const decisionGraph = generateLearningPathDecisionTree(user, learnerContext.targetRole || "My LMS learning record", null, courses, { enrollments, progress, attempts, certificates, submissions });
  return { traces, summary, decisionGraph };
}

export function generateLearningPathDecisionTree(user, targetRole = "My LMS learning record", weakDomain, courses = [], evidence = {}) {
  const nodes = [
    { id: "learner", label: `Learner: ${user?.fullName || user?.name || user?.id || "Current user"}`, type: "SOURCE", details: `Identifier: ${user?.id ?? "not provided"}; email: ${user?.email || "not provided"}`, category: "PROFILE", weight: "Source: session" },
    { id: "enrollments", label: `${evidence.enrollments?.length || 0} enrollments`, type: "SOURCE", details: `${evidence.progress?.length || 0} course progress records returned by the LMS.`, category: "LEARNING", weight: "Observed records" },
    { id: "assessments", label: `${evidence.attempts?.length || 0} assessment attempts`, type: "SOURCE", details: `${evidence.certificates?.length || 0} certificates and ${evidence.submissions?.length || 0} assignment submissions returned.`, category: "ASSESSMENTS", weight: "Observed records" },
    { id: "catalog", label: `${courses.length} catalog courses`, type: "SOURCE", details: "Course catalog records currently available to this client.", category: "CATALOG", weight: "Observed records" },
  ];
  return {
    rootGoal: { id: "root", label: targetRole, type: "OBSERVED DATA", confidence: null, rationale: "This is an evidence view of LMS records, not an AI-generated career recommendation." },
    nodes,
    edges: nodes.slice(1).map((node) => ({ from: "learner", to: node.id, label: "Read from LMS API" })),
  };
}
