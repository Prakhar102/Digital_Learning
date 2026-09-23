import api from "./api";

const PROGRESS_STORAGE_KEY = "dlm_user_progress_store";

export const getStoredProgressMap = () => {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const updateProgress = async (data) => {
  const { userId, courseId, lessonId, status = "COMPLETED" } = data;
  
  // Local store update
  if (userId && courseId) {
    try {
      const allProg = getStoredProgressMap();
      const userKey = `u_${userId}_c_${courseId}`;
      const userProg = allProg[userKey] || { completedLessonIds: [] };
      const set = new Set(userProg.completedLessonIds || []);
      if (lessonId) set.add(lessonId);
      allProg[userKey] = {
        userId,
        courseId,
        completedLessonIds: Array.from(set),
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(allProg));
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.warn("Could not save progress locally:", e);
    }
  }

  try {
    const response = await api.post("/api/progress", data);
    return response.data;
  } catch (err) {
    return { status: "SAVED_LOCALLY", ...data };
  }
};

export const getProgress = async (userId, courseId) => {
  const allProg = getStoredProgressMap();
  const userKey = `u_${userId}_c_${courseId}`;
  const localProg = allProg[userKey] || { completedLessonIds: [] };

  try {
    const response = await api.get(
      `/api/progress?userId=${userId}&courseId=${courseId}`
    );
    if (response?.data) {
      const combined = new Set([
        ...(response.data.completedLessonIds || []),
        ...(localProg.completedLessonIds || []),
      ]);
      return { ...response.data, completedLessonIds: Array.from(combined) };
    }
  } catch {}

  return localProg;
};

export const getProgressDashboard = async (userId) => {
  try {
    const response = await api.get(`/api/progress/dashboard?userId=${userId}`);
    if (response?.data && (response.data.completedCourses > 0 || response.data.inProgressCourses > 0)) {
      return response.data;
    }
  } catch {}

  const allProg = getStoredProgressMap();
  let certsCount = 0;
  try {
    const rawCerts = localStorage.getItem("dlm_user_certificates_store");
    const certs = rawCerts ? JSON.parse(rawCerts) : [];
    certsCount = certs.filter((c) => String(c.userId) === String(userId)).length;
  } catch {}

  let inProgressCount = 0;
  Object.entries(allProg).forEach(([key, val]) => {
    if (key.startsWith(`u_${userId}_`)) {
      if (val.completedLessonIds && val.completedLessonIds.length > 0) {
        inProgressCount++;
      }
    }
  });

  return {
    completedCourses: certsCount,
    inProgressCourses: Math.max(0, inProgressCount - certsCount),
  };
};
