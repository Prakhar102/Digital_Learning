import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { getCurrentUser } from "../../services/userService";

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const menu = [
    { label: "Overview", path: "/admin", icon: LayoutDashboard },
    { label: "Personnel", path: "/admin/instructors", icon: Users },
    { label: "Course Directory", path: "/admin/courses", icon: BookOpen },
    { label: "Platform Reports", path: "/admin/analytics", icon: BarChart },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      {/* ── Sidebar ── */}
      <aside
        className="
          fixed top-0 left-0
          w-[260px] h-screen
          bg-white
          border-r border-slate-200
          flex flex-col z-50
          shadow-sm
        "
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white text-sm shadow-sm">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900">
                DLM Admin
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Control Center
              </p>
            </div>
          </div>
        </div>

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
                    ? "bg-slate-100 text-slate-900 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }
                `}
              >
                <Icon size={16} className={active ? "text-slate-900" : "text-slate-400"} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100">
          {user && (
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                {user.fullName?.charAt(0) || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-900 truncate">{user.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
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

      {/* ── Main Content ── */}
      <main className="ml-[260px] flex-1 min-h-screen bg-slate-50 text-slate-800">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
