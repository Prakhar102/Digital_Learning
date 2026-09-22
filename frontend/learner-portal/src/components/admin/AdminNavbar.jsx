import { useNavigate } from "react-router-dom";

function AdminNavbar() {

  const navigate =
    useNavigate();

  const handleLogout = () => {

    localStorage.clear();

    navigate("/login");
  };

  return (
    <nav
      className="
      sticky
      top-0
      z-50

      bg-[#111827]

      border-b
      border-white/10

      px-8
      py-4

      flex
      items-center
      justify-between
      "
    >
      <div>
        <h1
          className="
          text-2xl
          font-bold
          "
        >
          DLM Admin
        </h1>
      </div>

      <button
        onClick={handleLogout}
        className="
        px-5
        py-2

        rounded-xl

        bg-red-500/20

        text-red-300
        "
      >
        Logout
      </button>
    </nav>
  );
}

export default AdminNavbar;