import { searchKnowledgeBase } from "./ragService";
import { getAllAssessments, getQuestionsByAssessment, getUserAttempts } from "./assessmentService";
import { getCurrentUser } from "./userService";
import { getMyCourses } from "./enrollmentService";
import { getUserCertificates } from "./certificateService";
import { getAllCourses } from "./courseService";
import { getProgress } from "./progressService";

// These personas and tool schemas describe available UI actions; they are not
// claims that an LLM or external agent server is configured.
export const AGENT_PERSONAS = {
  coach: { id: "coach", name: "Learning Coach", role: "Course material search", description: "Finds relevant material from the live LMS course catalog.", avatar: "GraduationCap", color: "blue", tools: ["fetch_course_knowledge"] },
  assessment: { id: "assessment", name: "Assessment Finder", role: "Published LMS assessments", description: "Finds real assessments and their authored questions in the LMS.", avatar: "ClipboardCheck", color: "emerald", tools: ["find_assessments"] },
  skillgap: { id: "skillgap", name: "Learning Record Review", role: "Progress and assessment evidence", description: "Summarizes recorded course progress, attempts, and certificates.", avatar: "Brain", color: "purple", tools: ["review_learning_record"] },
  career: { id: "career", name: "Course Path Finder", role: "Catalog search", description: "Finds courses in the live catalog that match a requested role or topic.", avatar: "Briefcase", color: "amber", tools: ["find_courses"] },
};

export const TOOL_DEFINITIONS = [
  { name: "fetch_course_knowledge", description: "Search actual course descriptions, module and lesson text.", parameters: { query: { type: "string" } } },
  { name: "find_assessments", description: "Find published LMS assessments and questions matching the topic.", parameters: { topic: { type: "string" } } },
  { name: "review_learning_record", description: "Read this signed-in learner's enrollments, progress, attempts and certificates.", parameters: {} },
  { name: "find_courses", description: "Search the actual course catalog for a target role or topic.", parameters: { query: { type: "string" } } },
];

const elapsed = (start) => Math.round(performance.now() - start);

export async function executeToolCall(toolName, params = {}) {
  const start = performance.now();
  let result;
  let status = "SUCCESS";
  try {
    if (toolName === "fetch_course_knowledge") {
      result = await searchKnowledgeBase({ query: params.query || "", limit: 8 });
    } else if (toolName === "find_assessments") {
      const query = String(params.topic || "").toLowerCase();
      const topic = query.replace(/^(generate|create|find|show)\s+(a[n]?\s+)?(diagnostic\s+)?(quiz|test|assessment)s?(\s+(on|about|for)\s+)?/i, "").trim();
      const assessments = await getAllAssessments();
      const candidates = assessments.filter((a) => !topic || `${a.title || ""} ${a.description || ""}`.toLowerCase().includes(topic));
      const loaded = await Promise.all(candidates.map(async (assessment) => ({ ...assessment, questions: await getQuestionsByAssessment(assessment.id) })));
      const assessment = loaded.find((item) => item.questions?.length);
      if (assessment) {
        result = {
          assessmentTitle: assessment.title,
          generatedQuestions: assessment.questions.map((question) => {
            const options = [question.optionA, question.optionB, question.optionC, question.optionD].filter(Boolean);
            const answer = String(question.correctAnswer ?? "").trim().toLowerCase();
            const correctIndex = options.findIndex((option, index) => String(option).trim().toLowerCase() === answer || String(index + 1) === answer || "abcd"[index] === answer);
            return { id: question.id, questionText: question.questionText || question.question || question.text || "", options, correctIndex, explanation: question.explanation || "" };
          }).filter((question) => question.questionText && question.options.length),
        };
        if (!result.generatedQuestions.length) result = { message: "The matching assessment has no usable question records.", assessments: [] };
      } else result = { message: "No matching assessment with questions is available in the LMS.", assessments: [] };
    } else if (toolName === "review_learning_record") {
      const user = await getCurrentUser();
      if (!user?.id) throw new Error("No signed-in learner record is available.");
      const enrollments = await getMyCourses(user.id);
      const [attempts, certificates] = await Promise.all([getUserAttempts(user.id), getUserCertificates(user.id)]);
      const progress = await Promise.all(enrollments.map(async (enrollment) => {
        const courseId = enrollment.courseId ?? enrollment.course?.id;
        if (!courseId) return { enrollment };
        return { enrollment, progress: await getProgress(user.id, courseId) };
      }));
      const acquiredCompetencies = progress.filter(({ progress: item }) => item?.completed || Number(item?.completionPercentage) >= 100).map(({ enrollment }) => ({ name: enrollment.courseTitle || enrollment.title || `Course ${enrollment.courseId}`, level: "Course completed" }));
      const missingGaps = progress.filter(({ progress: item }) => item && !item.completed && Number(item.completionPercentage) < 100).map(({ enrollment, progress: item }) => ({ skill: enrollment.courseTitle || enrollment.title || `Course ${enrollment.courseId}`, severity: "IN PROGRESS", recommendation: `${item.completionPercentage ?? 0}% recorded progress` }));
      result = { learner: { id: user.id, name: user.fullName || user.name || null, email: user.email || null }, enrollments: progress, attempts, certificates, role: "Recorded LMS learning", acquiredCompetencies, missingGaps };
    } else if (toolName === "find_courses") {
      const query = String(params.query || "").toLowerCase().trim();
      const courses = await getAllCourses();
      const matches = courses.filter((course) => !query || `${course.title || ""} ${course.description || ""} ${course.category || ""}`.toLowerCase().includes(query));
      result = matches.length ? { title: `Catalog matches for ${params.query || "all courses"}`, milestones: matches.map((course) => ({ phase: course.category || course.level || "Course", title: course.title, courses: [course.title] })), courses: matches } : { message: "No matching course exists in the catalog.", courses: [] };
    } else {
      throw new Error(`Unsupported tool: ${toolName}`);
    }
  } catch (error) {
    status = "ERROR";
    result = { message: error?.message || "The LMS data source could not be reached." };
  }
  return { tool: toolName, status, durationMs: elapsed(start), result };
}

export async function runAgentExecution({ agentId = "coach", prompt = "" }) {
  const persona = AGENT_PERSONAS[agentId] || AGENT_PERSONAS.coach;
  const lower = prompt.toLowerCase();
  let tool;
  let params;
  if (agentId === "assessment" || /quiz|assessment|test/.test(lower)) {
    tool = "find_assessments";
    params = { topic: prompt };
  } else if (agentId === "skillgap" || /my progress|my record|skill gap|my skills|learning record/.test(lower)) {
    tool = "review_learning_record";
    params = {};
  } else if (agentId === "career" || /career|role|become|roadmap/.test(lower)) {
    tool = "find_courses";
      params = { query: prompt.replace(/build a career pathway for|how to become|create milestone roadmap for|career path for|find courses related to|show all available courses/ig, "").trim() };
  } else {
    tool = "fetch_course_knowledge";
    params = { query: prompt };
  }
  const toolCall = await executeToolCall(tool, params);
  const response = toolCall.status === "ERROR"
    ? `The requested LMS data could not be loaded: ${toolCall.result.message}`
    : `I checked the live LMS data using ${tool}. Results below contain only records returned by the LMS; no AI model is configured for generated answers.`;
  return { agent: persona, prompt, response, toolCall, timestamp: new Date().toISOString() };
}
