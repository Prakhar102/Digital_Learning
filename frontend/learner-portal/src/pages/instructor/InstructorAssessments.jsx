import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  FileCheck,
  PlusCircle,
  Search,
  Trophy,
  Lock,
  Unlock,
  Sparkles,
  BookOpen,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { getAllAssessments, getStoredAttempts, deleteAssessment } from "../../services/assessmentService";
import { getAllCourses } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";

function InstructorAssessments() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [uData, assessList, courseList] = await Promise.allSettled([
        getCurrentUser(),
        getAllAssessments(),
        getAllCourses(),
      ]);

      const aList = assessList.status === "fulfilled" && Array.isArray(assessList.value) ? assessList.value : [];
      const cList = courseList.status === "fulfilled" && Array.isArray(courseList.value) ? courseList.value : [];
      const attList = getStoredAttempts();

      const courseMap = new Map((cList || []).map((c) => [Number(c.id), c.title]));
      const enrichedAssessments = aList.map((a) => ({
        ...a,
        courseTitle:
          courseMap.get(Number(a.courseId)) ||
          (a.courseTitle && !a.courseTitle.startsWith("Course #") ? a.courseTitle : null) ||
          `Course #${a.courseId}`,
      }));

      setAssessments(enrichedAssessments);
      setCourses(cList);
      setAttempts(attList);
    } catch (e) {
      console.error("Error loading instructor assessments:", e);
    } finally {
      setLoading(false);
    }
  }

  const getAssessmentStatus = (scheduledAt, durationMinutes = 30) => {
    if (!scheduledAt) return "LIVE";
    const start = new Date(scheduledAt).getTime();
    if (isNaN(start)) return "LIVE";
    const end = start + (Number(durationMinutes) || 30) * 60 * 1000;

    if (now < start) return "UPCOMING";
    if (now >= start && now <= end) return "LIVE";
    return "ENDED";
  };

  const getAssessmentAttemptsCount = (assessmentId) => {
    return attempts.filter((att) => String(att.assessmentId) === String(assessmentId)).length;
  };

  const filtered = assessments.filter((a) => {
    const matchSearch =
      (a.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.courseTitle || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || a.type === filterType;
    return matchSearch && matchType;
  });

  const totalMCQs = assessments.filter((a) => a.type === "MCQ").length;
  const totalDescriptive = assessments.filter((a) => a.type === "DESCRIPTIVE").length;

  const handleDeleteAssessment = (id, title) => {
    if (window.confirm(`Are you sure you want to delete the scheduled assessment "${title}"?`)) {
      deleteAssessment(id);
      setAssessments((prev) => prev.filter((a) => String(a.id) !== String(id)));
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* ── Top Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Calendar className="text-indigo-600" size={24} />
              Assessments & Scheduled Exams
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Schedule timed MCQ/Descriptive assessments, manage exams, and track live student performance on the leaderboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/instructor/create-assessment")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle size={15} /> Schedule New Assessment
            </button>
          </div>
        </div>

        {/* ── Stat Badges ── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Scheduled</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{assessments.length}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">MCQ Quizzes</p>
            <p className="text-xl font-bold text-indigo-600 mt-1">{totalMCQs}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Descriptive Exams</p>
            <p className="text-xl font-bold text-purple-600 mt-1">{totalDescriptive}</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Learner Submissions</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{attempts.length}</p>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search assessment title or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === "ALL" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType("MCQ")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === "MCQ" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              MCQs
            </button>
            <button
              onClick={() => setFilterType("DESCRIPTIVE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === "DESCRIPTIVE" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Descriptive
            </button>
          </div>
        </div>

        {/* ── Assessments Roster List ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-16 text-center">
              <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Calendar size={32} className="mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">No scheduled assessments found.</p>
              <p className="text-xs text-slate-400">
                Click below to create a quiz or descriptive evaluation for your course.
              </p>
              <button
                onClick={() => navigate("/instructor/create-assessment")}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                <PlusCircle size={14} /> Schedule First Assessment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <div className="col-span-4">Assessment & Course Track</div>
                <div className="col-span-2">Format</div>
                <div className="col-span-3">Scheduled Start & Lock Status</div>
                <div className="col-span-1 text-center">Submissions</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {filtered.map((item) => {
                const attemptsCount = getAssessmentAttemptsCount(item.id);

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 px-6 py-4 items-center text-xs hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Title & Course */}
                    <div className="col-span-4 pr-3">
                      <p className="font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-indigo-600 font-medium flex items-center gap-1 mt-0.5 truncate">
                        <BookOpen size={12} /> {item.courseTitle || `Course #${item.courseId}`}
                      </p>
                    </div>

                    {/* Format */}
                    <div className="col-span-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          item.type === "MCQ"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {item.type || "MCQ"} • {item.questions?.length || 0} Qs
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock size={10} /> {item.durationMinutes || 30} mins
                      </p>
                    </div>

                    {/* Scheduled Start & Lock Status */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const status = getAssessmentStatus(item.scheduledAt, item.durationMinutes);
                          if (status === "UPCOMING") {
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1 shadow-2xs">
                                <Lock size={10} className="text-amber-600" /> Upcoming / Locked
                              </span>
                            );
                          }
                          if (status === "LIVE") {
                            return (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 animate-pulse shadow-2xs">
                                <Unlock size={10} className="text-emerald-600" /> Live / Active
                              </span>
                            );
                          }
                          return (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 inline-flex items-center gap-1 shadow-2xs">
                              <CheckCircle size={10} className="text-slate-500" /> Exam Ended
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">
                        {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "Immediate"}
                      </p>
                    </div>

                    {/* Submissions */}
                    <div className="col-span-1 text-center font-bold text-slate-800">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-[11px]">
                        {attemptsCount}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/leaderboard/${item.id}`)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="View Student Leaderboard"
                      >
                        <Trophy size={13} className="text-amber-600" /> Student Leaderboard
                      </button>
                      <button
                        onClick={() => handleDeleteAssessment(item.id, item.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Assessment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}

export default InstructorAssessments;
