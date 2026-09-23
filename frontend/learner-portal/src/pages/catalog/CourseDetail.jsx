import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  PlayCircle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Flame,
  Star,
  Eye,
  GraduationCap,
  Award,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getCourseDetails, getCourseById, getCourseViews, recordUniqueCourseView, getCourseRatingData } from "../../services/courseService";
import { getModulesByCourse } from "../../services/moduleService";
import { enrollInCourse, getMyCourses } from "../../services/enrollmentService";
import { getCurrentUser } from "../../services/userService";
import { getAutoThumbnail } from "../../utils/courseThumbnails";

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [viewsCount, setViewsCount] = useState(() => getCourseViews(courseId));
  const [ratingData, setRatingData] = useState(() => getCourseRatingData(courseId));

  useEffect(() => {
    loadCourseData();
    setRatingData(getCourseRatingData(courseId));
    const handleStorage = () => {
      setViewsCount(getCourseViews(courseId));
      setRatingData(getCourseRatingData(courseId));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [courseId]);

  async function loadCourseData() {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Record unique view strictly once per learner
      const currentViews = recordUniqueCourseView(courseId, user?.id);
      setViewsCount(currentViews);

      if (user?.id) {
        const enrollments = await getMyCourses(user.id);
        if (Array.isArray(enrollments)) {
          setIsEnrolled(enrollments.some((e) => Number(e.courseId) === Number(courseId)));
        }
      }

      try {
        const details = await getCourseDetails(courseId);
        setCourse(details);
        if (details?.modules) {
          setModules(details.modules);
        }
      } catch (e) {
        const basic = await getCourseById(courseId);
        setCourse(basic);
        const mods = await getModulesByCourse(courseId);
        setModules(Array.isArray(mods) ? mods : []);
      }
    } catch (err) {
      console.error("Course details error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!currentUser?.id) {
      navigate("/login");
      return;
    }
    try {
      setEnrolling(true);
      await enrollInCourse(currentUser.id, Number(courseId), course, currentUser);
      setIsEnrolled(true);
      setStatusMessage({
        type: "success",
        text: `Enrolled successfully! Instructor & Admin notified. Taking you to course lessons...`,
      });
      setTimeout(() => {
        navigate(`/learn/${courseId}`);
      }, 1000);
    } catch (err) {
      console.error("Enrollment failed:", err);
      setStatusMessage({
        type: "error",
        text: "Enrollment failed or already enrolled.",
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (id) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-4xl mx-auto text-center py-20">
          <p className="text-slate-500 mb-4">Course not found.</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            Back to Catalog
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const thumbnail = course.imageUrl || course.thumbnailUrl || getAutoThumbnail(course.title, course.categoryName || course.category);
  const instructorName =
    course.instructorName && course.instructorName !== "Instructor"
      ? course.instructorName
      : course.author && course.author !== "Instructor"
      ? course.author
      : "Swati Kumari";
  const currentRating = ratingData?.rating > 0 ? ratingData.rating : 5.0;
  const reviewsCount = ratingData?.count || 0;

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        {/* ── Back Navigation ── */}
        <button
          onClick={() => navigate("/courses")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </button>

        {/* ── Status Toast ── */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold border shadow-xs animate-in fade-in duration-200 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* ── Course Hero Card ── */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Details & Meta */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px] uppercase tracking-wider">
                  {course.categoryName || course.category || "Curriculum Track"}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[11px] flex items-center gap-1">
                  <Flame size={12} /> {viewsCount.toLocaleString()} views
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-bold text-[11px] flex items-center gap-1">
                  <Award size={12} /> Verified Certificate
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {course.title}
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed">
                {course.description ||
                  "Master essential engineering concepts and production-grade architectures through structured curriculum modules, interactive sandbox exercises, and graded milestone assessments."}
              </p>

              {/* Instructor & Rating Row */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {instructorName[0]}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Instructor</span>
                    <span className="font-semibold text-slate-900">{instructorName}</span>
                  </div>
                </div>

                <div className="h-4 w-px bg-slate-200" />

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900">{currentRating}</span>
                  </div>
                  <span className="text-slate-400">({reviewsCount} ratings)</span>
                </div>

                <div className="h-4 w-px bg-slate-200" />

                <div className="flex items-center gap-1 text-slate-500">
                  <BookOpen size={13} className="text-slate-400" />
                  <span>{modules.length} Modules</span>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Preview Card & Enroll CTA */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-4">
              <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 shadow-xs">
                <img
                  src={thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-[10px] text-white font-mono flex items-center gap-1">
                  <Eye size={10} className="text-blue-400" />
                  {viewsCount.toLocaleString()} views
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Access Type:</span>
                  <span className="font-bold text-slate-900">Full Lifetime Access</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Curriculum:</span>
                  <span className="font-bold text-slate-900">{modules.length} modules</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Certificate:</span>
                  <span className="font-bold text-emerald-600">Included on completion</span>
                </div>
              </div>

              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/learn/${courseId}`)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlayCircle size={15} /> Continue Learning &rarr;
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <GraduationCap size={16} />
                  {enrolling ? "Enrolling candidate..." : "Enroll Now"}
                </button>
              )}
            </div>
          </div>
        </div>


        {/* ── Syllabus / Curriculum Tree ── */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Course Syllabus & Curriculum</h2>

          {modules.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-500 shadow-xs">
              Curriculum modules are being finalized for this course.
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((mod, idx) => {
                const isOpen = expandedModules[mod.id] ?? true;
                return (
                  <div
                    key={mod.id || idx}
                    className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs"
                  >
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                          <p className="text-xs text-slate-500">{mod.lessons?.length || 0} lessons included</p>
                        </div>
                      </div>
                      {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                    </button>

                    {isOpen && mod.lessons && mod.lessons.length > 0 && (
                      <div className="px-4 pb-4 space-y-1.5 border-t border-slate-100 pt-3 bg-slate-50/50">
                        {mod.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id || lIdx}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 hover:text-slate-900 transition-colors shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <PlayCircle size={14} className="text-blue-600" />
                              <span className="font-medium">{lesson.title}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {lesson.duration || "10m"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CourseDetail;
