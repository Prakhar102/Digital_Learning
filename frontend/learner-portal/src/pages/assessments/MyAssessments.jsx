import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  Calendar,
  Clock,
  Lock,
  Unlock,
  Play,
  FileCheck,
  BookOpen,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getAllAssessments, getUserAttempts, getStoredAttempts } from "../../services/assessmentService";
import { getMyCourses } from "../../services/enrollmentService";
import { getAllCourses } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";

function MyAssessments() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [scheduledAssessments, setScheduledAssessments] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
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
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (user?.id) {
        const [allSched, userAtts, myEnrollments, allCoursesList] = await Promise.all([
          getAllAssessments(),
          getUserAttempts(user.id),
          getMyCourses(user.id),
          getAllCourses(),
        ]);

        const enrolledCourseIds = new Set((myEnrollments || []).map((e) => Number(e.courseId)));
        setEnrolledCourses(myEnrollments || []);

        // Create course title lookup map
        const courseMap = new Map((allCoursesList || []).map((c) => [Number(c.id), c.title]));

        // Filter scheduled assessments specifically for courses the learner is enrolled in
        // and enrich any fallback course names with authentic course titles
        const relevantAssessments = (allSched || [])
          .filter((a) => enrolledCourseIds.has(Number(a.courseId)) || enrolledCourseIds.size === 0)
          .map((a) => {
            const actualTitle =
              courseMap.get(Number(a.courseId)) ||
              (a.courseTitle && !a.courseTitle.startsWith("Course #") ? a.courseTitle : null) ||
              `Course #${a.courseId}`;
            return {
              ...a,
              courseTitle: actualTitle,
            };
          });

        setScheduledAssessments(relevantAssessments);
        setAttempts(Array.isArray(userAtts) ? userAtts : getStoredAttempts().filter((att) => String(att.learnerId) === String(user.id)));
      }
    } catch (e) {
      console.error("Error loading learner assessments:", e);
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

  const isAssessmentLocked = (scheduledAt) => {
    if (!scheduledAt) return false;
    const target = new Date(scheduledAt).getTime();
    if (isNaN(target)) return false;
    return target > now;
  };

  const formatCountdown = (scheduledAt) => {
    if (!scheduledAt) return "";
    const target = new Date(scheduledAt).getTime();
    if (isNaN(target)) return "";
    const diff = target - now;
    if (diff <= 0) return "Ready to start";

    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 1) return `${days} days ${hours}h`;
    if (days === 1) return `1 day ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const getLearnerAttemptForAssessment = (assessmentId) => {
    return attempts.find((att) => String(att.assessmentId) === String(assessmentId));
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <ClipboardCheck className="text-blue-600" size={26} />
              Course Assessments & Exams
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Participate in scheduled course evaluations, view live exams, and track your performance standings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/leaderboard")}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy size={14} className="text-amber-600" /> Global Leaderboard
            </button>
            <button
              onClick={() => navigate("/my-learning")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen size={14} /> My Learning
            </button>
          </div>
        </div>

        {/* ── Section 1: Scheduled & Live Course Assessments ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              Scheduled & Live Assessments
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {scheduledAssessments.length} Available
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center bg-white border border-slate-200/80 rounded-2xl">
              <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : scheduledAssessments.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-white shadow-xs">
              <Calendar size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No scheduled assessments right now</p>
              <p className="text-xs text-slate-500 mt-1">
                Your instructors will schedule evaluations and quizzes as you progress through course modules.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {scheduledAssessments.map((item) => {
                const status = getAssessmentStatus(item.scheduledAt, item.durationMinutes);
                const pastAttempt = getLearnerAttemptForAssessment(item.id);
                const isCompleted = !!pastAttempt;

                return (
                  <div
                    key={item.id}
                    className={`bg-white border rounded-2xl p-6 flex flex-col justify-between transition-all shadow-xs ${
                      isCompleted
                        ? "border-emerald-200 bg-emerald-50/10"
                        : status === "UPCOMING"
                        ? "border-slate-200/80 opacity-95"
                        : status === "LIVE"
                        ? "border-indigo-300 hover:border-indigo-500 hover:shadow-md"
                        : "border-slate-200 bg-slate-50/40 opacity-80"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded shrink-0 whitespace-nowrap">
                          {item.type || "MCQ"} • {item.questions?.length || 0} Questions
                        </span>

                        {isCompleted ? (
                          (() => {
                            const passingMark = item.passingScore || pastAttempt.passingScore || 60;
                            const earnedScore = Number(pastAttempt.percentage !== undefined ? pastAttempt.percentage : pastAttempt.score) || 0;
                            const isPassed = pastAttempt.passed !== undefined ? pastAttempt.passed : earnedScore >= passingMark;

                            return isPassed ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs shrink-0 whitespace-nowrap">
                                <CheckCircle size={11} className="text-emerald-600" /> PASS ({earnedScore}%)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-300 inline-flex items-center gap-1 shadow-2xs shrink-0 whitespace-nowrap">
                                <XCircle size={11} className="text-rose-600" /> FAIL ({earnedScore}%)
                              </span>
                            );
                          })()
                        ) : status === "UPCOMING" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1 shadow-2xs shrink-0 whitespace-nowrap">
                            <Lock size={10} className="text-amber-600" /> Locked
                          </span>
                        ) : status === "LIVE" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1 animate-pulse shrink-0 whitespace-nowrap">
                            <Unlock size={10} className="text-emerald-600" /> Live / Start Now
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 inline-flex items-center gap-1 shadow-2xs shrink-0 whitespace-nowrap">
                            <CheckCircle size={10} className="text-slate-500" /> Exam Ended
                          </span>
                        )}
                      </div>

                      {/* Title & Course */}
                      <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-indigo-600 font-medium mb-3 flex items-center gap-1">
                        <BookOpen size={12} /> {item.courseTitle || `Course #${item.courseId}`}
                      </p>

                      {item.description && (
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 mb-4 text-[11px]">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock size={12} /> Duration:
                          </span>
                          <span className="font-semibold text-slate-800">{item.durationMinutes || 30} Minutes</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar size={12} /> Scheduled:
                          </span>
                          <span className={`font-semibold font-mono text-[10px] ${status === "UPCOMING" ? "text-amber-700 font-bold" : status === "LIVE" ? "text-emerald-700 font-bold" : "text-slate-600"}`}>
                            {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : "Live Now"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                      {isCompleted ? (
                        <>
                          <button
                            onClick={() => navigate(`/leaderboard/${item.id}`)}
                            className="flex-1 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Trophy size={13} className="text-amber-600" /> Leaderboard
                          </button>
                          <button
                            onClick={() => navigate(`/take-assessment/${item.id}`)}
                            className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw size={13} /> Retake
                          </button>
                        </>
                      ) : status === "UPCOMING" ? (
                        <button
                          disabled
                          className="w-full py-2.5 bg-slate-100 text-slate-500 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed shadow-2xs"
                          title={`Scheduled for ${new Date(item.scheduledAt).toLocaleString()}`}
                        >
                          <Lock size={12} className="text-amber-600" /> Locked — Starts in {formatCountdown(item.scheduledAt)}
                        </button>
                      ) : status === "LIVE" ? (
                        <button
                          onClick={() => navigate(`/take-assessment/${item.id}`)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Play size={13} /> Start Assessment Now
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-not-allowed shadow-2xs"
                        >
                          <CheckCircle size={12} className="text-slate-400" /> Assessment Ended / Closed
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Section 2: Assessment History & Evaluation Records ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck size={18} className="text-emerald-600" />
              Attempt History & Verified Results
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {attempts.length} Attempts
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            {attempts.length === 0 ? (
              <div className="p-16 text-center">
                <ClipboardCheck size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No assessment attempts recorded yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Once you submit an assessment, your score, grade, and evaluation records will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-12 px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <div className="col-span-5">Assessment Track</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Score</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>

                {attempts.map((att) => {
                  const targetAssessment = scheduledAssessments.find((a) => String(a.id) === String(att.assessmentId));
                  const passingMark = targetAssessment?.passingScore || att.passingScore || 60;
                  const earnedScore = Number(att.percentage !== undefined ? att.percentage : att.score) || 0;
                  const isPassed = att.passed !== undefined ? att.passed : earnedScore >= passingMark;

                  return (
                    <div
                      key={att.id}
                      className="grid grid-cols-12 px-6 py-4 items-center text-xs hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="col-span-5 pr-3">
                        <p className="font-bold text-slate-900 truncate">
                          {att.assessmentTitle || targetAssessment?.title || `Assessment #${att.assessmentId}`}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Submitted: {att.submittedAt || att.completedAt ? new Date(att.submittedAt || att.completedAt).toLocaleString() : "Recently"}
                        </p>
                      </div>

                      <div className="col-span-2">
                        {isPassed ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full shadow-2xs">
                            <CheckCircle size={13} className="text-emerald-600" /> PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-300 px-3 py-1 rounded-full shadow-2xs">
                            <XCircle size={13} className="text-rose-600" /> FAIL
                          </span>
                        )}
                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                          Passing Mark: {passingMark}%
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span className={`font-black text-sm ${isPassed ? "text-emerald-700" : "text-rose-700"}`}>
                          {earnedScore}%
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {att.correctCount || 0}/{att.totalQuestions || 1} Correct
                        </p>
                      </div>

                      <div className="col-span-3 flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/leaderboard/${att.assessmentId}`)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trophy size={12} className="text-amber-600" /> Board
                        </button>
                        <button
                          onClick={() => navigate(`/take-assessment/${att.assessmentId}`)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw size={12} /> Retake
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyAssessments;
