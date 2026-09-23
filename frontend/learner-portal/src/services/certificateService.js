import api from "./api";

const CERTIFICATES_KEY = "dlm_user_certificates_store";

export const getStoredLocalCertificates = () => {
  try {
    const raw = localStorage.getItem(CERTIFICATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const claimCourseCertificate = async ({ userId, userName, courseId, courseTitle, grade = "Passed with Distinction (100%)" }) => {
  if (!userId || !courseId) return null;

  const current = getStoredLocalCertificates();
  const existing = current.find(
    (c) => String(c.userId) === String(userId) && String(c.courseId) === String(courseId)
  );
  if (existing) return existing;

  const certId = `CERT-DLM-${Math.floor(100000 + Math.random() * 900000)}`;
  const newCert = {
    id: certId,
    certificateId: certId,
    userId: Number(userId),
    userName: userName || `Learner #${userId}`,
    courseId: Number(courseId),
    courseTitle: courseTitle || `Course #${courseId}`,
    issuedAt: new Date().toISOString(),
    grade,
    verificationCode: `DLM-VERIFY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
  };

  try {
    const response = await api.post("/api/certificates", {
      userId: Number(userId),
      courseId: Number(courseId),
      courseTitle,
      grade,
    });
    if (response?.data) {
      newCert.id = response.data.id || certId;
    }
  } catch (err) {
    console.warn("Backend certificate API error, saving locally:", err?.message || err);
  }

  const updated = [newCert, ...current.filter((c) => c.id !== newCert.id)];
  localStorage.setItem(CERTIFICATES_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));

  return newCert;
};

export const generateCertificate = async (data) => {
  return claimCourseCertificate(data);
};

export const getUserCertificates = async (userId) => {
  const localList = getStoredLocalCertificates().filter(
    (c) => !userId || String(c.userId) === String(userId)
  );

  let backendList = [];
  try {
    const response = await api.get(`/api/certificates/user/${userId}`);
    if (Array.isArray(response.data)) {
      backendList = response.data;
    }
  } catch {}

  const backendIds = new Set(backendList.map((c) => String(c.id || c.certificateId)));
  const extraLocal = localList.filter((c) => !backendIds.has(String(c.id || c.certificateId)));

  return [...extraLocal, ...backendList];
};

export const getCertificateById = async (certificateId) => {
  const localList = getStoredLocalCertificates();
  const found = localList.find(
    (c) => String(c.id) === String(certificateId) || String(c.certificateId) === String(certificateId)
  );

  try {
    const response = await api.get(`/api/certificates/${certificateId}`);
    if (response?.data) return { ...found, ...response.data };
  } catch {}

  return found || null;
};

export const downloadCertificate = async (certificateId) => {
  try {
    const response = await api.get(`/api/certificates/${certificateId}/download`, {
      responseType: "blob",
    });
    return response.data;
  } catch {
    return null;
  }
};

export const checkEligibility = async (userId, courseId) => {
  try {
    const response = await api.get(
      `/api/certificates/eligible?userId=${userId}&courseId=${courseId}`
    );
    return response.data;
  } catch {
    return { eligible: true };
  }
};
