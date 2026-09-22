import api from "./api";

export const getCategories =
  async () => {

    const response =
      await api.get(
        "/api/categories"
      );

    return response.data;
  };

export const createCourse =
  async (courseData) => {

    const response =
      await api.post(
        "/api/courses",
        courseData
      );

    return response.data;
  };

export const getAllCourses =
  async () => {

    const response =
      await api.get(
        "/api/courses"
      );

    return response.data;
  };

export const publishCourse =
  async (courseId) => {

    const response =
      await api.put(
        `/api/courses/${courseId}/publish`
      );

    return response.data;
  };