import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  PlusCircle,
  Eye,
  Settings,
  Share2,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";
import InstructorLayout from "../../components/instructor/InstructorLayout";
import { getAllCourses } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";

function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const user = await getCurrentUser();
      const list = await getAllCourses();
      if (Array.isArray(list)) {
        setCourses(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Authored Courses & Curricula
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Organize syllabus modules, upload video lectures, and configure question banks.
            </p>
          </div>

          <button
            onClick={() => navigate("/instructor/create-course")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <PlusCircle size={14} />
            Create Course
          </button>
        </div>

        {/* ── Courses Grid ── */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white shadow-xs">
            <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No courses authored yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Start structuring your curriculum and publishing learning content.
            </p>
            <button
              onClick={() => navigate("/instructor/create-course")}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between hover:border-indigo-400 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded">
                      ID #{course.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      course.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {course.status || "PUBLISHED"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {course.description || "Comprehensive syllabus and technical track modules."}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/instructor/courses/${course.id}/content`)}
                      className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Settings size={12} /> Modules
                    </button>
                    <button
                      onClick={() => navigate(`/instructor/courses/${course.id}/assessment`)}
                      className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <FileText size={12} /> Quiz Exam
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </InstructorLayout>
  );
}

export default MyCourses;