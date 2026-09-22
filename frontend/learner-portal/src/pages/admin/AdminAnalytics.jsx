import AdminSidebar from "../../components/admin/AdminSidebar";

function AdminAnalytics() {
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
          Analytics
        </h1>

        <p
          className="
          mt-3
          text-white/60
          "
        >
          Platform analytics and
          reports.
        </p>
      </div>
    </div>
  );
}

export default AdminAnalytics;