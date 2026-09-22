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
  Bot,
  Brain,
  Sparkles,
  Zap,
  TrendingUp,
  GraduationCap,
  Calendar,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../../services/userService";
import { getMyCourses } from "../../services/enrollmentService";
import { getProgressDashboard } from "../../services/progressService";
import { getUserCertificates } from "../../services/certificateService";
import { getUserAttempts } from "../../services/assessmentService";
import LeetCodeStreakHeatmap from "../../components/profile/LeetCodeStreakHeatmap";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);

        if (userData?.id) {
          const [enrolled, progress, certs, attempts] = await Promise.allSettled([
            getMyCourses(userData.id),
            getProgressDashboard(userData.id),
            getUserCertificates(userData.id),
            getUserAttempts(userData.id),
          ]);

          if (enrolled.status === "fulfilled") setEnrollments(enrolled.value || []);

          const progressData = progress.status === "fulfilled" ? progress.value : {};
          const certsData = certs.status === "fulfilled" ? certs.value : [];
          const attemptsData = attempts.status === "fulfilled" ? attempts.value : [];

          setStats({
            enrolledCourses: enrolled.status === "fulfilled" ? (enrolled.value?.length || 0) : 0,
            completedCourses: progressData?.completedCourses || 0,
            inProgressCourses: progressData?.inProgressCourses || 0,
            certificates: certsData?.length || 0,
            assessmentsPassed: attemptsData?.filter((a) => a.passed)?.length || 0,
          });
        }
      } catch (e) {
        console.error("Dashboard error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
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
      desc: "Run autonomous agents & dynamic assessment generator",
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
      label: "AI Flashcard Decks",
      desc: "Spaced-repetition microservices recall cards",
      icon: Brain,
      path: "/flashcards",
      badge: "Active Recall",
    },
    {
      label: "Socratic Debate Arena",
      desc: "Test system failure architecture with AI critique",
      icon: GraduationCap,
      path: "/socratic-debate",
      badge: "Critical Thinking",
    },
  ];

  // 12-week simulated activity streak matrix
  const activityWeeks = Array.from({ length: 14 }, (_, wIdx) =>
    Array.from({ length: 7 }, (_, dIdx) => {
      const active = (wIdx * 7 + dIdx) % 3 === 0 || (wIdx * 7 + dIdx) % 5 === 0;
      const intensity = active ? ((wIdx + dIdx) % 3) + 1 : 0;
      return intensity;
    })
  );

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
              Welcome back, <span className="text-slate-900 font-semibold">{user?.fullName || "Student"}</span>. Track your progress, AI mentors, and curriculum here.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/agent-studio")}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Sparkles size={14} className="text-blue-600" />
              Agent Studio
            </button>
            <button
              onClick={() => navigate("/courses")}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
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

        {/* ── Innovative Feature Highlights: Agent & Knowledge Shortcuts ── */}
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
                  className="group text-left bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-blue-500/40 hover:shadow-sm transition-all relative"
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

        {/* ── LeetCode-style Learning Streak & 52-Week Activity Heatmap ── */}
        <LeetCodeStreakHeatmap user={user} enrollments={enrollments} />

        {/* ── Recent Course Progress Table / Grid ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Enrollments</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your currently enrolled training courses</p>
            </div>
            <button
              onClick={() => navigate("/my-learning")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
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
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
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
                  className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg hover:border-blue-500/50 cursor-pointer transition-colors group flex flex-col justify-between"
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