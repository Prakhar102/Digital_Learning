import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { getCurrentUser } from "../../services/userService";
import { getUserNotifications, getUnreadCount } from "../../services/notificationService";

function InstructorLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotification, setToastNotification] = useState(null);
  const lastCountRef = useRef(0);

  const fetchNotificationData = async (userId) => {
    if (!userId) return;
    try {
      const list = await getUserNotifications(userId);
      if (Array.isArray(list)) {
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
          }, 6000);
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const menu = [
    { label: "Console Overview", path: "/instructor", icon: LayoutDashboard },
    { label: "Author New Course", path: "/instructor/create-course", icon: PlusCircle },
    { label: "Manage Courses", path: "/instructor/my-courses", icon: BookOpen },
    { label: "Create Assignment", path: "/instructor/assignments", icon: ClipboardCheck },
    { label: "My Assignments", path: "/instructor/my-assignments", icon: FileCheck },
    { label: "Submissions & Grading", path: "/instructor/submissions", icon: FileSpreadsheet, badge: unreadCount },
    { label: "Faculty Analytics", path: "/instructor/analytics", icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.clear();
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
              {toastNotification.subject || "New Student Submission Alert"}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
              {toastNotification.message}
            </p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
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
            const active = location.pathname === item.path;

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3
                  px-3 py-2.5 rounded-lg
                  text-[13px] font-medium transition-all
                  ${active
                    ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }
                `}
              >
                <Icon size={16} className={active ? "text-indigo-600" : "text-slate-400"} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-600 text-white rounded-full animate-pulse">
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
              transition-colors
            "
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <main className="ml-[260px] flex-1 min-h-screen bg-slate-50 text-slate-800">
        {children}
      </main>
    </div>
  );
}

export default InstructorLayout;