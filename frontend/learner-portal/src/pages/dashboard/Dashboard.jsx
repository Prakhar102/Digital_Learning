import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Trophy,
  Clock,
  ChevronRight,
  Play,
  Award,
  Target,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Lock,
  Flame,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../../services/userService";
import { getMyCourses } from "../../services/enrollmentService";
import { getProgressDashboard, getStoredProgressMap } from "../../services/progressService";
import { getUserCertificates } from "../../services/certificateService";
import { getUserAttempts, getGlobalDynamicLeaderboard, getStoredAssessments } from "../../services/assessmentService";
import { getAllCourses, getTopViewedCourses } from "../../services/courseService";
import LeetCodeStreakHeatmap from "../../components/profile/LeetCodeStreakHeatmap";
import UdemyCourseCard from "../../components/course/UdemyCourseCard";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    certificates: 0,
    assessmentsPassed: 0,
  });
  const [enrollments, setEnrollments] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [scheduledAssessments, setScheduledAssessments] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);

        const [enrolled, progress, certs, attempts, allC] = await Promise.allSettled([
          userData?.id ? getMyCourses(userData.id) : Promise.resolve([]),
          userData?.id ? getProgressDashboard(userData.id) : Promise.resolve({}),
          userData?.id ? getUserCertificates(userData.id) : Promise.resolve([]),
          userData?.id ? getUserAttempts(userData.id) : Promise.resolve([]),
          getAllCourses(),
        ]);

        const enrolledList = enrolled.status === "fulfilled" && Array.isArray(enrolled.value) ? enrolled.value : [];
        setEnrollments(enrolledList);

        const certsData = certs.status === "fulfilled" && Array.isArray(certs.value) ? certs.value : [];
        const attemptsData = attempts.status === "fulfilled" && Array.isArray(attempts.value) ? attempts.value : [];
        const coursesList = allC.status === "fulfilled" && Array.isArray(allC.value) ? allC.value : [];

        // Accurate course completion evaluation matching MyLearning logic
        const courseMap = new Map((coursesList || []).map((c) => [String(c.id), c]));
        const certCourseIds = new Set((certsData || []).map((c) => String(c.courseId)));
        const progressMap = getStoredProgressMap();

        let completedCoursesCount = 0;
        let inProgressCoursesCount = 0;

        enrolledList.forEach((item) => {
          const courseDetail = courseMap.get(String(item.courseId)) || {};
          const hasCert = certCourseIds.has(String(item.courseId));
          const progKey = `u_${userData?.id}_c_${item.courseId}`;
          const prog = progressMap[progKey] || {};

          const totalLessons = (courseDetail.modules || []).flatMap((m) => m.lessons || []).length;
          const completedLessonCount = (prog.completedLessonIds || []).length;

          const isCompleted =
            item.status === "COMPLETED" ||
            Number(item.progress) >= 100 ||
            hasCert ||
            (totalLessons > 0 && completedLessonCount >= totalLessons);

          if (isCompleted) {
            completedCoursesCount++;
          } else {
            inProgressCoursesCount++;
          }
        });

        const finalCompletedCourses = Math.max(completedCoursesCount, certsData.length);
        const finalInProgressCourses = Math.max(0, enrolledList.length - finalCompletedCourses);

        // Accurate passed assessments evaluation
        const passedAttempts = (attemptsData || []).filter((a) => {
          if (a.passed === true) return true;
          if (a.passed === false) return false;
          const score = Number(a.percentage !== undefined ? a.percentage : a.score || 0);
          const passingScore = Number(a.passingScore || 60);
          return score >= passingScore;
        });
        const uniquePassedAssessments = new Set(passedAttempts.map((a) => String(a.assessmentId || a.id)));
        const finalAssessmentsPassed = uniquePassedAssessments.size;

        setStats({
          enrolledCourses: enrolledList.length,
          completedCourses: finalCompletedCourses,
          inProgressCourses: finalInProgressCourses,
          certificates: certsData.length,
          assessmentsPassed: finalAssessmentsPassed,
        });

        // Dynamic Global Leaderboard
        setLeaderboard(getGlobalDynamicLeaderboard().slice(0, 5));

        // Dynamic Scheduled Assessments
        const allSched = getStoredAssessments();
        const enrolledCourseIds = new Set(enrolledList.map((e) => Number(e.courseId)));
        const relevantAssessments = allSched.filter(
          (a) => enrolledCourseIds.has(Number(a.courseId)) || enrolledCourseIds.size === 0
        );
        setScheduledAssessments(relevantAssessments.slice(0, 4));

        // Dynamic Top Viewed Courses
        setTopCourses(getTopViewedCourses(coursesList).slice(0, 4));
      } catch (e) {
        console.error("Dashboard error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
    const handleStorage = () => load();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const statCards = [
    { label: "Enrolled Courses", value: stats.enrolledCourses, icon: BookOpen, subtext: "Active tracks" },
    { label: "In Progress", value: stats.inProgressCourses, icon: Clock, subtext: "Ongoing modules" },
    { label: "Completed", value: stats.completedCourses, icon: Trophy, subtext: "100% finished" },
    { label: "Certifications", value: stats.certificates, icon: Award, subtext: "Verified credentials" },
    { label: "Passed Assessments", value: stats.assessmentsPassed, icon: Target, subtext: "Evaluations cleared" },
  ];

  const quickActions = [
    {
      label: "Agent Studio & Tools",
      desc: "Autonomous AI mentor & multi-agent reasoning traces",
      icon: Sparkles,
      path: "/agent-studio",
      badge: "Phase 3 Tooling",
    },
    {
      label: "RAG Knowledge Hub",
      desc: "Search lecture transcripts & SFIA competency matrix",
      icon: BookOpen,
      path: "/knowledge-hub",
      badge: "Phase 2 RAG",
    },
    {
      label: "Cohort Leaderboard",
      desc: "Live platform rankings and assessment standings",
      icon: Trophy,
      path: "/leaderboard",
      badge: "Dynamic Rankings",
    },
    {
      label: "Scheduled Assessments",
      desc: "Timed instructor quizzes & locked exam checkpoints",
      icon: Clock,
      path: "/my-assessments",
      badge: "Live Tests",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* ── Header / Overview Banner ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Learner Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Welcome back, <span className="text-slate-900 font-semibold">{user?.fullName || "Student"}</span>. Track your authentic streak, upcoming scheduled exams, and cohort leaderboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/leaderboard")}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Trophy size={14} className="text-amber-500" />
              Leaderboard
            </button>
            <button
              onClick={() => navigate("/courses")}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <BookOpen size={14} />
              Browse Catalog
            </button>
          </div>
        </div>

        {/* ── Key Metrics Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  {card.subtext}
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Innovative Feature Highlights ── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            AI Mentoring & Study Ecosystem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="group text-left bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-blue-500/40 hover:shadow-sm transition-all relative cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon size={18} />
                    </div>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase">
                      {action.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    {action.label}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {action.desc}
                  </p>
                  <ArrowUpRight
                    size={14}
                    className="absolute top-5 right-5 text-slate-400 group-hover:text-blue-600 transition-colors"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Dynamic Streak & Activity Heatmap ── */}
        <LeetCodeStreakHeatmap user={user} enrollments={enrollments} />

        {/* ── Scheduled Assessments & Dynamic Leaderboard Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scheduled Assessments Column */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={18} className="text-indigo-600" />
                  Scheduled Assessments & Quizzes
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Instructor-created exams. Assessments remain locked until the scheduled start time.
                </p>
              </div>
              <button
                onClick={() => navigate("/my-assessments")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>

            {scheduledAssessments.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Clock size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-700">No scheduled assessments right now</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When your instructors schedule an MCQ or descriptive exam, it will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {scheduledAssessments.map((item) => {
                  const isLocked = new Date() < new Date(item.scheduledAt);
                  return (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/take-assessment/${item.id}`)}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-indigo-500/50 cursor-pointer transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                            {item.type || "MCQ"}
                          </span>
                          {isLocked ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Lock size={10} /> Locked
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              Active Now
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          {item.courseTitle || `Course #${item.courseId}`}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(item.scheduledAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="font-bold text-indigo-600 flex items-center gap-0.5">
                          {item.durationMinutes} mins
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic Cohort Leaderboard Widget */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500" />
                  Live Leaderboard
                </h2>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Full Table &rarr;
                </button>
              </div>

              <div className="divide-y divide-slate-100 mt-3">
                {leaderboard.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No scores submitted yet. Take tests to climb the leaderboard!
                  </div>
                ) : (
                  leaderboard.map((row, idx) => (
                    <div key={row.learnerId || idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-6 w-6 rounded-md flex items-center justify-center font-black text-[11px] ${
                          idx === 0 ? "bg-amber-100 text-amber-800" :
                          idx === 1 ? "bg-slate-200 text-slate-800" :
                          idx === 2 ? "bg-amber-900/15 text-amber-900" : "bg-slate-100 text-slate-600"
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 truncate max-w-[130px]">
                            {row.learnerName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {row.attemptsCount} tests completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-600 text-xs">
                          {row.totalScore} pts
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-600 shrink-0" />
              <span>Rankings dynamically update upon every assessment and assignment submission.</span>
            </div>
          </div>
        </div>

        {/* ── Top Viewed Courses Section (Dynamic views, No price badges) ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame size={18} className="text-amber-500 fill-amber-500" />
                Most Popular & Top Viewed Courses
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamically ranked by real learner views and enrollment engagement.
              </p>
            </div>
            <button
              onClick={() => navigate("/courses")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              Explore all <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topCourses.map((course) => (
              <UdemyCourseCard
                key={course.id}
                course={course}
                isTopViewed={true}
                isEnrolled={enrollments.some((e) => Number(e.courseId) === Number(course.id))}
              />
            ))}
          </div>
        </div>

        {/* ── Active Enrollments ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Enrollments</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your currently enrolled training courses</p>
            </div>
            <button
              onClick={() => navigate("/my-learning")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          {enrollments.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-lg">
              <BookOpen size={32} className="mx-auto text-slate-400 mb-3" />
              <p className="text-sm text-slate-700 font-semibold">No active course enrollments</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore the course catalog to enroll in certification programs and technical tracks.
              </p>
              <button
                onClick={() => navigate("/courses")}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/learn/${item.courseId}`)}
                  className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl hover:border-blue-500/50 cursor-pointer transition-colors group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <BookOpen size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          Course #{item.courseId}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Enrolled on {new Date(item.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
                    <span className="text-slate-500 font-medium">In Progress</span>
                    <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Resume <Play size={10} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;