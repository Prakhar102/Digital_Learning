import api from "./api";

export const getCurrentUser = async () => {
  const token =
    localStorage.getItem(
      "accessToken"
    );

  const response = await api.get(
    "/api/users/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getDashboardStats = async () => {
  const token =
    localStorage.getItem(
      "accessToken"
    );

  const response = await api.get(
    "/api/users/dashboard-stats",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};