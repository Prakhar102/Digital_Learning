import api from "./api";

// Fetch notifications for user
export const getUserNotifications = async (userId) => {
  const response = await api.get(`/api/notifications/user/${userId}`);
  return response.data;
};

// Mark single notification as read
export const markAsRead = async (notificationId) => {
  const response = await api.put(`/api/notifications/${notificationId}/read`);
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async (userId) => {
  try {
    const notifications = await getUserNotifications(userId);
    if (Array.isArray(notifications)) {
      return notifications.filter((n) => !n.read && !n.isRead).length;
    }
    return 0;
  } catch {
    return 0;
  }
};

// Send real-time notification to user (learner, instructor, etc.)
export const sendNotification = async ({ userId, subject, message }) => {
  try {
    const response = await api.post("/api/notifications", {
      userId: Number(userId),
      subject,
      message,
    });
    return response.data;
  } catch (err) {
    console.warn("Notification backend fallback:", err);
    // Persist to local activity cache for offline / fallback demo resilience
    const localKey = `dlm_notifications_${userId}`;
    const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
    const newNotif = {
      id: Date.now(),
      userId: Number(userId),
      subject,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(localKey, JSON.stringify([newNotif, ...existing]));
    return newNotif;
  }
};
