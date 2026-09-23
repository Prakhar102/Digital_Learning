import api from "./api";

const READ_IDS_KEY = "dlm_read_notification_ids";
const READ_ALL_TS_KEY = "dlm_notifications_read_all_timestamp_";

export const getReadNotificationIds = () => {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

export const addReadNotificationId = (id) => {
  if (!id) return;
  try {
    const set = getReadNotificationIds();
    set.add(String(id));
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
};

export const getReadAllTimestamp = (userId) => {
  try {
    const raw = localStorage.getItem(`${READ_ALL_TS_KEY}${userId}`);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
};

export const deduplicateNotifications = (list = []) => {
  const seenIds = new Set();
  const seenContent = new Set();
  const result = [];

  for (const n of list) {
    if (!n) continue;
    const idKey = String(n.id || "");
    const subjectKey = (n.subject || "").trim().toLowerCase();
    const msgKey = (n.message || "").trim().toLowerCase();
    // Bucket within 2-minute window for identical messages
    const timeMs = n.createdAt ? new Date(n.createdAt).getTime() : Date.now();
    const timeBucket = Math.floor(timeMs / (120 * 1000));
    const contentKey = `${subjectKey}:::${msgKey}:::${timeBucket}`;

    if (idKey && seenIds.has(idKey)) continue;
    if (subjectKey && seenContent.has(contentKey)) continue;

    if (idKey) seenIds.add(idKey);
    if (subjectKey) seenContent.add(contentKey);
    result.push(n);
  }

  return result;
};

// Fetch notifications for user
export const getUserNotifications = async (userId) => {
  const localKey = `dlm_notifications_${userId}`;
  let localList = [];
  try {
    localList = JSON.parse(localStorage.getItem(localKey) || "[]");
  } catch {
    localList = [];
  }

  let facultyList = [];
  // Check if current logged in user is instructor/faculty to include faculty notifications stream
  try {
    const rawUser = localStorage.getItem("user");
    const u = rawUser ? JSON.parse(rawUser) : null;
    const isInstructor =
      u?.role === "ROLE_INSTRUCTOR" ||
      u?.role === "INSTRUCTOR" ||
      u?.role === "FACULTY" ||
      u?.role === "ROLE_FACULTY";

    if (isInstructor) {
      const facultyKey = "dlm_notifications_faculty";
      facultyList = JSON.parse(localStorage.getItem(facultyKey) || "[]");
    }
  } catch {}

  let backendList = [];
  try {
    const response = await api.get(`/api/notifications/user/${userId}`);
    if (Array.isArray(response.data)) {
      backendList = response.data;
    }
  } catch {}

  // Merge and strictly deduplicate by both unique ID and content fingerprint
  const combined = deduplicateNotifications([...localList, ...facultyList, ...backendList]);

  // Clean and persist deduplicated list to avoid stale duplicate build-up
  try {
    localStorage.setItem(localKey, JSON.stringify(deduplicateNotifications(localList)));
    if (facultyList.length > 0) {
      localStorage.setItem("dlm_notifications_faculty", JSON.stringify(deduplicateNotifications(facultyList)));
    }
  } catch {}

  const readIdsSet = getReadNotificationIds();
  const readAllTs = getReadAllTimestamp(userId);

  // Apply read status resolution
  const resolved = combined.map((n) => {
    const notifTime = n.createdAt ? new Date(n.createdAt).getTime() : 0;
    const isExplicitlyRead =
      n.read === true ||
      n.isRead === true ||
      readIdsSet.has(String(n.id)) ||
      (readAllTs > 0 && notifTime > 0 && notifTime <= readAllTs);

    return {
      ...n,
      read: isExplicitlyRead,
      isRead: isExplicitlyRead,
    };
  });

  // Sort descending by time
  return resolved.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

// Mark single notification as read
export const markAsRead = async (notificationId, userId) => {
  if (notificationId) {
    addReadNotificationId(notificationId);
  }

  // 1. Update local user cache
  if (userId) {
    const localKey = `dlm_notifications_${userId}`;
    try {
      const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
      const updated = existing.map((n) =>
        String(n.id) === String(notificationId) ? { ...n, read: true, isRead: true } : n
      );
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch {}
  } else {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith("dlm_notifications_") && !k.startsWith("dlm_notifications_read_all_")) {
        try {
          const list = JSON.parse(localStorage.getItem(k) || "[]");
          const upd = list.map((n) =>
            String(n.id) === String(notificationId) ? { ...n, read: true, isRead: true } : n
          );
          localStorage.setItem(k, JSON.stringify(upd));
        } catch {}
      }
    });
  }

  // 2. Dispatch events to immediately clear bell red badge
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new CustomEvent("dlm-notifications-updated"));

  try {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch {
    return { success: true };
  }
};

// Mark all notifications for user as read
export const markAllAsRead = async (userId) => {
  const currentTs = Date.now() + 60000; // Covers all current notifications
  if (userId) {
    localStorage.setItem(`${READ_ALL_TS_KEY}${userId}`, String(currentTs));
    const localKey = `dlm_notifications_${userId}`;
    try {
      const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
      const updated = existing.map((n) => {
        addReadNotificationId(n.id);
        return { ...n, read: true, isRead: true };
      });
      localStorage.setItem(localKey, JSON.stringify(updated));
    } catch {}
  } else {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith("dlm_notifications_") && !k.startsWith("dlm_notifications_read_all_")) {
        try {
          const uId = k.replace("dlm_notifications_", "");
          localStorage.setItem(`${READ_ALL_TS_KEY}${uId}`, String(currentTs));
          const list = JSON.parse(localStorage.getItem(k) || "[]");
          const upd = list.map((n) => {
            addReadNotificationId(n.id);
            return { ...n, read: true, isRead: true };
          });
          localStorage.setItem(k, JSON.stringify(upd));
        } catch {}
      }
    });
  }

  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new CustomEvent("dlm-notifications-updated"));

  try {
    const response = await api.put(`/api/notifications/user/${userId}/read-all`);
    return response.data;
  } catch {
    return { success: true };
  }
};

// Get unread notification count
export const getUnreadCount = async (userId) => {
  if (!userId) return 0;
  try {
    const notifs = await getUserNotifications(userId);
    return notifs.filter((n) => !n.read && !n.isRead).length;
  } catch {
    return 0;
  }
};

// Send real-time notification to user (learner, instructor, etc.)
export const sendNotification = async ({ userId, subject, message }) => {
  const newNotif = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    userId: Number(userId),
    subject,
    message,
    read: false,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  // 1. Persist to local activity cache with deduplication
  const localKey = `dlm_notifications_${userId}`;
  try {
    const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
    localStorage.setItem(localKey, JSON.stringify(deduplicateNotifications([newNotif, ...existing])));
  } catch {}

  // 2. Dispatch events
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new CustomEvent("dlm-notifications-updated"));

  try {
    const response = await api.post("/api/notifications", {
      userId: Number(userId),
      subject,
      message,
    });
    return response.data || newNotif;
  } catch (err) {
    return newNotif;
  }
};

// Specifically notify course instructor & faculty stream
export const notifyInstructor = async ({ instructorId = 3, subject, message }) => {
  const targetId = Number(instructorId) || 3;
  const notifId = Date.now() + Math.floor(Math.random() * 1000);
  const newNotif = {
    id: notifId,
    userId: targetId,
    subject,
    message,
    read: false,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  // 1. Save to specific instructor cache with deduplication
  const localKey = `dlm_notifications_${targetId}`;
  try {
    const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
    localStorage.setItem(localKey, JSON.stringify(deduplicateNotifications([newNotif, ...existing])));
  } catch {}

  // 2. Also persist to general faculty alert stream with deduplication
  const facultyKey = "dlm_notifications_faculty";
  try {
    const existing = JSON.parse(localStorage.getItem(facultyKey) || "[]");
    localStorage.setItem(facultyKey, JSON.stringify(deduplicateNotifications([newNotif, ...existing])));
  } catch {}

  // 3. Dispatch real-time storage & custom events
  window.dispatchEvent(new Event("storage"));
  window.dispatchEvent(new CustomEvent("dlm-notifications-updated"));

  try {
    await api.post("/api/notifications", {
      userId: targetId,
      subject,
      message,
    });
  } catch {}

  return newNotif;
};
