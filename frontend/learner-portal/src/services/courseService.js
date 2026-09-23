import api from "./api";
import { getModulesByCourse } from "./moduleService";

// ── Course Views & Dynamic Metrics Engine ──
const COURSE_VIEWS_KEY = "dlm_dynamic_course_views";
const COURSE_REVIEWS_KEY = "dlm_dynamic_course_reviews";
const CREATED_COURSES_KEY = "dlm_created_courses_store";
const COURSE_INSTRUCTORS_KEY = "dlm_course_instructors_store";

export const getStoredInstructorsMap = () => {
  try {
    const raw = localStorage.getItem(COURSE_INSTRUCTORS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const setCourseInstructor = (courseId, instructorName) => {
  if (!courseId || !instructorName) return;
  try {
    const map = getStoredInstructorsMap();
    map[String(courseId)] = instructorName;
    localStorage.setItem(COURSE_INSTRUCTORS_KEY, JSON.stringify(map));
  } catch {}
};

export const CATEGORY_TAXONOMY_MAP = [
  { id: 1, name: "Python & Full Stack", slug: "python" },
  { id: 2, name: "AI & Machine Learning", slug: "ai-ml" },
  { id: 3, name: "Java & Spring Boot", slug: "java-spring" },
  { id: 4, name: "Cybersecurity & SOC", slug: "cybersecurity" },
  { id: 5, name: "Cloud & DevOps (K8s)", slug: "devops" },
  { id: 6, name: "Frontend (React & Next.js)", slug: "frontend" },
  { id: 7, name: "System Design & Architecture", slug: "system-design" },
  { id: 8, name: "Data Science & Analytics", slug: "data-science" },
];

export const DEFAULT_STARTER_COURSES = [];

export const getStoredLocalCourses = () => {
  try {
    const raw = localStorage.getItem(CREATED_COURSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const UNIQUE_COURSE_VIEWERS_KEY = "dlm_unique_course_viewers";

export const getCourseViews = (courseId) => {
  if (!courseId) return 0;
  try {
    const raw = localStorage.getItem(UNIQUE_COURSE_VIEWERS_KEY);
    const viewers = raw ? JSON.parse(raw) : {};
    const list = viewers[String(courseId)] || [];
    return list.length;
  } catch {
    return 0;
  }
};

export const recordUniqueCourseView = (courseId, userId) => {
  if (!courseId) return 0;

  // Resolve unique user identifier
  let viewerId = userId;
  if (!viewerId) {
    try {
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : null;
      viewerId = u?.id || u?.username || u?.email;
    } catch {}
  }
  if (!viewerId) {
    viewerId = "guest_viewer";
  }
  const viewerKey = String(viewerId);

  try {
    const raw = localStorage.getItem(UNIQUE_COURSE_VIEWERS_KEY);
    const viewers = raw ? JSON.parse(raw) : {};
    const cKey = String(courseId);

    if (!Array.isArray(viewers[cKey])) {
      viewers[cKey] = [];
    }

    // Strictly add viewer only once per course
    if (!viewers[cKey].includes(viewerKey)) {
      viewers[cKey].push(viewerKey);
      localStorage.setItem(UNIQUE_COURSE_VIEWERS_KEY, JSON.stringify(viewers));
      window.dispatchEvent(new Event("storage"));
    }

    return viewers[cKey].length;
  } catch {
    return 0;
  }
};

export const incrementCourseViews = (courseId, userId) => {
  return recordUniqueCourseView(courseId, userId);
};

export const getCourseRatingData = (courseId, defaultAvg = 5.0) => {
  if (!courseId) return { rating: 5.0, count: 0, reviews: [] };
  try {
    const raw = localStorage.getItem(COURSE_REVIEWS_KEY);
    const reviews = raw ? JSON.parse(raw) : {};
    const data = reviews[String(courseId)];
    if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
      const sum = data.reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      const avg = Number((sum / data.reviews.length).toFixed(1));
      return { rating: avg, count: data.reviews.length, reviews: data.reviews };
    }
    return { rating: 5.0, count: 0, reviews: [] };
  } catch {
    return { rating: 5.0, count: 0, reviews: [] };
  }
};

export const getUserCourseReview = (courseId, userId) => {
  if (!courseId) return null;
  try {
    const raw = localStorage.getItem(COURSE_REVIEWS_KEY);
    const reviews = raw ? JSON.parse(raw) : {};
    const data = reviews[String(courseId)];
    if (!data || !Array.isArray(data.reviews)) return null;
    const uKey = String(userId || "");
    return data.reviews.find((r) => String(r.userId) === uKey) || null;
  } catch {
    return null;
  }
};

export const submitCourseReview = (courseId, { userId, userName, userEmail, rating, comment, courseTitle }) => {
  if (!courseId) return null;
  try {
    const raw = localStorage.getItem(COURSE_REVIEWS_KEY);
    const reviews = raw ? JSON.parse(raw) : {};
    const key = String(courseId);
    if (!reviews[key]) reviews[key] = { reviews: [] };

    const parsedRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const uKey = String(userId || Date.now());
    const existingIdx = reviews[key].reviews.findIndex((r) => String(r.userId) === uKey);

    const reviewObj = {
      userId: uKey,
      userName: userName || "Student Learner",
      userEmail: userEmail || "",
      rating: parsedRating,
      comment: (comment || "").trim(),
      updatedAt: new Date().toISOString(),
      createdAt: existingIdx >= 0 ? reviews[key].reviews[existingIdx].createdAt : new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      reviews[key].reviews[existingIdx] = reviewObj;
    } else {
      reviews[key].reviews.unshift(reviewObj);
    }

    localStorage.setItem(COURSE_REVIEWS_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new Event("storage"));

    const sum = reviews[key].reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    const avg = Number((sum / reviews[key].reviews.length).toFixed(1));

    return {
      rating: avg,
      count: reviews[key].reviews.length,
      reviews: reviews[key].reviews,
      userReview: reviewObj,
    };
  } catch (e) {
    console.error("submitCourseReview error:", e);
    return null;
  }
};

export const getTopViewedCourses = (courses = []) => {
  return [...courses].sort((a, b) => {
    const vA = getCourseViews(a.id);
    const vB = getCourseViews(b.id);
    return vB - vA;
  });
};

// ── Categories ──

export const getCategories = async () => {
  try {
    const response = await api.get("/api/categories");
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
    return CATEGORY_TAXONOMY_MAP;
  } catch {
    return CATEGORY_TAXONOMY_MAP;
  }
};

export const createCategory = async (data) => {
  const response = await api.post("/api/categories", data);
  return response.data;
};

// ── Courses ──

export const createCourse = async (courseData) => {
  // Determine Category ID mapping (starts with 1, 2, ...)
  let catId = Number(courseData.categoryId);
  if (!catId || isNaN(catId)) {
    const matched = CATEGORY_TAXONOMY_MAP.find(
      (c) =>
        c.name.toLowerCase() === (courseData.category || "").toLowerCase() ||
        c.slug.toLowerCase() === (courseData.category || "").toLowerCase()
    );
    catId = matched ? matched.id : 1;
  }

  const categoryName =
    courseData.category ||
    CATEGORY_TAXONOMY_MAP.find((c) => c.id === catId)?.name ||
    "Python & Full Stack";

  const payload = {
    title: courseData.title?.trim(),
    description: courseData.description?.trim() || "Comprehensive curriculum track with hands-on labs and evaluations.",
    level: courseData.level || "BEGINNER",
    categoryId: catId,
    category: categoryName,
    ownerUserId: Number(courseData.ownerUserId || courseData.instructorId || 1),
    instructorId: Number(courseData.instructorId || courseData.ownerUserId || 1),
    instructorName: courseData.instructorName || "Faculty Instructor",
    imageUrl: courseData.imageUrl || "",
    status: courseData.status || "PUBLISHED",
    published: true,
    price: Number(courseData.price) || 449,
  };

  let savedCourse = null;

  try {
    // Attempt backend POST /api/courses
    const response = await api.post("/api/courses", payload);
    if (response?.data) {
      savedCourse = {
        ...payload,
        ...response.data,
        id: response.data.id || Date.now(),
        status: "PUBLISHED",
        published: true,
      };

      try {
        await api.put(`/api/courses/${savedCourse.id}/publish`);
      } catch {}
    }
  } catch (err) {
    console.warn("Backend /api/courses call error, saving course locally:", err?.message || err);
    savedCourse = {
      ...payload,
      id: Date.now(),
      status: "PUBLISHED",
      published: true,
      createdAt: new Date().toISOString(),
    };
  }

  if (savedCourse) {
    if (courseData.instructorName || payload.instructorName) {
      setCourseInstructor(savedCourse.id, courseData.instructorName || payload.instructorName);
    }
    const localCourses = getStoredLocalCourses();
    const updated = [savedCourse, ...localCourses.filter((c) => String(c.id) !== String(savedCourse.id))];
    localStorage.setItem(CREATED_COURSES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  }

  return savedCourse;
};

export const getAllCourses = async () => {
  const localList = getStoredLocalCourses();
  let backendList = [];
  try {
    const response = await api.get("/api/courses");
    if (Array.isArray(response.data)) {
      backendList = response.data;
    }
  } catch (err) {
    console.warn("Backend /api/courses call:", err?.message || err);
  }

  const backendIds = new Set(backendList.map((c) => String(c.id)));
  const extraLocal = localList.filter((c) => !backendIds.has(String(c.id)));

  // Real courses authored locally or stored in backend database
  const combined = [...extraLocal, ...backendList].filter(
    (c) =>
      !c.title?.includes("The Complete Full Stack AI & Microservices Engineering Bootcamp") &&
      !c.title?.includes("Python, FastAPI & Enterprise Distributed Systems Masterclass")
  );

  const instMap = getStoredInstructorsMap();

  return combined.map((c) => {
    const catObj = CATEGORY_TAXONOMY_MAP.find((cat) => Number(cat.id) === Number(c.categoryId));
    const storedInstructorName = instMap[String(c.id)];

    let resolvedInstructor = c.instructorName || c.author || storedInstructorName;
    if (!resolvedInstructor || resolvedInstructor === "Instructor" || resolvedInstructor === "Faculty Instructor") {
      try {
        const rawU = localStorage.getItem("user");
        const currentU = rawU ? JSON.parse(rawU) : null;
        if (currentU?.fullName && currentU.role?.includes("INSTRUCTOR")) {
          resolvedInstructor = currentU.fullName;
        } else if (c.ownerUserId === 3 || c.id === 3) {
          resolvedInstructor = "Swati Kumari";
        } else if (c.ownerUserId === 2 || c.id === 2) {
          resolvedInstructor = "Dr. Evelyn Reed";
        } else if (c.ownerUserId === 1 || c.id === 1) {
          resolvedInstructor = "Aritra Basak";
        } else {
          resolvedInstructor = "Swati Kumari";
        }
      } catch {
        resolvedInstructor = "Swati Kumari";
      }
    }

    return {
      ...c,
      instructorName: resolvedInstructor,
      author: resolvedInstructor,
      category: c.category || catObj?.name || "Python & Full Stack",
      status: c.status || "PUBLISHED",
      published: c.published !== false,
    };
  });
};

export const deleteCourse = async (courseId) => {
  if (!courseId) return false;

  // 1. Remove from local storage cache
  try {
    const localCourses = getStoredLocalCourses();
    const filtered = localCourses.filter((c) => String(c.id) !== String(courseId));
    localStorage.setItem(CREATED_COURSES_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.warn("Local storage delete error:", e);
  }

  // 2. Remove from backend database
  try {
    await api.delete(`/api/courses/${courseId}`);
  } catch (err) {
    console.warn("Backend course delete error:", err?.message || err);
  }

  return true;
};

export const getCourseById = async (courseId) => {
  const localList = getStoredLocalCourses();
  const instMap = getStoredInstructorsMap();
  const found = localList.find((c) => String(c.id) === String(courseId));
  if (found) {
    const instructorName = found.instructorName || instMap[String(courseId)] || "Swati Kumari";
    return { ...found, instructorName, author: instructorName };
  }

  try {
    const response = await api.get(`/api/courses/${courseId}`);
    if (response?.data) {
      const instructorName = response.data.instructorName || instMap[String(courseId)] || "Swati Kumari";
      return { ...response.data, instructorName, author: instructorName };
    }
  } catch {
    if (found) {
      const instructorName = found.instructorName || instMap[String(courseId)] || "Swati Kumari";
      return { ...found, instructorName, author: instructorName };
    }
  }
  return null;
};

export const getPublishedCourses = async () => {
  return getAllCourses();
};

export const searchCourses = async (keyword) => {
  const all = await getAllCourses();
  if (!keyword || !keyword.trim()) return all;
  const kw = keyword.toLowerCase().trim();
  return all.filter(
    (c) =>
      (c.title || "").toLowerCase().includes(kw) ||
      (c.category || "").toLowerCase().includes(kw) ||
      (c.description || "").toLowerCase().includes(kw)
  );
};

export const getCoursesByCategory = async (categoryId) => {
  const all = await getAllCourses();
  if (!categoryId || categoryId === "ALL") return all;
  return all.filter(
    (c) =>
      Number(c.categoryId) === Number(categoryId) ||
      String(c.category || "").toLowerCase() === String(categoryId).toLowerCase()
  );
};

export const getCourseDetails = async (courseId) => {
  const course = await getCourseById(courseId);
  const instMap = getStoredInstructorsMap();
  const instructorName = course?.instructorName || course?.author || instMap[String(courseId)] || "Swati Kumari";
  let modules = [];

  try {
    const response = await api.get(`/api/courses/${courseId}/details`);
    if (response?.data?.modules && response.data.modules.length > 0) {
      modules = response.data.modules;
    }
  } catch (err) {
    console.warn("Backend getCourseDetails failed, falling back to moduleService:", err?.message || err);
  }

  if (!modules || modules.length === 0) {
    try {
      modules = await getModulesByCourse(courseId);
    } catch (e) {
      console.warn("Fallback module fetch failed:", e);
    }
  }

  return {
    id: course?.id || courseId,
    title: course?.title || "Course Track",
    description: course?.description || "",
    level: course?.level || "BEGINNER",
    status: course?.status || "PUBLISHED",
    categoryId: course?.categoryId || 1,
    ownerUserId: course?.ownerUserId || 1,
    instructorName,
    author: instructorName,
    modules: modules || [],
  };
};

export const publishCourse = async (courseId) => {
  try {
    const response = await api.put(`/api/courses/${courseId}/publish`);
    return response.data;
  } catch {
    return { id: courseId, status: "PUBLISHED" };
  }
};

export const unpublishCourse = async (courseId) => {
  try {
    const response = await api.put(`/api/courses/${courseId}/unpublish`);
    return response.data;
  } catch {
    return { id: courseId, status: "DRAFT" };
  }
};