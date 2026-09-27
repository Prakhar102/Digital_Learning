import { getCurrentUser } from "./userService.js";
import { getMyCourses } from "./enrollmentService.js";
import { getUserCertificates } from "./certificateService.js";
import { getUserAttempts, getAllAssessments } from "./assessmentService.js";
import {
  getCourseAssignments,
  getLearnerSubmissions,
} from "./assignmentService.js";
import { getAllCourses, getCourseDetails } from "./courseService.js";
import { getProgress } from "./progressService.js";

const asArray = (value) => (Array.isArray(value) ? value : []);
const identityOf = (record) => record?.userId ?? record?.learnerId ?? record?.studentId;

const formatDate = (value) => {
  if (!value) return "date not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const recordsResult = (title, source, rows, emptyText) => ({
  title,
  source,
  rows,
  content: rows.length ? rows.join("\n") : emptyText,
});

/** Build a per-learner snapshot. Every learner-owned record is scoped by the active user's id. */
export async function getLearnerRagContext(activeUserId, activeUser = null) {
  if (activeUserId === undefined || activeUserId === null || activeUserId === "") {
    return { user: null, sources: [] };
  }

  const [userResult, enrollmentResult, certificateResult, attemptResult, assessmentsResult, catalogResult, submissionResult] = await Promise.allSettled([
    activeUser ? Promise.resolve(activeUser) : getCurrentUser(),
    getMyCourses(activeUserId),
    getUserCertificates(activeUserId),
    getUserAttempts(activeUserId),
    getAllAssessments(),
    getAllCourses(),
    getLearnerSubmissions(activeUserId),
  ]);

  const user = userResult.status === "fulfilled" ? userResult.value : null;
  const courseCatalog = asArray(catalogResult.status === "fulfilled" ? catalogResult.value : []);
  const courseById = new Map(courseCatalog.map((course) => [String(course.id), course]));

  const enrollments = asArray(enrollmentResult.status === "fulfilled" ? enrollmentResult.value : [])
    .filter((record) => String(identityOf(record)) === String(activeUserId));
  const courseRecords = await Promise.all(enrollments.map(async (enrollment) => {
    const courseId = enrollment.courseId ?? enrollment.id;
    const catalogCourse = courseById.get(String(courseId));
    const [progressResult, detailsResult] = await Promise.allSettled([
      getProgress(activeUserId, courseId),
      getCourseDetails(courseId),
    ]);
    const progress = progressResult.status === "fulfilled" ? progressResult.value || {} : {};
    const details = detailsResult.status === "fulfilled" ? detailsResult.value || {} : {};
    const completedLessons = Number(progress.completedLessons ?? progress.completedLessonIds?.length ?? 0);
    const totalLessons = Number(progress.totalLessons ?? details.modules?.reduce(
      (sum, module) => sum + (module.lessons?.length || 0), 0
    ) ?? 0);
    const percentCandidates = [
      progress.completionPercentage,
      progress.progress,
      enrollment.progress,
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
    ].map(Number).filter(Number.isFinite);
    const percent = Math.max(0, ...percentCandidates);
    const isComplete = enrollment.status?.toUpperCase() === "COMPLETED" || progress.completed === true || percent >= 100;
    const courseTitle = enrollment.courseTitle || catalogCourse?.title || details.title || `Course #${courseId}`;

    return {
      courseId,
      courseTitle,
      enrolledAt: enrollment.enrolledAt || enrollment.createdAt,
      percent: Math.max(0, Math.min(100, Math.round(percent || 0))),
      isComplete,
    };
  }));

  const certificates = asArray(certificateResult.status === "fulfilled" ? certificateResult.value : [])
    .filter((record) => String(identityOf(record)) === String(activeUserId));
  const assessmentCatalog = asArray(assessmentsResult.status === "fulfilled" ? assessmentsResult.value : []);
  const assessmentById = new Map(assessmentCatalog.map((assessment) => [String(assessment.id), assessment]));
  const attempts = asArray(attemptResult.status === "fulfilled" ? attemptResult.value : [])
    .filter((record) => String(identityOf(record)) === String(activeUserId));
  const submissions = asArray(submissionResult.status === "fulfilled" ? submissionResult.value : [])
    .filter((record) => String(identityOf(record)) === String(activeUserId));

  const courseIds = new Set(courseRecords.map((course) => String(course.courseId)));
  const assignmentGroups = await Promise.all([...courseIds].map((courseId) => getCourseAssignments(courseId)));
  const assignmentMap = new Map();
  assignmentGroups.flatMap(asArray).forEach((assignment) => {
    if (courseIds.has(String(assignment.courseId))) assignmentMap.set(String(assignment.id), assignment);
  });

  const source = "Your LMS records (database or local fallback)";
  const profileSource = recordsResult("Your Profile", source, user ? [
    `Name: ${user.fullName || user.name || "not available"}`,
    `Email: ${user.email || "not available"}`,
    `Learner ID: ${activeUserId}`,
  ] : [], "Profile details are not available in the current session.");
  const courseSource = recordsResult("Your Courses", source, courseRecords.map((course) =>
    `${course.courseTitle} — ${course.isComplete ? "Completed" : "Ongoing"}; ${course.percent}% complete; enrolled ${formatDate(course.enrolledAt)}${course.isComplete ? `; completed ${formatDate(enrollments.find((enrollment) => String(enrollment.courseId ?? enrollment.id) === String(course.courseId))?.completedAt)}` : ""}.`
  ), "No course enrollments were found for this learner.");
  const certificateSource = recordsResult("Your Certificates", source, certificates.map((certificate) =>
    `${certificate.courseTitle || courseById.get(String(certificate.courseId))?.title || `Course #${certificate.courseId}`} — issued ${formatDate(certificate.issuedAt || certificate.issuedDate || certificate.createdAt)}; grade ${certificate.grade || "not available"}.`
  ), "No certificates were found for this learner.");
  const assessmentSource = recordsResult("Your Assessment Attempts", source, attempts.map((attempt) => {
    const assessment = assessmentById.get(String(attempt.assessmentId));
    const outcome = attempt.passed === true ? "Passed" : attempt.passed === false ? "Failed" : "result not recorded";
    return `${attempt.assessmentTitle || assessment?.title || `Assessment #${attempt.assessmentId}`} — ${outcome}; score ${attempt.score ?? attempt.percentage ?? "not available"}; date ${formatDate(attempt.submittedAt || attempt.completedAt || attempt.attemptedAt)}.`;
  }), "No assessment attempts were found for this learner.");
  const submissionByAssignment = new Map(submissions.map((submission) => [String(submission.assignmentId), submission]));
  const assignmentSource = recordsResult("Your Course Assignments", source, [...assignmentMap.values()].map((assignment) => {
    const course = courseById.get(String(assignment.courseId)) || courseRecords.find((item) => String(item.courseId) === String(assignment.courseId));
    const submission = submissionByAssignment.get(String(assignment.id));
    const status = submission
      ? `submitted ${formatDate(submission.submittedAt)}${submission.status ? ` (${submission.status})` : ""}`
      : "not submitted";
    return `${assignment.title || `Assignment #${assignment.id}`} for ${course?.title || course?.courseTitle || `Course #${assignment.courseId}`} — assigned ${formatDate(assignment.createdAt || assignment.assignedAt)}; due ${formatDate(assignment.dueDate)}; ${status}.`;
  }), "No assignments were found for the learner's enrolled courses.");

  return {
    user,
    sources: [profileSource, courseSource, certificateSource, assessmentSource, assignmentSource],
    totals: {
      enrolledCourses: courseRecords.length,
      completedCourses: courseRecords.filter((course) => course.isComplete).length,
      ongoingCourses: courseRecords.filter((course) => !course.isComplete).length,
      certificates: certificates.length,
      assessmentAttempts: attempts.length,
      passedAssessments: attempts.filter((attempt) => attempt.passed === true).length,
      failedAssessments: attempts.filter((attempt) => attempt.passed === false).length,
      assignments: assignmentMap.size,
    },
  };
}
