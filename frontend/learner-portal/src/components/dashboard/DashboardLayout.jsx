import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  ClipboardCheck,
  Bell,
  UserCircle,
  LogOut,
  Search,
  FileText,
  Bot,
  GraduationCap,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  Layers,
  Brain,
  Cpu,
  Workflow,
  Flame,
  Zap,
  ChevronRight,
  Settings,
} from "lucide-react";
import {
  getUnreadCount,
  getUserNotifications,
  markAsRead,
} from "../../services/notificationService";
import { getCurrentUser } from "../../services/userService";
import LeetCodeStreakHeatmap from "../profile/LeetCodeStreakHeatmap";
import { calculateLearnerStreak } from "../../services/streakService";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);
  const [streakCount, setStreakCount] = useState(1);
  const lastCountRef = useRef(0);
  const profileModalRef = useRef(null);

  const fetchNotificationData = async (userId) => {
    if (!userId) return;
    try {
      const list = await getUserNotifications(userId);
      if (Array.isArray(list)) {
        setNotifications(list.slice(0, 8));
        const unread = list.filter((n) => !n.read && !n.isRead).length;
        setUnreadCount(unread);

        // If new notifications arrived in real-time, show toast alert!
        if (unread > lastCountRef.current && lastCountRef.current !== 0) {
          const latest = list[0];
          setToastNotification(latest);
          setTimeout(() => setToastNotification(null), 6000);
        }
        lastCountRef.current = unread;
      }
    } catch (e) {
      // Fallback local notifications cache
      const localKey = `dlm_notifications_${userId}`;
      const local = JSON.parse(localStorage.getItem(localKey) || "[]");
      if (local.length > 0) {
        setNotifications(local.slice(0, 8));
        const unread = local.filter((n) => !n.read).length;
        setUnreadCount(unread);
      }
    }
  };

  const refreshStreak = (userData) => {
    if (!userData) return;
    const { stats } = calculateLearnerStreak(userData);
    setStreakCount(stats.currentStreak);
  };

  useEffect(() => {
    let intervalId;
    const init = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        if (userData?.id) {
          refreshStreak(userData);
          await fetchNotificationData(userData.id);
          // ── Real-time notification polling every 6 seconds ──
          intervalId = setInterval(() => {
            fetchNotificationData(userData.id);
          }, 6000);
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();

    const handleStorage = () => {
      if (user) {
        refreshStreak(user);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleMarkAsRead = async (notifId) => {
    try {
      await markAsRead(notifId);
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

  const menu = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Course Catalog", path: "/courses", icon: Search },
    { label: "My Learning", path: "/my-learning", icon: BookOpen },
    { label: "Assessments", path: "/my-assessments", icon: ClipboardCheck },
    { label: "Assignments", path: "/my-submissions", icon: FileText },
    { label: "Certifications", path: "/certificates", icon: Trophy },
    { label: "AI Mentor (RAG)", path: "/ai-mentor", icon: Bot },
    { label: "Agent Studio (Tools)", path: "/agent-studio", icon: Sparkles },
    { label: "Knowledge Hub", path: "/knowledge-hub", icon: Layers },
    { label: "AI Flashcards", path: "/flashcards", icon: Brain },
    { label: "Socratic Debate", path: "/socratic-debate", icon: GraduationCap },
    { label: "MCP Inspector", path: "/mcp-explorer", icon: Cpu },
    { label: "Agent Observability", path: "/agent-observability", icon: Workflow },
    { label: "Notifications", path: "/notifications", icon: Bell, badge: unreadCount },
    { label: "Profile", path: "/profile", icon: UserCircle },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased relative">
      {/* ── Real-Time Popup Notification Toast ── */}
      {toastNotification && (
        <div className="fixed top-5 right-5 z-[9999] max-w-sm bg-white border border-blue-200 rounded-xl p-4 shadow-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Bell size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              {toastNotification.subject || "New Real-Time Alert"}
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
        {/* Logo / Brand */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white tracking-wider text-sm shadow-xs">
              DLM
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                Enterprise LMS
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Learner Workspace
              </p>
            </div>
          </div>
        </div>

        {/* User Quick Card (Clickable to open profile streak modal) */}
        {user && (
          <div
            onClick={() => setShowProfileModal(true)}
            className="mx-3 mt-4 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs ring-2 ring-blue-100 group-hover:ring-blue-300">
                {user.fullName?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{user.fullName}</p>
                <p className="text-[10px] text-orange-600 font-bold flex items-center gap-1">
                  <Flame size={11} className="shrink-0" /> {streakCount}-Day Streak
                </p>
              </div>
              <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 transition" />
            </div>
          </div>
        )}

        {/* Navigation Menu */}
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
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }
                `}
              >
                <Icon size={16} className={active ? "text-blue-600" : "text-slate-400"} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sign Out */}
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
      <div className="ml-[260px] flex-1 flex flex-col min-h-screen">
        {/* ── Top Header Navigation Bar with Profile Circle Symbol ── */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-800">
              {location.pathname.replace("/", "").replace("-", " ") || "Dashboard"}
            </span>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-4">
            {/* Clickable Streak Flame Badge */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Click to view full Learning Streak & Heatmap"
            >
              <Flame size={14} className="text-orange-600" />
              <span>{streakCount}-Day Streak</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              title="View Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* ── Interactive Profile Circle Symbol / Avatar Button ── */}
            <button
              id="profile-circle-button"
              onClick={() => setShowProfileModal(!showProfileModal)}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition focus:outline-hidden"
              title="Click for Profile Details & Streak Heatmap"
            >
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs ring-2 ring-blue-100 hover:ring-blue-400 transition-all">
                {user?.fullName?.charAt(0) || "U"}
              </div>
            </button>
          </div>
        </header>

        {/* ── Main Content Page ── */}
        <main className="flex-1 bg-slate-50 text-slate-800">
          {children}
        </main>
      </div>

      {/* ── Interactive Profile & LeetCode Streak Modal ── */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            ref={profileModalRef}
            className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200 relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition"
            >
              <X size={18} />
            </button>

            {/* User Profile Card Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
              <div className="h-18 w-18 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md ring-4 ring-blue-50">
                {user?.fullName?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 truncate">
                    {user?.fullName || "Student Learner"}
                  </h2>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
                    {user?.role || "ROLE_LEARNER"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email || "learner@dlm.internal"}</p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                  <span>Student ID: <strong className="text-slate-700">{user?.id || "usr_student_01"}</strong></span>
                  <span>•</span>
                  <span>Enrolled Tracks: <strong className="text-blue-600">Active</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    navigate("/profile");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Settings size={13} /> Edit Profile
                </button>
              </div>
            </div>

            {/* ── LeetCode Streak & 52-Week Activity Heatmap inside Profile Modal ── */}
            <div>
              <LeetCodeStreakHeatmap user={user} />
            </div>

            {/* Quick Links inside Profile Modal */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    navigate("/my-learning");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition"
                >
                  My Courses
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    navigate("/certificates");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold hover:bg-emerald-100 transition"
                >
                  My Certificates
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5"
              >
                <LogOut size={13} /> Sign Out of Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
