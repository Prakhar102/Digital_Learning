import api from "./api";

const MODULES_STORAGE_KEY = "dlm_course_modules_store";

export const getStoredModulesMap = () => {
  try {
    const raw = localStorage.getItem(MODULES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const getStoredModulesForCourse = (courseId) => {
  if (!courseId) return [];
  const map = getStoredModulesMap();
  return map[String(courseId)] || [];
};

export const saveModulesForCourse = (courseId, modulesList) => {
  if (!courseId) return;
  const map = getStoredModulesMap();
  map[String(courseId)] = modulesList;
  localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("storage"));
};

// ── Modules ──

export const createModule = async (moduleData) => {
  const courseId = Number(moduleData.courseId);
  const seq = Number(moduleData.sequenceNumber || moduleData.orderIndex || 1);
  const payload = {
    courseId,
    title: moduleData.title?.trim(),
    sequenceNumber: seq,
    orderIndex: seq,
  };

  let savedModule = null;

  try {
    const response = await api.post("/api/modules", payload);
    if (response?.data) {
      savedModule = {
        ...response.data,
        id: response.data.id || Date.now(),
        courseId,
        title: response.data.title || payload.title,
        sequenceNumber: response.data.sequenceNumber || seq,
        lessons: response.data.lessons || [],
      };
    }
  } catch (err) {
    console.warn("Backend /api/modules unreachable, caching module locally:", err?.message || err);
    savedModule = {
      id: Date.now(),
      courseId,
      title: payload.title,
      sequenceNumber: seq,
      lessons: [],
      createdAt: new Date().toISOString(),
    };
  }

  if (savedModule) {
    const existing = getStoredModulesForCourse(courseId);
    const updated = [...existing.filter((m) => String(m.id) !== String(savedModule.id)), savedModule];
    saveModulesForCourse(courseId, updated);
  }

  return savedModule;
};

export const getModulesByCourse = async (courseId) => {
  const localList = getStoredModulesForCourse(courseId);

  try {
    const response = await api.get(`/api/modules/course/${courseId}`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      // Merge backend modules with local modules and their lessons
      const backendMap = new Map();
      response.data.forEach((bm) => {
        backendMap.set(String(bm.id), bm);
      });

      // Combine lessons from local cache if backend lessons list is empty
      const merged = response.data.map((bm) => {
        const localMod = localList.find((lm) => String(lm.id) === String(bm.id) || lm.title === bm.title);
        const lessons = (bm.lessons && bm.lessons.length > 0)
          ? bm.lessons
          : (localMod?.lessons || []);
        return {
          ...bm,
          lessons,
        };
      });

      // Add any local modules not in backend
      localList.forEach((lm) => {
        if (!backendMap.has(String(lm.id)) && !merged.some((m) => m.title === lm.title)) {
          merged.push(lm);
        }
      });

      saveModulesForCourse(courseId, merged);
      return merged;
    }

    if (localList.length > 0) return localList;

    // Seed default starter module for new course if empty
    const defaultModule = {
      id: Date.now(),
      courseId: Number(courseId),
      title: "Module 1: Foundations & Architecture",
      sequenceNumber: 1,
      lessons: [
        {
          id: Date.now() + 1,
          title: "Introduction & Setup Overview",
          contentType: "VIDEO",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          content: "Welcome to the course! In this lesson, we will review the architecture and prerequisites.",
          durationInMinutes: 20,
        },
      ],
    };
    saveModulesForCourse(courseId, [defaultModule]);
    return [defaultModule];
  } catch (err) {
    console.warn("Backend /api/modules/course error, using local modules store:", err?.message || err);
    if (localList.length > 0) return localList;

    const defaultModule = {
      id: Date.now(),
      courseId: Number(courseId),
      title: "Module 1: Foundations & Architecture",
      sequenceNumber: 1,
      lessons: [
        {
          id: Date.now() + 1,
          title: "Introduction & Setup Overview",
          contentType: "VIDEO",
          videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
          content: "Welcome to the course! In this lesson, we will review the architecture and prerequisites.",
          durationInMinutes: 20,
        },
      ],
    };
    saveModulesForCourse(courseId, [defaultModule]);
    return [defaultModule];
  }
};

// ── Lessons ──

export const createLesson = async (lessonData) => {
  const moduleId = Number(lessonData.moduleId);
  const duration = Number(lessonData.durationInMinutes || lessonData.duration) || 15;
  const seq = Number(lessonData.sequenceNumber || lessonData.orderIndex || 1);

  const payload = {
    moduleId,
    title: lessonData.title?.trim(),
    contentType: lessonData.contentType || "VIDEO",
    contentRef: lessonData.videoUrl || lessonData.contentRef || "https://www.w3schools.com/html/mov_bbb.mp4",
    videoUrl: lessonData.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
    content: lessonData.content?.trim() || "Slide notes & key architectural takeaways.",
    durationInMinutes: duration,
    sequenceNumber: seq,
    orderIndex: seq,
  };

  let savedLesson = null;

  try {
    const response = await api.post("/api/lessons", payload);
    if (response?.data) {
      savedLesson = {
        ...payload,
        ...response.data,
        id: response.data.id || Date.now(),
      };
    }
  } catch (err) {
    console.warn("Backend /api/lessons error, caching lesson locally:", err?.message || err);
    savedLesson = {
      ...payload,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
  }

  // Update local modules store across all courses
  const map = getStoredModulesMap();
  let updatedCourseId = null;

  Object.entries(map).forEach(([cId, mods]) => {
    const mIdx = mods.findIndex((m) => String(m.id) === String(moduleId));
    if (mIdx !== -1) {
      const mod = mods[mIdx];
      const lessons = mod.lessons || [];
      const updatedLessons = [...lessons.filter((l) => String(l.id) !== String(savedLesson.id)), savedLesson];
      mods[mIdx] = { ...mod, lessons: updatedLessons };
      updatedCourseId = cId;
    }
  });

  if (updatedCourseId) {
    localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("storage"));
  }

  return savedLesson;
};

export const updateLesson = async (lessonId, lessonData) => {
  const moduleId = Number(lessonData.moduleId);
  const payload = {
    ...lessonData,
    id: lessonId,
  };

  try {
    await api.put(`/api/lessons/${lessonId}`, payload);
  } catch (err) {
    console.warn("Backend /api/lessons update error, updating local store:", err?.message || err);
  }

  // Update local storage
  const map = getStoredModulesMap();
  let updatedCourseId = null;

  Object.entries(map).forEach(([cId, mods]) => {
    mods.forEach((mod) => {
      if (mod.lessons && mod.lessons.some((l) => String(l.id) === String(lessonId))) {
        mod.lessons = mod.lessons.map((l) =>
          String(l.id) === String(lessonId) ? { ...l, ...payload } : l
        );
        updatedCourseId = cId;
      }
    });
  });

  if (updatedCourseId) {
    localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("storage"));
  }

  return payload;
};

export const deleteLesson = async (lessonId, moduleId) => {
  try {
    await api.delete(`/api/lessons/${lessonId}`);
  } catch (err) {
    console.warn("Backend /api/lessons delete error, updating local store:", err?.message || err);
  }

  const map = getStoredModulesMap();
  let updatedCourseId = null;

  Object.entries(map).forEach(([cId, mods]) => {
    mods.forEach((mod) => {
      if (mod.lessons && mod.lessons.some((l) => String(l.id) === String(lessonId))) {
        mod.lessons = mod.lessons.filter((l) => String(l.id) !== String(lessonId));
        updatedCourseId = cId;
      }
    });
  });

  if (updatedCourseId) {
    localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("storage"));
  }

  return true;
};

export const updateModule = async (moduleId, courseId, title) => {
  try {
    await api.put(`/api/modules/${moduleId}`, { title });
  } catch (err) {
    console.warn("Backend /api/modules update error, updating local store:", err?.message || err);
  }

  const map = getStoredModulesMap();
  const mods = map[String(courseId)] || [];
  const updatedMods = mods.map((m) =>
    String(m.id) === String(moduleId) ? { ...m, title } : m
  );
  map[String(courseId)] = updatedMods;
  localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("storage"));

  return true;
};

export const deleteModule = async (moduleId, courseId) => {
  try {
    await api.delete(`/api/modules/${moduleId}`);
  } catch (err) {
    console.warn("Backend /api/modules delete error, updating local store:", err?.message || err);
  }

  const map = getStoredModulesMap();
  const mods = map[String(courseId)] || [];
  const updatedMods = mods.filter((m) => String(m.id) !== String(moduleId));
  map[String(courseId)] = updatedMods;
  localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("storage"));

  return true;
};

export const getLessonsByModule = async (moduleId) => {
  try {
    const response = await api.get(`/api/lessons/module/${moduleId}`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
  } catch {}

  // Fallback to local store search
  const map = getStoredModulesMap();
  for (const mods of Object.values(map)) {
    const target = mods.find((m) => String(m.id) === String(moduleId));
    if (target?.lessons) return target.lessons;
  }
  return [];
};
