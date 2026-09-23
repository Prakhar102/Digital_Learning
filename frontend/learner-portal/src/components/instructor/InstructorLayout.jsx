import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  ClipboardCheck,
  FileSpreadsheet,
  FileCheck,
  BarChart3,
  LogOut,
  Bell,
  X,
  Calendar,
  CheckCheck,
  Award,
  Trophy,
  GraduationCap,
  FileText,
  CheckCircle,
} from "lucide-react";
import { getCurrentUser } from "../../services/userService";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notificationService";
import { getStoredLocalSubmissions } from "../../services/assignmentService";

function InstructorLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [pendingGradingCount, setPendingGradingCount] = useState(() => {
    try {
      const subs = getStoredLocalSubmissions();
      return subs.filter((s) => s.grade === null || s.grade === undefined).length;
    } catch {
      return 0;
    }
  });
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const lastCountRef = useRef(0);
  const notifDropdownRef = useRef(null);

  const fetchNotificationData = async (userId) => {
    if (!userId) return;
    try {
      const list = await getUserNotifications(userId);
      if (Array.isArray(list)) {
        setNotifications(list.slice(0, 10));
        const unread = list.filter((n) => !n.read && !n.isRead).length;
        setUnreadCount(unread);

        if (unread > lastCountRef.current && lastCountRef.current !== 0) {
          const latest = list[0];
          setToastNotification(latest);
          setTimeout(() => setToastNotification(null), 6000);
        }
        lastCountRef.current = unread;
      }
    } catch {
      const localKey = `dlm_notifications_${userId}`;
      const local = JSON.parse(localStorage.getItem(localKey) || "[]");
      if (local.length > 0) {
        setNotifications(local.slice(0, 10));
        const unread = local.filter((n) => !n.read).length;
        setUnreadCount(unread);
      }
    }
  };

  useEffect(() => {
    let intervalId;
    const init = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        if (userData?.id) {
          await fetchNotificationData(userData.id);
          intervalId = setInterval(() => {
            fetchNotificationData(userData.id);
          }, 4000);
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();

    const handleStorage = () => {
      if (user?.id) fetchNotificationData(user.id);
      try {
        const subs = getStoredLocalSubmissions();
        setPendingGradingCount(subs.filter((s) => s.grade === null || s.grade === undefined).length);
      } catch {}
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("dlm-notifications-updated", handleStorage);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("dlm-notifications-updated", handleStorage);
    };
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      await markAsRead(notifId, user?.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead(user?.id);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, isRead: true }))
      );
      setUnreadCount(0);
    } catch {}
  };

  const getNotifIcon = (subject = "", message = "") => {
    const text = `${subject} ${message}`.toLowerCase();
    if (text.includes("enrolled") || text.includes("enrollment")) {
      return <GraduationCap size={15} className="text-blue-600" />;
    }
    if (text.includes("assessment") || text.includes("exam") || text.includes("test") || text.includes("score")) {
      return <Trophy size={15} className="text-emerald-600" />;
    }
    if (text.includes("assignment") || text.includes("submission") || text.includes("grading")) {
      return <FileSpreadsheet size={15} className="text-amber-600" />;
    }
    return <Bell size={15} className="text-indigo-600" />;
  };

  const handleNotifClick = (notif) => {
    handleMarkRead(notif.id);
    const text = `${notif.subject} ${notif.message}`.toLowerCase();
    if (text.includes("assignment") || text.includes("submission")) {
      navigate("/instructor/submissions");
    } else if (text.includes("assessment") || text.includes("exam")) {
      navigate("/instructor/assessments");
    } else if (text.includes("enrolled") || text.includes("enrollment")) {
      navigate("/instructor/analytics");
    } else {
      navigate("/notifications");
    }
    setShowNotifDropdown(false);
  };

  const menu = [
    { label: "Console Overview", path: "/instructor", icon: LayoutDashboard },
    { label: "Author New Course", path: "/instructor/create-course", icon: PlusCircle },
    { label: "Manage Courses", path: "/instructor/my-courses", icon: BookOpen },
    { label: "Assessments & Exams", path: "/instructor/assessments", icon: Calendar },
    { label: "Create Assignment", path: "/instructor/assignments", icon: ClipboardCheck },
    { label: "My Assignments", path: "/instructor/my-assignments", icon: FileCheck },
    { label: "Submissions & Grading", path: "/instructor/submissions", icon: FileSpreadsheet, badge: pendingGradingCount > 0 ? pendingGradingCount : undefined },
    { label: "Faculty Analytics", path: "/instructor/analytics", icon: BarChart3 },
  ];

  const isRouteActive = (itemPath) => {
    const current = location.pathname;
    if (itemPath === "/instructor") {
      return current === "/instructor" || current === "/instructor/";
    }
    if (itemPath === "/instructor/create-course") {
      return current === "/instructor/create-course";
    }
    if (itemPath === "/instructor/my-courses") {
      return (
        current === "/instructor/my-courses" ||
        (current.startsWith("/instructor/courses") && !current.includes("/assessment")) ||
        current.startsWith("/instructor/course/")
      );
    }
    if (itemPath === "/instructor/assessments") {
      return (
        current === "/instructor/assessments" ||
        current === "/instructor/my-assessments" ||
        current === "/instructor/create-assessment" ||
        current.includes("/assessment")
      );
    }
    if (itemPath === "/instructor/assignments") {
      return current === "/instructor/assignments";
    }
    if (itemPath === "/instructor/my-assignments") {
      return current === "/instructor/my-assignments";
    }
    if (itemPath === "/instructor/submissions") {
      return current.startsWith("/instructor/submissions");
    }
    if (itemPath === "/instructor/analytics") {
      return current.startsWith("/instructor/analytics");
    }
    return current.startsWith(itemPath);
  };

  const getSectionTitle = () => {
    const p = location.pathname;
    if (p === "/instructor" || p === "/instructor/") return "Console Overview";
    if (p.includes("create-course")) return "Author New Course";
    if (p.includes("my-courses")) return "Manage Courses";
    if (p.includes("assessment")) return "Assessments & Exams";
    if (p.includes("assignments") && !p.includes("my-")) return "Create Assignment";
    if (p.includes("my-assignments")) return "My Assignments";
    if (p.includes("submissions")) return "Submissions & Grading";
    if (p.includes("analytics")) return "Faculty Analytics";
    if (p.includes("leaderboard")) return "Student Leaderboard";
    if (p.includes("notifications")) return "Activity Alerts";
    return "Faculty Console";
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased relative">
      {/* ── Real-Time Popup Notification Toast ── */}
      {toastNotification && (
        <div className="fixed top-5 right-5 z-[9999] max-w-sm bg-white border border-indigo-200 rounded-xl p-4 shadow-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Bell size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {toastNotification.subject || "Faculty Alert"}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
              {toastNotification.message}
            </p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside
        className="
          fixed top-0 left-0
          w-[260px] h-screen
          bg-white
          border-r border-slate-200
          flex flex-col z-50
          shadow-xs
        "
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white tracking-wider text-sm shadow-xs">
              DLM
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Enterprise LMS
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Faculty Workspace
              </p>
            </div>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="mx-3 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                {user.fullName?.charAt(0) || "I"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.path);

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3
                  py-2.5 pr-3 pl-3 rounded-lg
                  text-[13px] transition-colors cursor-pointer text-left
                  ${
                    active
                      ? "bg-indigo-50 text-indigo-600 font-semibold border-l-[3px] border-indigo-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium border-l-[3px] border-transparent"
                  }
                `}
              >
                <Icon
                  size={16}
                  className={active ? "text-indigo-600 shrink-0" : "text-slate-400 shrink-0"}
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center justify-center gap-2
              py-2.5 rounded-lg
              text-xs font-medium
              text-slate-600 hover:text-rose-600
              hover:bg-rose-50
              border border-transparent hover:border-rose-100
              transition-colors cursor-pointer
            "
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <div className="ml-[260px] flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-800">
        {/* ── Top Header Navigation Bar with Real-Time Notification Bell ── */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Faculty Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-800">
              {getSectionTitle()}
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Faculty Badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs">
              Faculty Lead
            </span>

            {/* ── Notification Bell with Real-Time Dropdown ── */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Faculty Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full ring-2 ring-white animate-pulse min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Interactive Notification Dropdown */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Dropdown Header */}
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">Faculty Alerts</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck size={13} /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* Dropdown Feed */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400">
                        <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                        No faculty alerts yet
                      </div>
                    ) : (
                      notifications.map((n) => {
                        const isRead = n.read || n.isRead;
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                              isRead ? "bg-white" : "bg-indigo-50/40"
                            }`}
                          >
                            <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              {getNotifIcon(n.subject, n.message)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {n.subject}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                                {n.message}
                              </p>
                            </div>
                            {!isRead && (
                              <button
                                onClick={(e) => handleMarkRead(n.id, e)}
                                className="text-slate-300 hover:text-indigo-600 p-1"
                                title="Mark read"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
                    <button
                      onClick={() => {
                        navigate("/notifications");
                        setShowNotifDropdown(false);
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      View all in Activity Console &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Circle Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.fullName?.charAt(0) || "I"}
              </div>
              <span className="hidden md:inline text-xs font-bold text-slate-800 truncate max-w-[120px]">
                {user?.fullName || "Instructor"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default InstructorLayout;