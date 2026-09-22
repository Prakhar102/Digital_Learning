import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();

  const location = useLocation();

  const items = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },

    {
      label: "Instructors",
      path: "/admin/instructors",
      icon: Users,
    },

    {
      label: "Courses",
      path: "/admin/courses",
      icon: BookOpen,
    },

    {
      label: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
    },

    {
      label: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.clear();

    navigate("/login");
  };

  return (
    <aside
      className="
      w-72
      h-screen
      sticky
      top-0

      bg-[#0F172A]

      border-r
      border-white/10

      backdrop-blur-xl

      flex
      flex-col
      justify-between
      "
    >
      {/* TOP */}

      <div>
        <div className="p-8">
          <h2
            className="
            text-3xl
            font-bold
            "
          >
            DLM
          </h2>

          <p
            className="
            text-white/50
            mt-2
            "
          >
            Admin Console
          </p>
        </div>

        <nav className="px-4">
          {items.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname ===
              item.path;

            return (
              <button
                key={item.label}
                onClick={() =>
                  navigate(item.path)
                }
                className={`
                  w-full

                  flex
                  items-center
                  gap-4

                  px-5
                  py-4

                  rounded-2xl

                  transition-all

                  mb-3

                  ${
                    isActive
                      ? "bg-[#C98A3D] text-[#161A34] shadow-lg"
                      : "hover:bg-white/5 text-white"
                  }
                `}
              >
                <Icon size={20} />

                <span className="font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM */}

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="
          w-full

          flex
          items-center
          justify-center
          gap-3

          py-4

          rounded-2xl

          bg-red-500/10

          border
          border-red-500/20

          text-red-300

          hover:bg-red-500/20

          transition-all
          "
        >
          <LogOut size={18} />

          Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;