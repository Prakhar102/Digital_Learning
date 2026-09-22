import api from "./api";

// ── Categories ──

export const getCategories = async () => {
  const response = await api.get("/api/categories");
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post("/api/categories", data);
  return response.data;
};

// ── Courses ──

export const createCourse = async (courseData) => {
  const response = await api.post("/api/courses", courseData);
  return response.data;
};

export const getAllCourses = async () => {
  const response = await api.get("/api/courses");
  return response.data;
};

export const getCourseById = async (courseId) => {
  const response = await api.get(`/api/courses/${courseId}`);
  return response.data;
};

export const getPublishedCourses = async () => {
  const response = await api.get("/api/courses/published");
  return response.data;
};

export const searchCourses = async (keyword) => {
  const response = await api.get(`/api/courses/search?keyword=${keyword}`);
  return response.data;
};

export const getCoursesByCategory = async (categoryId) => {
  const response = await api.get(`/api/courses/category/${categoryId}`);
  return response.data;
};

export const getCourseDetails = async (courseId) => {
  const response = await api.get(`/api/courses/${courseId}/details`);
  return response.data;
};

export const publishCourse = async (courseId) => {
  const response = await api.put(`/api/courses/${courseId}/publish`);
  return response.data;
};