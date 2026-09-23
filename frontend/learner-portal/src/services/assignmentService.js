import api from "./api";

const ASSIGNMENTS_KEY = "dlm_created_assignments_store";
const SUBMISSIONS_KEY = "dlm_submissions_store";

export const getStoredLocalAssignments = () => {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const getStoredLocalSubmissions = () => {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const createAssignment = async (assignmentData) => {
  let saved = null;
  try {
    const response = await api.post("/api/assignments", assignmentData);
    if (response?.data) {
      saved = {
        ...assignmentData,
        ...response.data,
        id: response.data.id || Date.now(),
      };
    }
  } catch (err) {
    console.warn("Backend /api/assignments error, saving assignment locally:", err?.message || err);
    saved = {
      ...assignmentData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
  }

  if (saved) {
    const current = getStoredLocalAssignments();
    const updated = [saved, ...current.filter((a) => String(a.id) !== String(saved.id))];
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  }

  return saved;
};

export const getAssignmentById = async (assignmentId) => {
  const localList = getStoredLocalAssignments();
  const found = localList.find((a) => String(a.id) === String(assignmentId));

  try {
    const response = await api.get(`/api/assignments/${assignmentId}`);
    if (response?.data) return response.data;
  } catch {}

  return found || null;
};

export const getInstructorAssignments = async (instructorId) => {
  const localList = getStoredLocalAssignments();
  let backendList = [];
  try {
    const response = await api.get(`/api/assignments/instructor/${instructorId}`);
    if (Array.isArray(response.data)) {
      backendList = response.data;
    }
  } catch (err) {
    console.warn("Backend /api/assignments/instructor call:", err?.message || err);
  }

  const backendIds = new Set(backendList.map((a) => String(a.id)));
  const extraLocal = localList.filter((a) => {
    if (backendIds.has(String(a.id))) return false;
    if (!instructorId) return true;
    return !a.instructorId || Number(a.instructorId) === Number(instructorId);
  });

  return [...extraLocal, ...backendList];
};

export const getAllAssignments = async () => {
  const localList = getStoredLocalAssignments();
  let backendList = [];
  try {
    const response = await api.get("/api/assignments");
    if (Array.isArray(response.data)) {
      backendList = response.data;
    }
  } catch (err) {
    // fallback
  }

  const backendIds = new Set(backendList.map((a) => String(a.id)));
  const extraLocal = localList.filter((a) => !backendIds.has(String(a.id)));
  return [...extraLocal, ...backendList];
};

export const getCourseAssignments = async (courseId) => {
  const localList = getStoredLocalAssignments();
  let backendList = [];
  try {
    const response = await api.get(`/api/assignments/course/${courseId}`);
    if (Array.isArray(response.data)) {
      backendList = response.data;
    }
  } catch (err) {
    console.warn("Backend /api/assignments/course call:", err?.message || err);
  }

  const backendIds = new Set(backendList.map((a) => String(a.id)));
  const extraLocal = localList.filter(
    (a) => !backendIds.has(String(a.id)) && String(a.courseId) === String(courseId)
  );

  return [...extraLocal, ...backendList];
};

export const submitAssignment = async (submissionData) => {
  let saved = null;
  try {
    const response = await api.post("/api/submissions", submissionData);
    if (response?.data) {
      saved = {
        ...submissionData,
        ...response.data,
        id: response.data.id || Date.now(),
        submittedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("Backend /api/submissions error, saving submission locally:", err?.message || err);
    saved = {
      ...submissionData,
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      grade: null,
      feedback: "",
    };
  }

  if (saved) {
    const current = getStoredLocalSubmissions();
    const updated = [saved, ...current.filter((s) => String(s.id) !== String(saved.id))];
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  }

  return saved;
};

export const getAssignmentSubmissions = async (assignmentId) => {
  const localList = getStoredLocalSubmissions();
  let backendList = [];
  try {
    const response = await api.get(`/api/submissions/assignment/${assignmentId}`);
    if (Array.isArray(response.data)) {
      backendList = response.data;
    }
  } catch (err) {
    console.warn("Backend /api/submissions/assignment call:", err?.message || err);
  }

  const backendIds = new Set(backendList.map((s) => String(s.id)));
  const extraLocal = localList.filter(
    (s) => !backendIds.has(String(s.id)) && String(s.assignmentId) === String(assignmentId)
  );

  return [...extraLocal, ...backendList];
};

export const gradeSubmission = async (submissionId, gradeData) => {
  try {
    await api.put(`/api/submissions/${submissionId}/grade`, gradeData);
  } catch (err) {
    console.warn("Backend /api/submissions/grade call:", err?.message || err);
  }

  // Update local store
  const current = getStoredLocalSubmissions();
  const updated = current.map((s) =>
    String(s.id) === String(submissionId)
      ? { ...s, ...gradeData, grade: gradeData.grade ?? gradeData.marks, marks: gradeData.marks ?? gradeData.grade }
      : s
  );
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("storage"));

  return { id: submissionId, ...gradeData };
};

export const getLearnerSubmissions = async (learnerId) => {
  const localList = getStoredLocalSubmissions();
  let backendList = [];
  try {
    const response = await api.get(`/api/submissions/learner/${learnerId}`);
    if (Array.isArray(response.data)) {
      backendList = response.data;
    }
  } catch (err) {
    console.warn("Backend /api/submissions/learner call:", err?.message || err);
  }

  const backendIds = new Set(backendList.map((s) => String(s.id)));
  const extraLocal = localList.filter(
    (s) => !backendIds.has(String(s.id)) && String(s.learnerId) === String(learnerId)
  );

  return [...extraLocal, ...backendList];
};

export const uploadAssignmentFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/api/assignments/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};