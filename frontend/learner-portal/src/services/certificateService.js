import api from "./api";

export const generateCertificate = async (data) => {
  const response = await api.post("/api/certificates", data);
  return response.data;
};

export const getUserCertificates = async (userId) => {
  const response = await api.get(`/api/certificates/user/${userId}`);
  return response.data;
};

export const getCertificateById = async (certificateId) => {
  const response = await api.get(`/api/certificates/${certificateId}`);
  return response.data;
};

export const downloadCertificate = async (certificateId) => {
  const response = await api.get(
    `/api/certificates/${certificateId}/download`,
    { responseType: "blob" }
  );
  return response.data;
};

export const checkEligibility = async (userId, courseId) => {
  const response = await api.get(
    `/api/certificates/eligible?userId=${userId}&courseId=${courseId}`
  );
  return response.data;
};
