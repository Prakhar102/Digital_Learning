import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  Filter,
  Sparkles,
  Flame,
  Star,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  getPublishedCourses,
  getCategories,
  searchCourses,
  getCoursesByCategory,
  getCourseViews,
  getCourseRatingData,
  getTopViewedCourses,
} from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";
import { enrollInCourse, getMyCourses } from "../../services/enrollmentService";
import UdemyCourseCard from "../../components/course/UdemyCourseCard";

function CourseCatalog() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL"); // 'ALL' | 'MOST_VIEWED' | 'HIGHEST_RATED' | 'PREMIUM'
  const [searchKeyword, setSearchKeyword] = useState("");
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [userRes, coursesRes, catsRes] = await Promise.allSettled([
        getCurrentUser(),
        getPublishedCourses(),
        getCategories(),
      ]);

      const user = userRes.status === "fulfilled" ? userRes.value : null;
      setCurrentUser(user);

      if (user?.id) {
        try {
          const myEnrolled = await getMyCourses(user.id);
          if (Array.isArray(myEnrolled)) {
            setEnrolledCourseIds(new Set(myEnrolled.map((e) => e.courseId)));
          }
        } catch (e) {
          console.error("Error loading user enrollments:", e);
        }
      }

      if (coursesRes.status === "fulfilled" && Array.isArray(coursesRes.value)) {
        setCourses(coursesRes.value);
      }
      if (catsRes.status === "fulfilled" && Array.isArray(catsRes.value)) {
        setCategories(catsRes.value);
      }
    } catch (err) {
      console.error("Catalog load error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) {
      const res = await getPublishedCourses();
      setCourses(Array.isArray(res) ? res : []);
      return;
    }
    try {
      const results = await searchCourses(searchKeyword.trim());
      setCourses(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleCategoryFilter = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      if (categoryId === "ALL") {
        const res = await getPublishedCourses();
        setCourses(Array.isArray(res) ? res : []);
      } else {
        const res = await getCoursesByCategory(categoryId);
        setCourses(Array.isArray(res) ? res : []);
      }
    } catch (err) {
      console.error("Filter category error:", err);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!currentUser?.id) {
      navigate("/login");
      return;
    }
    try {
      setEnrollingId(courseId);
      const targetCourse = courses.find((c) => String(c.id) === String(courseId)) || {};
      await enrollInCourse(currentUser.id, courseId, targetCourse, currentUser);
      setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
      setStatusMessage({
        type: "success",
        text: `Successfully enrolled in "${targetCourse.title || "Course Track"}"! Instructor & Admin notified.`,
      });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error("Enrollment failed:", err);
      setStatusMessage({ type: "error", text: "Enrollment failed or already enrolled." });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setEnrollingId(null);
    }
  };

  // Filtered & sorted courses list
  const filteredCourses = useMemo(() => {
    let list = [...courses];
    if (filterType === "MOST_VIEWED") {
      list.sort((a, b) => getCourseViews(b.id) - getCourseViews(a.id));
    } else if (filterType === "HIGHEST_RATED") {
      list.sort((a, b) => (getCourseRatingData(b.id)?.rating || 5) - (getCourseRatingData(a.id)?.rating || 5));
    } else if (filterType === "PREMIUM") {
      list = list.filter((c) => c.level === "ADVANCED" || c.id % 2 === 0);
    }
    return list;
  }, [courses, filterType]);

  // Most Viewed top 3 courses for header showcase
  const topViewedCourses = useMemo(() => {
    return getTopViewedCourses(courses).slice(0, 3);
  }, [courses]);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* ── Top Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            {/* <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                <Sparkles size={11} /> Curated Curriculum Tracks
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Flame size={11} /> Most Viewed Tech Courses
              </span>
            </div> */}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1.5">
              Course Catalog & Bootcamps
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Explore 3D-visualized engineering curricula across System Design, Full-Stack AI, Spring Boot, and Cybersecurity.
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Python, Java, AI, Microservices..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
            >
              Search
            </button>
          </form>
        </div>

        {/* ── Status Toast ── */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold border shadow-xs animate-in fade-in duration-200 ${statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* ── Section 1: Most Viewed & Trending Spotlight Showcase ── */}
        {topViewedCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Flame size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Most Viewed & Highest Trending Courses</h2>
                  <p className="text-xs text-slate-500">Learners' top choices for system design and advanced engineering</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topViewedCourses.map((course) => (
                <UdemyCourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={enrolledCourseIds.has(course.id)}
                  onEnroll={handleEnroll}
                  isEnrolling={enrollingId === course.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Section 2: Filter Tabs & Complete Catalog ── */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setFilterType("ALL")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${filterType === "ALL"
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                All Courses ({courses.length})
              </button>
              <button
                onClick={() => setFilterType("MOST_VIEWED")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${filterType === "MOST_VIEWED"
                    ? "bg-amber-500 text-slate-900 border-amber-500 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                <Flame size={12} className="text-amber-600" />
                Most Viewed
              </button>
              <button
                onClick={() => setFilterType("HIGHEST_RATED")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${filterType === "HIGHEST_RATED"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                <Star size={12} className="text-amber-400 fill-amber-400" />
                Highest Rated
              </button>
              <button
                onClick={() => setFilterType("PREMIUM")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1 ${filterType === "PREMIUM"
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
              >
                <Sparkles size={12} />
                Premium Bootcamps
              </button>
            </div>

            {/* Category selection */}
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* ── Main Course Grid (Udemy Cards) ── */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-white shadow-xs">
              <BookOpen size={36} className="mx-auto text-slate-400 mb-3" />
              <p className="text-sm text-slate-800 font-semibold">No courses found matching your criteria</p>
              <p className="text-xs text-slate-500 mt-1">
                Try adjusting your search keyword or switching category tabs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <UdemyCourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={enrolledCourseIds.has(course.id)}
                  onEnroll={handleEnroll}
                  isEnrolling={enrollingId === course.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CourseCatalog;
