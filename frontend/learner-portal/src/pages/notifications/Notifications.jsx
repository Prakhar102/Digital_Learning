import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle,
  CheckCheck,
  FileText,
  Award,
  BookOpen,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import InstructorLayout from "../../components/instructor/InstructorLayout";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";
import { getCurrentUser } from "../../services/userService";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isInstructor =
    user?.role === "ROLE_INSTRUCTOR" ||
    user?.role === "INSTRUCTOR" ||
    user?.role === "FACULTY" ||
    user?.role === "ROLE_FACULTY";

  const Layout = isInstructor ? InstructorLayout : DashboardLayout;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      if (userData?.id) {
        const list = await getUserNotifications(userData.id);
        if (Array.isArray(list)) {
          setNotifications(list);
        } else {
          // Local fallback
          const localKey = `dlm_notifications_${userData.id}`;
          const local = JSON.parse(localStorage.getItem(localKey) || "[]");
          setNotifications(local);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id, user?.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
      );
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, isRead: true } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(user?.id);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, isRead: true }))
      );
    } catch {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, isRead: true }))
      );
    }
  };

  const getIcon = (subject = "") => {
    const s = subject.toLowerCase();
    if (s.includes("assignment") || s.includes("graded") || s.includes("submission")) {
      return <FileText size={16} className="text-blue-600" />;
    }
    if (s.includes("certificate") || s.includes("passed")) {
      return <Award size={16} className="text-amber-600" />;
    }
    return <BookOpen size={16} className="text-indigo-600" />;
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Activity & Notifications
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time alerts for course assignments, grading feedback, and platform milestones.
            </p>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
            >
              <CheckCheck size={14} className="text-blue-600" /> Mark All as Read
            </button>
          )}
        </div>

        {/* ── Feed ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-16 text-center">
              <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center">
              <Bell size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No notifications yet</p>
              <p className="text-xs text-slate-500 mt-1">
                You're all caught up! When instructors publish assignments or grade your work, alerts will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => {
                const isRead = n.read || n.isRead;
                return (
                  <div
                    key={n.id}
                    className={`p-5 flex items-start gap-4 transition-colors ${
                      isRead ? "bg-white" : "bg-blue-50/40"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {getIcon(n.subject)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900">
                          {n.subject || "Notification"}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {n.message}
                      </p>

                      {(n.subject?.toLowerCase().includes("assignment") || n.message?.toLowerCase().includes("assignment")) && (
                        <div className="mt-2.5">
                          <button
                            onClick={() => {
                              handleMarkRead(n.id);
                              navigate(isInstructor ? "/instructor/submissions" : "/my-submissions");
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            {isInstructor ? "View Submissions" : "Open Assignments & Submit Solution"} →
                          </button>
                        </div>
                      )}
                    </div>

                    {!isRead && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                        title="Mark as read"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Notifications;
