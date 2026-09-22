import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  ClipboardCheck,
  FileSpreadsheet,
  BarChart3,
  UserCircle,
  LogOut,
  BrainCircuit,
} from "lucide-react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

function InstructorSidebar() {
  const navigate = useNavigate();

  const location = useLocation();

  const menu = [
    {
      label: "Dashboard",
      path: "/instructor",
      icon: LayoutDashboard,
    },
    {
      label: "My Courses",
      path: "/instructor/my-courses",
      icon: BookOpen,
    },
    {
      label: "Create Course",
      path: "/instructor/create-course",
      icon: PlusCircle,
    },
    {
      label: "Assignments",
      path: "/instructor/my-assignments",
      icon: ClipboardCheck,
    },
    {
      label: "Submissions",
      path: "/instructor/submissions",
      icon: FileSpreadsheet,
    },
    {
      label: "Analytics",
      path: "/instructor/analytics",
      icon: BarChart3,
    },
    {
      label: "Profile",
      path: "/instructor/profile",
      icon: UserCircle,
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      className="
      fixed
      top-0
      left-0

      w-[290px]
      h-screen

      bg-[#0A101C]

      border-r
      border-slate-800

      flex
      flex-col

      z-50
      "
    >
      {/* HEADER */}

      <div className="p-6">
        <div className="flex items-center gap-4">
          <div
            className="
            h-14
            w-14

            rounded-2xl

            bg-gradient-to-br
            from-cyan-500
            via-sky-500
            to-blue-600

            flex
            items-center
            justify-center

            shadow-lg
            shadow-cyan-500/25
            "
          >
            <BrainCircuit
              size={28}
              className="text-white"
            />
          </div>

          <div>
            <h2
              className="
              text-2xl
              font-bold
              text-white
              "
            >
              DLM
            </h2>

            <p
              className="
              text-xs
              text-slate-400
              "
            >
              Instructor Portal
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}

      <div
        className="
        flex-1
        overflow-y-auto
        px-4
        "
      >
        {menu.map((item) => {
          const Icon = item.icon;

          const active =
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

                mb-2

                transition-all
                duration-300

                ${
                  active
                    ? `
                      bg-gradient-to-r
                      from-cyan-500
                      to-blue-500

                      text-white

                      shadow-lg
                      shadow-cyan-500/20
                    `
                    : `
                      text-slate-300

                      hover:bg-white/5
                      hover:text-white
                    `
                }
              `}
            >
              <Icon size={18} />

              <span className="font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* BOTTOM LOGOUT */}

      <div
        className="
        mt-auto

        p-4

        border-t
        border-slate-800
        "
      >
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

export default InstructorSidebar;