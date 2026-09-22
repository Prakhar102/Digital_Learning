import api from "./api";

// ── Assessments ──

export const createAssessment = async (data) => {
  const response = await api.post("/api/assessments", data);
  return response.data;
};

export const getAssessmentsByCourse = async (courseId) => {
  const response = await api.get(`/api/assessments/course/${courseId}`);
  return response.data;
};

export const getAssessmentById = async (id) => {
  const response = await api.get(`/api/assessments/${id}`);
  return response.data;
};

export const getAllAssessments = async () => {
  try {
    const response = await api.get("/api/assessments");
    return response.data || [];
  } catch (e) {
    return [];
  }
};

// ── Questions ──

export const addQuestion = async (data) => {
  const response = await api.post("/api/questions", data);
  return response.data;
};

export const addQuestionToAssessment = addQuestion;

export const getQuestionsByAssessment = async (assessmentId) => {
  const response = await api.get(`/api/questions/assessment/${assessmentId}`);
  return response.data;
};

export const getAssessmentQuestions = getQuestionsByAssessment;

// ── Attempts ──

export const submitAttempt = async (data) => {
  const response = await api.post("/api/attempts", data);
  return response.data;
};

export const getUserAttempts = async (userId) => {
  const response = await api.get(`/api/attempts/user/${userId}`);
  return response.data;
};

export const getAssessmentDashboard = async (assessmentId) => {
  const response = await api.get(
    `/api/attempts/assessment/${assessmentId}/dashboard`
  );
  return response.data;
};

export const getLeaderboard = async (assessmentId) => {
  const response = await api.get(
    `/api/attempts/assessment/${assessmentId}/leaderboard`
  );
  return response.data;
};
