import { Link, useNavigate } from "react-router-dom";
import { PiBrainFill } from "react-icons/pi";
import { logoutUser } from "../../services/authService";
function DashboardNavbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
  try {
    const refreshToken =
      localStorage.getItem(
        "refreshToken"
      );

    if (refreshToken) {
      await logoutUser(
        refreshToken
      );
    }
  } catch (error) {
    console.error(error);
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login");
  }
};

  return (
    <nav
      className="
      sticky
      top-0
      z-50
      border-b
      border-white/10
      bg-[#0F1226]/80
      backdrop-blur-xl
      "
    >
      <div
        className="
        max-w-7xl
        mx-auto
        px-8
        py-4
        flex
        items-center
        justify-between
        "
      >
        {/* LOGO */}

        <Link
          to="/dashboard"
          className="
          flex
          items-center
          gap-3
          "
        >
          <div
            className="
            h-10
            w-10
            rounded-xl
            bg-gradient-to-br
            from-[#C98A3D]
            to-[#D9A65A]
            flex
            items-center
            justify-center
            "
          >
            <PiBrainFill
              className="
              text-[#161A34]
              text-xl
              "
            />
          </div>

          <span
            className="
            text-lg
            font-bold
            "
          >
            DLM
          </span>
        </Link>

        {/* MENU */}

        <div
          className="
          hidden
          md:flex
          items-center
          gap-8
          "
        >
          <button className="hover:text-[#C98A3D] transition-colors">
            Dashboard
          </button>

          <Link
              to="/my-learning"
              className="
              hover:text-[#C98A3D]
              transition-colors
              "
            >
              My Learning
            </Link>


          <button className="hover:text-[#C98A3D] transition-colors">
            Assessments
          </button>

          <button className="hover:text-[#C98A3D] transition-colors">
            Certifications
          </button>
        </div>

        {/* RIGHT */}

        <div
          className="
          flex
          items-center
          gap-4
          "
        >
          <div
            className="
            h-10
            w-10
            rounded-full
            bg-[#C98A3D]
            text-[#161A34]
            flex
            items-center
            justify-center
            font-bold
            "
          >
            {user
              ? user.fullName
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

          <button
            onClick={handleLogout}
            className="
            px-4
            py-2
            rounded-xl
            border
            border-white/10
            hover:border-[#C98A3D]
            transition-all
            "
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNavbar;