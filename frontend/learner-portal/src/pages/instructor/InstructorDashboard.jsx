import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  PlusCircle,
  ClipboardCheck,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  Award,
  Users,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import InstructorLayout from "../../components/instructor/InstructorLayout";
import { getCurrentUser } from "../../services/userService";
import { getAllCourses } from "../../services/courseService";
import { getInstructorAssignments } from "../../services/assignmentService";
import { getInstructorEnrolledStudents } from "../../services/enrollmentService";

function InstructorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalAssignments: 0,
    totalEnrolled: 0,
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);

        if (userData?.id) {
          const [coursesRes, assignmentsRes] = await Promise.allSettled([
            getAllCourses(),
            getInstructorAssignments(userData.id),
          ]);

          const courses = coursesRes.status === "fulfilled" && Array.isArray(coursesRes.value) ? coursesRes.value : [];
          const assignments = assignmentsRes.status === "fulfilled" && Array.isArray(assignmentsRes.value) ? assignmentsRes.value : [];
          const students = getInstructorEnrolledStudents(userData.id);

          setRecentCourses(courses.slice(0, 5));
          setRecentAssignments(assignments.slice(0, 5));
          setEnrolledStudents(students);

          setStats({
            totalCourses: courses.length,
            publishedCourses: courses.filter((c) => c.status === "PUBLISHED" || c.published).length,
            totalAssignments: assignments.length,
            totalEnrolled: students.length,
          });
        }
      } catch (e) {
        console.error("Instructor dashboard error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();

    const handleStorage = () => {
      if (user?.id) {
        const students = getInstructorEnrolledStudents(user.id);
        setEnrolledStudents(students);
        setStats((prev) => ({ ...prev, totalEnrolled: students.length }));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const statCards = [
    { label: "Created Courses", value: stats.totalCourses, icon: BookOpen, desc: "Authored modules" },
    { label: "Published Tracks", value: stats.publishedCourses, icon: TrendingUp, desc: "Active in catalog" },
    { label: "Enrolled Students", value: stats.totalEnrolled, icon: Users, desc: "Live student roster" },
    { label: "Assignments Posted", value: stats.totalAssignments, icon: ClipboardCheck, desc: "Evaluations pending" },
  ];

  const quickActions = [
    {
      label: "Create New Course",
      desc: "Define syllabus, modules, and video lessons",
      icon: PlusCircle,
      path: "/instructor/create-course",
    },
    {
      label: "Curriculum Manager",
      desc: "Manage existing content, publish or unpublish",
      icon: BookOpen,
      path: "/instructor/my-courses",
    },
    {
      label: "Assignment Manager",
      desc: "Create new homework assignments and rubrics",
      icon: ClipboardCheck,
      path: "/instructor/assignments",
    },
    {
      label: "Grading Console",
      desc: "Review student code and evaluate submissions",
      icon: FileSpreadsheet,
      path: "/instructor/submissions",
    },
  ];

  if (loading) {
    return (
      <InstructorLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Instructor Console
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome, <span className="text-slate-900 font-semibold">{user?.fullName || "Instructor"}</span>. Manage your lectures, assignments, and student reviews.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/instructor/create-course")}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              <PlusCircle size={14} />
              New Course
            </button>
          </div>
        </div>

        {/* ── Metrics Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-500 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {card.label}
                  </span>
                  <div className="h-7 w-7 rounded-md bg-slate-50 flex items-center justify-center text-slate-600">
                    <Icon size={15} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {card.value}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Action Shortcuts ── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Course Administration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="group text-left bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-indigo-500/40 hover:shadow-sm transition-all relative"
                >
                  <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                    {action.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {action.desc}
                  </p>
                  <ArrowUpRight
                    size={14}
                    className="absolute top-5 right-5 text-slate-400 group-hover:text-indigo-600 transition-colors"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Real-Time Enrolled Candidates Section ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Enrolled Students (Real-Time)
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                    LIVE
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Live roster of learners who enrolled in your curriculum tracks</p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              {enrolledStudents.length} Students
            </span>
          </div>

          {enrolledStudents.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-lg">
              No students enrolled yet. Once learners enroll in your courses via the catalog, their profile and enrollment status will appear here in real-time.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Learner</th>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Course Track</th>
                    <th className="p-2.5">Enrolled Date</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrolledStudents.map((enr) => (
                    <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-semibold text-slate-900 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                          {(enr.learnerName || "S")[0].toUpperCase()}
                        </div>
                        {enr.learnerName}
                      </td>
                      <td className="p-2.5 text-slate-500">{enr.learnerEmail}</td>
                      <td className="p-2.5 font-medium text-indigo-700">{enr.courseTitle}</td>
                      <td className="p-2.5 text-slate-400 font-mono">
                        {enr.enrolledAt ? new Date(enr.enrolledAt).toLocaleDateString() : "Today"}
                      </td>
                      <td className="p-2.5 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Content Feeds Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Courses */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Your Courses</h3>
              <button
                onClick={() => navigate("/instructor/my-courses")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                View all
              </button>
            </div>
            {recentCourses.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-lg">
                No courses created yet. Click "New Course" to get started.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentCourses.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-lg"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{c.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{c.description || "No description provided"}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-200 text-slate-700"}`}>
                      {c.status || "DRAFT"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignments */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Active Assignments</h3>
              <button
                onClick={() => navigate("/instructor/assignments")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                View all
              </button>
            </div>
            {recentAssignments.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 rounded-lg">
                No assignments created yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentAssignments.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-lg"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{a.title}</h4>
                      <p className="text-[11px] text-slate-500">Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "Flexible"}</p>
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium">
                      Course #{a.courseId}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}

export default InstructorDashboard;