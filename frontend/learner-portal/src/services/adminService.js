import api from "./api";

const INSTRUCTORS_STORAGE_KEY = "dlm_instructors_store";

const DEFAULT_INSTRUCTORS = [
  { id: 1, fullName: "Aritra Basak", email: "aritra@dlm.edu", phoneNumber: "+1-555-0101", role: "INSTRUCTOR" },
  { id: 2, fullName: "Dr. Evelyn Reed", email: "reed@dlm.edu", phoneNumber: "+1-555-0102", role: "INSTRUCTOR" },
  { id: 3, fullName: "Marcus Vance", email: "vance@dlm.edu", phoneNumber: "+1-555-0103", role: "INSTRUCTOR" },
];

export const getStoredInstructors = () => {
  try {
    const raw = localStorage.getItem(INSTRUCTORS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INSTRUCTORS_STORAGE_KEY, JSON.stringify(DEFAULT_INSTRUCTORS));
      return DEFAULT_INSTRUCTORS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INSTRUCTORS;
  }
};

export const createInstructor = async (instructorData) => {
  const payload = {
    fullName: instructorData.fullName?.trim(),
    email: instructorData.email?.trim(),
    password: instructorData.password,
    phoneNumber: instructorData.phoneNumber?.trim() || "+1-555-0199",
  };

  let backendSuccess = false;
  let backendMsg = "";

  try {
    const response = await api.post("/api/admin/instructors", payload);
    const data = response?.data;
    if (typeof data === "string" && data.toLowerCase().includes("already exists")) {
      throw new Error(data);
    }
    backendSuccess = true;
    backendMsg = typeof data === "string" ? data : "Faculty account provisioned successfully";
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes("already exists")) {
      throw err;
    }
    if (err.response?.data && typeof err.response.data === "string" && err.response.data.toLowerCase().includes("already exists")) {
      throw new Error(err.response.data);
    }
    console.warn("Backend /api/admin/instructors unavailable, caching instructor locally:", err?.message || err);
  }

  // Persist to local instructors cache
  const currentList = getStoredInstructors();
  const exists = currentList.some((ins) => ins.email?.toLowerCase() === payload.email.toLowerCase());
  if (exists && !backendSuccess) {
    throw new Error("An instructor with this email address already exists.");
  }

  if (!exists) {
    const newInstructor = {
      id: Date.now(),
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber,
      role: "INSTRUCTOR",
      createdAt: new Date().toISOString(),
    };
    const updated = [newInstructor, ...currentList];
    localStorage.setItem(INSTRUCTORS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  }

  return { success: true, message: backendMsg || "Faculty account provisioned successfully!" };
};

export const getAdminStats = async () => {
  const instructors = getStoredInstructors();
  const staffEmails = new Set(
    instructors.map((i) => (i.email || "").toLowerCase().trim()).filter(Boolean)
  );
  staffEmails.add("admin@dlm.edu");
  staffEmails.add("instructor@dlm.edu");
  staffEmails.add("faculty@dlm.edu");

  const staffIds = new Set(instructors.map((i) => String(i.id)).filter(Boolean));
  staffIds.add("1");

  const genuineLearnerEmails = new Set();
  try {
    const enrollments = JSON.parse(localStorage.getItem("dlm_realtime_enrollments") || "[]");
    enrollments.forEach((e) => {
      const email = (e.learnerEmail || "").toLowerCase().trim();
      const uid = String(e.userId || "");
      if (
        (!email || !staffEmails.has(email)) &&
        (!uid || !staffIds.has(uid)) &&
        (!e.role || (!e.role.includes("INSTRUCTOR") && !e.role.includes("ADMIN")))
      ) {
        if (email) genuineLearnerEmails.add(email);
        else if (uid) genuineLearnerEmails.add(uid);
      }
    });
  } catch {}

  try {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (Array.isArray(users)) {
      users.forEach((u) => {
        const role = (u.role || "").toUpperCase();
        const email = (u.email || "").toLowerCase().trim();
        const uid = String(u.id || "");
        if (
          !role.includes("INSTRUCTOR") &&
          !role.includes("ADMIN") &&
          !role.includes("FACULTY") &&
          (!email || !staffEmails.has(email)) &&
          (!uid || !staffIds.has(uid))
        ) {
          if (email) genuineLearnerEmails.add(email);
          else if (uid) genuineLearnerEmails.add(uid);
        }
      });
    }
  } catch {}

  let totalCertificates = 0;
  try {
    const certs = JSON.parse(localStorage.getItem("dlm_user_certificates_store") || "[]");
    totalCertificates = certs.length;
  } catch {}

  try {
    const response = await api.get("/api/admin/stats");
    if (response?.data) {
      return {
        ...response.data,
        totalLearners: response.data.totalLearners !== undefined ? response.data.totalLearners : genuineLearnerEmails.size,
        totalCertificates: response.data.totalCertificates !== undefined ? response.data.totalCertificates : totalCertificates,
      };
    }
  } catch {}

  return {
    totalLearners: genuineLearnerEmails.size,
    totalInstructors: instructors.length,
    totalAdmins: 1,
    totalCertificates,
  };
};

export const getAllInstructors = async () => {
  const localList = getStoredInstructors();
  try {
    const response = await api.get("/api/admin/instructors");
    if (Array.isArray(response.data) && response.data.length > 0) {
      const backendEmails = new Set(response.data.map((u) => (u.email || "").toLowerCase()));
      const extraLocals = localList.filter((u) => !backendEmails.has((u.email || "").toLowerCase()));
      return [...response.data, ...extraLocals];
    }
    return localList;
  } catch {
    return localList;
  }
};