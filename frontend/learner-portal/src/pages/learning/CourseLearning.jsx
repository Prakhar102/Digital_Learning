import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  ArrowLeft,
  Bot,
  ShieldAlert,
  Volume2,
  Maximize,
  Sparkles,
  RotateCcw,
  FileText,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getCourseDetails, getCourseById } from "../../services/courseService";
import { getModulesByCourse } from "../../services/moduleService";
import { updateProgress, getProgress } from "../../services/progressService";
import { recordUserActivity } from "../../services/streakService";
import { getCurrentUser } from "../../services/userService";

function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);

  // ── Video Player & Anti-Skipping State ──
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);
  const [skipWarning, setSkipWarning] = useState(false);
  const [activeTab, setActiveTab] = useState("notes"); // 'notes' | 'summary' | 'ai-qa'

  useEffect(() => {
    loadClassroom();
  }, [courseId]);

  // Reset video state when active lesson changes
  useEffect(() => {
    if (activeLesson) {
      setCurrentTime(0);
      setMaxWatchedTime(0);
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [activeLesson?.id]);

  const loadClassroom = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      let courseData = null;
      let modulesList = [];

      try {
        courseData = await getCourseDetails(courseId);
        if (courseData?.modules) {
          modulesList = courseData.modules;
        }
      } catch (e) {
        courseData = await getCourseById(courseId);
        const mods = await getModulesByCourse(courseId);
        modulesList = Array.isArray(mods) ? mods : [];
      }

      setCourse(courseData);
      setModules(modulesList);

      if (modulesList.length > 0 && modulesList[0].lessons?.length > 0) {
        setActiveLesson(modulesList[0].lessons[0]);
      }

      if (user?.id) {
        try {
          const prog = await getProgress(user.id, courseId);
          if (prog?.completedLessonIds) {
            setCompletedLessons(new Set(prog.completedLessonIds));
          }
        } catch (e) {
          console.error("Progress fetch error:", e);
        }
      }
    } catch (err) {
      console.error("Classroom error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Anti-Skipping Video Time Update Handler ──
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    // Track highest legitimately watched point
    if (cur > maxWatchedTime) {
      setMaxWatchedTime(cur);
    }
  };

  // ── Anti-Skipping Seeking Interceptor ──
  const handleSeeking = () => {
    if (!videoRef.current) return;
    const requestedTime = videoRef.current.currentTime;

    // If user attempts to skip ahead past what they've watched + 1.5s grace period:
    if (requestedTime > maxWatchedTime + 1.5) {
      videoRef.current.currentTime = maxWatchedTime;
      setSkipWarning(true);
      setTimeout(() => setSkipWarning(false), 4000);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 180);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeekSlider = (e) => {
    const target = Number(e.target.value);
    if (!videoRef.current) return;

    if (target > maxWatchedTime + 1.5) {
      videoRef.current.currentTime = maxWatchedTime;
      setSkipWarning(true);
      setTimeout(() => setSkipWarning(false), 4000);
    } else {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleCompleteLesson = async () => {
    if (!currentUser?.id || !activeLesson) return;
    try {
      setSavingProgress(true);
      const nextCompleted = new Set(completedLessons);
      nextCompleted.add(activeLesson.id);
      setCompletedLessons(nextCompleted);

      await updateProgress({
        userId: currentUser.id,
        courseId: Number(courseId),
        lessonId: activeLesson.id,
        status: "COMPLETED",
      });
      recordUserActivity(currentUser.id, "LESSON_COMPLETED", {
        lessonId: activeLesson.id,
        courseId: Number(courseId),
      });
    } catch (err) {
      console.error("Progress save failed:", err);
    } finally {
      setSavingProgress(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const percentWatched = duration > 0 ? Math.min(100, Math.round((maxWatchedTime / duration) * 100)) : 0;
  const isLessonEligibleForCompletion = percentWatched >= 90 || completedLessons.has(activeLesson?.id);

  const videoSourceUrl = activeLesson?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4";
  const isYouTubeEmbed = videoSourceUrl.includes("youtube.com") || videoSourceUrl.includes("youtu.be");

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
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => navigate("/my-learning")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to My Learning
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-900">
              {course?.title || `Course #${courseId}`}
            </span>
            <button
              onClick={() => navigate("/ai-mentor")}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-blue-600 font-semibold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Bot size={13} className="text-blue-600" /> Ask AI Mentor
            </button>
          </div>
        </div>

        {/* ── Main Classroom Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left / Center 3 Cols: Custom In-App Video Player & Slide Notes */}
          <div className="lg:col-span-3 space-y-5">
            {activeLesson ? (
              <div className="space-y-4">
                {/* ── In-App Non-Skip Video Player Container ── */}
                <div className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-md border border-slate-800">
                  {/* Anti-Skipping Warning Toast */}
                  {skipWarning && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-900/90 backdrop-blur-md border border-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xl animate-bounce">
                      <ShieldAlert size={16} className="text-rose-300" />
                      Anti-Skipping Protection: Fast-forwarding past unwatched content is disabled.
                    </div>
                  )}

                  {isYouTubeEmbed ? (
                    <div className="aspect-video w-full bg-black flex items-center justify-center">
                      <iframe
                        src={videoSourceUrl.replace("watch?v=", "embed/")}
                        title={activeLesson.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video w-full bg-black">
                      <video
                        ref={videoRef}
                        src={videoSourceUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onSeeking={handleSeeking}
                        onLoadedMetadata={handleLoadedMetadata}
                        onClick={togglePlay}
                        className="w-full h-full object-contain cursor-pointer"
                      />

                      {/* Custom In-App Control Bar */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-2 z-20">
                        {/* Progress Slider with Anti-Skip Visual Lock */}
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeekSlider}
                            className="w-full h-1.5 bg-slate-700 accent-blue-500 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-white">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={togglePlay}
                              className="text-white hover:text-blue-400 transition-colors"
                            >
                              {isPlaying ? <PauseCircle size={22} /> : <PlayCircle size={22} />}
                            </button>
                            <span className="font-mono text-[11px] text-slate-300">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-300">
                            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20">
                              {percentWatched}% Watched
                            </span>
                            <span className="text-amber-400 flex items-center gap-1">
                              <Lock size={11} /> Anti-Skip Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Lesson Title Bar & Completion Status ── */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      Current Lesson Lecture
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1">
                      {activeLesson.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Watch at least 90% of the video to unlock completion credit.
                    </p>
                  </div>

                  <button
                    onClick={handleCompleteLesson}
                    disabled={savingProgress || (!isLessonEligibleForCompletion && !completedLessons.has(activeLesson.id))}
                    className={`px-5 py-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-2 shrink-0 transition-colors shadow-xs ${
                      completedLessons.has(activeLesson.id)
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : isLessonEligibleForCompletion
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    <CheckCircle size={14} />
                    {completedLessons.has(activeLesson.id)
                      ? "Lesson Completed"
                      : isLessonEligibleForCompletion
                      ? "Mark as Complete"
                      : `Watch Video to Unlock (${percentWatched}%)`}
                  </button>
                </div>

                {/* ── AI-Prepared Slide Notes & Key Takeaways Panel ── */}
                <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
                  <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
                    <button
                      onClick={() => setActiveTab("notes")}
                      className={`text-xs font-bold py-1 border-b-2 transition-all flex items-center gap-1.5 ${
                        activeTab === "notes"
                          ? "border-blue-600 text-blue-700"
                          : "border-transparent text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <FileText size={14} /> AI Slide Notes & Concepts
                    </button>
                    <button
                      onClick={() => setActiveTab("ai-qa")}
                      className={`text-xs font-bold py-1 border-b-2 transition-all flex items-center gap-1.5 ${
                        activeTab === "ai-qa"
                          ? "border-blue-600 text-blue-700"
                          : "border-transparent text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Sparkles size={14} /> Ask AI Tutor on this Lecture
                    </button>
                  </div>

                  <div className="p-6">
                    {activeTab === "notes" ? (
                      <div className="space-y-4 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                        {activeLesson.content ||
                          "## 📑 AI-Prepared Slide Notes & Key Concepts\n\n- In-depth architectural walk-through of the current lecture.\n- Key takeaways and best practices are extracted automatically from the lecture video.\n- Review slide bullet points and complete hands-on lab exercises."}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-600">
                          Have questions about this video or slide notes? Ask your AI Mentor with grounded context:
                        </p>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">
                            "Summarize the key architectural decisions in {activeLesson.title}"
                          </span>
                          <button
                            onClick={() =>
                              navigate(`/ai-mentor?query=${encodeURIComponent(`Explain key concepts in ${activeLesson.title}`)}`)
                            }
                            className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 shadow-xs flex items-center gap-1"
                          >
                            <Bot size={13} /> Ask Question
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Select a lesson to begin learning</p>
              </div>
            )}
          </div>

          {/* Right 1 Col: Course Outline Playlist */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Curriculum Outline
            </h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {modules.map((mod, mIdx) => (
                <div key={mod.id || mIdx} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider px-1">
                    Chapter {mIdx + 1}: {mod.title}
                  </div>
                  {mod.lessons?.map((lesson) => {
                    const isSelected = activeLesson?.id === lesson.id;
                    const isDone = completedLessons.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full text-left p-3 rounded-lg text-xs flex items-center justify-between gap-2 transition-all ${
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isDone ? (
                            <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                          ) : (
                            <PlayCircle size={14} className="text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {lesson.durationInMinutes || 15}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CourseLearning;
