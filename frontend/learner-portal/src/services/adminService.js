import api from "./api";

export const createInstructor = async (
  instructorData
) => {

  const response =
    await api.post(
      "/api/admin/instructors",
      instructorData
    );

  return response.data;
};

export const getAdminStats =
  async () => {

    const response =
      await api.get(
        "/api/admin/stats"
      );

    return response.data;
};

export const getAllInstructors =
  async () => {

    const response =
      await api.get(
        "/api/admin/instructors"
      );

    return response.data;
};