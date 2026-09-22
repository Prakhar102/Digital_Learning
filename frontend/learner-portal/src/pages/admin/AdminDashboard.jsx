import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Database,
  GraduationCap,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminStats } from "../../services/adminService";
import { getCurrentUser } from "../../services/userService";
import { getAllRealtimeEnrollments } from "../../services/enrollmentService";

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalInstructors: 0,
    totalAdmins: 0,
  });
  const [realtimeEnrollments, setRealtimeEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [userData, statsData] = await Promise.all([
          getCurrentUser(),
          getAdminStats(),
        ]);
        setUser(userData);
        if (statsData) setStats(statsData);
        setRealtimeEnrollments(getAllRealtimeEnrollments());
      } catch (e) {
        console.error("Admin dashboard error", e);
      } finally {
        setLoading(false);
      }
    };
    load();

    // Listen for storage events for instant cross-tab real-time sync
    const handleStorage = () => {
      setRealtimeEnrollments(getAllRealtimeEnrollments());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const statCards = [
    { label: "Active Learners", value: stats.totalLearners || realtimeEnrollments.length, icon: Users },
    { label: "Faculty Members", value: stats.totalInstructors, icon: BookOpen },
    { label: "Total Enrollments", value: realtimeEnrollments.length, icon: GraduationCap },
    { label: "System Administrators", value: stats.totalAdmins, icon: ShieldCheck },
  ];

  const quickActions = [
    { label: "Manage Faculty Personnel", desc: "View and provision authorized instructor roles", path: "/admin/instructors", icon: Users },
    { label: "Platform Telemetry", desc: "View latency and cluster performance metrics", path: "/admin/analytics", icon: Activity },
    { label: "Course Directory", desc: "Audit curricula, modules, and publish live tracks", path: "/admin/courses", icon: Database },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-10 max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System Administration Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, <span className="text-slate-900 font-semibold">{user?.fullName || "Administrator"}</span>. Real-time platform metrics and cluster controls.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</span>
                  <div className="h-7 w-7 rounded-md bg-slate-50 flex items-center justify-center text-slate-600">
                    <Icon size={15} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* ── Dynamic Real-Time Enrolled Students Table ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Live Enrolled Students Telemetry
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                    LIVE
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Instant registration data synchronized directly when candidates enroll in any course
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {realtimeEnrollments.length} Total Enrolled
            </span>
          </div>

          {realtimeEnrollments.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-xs">
              No course enrollments recorded yet. Once learners click <strong>Enroll Now</strong> in the catalog, live student records will immediately appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Candidate / Student</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Enrolled Course</th>
                    <th className="p-3">Instructor</th>
                    <th className="p-3">Enrollment Date</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {realtimeEnrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          {(enr.learnerName || "S")[0].toUpperCase()}
                        </div>
                        {enr.learnerName}
                      </td>
                      <td className="p-3 text-slate-500">{enr.learnerEmail}</td>
                      <td className="p-3 font-medium text-blue-700">{enr.courseTitle}</td>
                      <td className="p-3 text-slate-600">{enr.instructorName || "Assigned Faculty"}</td>
                      <td className="p-3 text-slate-400 font-mono">
                        {enr.enrolledAt ? new Date(enr.enrolledAt).toLocaleString() : "Just now"}
                      </td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          Enrolled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Administrative Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="group text-left bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-400 hover:shadow-sm transition-all relative cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 mb-1">{action.label}</h3>
                  <p className="text-xs text-slate-500">{action.desc}</p>
                  <ArrowUpRight
                    size={14}
                    className="absolute top-5 right-5 text-slate-400 group-hover:text-slate-900 transition-colors"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;