import api from "./api";

// ── Modules ──

export const createModule = async (data) => {
  const response = await api.post("/api/modules", data);
  return response.data;
};

export const getModulesByCourse = async (courseId) => {
  const response = await api.get(`/api/modules/course/${courseId}`);
  return response.data;
};

// ── Lessons ──

export const createLesson = async (data) => {
  const response = await api.post("/api/lessons", data);
  return response.data;
};

export const getLessonsByModule = async (moduleId) => {
  const response = await api.get(`/api/lessons/module/${moduleId}`);
  return response.data;
};
