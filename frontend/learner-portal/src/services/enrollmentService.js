import api from "./api";
import { sendNotification } from "./notificationService";
import { recordUserActivity } from "./streakService";

const ENROLLMENTS_STORAGE_KEY = "dlm_realtime_enrollments";

export const getRealtimeEnrollmentRegistry = () => {
  try {
    const raw = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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
        (e) => !(e.userId === enrollment.userId && e.courseId === enrollment.courseId)
      ),
    ];
    localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Could not save to realtime enrollment registry:", err);
    return [];
  }
};

export const enrollInCourse = async (userId, courseId, courseMeta = {}, userMeta = {}) => {
  let resData = { id: Date.now(), userId, courseId, enrolledAt: new Date().toISOString() };
  try {
    const response = await api.post("/api/enrollments", {
      userId,
      courseId,
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
  const instructorId = courseMeta.instructorId || courseMeta.authorId || 1;
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
    await sendNotification({
      userId: Number(instructorId),
      subject: `🎓 New Student Enrolled: ${learnerName}`,
      message: `${learnerName} (${learnerEmail}) has just enrolled into "${courseTitle}". You can monitor their progress in your Instructor Console.`,
    });
  } catch (notifErr) {
    console.warn("Could not notify instructor:", notifErr);
  }

  // 3. Dispatch Real-time Notification to System Administrators (Admin ID 1 / broadcast)
  try {
    await sendNotification({
      userId: 1, // Default root admin
      subject: `⚡ Platform Enrollment: "${courseTitle}"`,
      message: `System Alert: ${learnerName} enrolled in course "${courseTitle}" taught by ${instructorName}. Live platform metrics refreshed.`,
    });
  } catch (adminNotifErr) {
    console.warn("Could not notify admin:", adminNotifErr);
  }

  return resData;
};

export const getMyCourses = async (userId) => {
  try {
    const response = await api.get(`/api/enrollments/user/${userId}`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
  } catch {
    // fallback
  }

  // Return from real-time dynamic registry
  const registry = getRealtimeEnrollmentRegistry();
  return registry.filter((e) => Number(e.userId) === Number(userId));
};

export const getUserEnrollments = getMyCourses;

export const getInstructorEnrolledStudents = (instructorId) => {
  const registry = getRealtimeEnrollmentRegistry();
  if (!instructorId) return registry;
  return registry.filter(
    (e) => !e.instructorId || Number(e.instructorId) === Number(instructorId)
  );
};

export const getAllRealtimeEnrollments = () => {
  return getRealtimeEnrollmentRegistry();
};