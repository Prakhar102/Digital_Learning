import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle,
  PlusCircle,
  Sparkles,
  Award,
  Trophy,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getMyCourses } from "../../services/enrollmentService";
import { getAllCourses } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";
import { getUserCertificates } from "../../services/certificateService";
import { getStoredProgressMap } from "../../services/progressService";

function MyLearning() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearningData();
    const handleStorage = () => loadLearningData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  async function loadLearningData() {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (user?.id) {
        const [enrollmentList, allCourses, userCerts] = await Promise.all([
          getMyCourses(user.id),
          getAllCourses(),
          getUserCertificates(user.id),
        ]);

        const courseMap = new Map((allCourses || []).map((c) => [String(c.id), c]));
        const certMap = new Map((userCerts || []).map((c) => [String(c.courseId), c]));
        const progressMap = getStoredProgressMap();

        const merged = (enrollmentList || []).map((item) => {
          const courseDetail = courseMap.get(String(item.courseId)) || {};
          const cert = certMap.get(String(item.courseId));
          const progKey = `u_${user.id}_c_${item.courseId}`;
          const prog = progressMap[progKey] || {};

          const totalLessons = (courseDetail.modules || []).flatMap((m) => m.lessons || []).length;
          const completedLessonCount = (prog.completedLessonIds || []).length;
          const calculatedPct = totalLessons > 0 ? Math.min(100, Math.round((completedLessonCount / totalLessons) * 100)) : 0;

          const isCompleted =
            item.status === "COMPLETED" ||
            item.progress >= 100 ||
            !!cert ||
            (totalLessons > 0 && completedLessonCount >= totalLessons);

          return {
            ...item,
            title: courseDetail.title || item.courseTitle || `Course #${item.courseId}`,
            description: courseDetail.description || item.description || "Comprehensive syllabus track with hands-on labs and evaluations.",
            category: courseDetail.category || "Python & Full Stack",
            imageUrl: courseDetail.imageUrl || "",
            level: courseDetail.level || "BEGINNER",
            isCompleted,
            progress: isCompleted ? 100 : (item.progress || calculatedPct || 0),
            certificateId: cert?.id || cert?.certificateId || null,
          };
        });

        setCourses(merged);
      }
    } catch (e) {
      console.error("Error loading learner enrollments:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My Learning Programs
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track course completion status, review completed lecture tracks, and access accredited certificates.
            </p>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle size={14} /> Browse Catalog
          </button>
        </div>

        {/* ── Grid ── */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white shadow-xs">
            <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No active course enrollments yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Explore the catalog to enroll in certification courses and start learning.
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              Browse Course Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((item) => (
              <div
                key={item.id || item.courseId}
                className={`bg-white border rounded-xl p-6 flex flex-col justify-between transition-all group ${
                  item.isCompleted
                    ? "border-emerald-200 shadow-2xs hover:border-emerald-400"
                    : "border-slate-200/80 hover:border-blue-400 hover:shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded">
                      Course ID #{item.courseId}
                    </span>

                    {item.isCompleted ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-emerald-600" /> Completed (100%)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full flex items-center gap-1">
                        <Clock size={11} className="text-amber-600" /> In Progress ({item.progress || 0}%)
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5 leading-snug">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {item.level}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-500">Progress:</span>
                      <span className={item.isCompleted ? "text-emerald-700 font-bold" : "text-slate-700"}>
                        {item.progress || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.isCompleted ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${item.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  {item.isCompleted ? (
                    <>
                      <button
                        onClick={() => navigate(`/learn/${item.courseId}`)}
                        className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                      >
                        <RotateCcw size={12} /> Watch Again
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            item.certificateId
                              ? `/certificates/${item.certificateId}`
                              : `/certificates`
                          )
                        }
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Award size={13} /> View Certificate
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate(`/learn/${item.courseId}`)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Play size={12} /> Continue Classroom
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MyLearning;