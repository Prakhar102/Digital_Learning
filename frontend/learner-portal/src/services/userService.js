import api from "./api";

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const response = await api.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response?.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        return response.data;
      }
    }
  } catch (err) {
    console.warn("Failed /api/users/me, using local user fallback:", err?.message || err);
  }

  const stored = localStorage.getItem("user");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed && (parsed.fullName || parsed.email)) return parsed;
    } catch { }
  }

  return {
    id: 1,
    fullName: "Swati Kumari",
    email: "instructor@dlm.edu",
    role: "ROLE_INSTRUCTOR",
  };
};

export const getDashboardStats = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await api.get("/api/users/dashboard-stats", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
