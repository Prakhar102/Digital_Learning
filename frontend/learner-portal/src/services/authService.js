import api from "./api";

export const registerUser = async (
  data
) => {
  const response = await api.post(
    "/api/auth/register",
    data
  );

  return response.data;
};

export const loginUser = async (
  data
) => {
  const response = await api.post(
    "/api/auth/login",
    data
  );

  return response.data;
};

export const refreshToken =
  async (refreshTokenValue) => {
    const response = await api.post(
      "/api/auth/refresh",
      {
        refreshToken:
          refreshTokenValue,
      }
    );

    return response.data;
  };

export const logoutUser =
  async (refreshTokenValue) => {
    const response = await api.post(
      "/api/auth/logout",
      {
        refreshToken:
          refreshTokenValue,
      }
    );

    return response.data;
  };