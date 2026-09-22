import api from "./api";

export const getMyCourses = async (
  userId
) => {

  const response =
    await api.get(
      `/api/enrollments/user/${userId}`
    );

  return response.data;
};