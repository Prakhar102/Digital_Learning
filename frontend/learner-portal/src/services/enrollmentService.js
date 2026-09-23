import api from "./api";
import { sendNotification, notifyInstructor } from "./notificationService";
import { recordUserActivity } from "./streakService";

const ENROLLMENTS_STORAGE_KEY = "dlm_realtime_enrollments";

export const getRealtimeEnrollmentRegistry = () => {
  try {
    const raw = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];

    return list.map((e) => {
      let inst = e.instructorName;
      if (!inst || inst === "Faculty Instructor" || inst === "Assigned Faculty") {
        try {
          const courses = JSON.parse(localStorage.getItem("dlm_created_courses") || "[]");
          const matchedCourse = courses.find((c) => String(c.id) === String(e.courseId));
          if (matchedCourse?.instructorName && matchedCourse.instructorName !== "Faculty Instructor") {
            inst = matchedCourse.instructorName;
          }
        } catch {}
      }
      if (!inst || inst === "Faculty Instructor" || inst === "Assigned Faculty") {
        try {
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          const matchedU = users.find(
            (u) =>
              Number(u.id) === Number(e.instructorId) ||
              (u.role?.includes("INSTRUCTOR") && u.fullName && u.fullName !== "Faculty Instructor")
          );
          if (matchedU?.fullName) {
            inst = matchedU.fullName;
          }
        } catch {}
      }
      if (!inst || inst === "Faculty Instructor" || inst === "Assigned Faculty") {
        inst = "Swati Kumari";
      }

      return {
        ...e,
        instructorName: inst,
      };
    });
  } catch {
    return [];
  }
};

export const saveRealtimeEnrollment = (enrollment) => {
  try {
    const current = getRealtimeEnrollmentRegistry();
    const updated = [
      {
        ...enrollment,
        id: enrollment.id || Date.now(),
        enrolledAt: enrollment.enrolledAt || new Date().toISOString(),
      },
      ...current.filter(
        (e) => !(String(e.userId) === String(enrollment.userId) && String(e.courseId) === String(enrollment.courseId))
      ),
    ];
    localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return updated;
  } catch (err) {
    console.warn("Could not save to realtime enrollment registry:", err);
    return [];
  }
};

export const updateEnrollmentProgress = (userId, courseId, updates = {}) => {
  try {
    const current = getRealtimeEnrollmentRegistry();
    const updated = current.map((e) => {
      if (String(e.userId) === String(userId) && String(e.courseId) === String(courseId)) {
        const isFinished = updates.status === "COMPLETED" || updates.progress >= 100 || updates.isCompleted;
        return {
          ...e,
          ...updates,
          status: isFinished ? "COMPLETED" : (updates.status || e.status || "ACTIVE"),
          progress: updates.progress !== undefined ? updates.progress : (isFinished ? 100 : e.progress),
          completedAt: isFinished ? (e.completedAt || new Date().toISOString()) : e.completedAt,
        };
      }
      return e;
    });
    localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return updated;
  } catch (err) {
    console.warn("Could not update enrollment progress:", err);
    return [];
  }
};

export const enrollInCourse = async (userId, courseId, courseMeta = {}, userMeta = {}) => {
  let resData = { id: Date.now(), userId: Number(userId), courseId: Number(courseId), enrolledAt: new Date().toISOString() };
  try {
    const response = await api.post("/api/enrollments", {
      userId: Number(userId),
      courseId: Number(courseId),
    });
    if (response?.data) {
      resData = response.data;
    }
  } catch (err) {
    console.warn("Backend enrollment call fallback to local event propagation:", err);
  }

  // 1. Record enrollment in dynamic real-time store
  const learnerName = userMeta.fullName || userMeta.username || `Learner #${userId}`;
  const learnerEmail = userMeta.email || `student_${userId}@dlm.edu`;
  const courseTitle = courseMeta.title || `Course #${courseId}`;
  const instructorId = courseMeta.ownerUserId || courseMeta.instructorId || courseMeta.authorId || 1;
  const instructorName = courseMeta.instructorName || courseMeta.author || "Faculty Instructor";

  const enrollmentRecord = {
    id: resData.id || Date.now(),
    userId: Number(userId),
    courseId: Number(courseId),
    learnerName,
    learnerEmail,
    courseTitle,
    instructorId: Number(instructorId),
    instructorName,
    status: "ACTIVE",
    progress: 0,
    enrolledAt: new Date().toISOString(),
  };

  saveRealtimeEnrollment(enrollmentRecord);
  recordUserActivity(userId, "COURSE_ENROLLED", { courseId, courseTitle });

  // 2. Dispatch Real-time Notification to Course Instructor
  try {
    await notifyInstructor({
      instructorId: Number(instructorId) || 3,
      subject: `New Learner Enrolled: ${learnerName}`,
      message: `${learnerName} (${learnerEmail}) has just enrolled into your course "${courseTitle}". You can monitor their progress in your Instructor Console.`,
    });
  } catch (notifErr) {
    console.warn("Could not notify instructor:", notifErr);
  }

  // 3. Dispatch Real-time Notification to System Administrators (Admin ID 1 / broadcast)
  try {
    await sendNotification({
      userId: 1, // Default root admin
      subject: `Platform Enrollment: "${courseTitle}"`,
      message: `System Alert: ${learnerName} enrolled in course "${courseTitle}" taught by ${instructorName}. Live platform metrics refreshed.`,
    });
  } catch (adminNotifErr) {
    console.warn("Could not notify admin:", adminNotifErr);
  }

  return resData;
};

export const getMyCourses = async (userId) => {
  const registry = getRealtimeEnrollmentRegistry();
  const localList = registry.filter((e) => !userId || String(e.userId) === String(userId));

  let backendList = [];
  try {
    const response = await api.get(`/api/enrollments/user/${userId}`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      backendList = response.data;
    }
  } catch {}

  const backendCourseIds = new Set(backendList.map((e) => String(e.courseId)));
  const extraLocal = localList.filter((e) => !backendCourseIds.has(String(e.courseId)));

  return [...backendList, ...extraLocal];
};

export const getUserEnrollments = getMyCourses;

export const getInstructorEnrolledStudents = (instructorId, instructorCourses = []) => {
  const registry = getRealtimeEnrollmentRegistry();
  if (!instructorId) return registry;

  const courseIdSet = new Set(
    Array.isArray(instructorCourses)
      ? instructorCourses.map((c) => String(c.id || c.courseId))
      : []
  );

  return registry.filter((e) => {
    // 1. Match by explicit instructorId
    if (e.instructorId && Number(e.instructorId) === Number(instructorId)) return true;
    // 2. Match by course ownership
    if (e.courseId && courseIdSet.has(String(e.courseId))) return true;
    // 3. If instructorCourses is empty or unassigned, return true
    if (!e.instructorId || courseIdSet.size === 0) return true;
    return false;
  });
};

export const getAllRealtimeEnrollments = () => {
  return getRealtimeEnrollmentRegistry();
};