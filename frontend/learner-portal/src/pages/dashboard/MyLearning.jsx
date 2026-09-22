import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getMyCourses } from "../../services/enrollmentService";
import { getCurrentUser } from "../../services/userService";

function MyLearning() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearningData();
  }, []);

  const loadLearningData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (user?.id) {
        const list = await getMyCourses(user.id);
        setCourses(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
              Resume active lessons, watch lecture modules, and review track progress.
            </p>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Browse Catalog
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
            <p className="text-sm font-semibold text-slate-700">No active course enrollments</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Explore the catalog to enroll in certification courses.
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((item) => (
              <div
                key={item.id || item.courseId}
                className="bg-white border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between hover:border-blue-400 hover:shadow-xs transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded">
                      Course #{item.courseId}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.enrolledAt ? new Date(item.enrolledAt).toLocaleDateString() : "Active"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                    Technical Track #{item.courseId}
                  </h3>

                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Interactive classroom modules, assessment quizzes, and assignment projects.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> Ongoing
                  </span>
                  <button
                    onClick={() => navigate(`/learn/${item.courseId}`)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Play size={11} /> Continue Classroom
                  </button>
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