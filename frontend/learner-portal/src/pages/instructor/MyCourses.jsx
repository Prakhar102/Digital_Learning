import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  PlusCircle,
  Settings,
  FileText,
  Trash2,
  ExternalLink,
  Eye,
  Users,
  Star,
  Flame,
} from "lucide-react";
import {
  getAllCourses,
  deleteCourse,
  getCourseViews,
  getCourseRatingData,
} from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";
import { getInstructorEnrolledStudents } from "../../services/enrollmentService";

function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledMap, setEnrolledMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    // Purge old mock starter courses from local storage store if present
    try {
      const raw = localStorage.getItem("dlm_created_courses_store");
      if (raw) {
        const stored = JSON.parse(raw);
        const cleaned = stored.filter(
          (c) =>
            ![101, 102, 103, 104].includes(Number(c.id)) &&
            !c.title?.includes("The Complete Full Stack AI & Microservices Engineering Bootcamp") &&
            !c.title?.includes("Python, FastAPI & Enterprise Distributed Systems Masterclass")
        );
        if (cleaned.length !== stored.length) {
          localStorage.setItem("dlm_created_courses_store", JSON.stringify(cleaned));
        }
      }
    } catch {}

    loadCourses();
    const handleStorage = () => loadCourses();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  async function loadCourses() {
    try {
      const user = await getCurrentUser();
      const list = await getAllCourses();
      if (Array.isArray(list)) {
        // Filter out legacy mock courses
        const realCourses = list.filter(
          (c) =>
            ![101, 102, 103, 104].includes(Number(c.id)) &&
            !c.title?.includes("The Complete Full Stack AI & Microservices Engineering Bootcamp") &&
            !c.title?.includes("Python, FastAPI & Enterprise Distributed Systems Masterclass")
        );
        setCourses(realCourses);

        // Compute enrolled students per course
        const students = getInstructorEnrolledStudents(user?.id, realCourses);
        const map = {};
        students.forEach((s) => {
          const cId = String(s.courseId);
          map[cId] = (map[cId] || 0) + 1;
        });
        setEnrolledMap(map);
      }
    } catch (e) {
      console.error("Failed to load courses:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCourse(courseId, courseTitle) {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This will also remove all its modules and lessons.`)) {
      return;
    }

    setDeletingId(courseId);
    try {
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => String(c.id) !== String(courseId)));
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Authored Courses & Curriculum Tracks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage course curriculum, monitor real-time learner views, review enrollments, and configure assessments.
          </p>
        </div>

        <button
          onClick={() => navigate("/instructor/create-course")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
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
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
          >
            Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const views = getCourseViews(course.id);
            const ratingData = getCourseRatingData(course.id);
            const enrolledCount = enrolledMap[String(course.id)] || 0;

            return (
              <div
                key={course.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between hover:border-indigo-400 hover:shadow-lg transition-all duration-200 group"
              >
                <div>
                  {/* Top Header Tag Row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md">
                      ID #{course.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                          course.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {course.status || "PUBLISHED"}
                      </span>
                      <button
                        title="Delete course"
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        disabled={deletingId === course.id}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} className={deletingId === course.id ? "animate-pulse" : ""} />
                      </button>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  {course.category && (
                    <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 rounded mb-3">
                      {course.category}
                    </span>
                  )}

                  {/* ── Real-Time Learner Views & Enrollment Metrics ── */}
                  <div className="my-3 p-3 bg-slate-50/90 border border-slate-100 rounded-xl grid grid-cols-3 gap-2 text-center">
                    {/* Live Unique Views */}
                    <div className="flex flex-col items-center justify-center p-1.5 bg-white border border-blue-100 rounded-lg shadow-2xs">
                      <div className="flex items-center gap-1 text-blue-600 mb-0.5">
                        <Eye size={13} />
                        <span className="text-xs font-black text-slate-900">{views.toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Unique Views</span>
                    </div>

                    {/* Enrolled Learners */}
                    <div className="flex flex-col items-center justify-center p-1.5 bg-white border border-emerald-100 rounded-lg shadow-2xs">
                      <div className="flex items-center gap-1 text-emerald-600 mb-0.5">
                        <Users size={13} />
                        <span className="text-xs font-black text-slate-900">{enrolledCount}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Learners</span>
                    </div>

                    {/* Rating */}
                    <div className="flex flex-col items-center justify-center p-1.5 bg-white border border-amber-100 rounded-lg shadow-2xs">
                      <div className="flex items-center gap-1 text-amber-500 mb-0.5">
                        <Star size={13} className="fill-amber-400" />
                        <span className="text-xs font-black text-slate-900">{ratingData.rating > 0 ? ratingData.rating : "5.0"}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Rating</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {course.description || "Comprehensive syllabus and technical track modules."}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/instructor/courses/${course.id}/content`)}
                      className="w-full py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Settings size={13} /> Modules
                    </button>
                    <button
                      onClick={() => navigate(`/instructor/courses/${course.id}/assessment`)}
                      className="w-full py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <FileText size={13} /> Quiz Exam
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyCourses;