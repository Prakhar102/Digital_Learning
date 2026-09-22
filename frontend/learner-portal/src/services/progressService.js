import api from "./api";

export const updateProgress = async (data) => {
  const response = await api.post("/api/progress", data);
  return response.data;
};

export const getProgress = async (userId, courseId) => {
  const response = await api.get(
    `/api/progress?userId=${userId}&courseId=${courseId}`
  );
  return response.data;
};

export const getProgressDashboard = async (userId) => {
  const response = await api.get(`/api/progress/dashboard?userId=${userId}`);
  return response.data;
};
