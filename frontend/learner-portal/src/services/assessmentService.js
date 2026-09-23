import api from "./api";
import { recordUserActivity } from "./streakService";

const SCHEDULED_ASSESSMENTS_KEY = "dlm_scheduled_assessments_store";
const ASSESSMENT_ATTEMPTS_KEY = "dlm_assessment_attempts_store";

// ── Scheduled Assessments Engine ──

export const getStoredAssessments = () => {
  try {
    const raw = localStorage.getItem(SCHEDULED_ASSESSMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveScheduledAssessment = (assessmentData) => {
  try {
    const list = getStoredAssessments();
    const newAssessment = {
      id: assessmentData.id || Date.now(),
      title: assessmentData.title || "Course Assessment",
      description: assessmentData.description || "",
      courseId: Number(assessmentData.courseId),
      courseTitle: assessmentData.courseTitle || `Course #${assessmentData.courseId}`,
      instructorId: assessmentData.instructorId || 1,
      type: assessmentData.type || "MCQ", // MCQ or DESCRIPTIVE
      durationMinutes: Number(assessmentData.durationMinutes) || 30,
      scheduledAt: assessmentData.scheduledAt || new Date().toISOString(), // ISO string
      questions: assessmentData.questions || [],
      createdAt: new Date().toISOString(),
      totalMarks: assessmentData.totalMarks || (assessmentData.questions?.length ? assessmentData.questions.length * 10 : 100),
    };
    list.unshift(newAssessment);
    localStorage.setItem(SCHEDULED_ASSESSMENTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("storage"));
    return newAssessment;
  } catch (e) {
    console.error("Failed to save scheduled assessment:", e);
    return null;
  }
};

export const deleteAssessment = (id) => {
  try {
    const list = getStoredAssessments();
    const updated = list.filter((a) => String(a.id) !== String(id));
    localStorage.setItem(SCHEDULED_ASSESSMENTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return updated;
  } catch (e) {
    console.error("Failed to delete assessment:", e);
    return [];
  }
};

export const getScheduledAssessmentsByCourse = (courseId) => {
  const all = getStoredAssessments();
  return all.filter((a) => Number(a.courseId) === Number(courseId));
};

export const getScheduledAssessmentById = (id) => {
  const all = getStoredAssessments();
  return all.find((a) => String(a.id) === String(id));
};

// ── Attempts & Submissions Engine ──

export const getStoredAttempts = () => {
  try {
    const raw = localStorage.getItem(ASSESSMENT_ATTEMPTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return list.map((a) => {
      let resolvedName = a.learnerName || a.userName || a.studentName || a.name;
      if (!resolvedName || resolvedName.includes("undefined") || resolvedName.includes("null")) {
        resolvedName = a.learnerEmail ? a.learnerEmail.split("@")[0] : (a.learnerId || a.userId ? `Learner #${a.learnerId || a.userId}` : "Prakhar Parth");
      }
      return {
        ...a,
        learnerName: resolvedName,
        learnerId: a.learnerId || a.userId || 1,
      };
    });
  } catch {
    return [];
  }
};

export const recordAssessmentSubmission = (attemptData) => {
  try {
    const attempts = getStoredAttempts();
    const pct = Number(attemptData.percentage) || (attemptData.totalQuestions ? Math.round(((attemptData.correctCount || 0) / attemptData.totalQuestions) * 100) : Number(attemptData.score) || 0);
    const passed = pct >= (attemptData.passingScore || 60);

    const newAttempt = {
      id: attemptData.id || Date.now(),
      assessmentId: attemptData.assessmentId,
      assessmentTitle: attemptData.assessmentTitle || "Course Assessment",
      courseId: attemptData.courseId,
      courseTitle: attemptData.courseTitle,
      learnerId: attemptData.learnerId || attemptData.userId || 1,
      learnerName: attemptData.learnerName || attemptData.userName || "Learner",
      learnerEmail: attemptData.learnerEmail || "learner@dlm.edu",
      score: pct,
      totalQuestions: Number(attemptData.totalQuestions) || 1,
      correctCount: Number(attemptData.correctCount) || 0,
      percentage: pct,
      passed: attemptData.passed !== undefined ? attemptData.passed : passed,
      answers: attemptData.answers || {},
      submittedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: "COMPLETED",
    };

    const updated = [
      newAttempt,
      ...attempts.filter(
        (a) => !(String(a.assessmentId) === String(newAttempt.assessmentId) && String(a.learnerId) === String(newAttempt.learnerId))
      ),
    ];
    localStorage.setItem(ASSESSMENT_ATTEMPTS_KEY, JSON.stringify(updated));

    // Also record streak activity for user
    if (newAttempt.learnerId) {
      recordUserActivity(newAttempt.learnerId, "ASSESSMENT_SUBMITTED", {
        score: newAttempt.score,
        assessmentTitle: newAttempt.assessmentTitle,
      });
    }

    window.dispatchEvent(new Event("storage"));
    return newAttempt;
  } catch (e) {
    console.error("Failed to record assessment submission:", e);
    return null;
  }
};

export const getLearnerAssessmentAttempts = (learnerId) => {
  const attempts = getStoredAttempts();
  if (!learnerId) return attempts;
  return attempts.filter(
    (a) =>
      String(a.learnerId) === String(learnerId) ||
      String(a.userId) === String(learnerId) ||
      !a.learnerId
  );
};

export const hasLearnerAttempted = (assessmentId, learnerId) => {
  const attempts = getStoredAttempts();
  return attempts.some(
    (a) => String(a.assessmentId) === String(assessmentId) && (String(a.learnerId) === String(learnerId) || !learnerId)
  );
};

// ── Global & Cohort Dynamic Leaderboard ──

export const getGlobalDynamicLeaderboard = () => {
  try {
    const attempts = getStoredAttempts();
    // Aggregate by learnerId
    const map = {};

    attempts.forEach((att) => {
      const uKey = String(att.learnerId);
      if (!map[uKey]) {
        map[uKey] = {
          learnerId: att.learnerId,
          learnerName: att.learnerName,
          learnerEmail: att.learnerEmail,
          totalScore: 0,
          attemptsCount: 0,
          highestScore: 0,
          assessmentsPassed: 0,
          lastActive: att.submittedAt,
        };
      }
      map[uKey].totalScore += att.score || att.percentage || 0;
      map[uKey].attemptsCount += 1;
      map[uKey].highestScore = Math.max(map[uKey].highestScore, att.score || att.percentage || 0);
      if ((att.percentage || att.score) >= 60) {
        map[uKey].assessmentsPassed += 1;
      }
      if (new Date(att.submittedAt) > new Date(map[uKey].lastActive)) {
        map[uKey].lastActive = att.submittedAt;
      }
    });

    const list = Object.values(map).map((u) => ({
      ...u,
      averageScore: Math.round(u.totalScore / (u.attemptsCount || 1)),
      rankPoints: u.totalScore + u.assessmentsPassed * 50,
    }));

    // Sort by rankPoints descending
    list.sort((a, b) => b.rankPoints - a.rankPoints);

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  } catch (e) {
    console.error("Failed to compute leaderboard:", e);
    return [];
  }
};

// ── Backend API Delegations ──

export const createAssessment = async (data) => {
  try {
    const response = await api.post("/api/assessments", data);
    return response.data;
  } catch {
    return saveScheduledAssessment(data);
  }
};

export const getAssessmentsByCourse = async (courseId) => {
  try {
    const response = await api.get(`/api/assessments/course/${courseId}`);
    return response.data && response.data.length > 0 ? response.data : getScheduledAssessmentsByCourse(courseId);
  } catch {
    return getScheduledAssessmentsByCourse(courseId);
  }
};

export const getAssessmentById = async (id) => {
  try {
    const response = await api.get(`/api/assessments/${id}`);
    return response.data || getScheduledAssessmentById(id);
  } catch {
    return getScheduledAssessmentById(id);
  }
};

export const getAllAssessments = async () => {
  try {
    const response = await api.get("/api/assessments");
    const backendData = response.data || [];
    const localData = getStoredAssessments();
    const combined = [...backendData, ...localData];
    // deduplicate by id
    const seen = new Set();
    return combined.filter((item) => {
      const key = String(item.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return getStoredAssessments();
  }
};

export const addQuestion = async (data) => {
  const response = await api.post("/api/questions", data);
  return response.data;
};

export const addQuestionToAssessment = addQuestion;

export const getQuestionsByAssessment = async (assessmentId) => {
  try {
    const response = await api.get(`/api/questions/assessment/${assessmentId}`);
    return response.data;
  } catch {
    const local = getScheduledAssessmentById(assessmentId);
    return local?.questions || [];
  }
};

export const getAssessmentQuestions = getQuestionsByAssessment;

export const submitAttempt = async (data) => {
  recordAssessmentSubmission(data);
  try {
    const response = await api.post("/api/attempts", data);
    return response.data;
  } catch {
    return { success: true, ...data };
  }
};

export const getUserAttempts = async (userId) => {
  const localAttempts = getLearnerAssessmentAttempts(userId);
  try {
    const response = await api.get(`/api/attempts/user/${userId}`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      const localIds = new Set(localAttempts.map((a) => String(a.id || a.assessmentId)));
      const extraBackend = response.data.filter((a) => !localIds.has(String(a.id || a.assessmentId)));
      return [...localAttempts, ...extraBackend];
    }
  } catch {}
  return localAttempts;
};

export const getAssessmentDashboard = async (assessmentId) => {
  const response = await api.get(`/api/attempts/assessment/${assessmentId}/dashboard`);
  return response.data;
};

export const getLeaderboard = async (assessmentId) => {
  try {
    const response = await api.get(`/api/attempts/assessment/${assessmentId}/leaderboard`);
    if (response.data && response.data.length > 0) return response.data;
    return getGlobalDynamicLeaderboard();
  } catch {
    return getGlobalDynamicLeaderboard();
  }
};

