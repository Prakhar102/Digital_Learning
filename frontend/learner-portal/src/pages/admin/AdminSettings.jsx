import AdminSidebar from "../../components/admin/AdminSidebar";

function AdminSettings() {
  return (
    <div
      className="
      min-h-screen
      bg-[#08101F]
      flex
      "
    >
      <AdminSidebar />

      <div
        className="
        flex-1
        p-8
        "
      >
        <h1
          className="
          text-5xl
          font-bold
          "
        >
          Settings
        </h1>

        <p
          className="
          mt-3
          text-white/60
          "
        >
          Platform configuration.
        </p>
      </div>
    </div>
  );
}

export default AdminSettings;