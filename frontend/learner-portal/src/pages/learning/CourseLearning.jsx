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
  Sparkles,
  FileText,
  Lock,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronRight,
  Clock,
  Unlock,
  AlertCircle,
  Award,
  Trophy,
  Download,
  CheckCircle2,
  X,
  Printer,
  Star,
  MessageSquare,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  getCourseDetails,
  getCourseById,
  submitCourseReview,
  getUserCourseReview,
  getCourseRatingData,
} from "../../services/courseService";
import { getModulesByCourse } from "../../services/moduleService";
import { updateProgress, getProgress } from "../../services/progressService";
import { recordUserActivity } from "../../services/streakService";
import { getCurrentUser } from "../../services/userService";
import { claimCourseCertificate, getCertificateById } from "../../services/certificateService";
import { updateEnrollmentProgress } from "../../services/enrollmentService";
import { notifyInstructor } from "../../services/notificationService";
import confetti from "canvas-confetti";

// ── Flower & Confetti Celebration Burst Animation ──
const triggerCelebrationBlast = () => {
  try {
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 70, zIndex: 9999 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    // 1. Initial Mega Center Firework
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#8b5cf6", "#eab308"],
    });

    // 2. Continuous celebratory floral side bursts
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left blast
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#22c55e", "#eab308", "#3b82f6", "#a855f7", "#f43f5e"],
      });

      // Right blast
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#fbbf24", "#06b6d4", "#ec4899", "#10b981", "#6366f1"],
      });
    }, 250);
  } catch (err) {
    console.warn("Confetti blast effect error:", err);
  }
};

// ── Robust YouTube & Video Embed URL Resolver ──
function formatVideoUrl(url) {
  if (!url || typeof url !== "string") {
    return { isYouTube: false, embedUrl: "https://www.w3schools.com/html/mov_bbb.mp4", rawUrl: "", videoId: null };
  }

  const trimmed = url.trim();

  // 1. youtu.be/VIDEO_ID
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch && youtuBeMatch[1]) {
    return {
      isYouTube: true,
      embedUrl: `https://www.youtube.com/embed/${youtuBeMatch[1]}?enablejsapi=1&rel=0&modestbranding=1&origin=${window.location.origin}`,
      rawUrl: trimmed,
      videoId: youtuBeMatch[1],
    };
  }

  // 2. youtube.com/watch?v=VIDEO_ID
  const youtubeWatchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (youtubeWatchMatch && youtubeWatchMatch[1]) {
    return {
      isYouTube: true,
      embedUrl: `https://www.youtube.com/embed/${youtubeWatchMatch[1]}?enablejsapi=1&rel=0&modestbranding=1&origin=${window.location.origin}`,
      rawUrl: trimmed,
      videoId: youtubeWatchMatch[1],
    };
  }

  // 3. youtube.com/embed/VIDEO_ID
  const youtubeEmbedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (youtubeEmbedMatch && youtubeEmbedMatch[1]) {
    return {
      isYouTube: true,
      embedUrl: `https://www.youtube.com/embed/${youtubeEmbedMatch[1]}?enablejsapi=1&rel=0&modestbranding=1&origin=${window.location.origin}`,
      rawUrl: trimmed,
      videoId: youtubeEmbedMatch[1],
    };
  }

  // 4. youtube.com/shorts/VIDEO_ID
  const youtubeShortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (youtubeShortsMatch && youtubeShortsMatch[1]) {
    return {
      isYouTube: true,
      embedUrl: `https://www.youtube.com/embed/${youtubeShortsMatch[1]}?enablejsapi=1&rel=0&modestbranding=1&origin=${window.location.origin}`,
      rawUrl: trimmed,
      videoId: youtubeShortsMatch[1],
    };
  }

  // 5. Direct MP4/HTML5 video
  return {
    isYouTube: false,
    embedUrl: trimmed,
    rawUrl: trimmed,
    videoId: null,
  };
}

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
  const [expandedModules, setExpandedModules] = useState({});
  const [unlockedCertificate, setUnlockedCertificate] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // ── 5-Star Feedback & Course Rating State ──
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmittedSuccess, setFeedbackSubmittedSuccess] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [courseRatingStats, setCourseRatingStats] = useState({ rating: 5.0, count: 0 });

  // ── Video Player State & Watched Tracking ──
  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const ytIntervalRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);
  const [skipWarning, setSkipWarning] = useState(false);
  const [activeTab, setActiveTab] = useState("notes"); // 'notes' | 'ai-qa'
  const [watchRequirementError, setWatchRequirementError] = useState(false);

  // Load YouTube IFrame API script once if not present
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    loadClassroom();
  }, [courseId]);

  // Reset video state & initialize YouTube listener when active lesson changes
  useEffect(() => {
    if (activeLesson) {
      setCurrentTime(0);
      setMaxWatchedTime(0);
      setDuration(0);
      setIsPlaying(false);
      setWatchRequirementError(false);

      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }

      // Cleanup existing YT interval
      if (ytIntervalRef.current) {
        clearInterval(ytIntervalRef.current);
      }

      const videoObj = formatVideoUrl(activeLesson.videoUrl || activeLesson.contentRef);
      if (videoObj.isYouTube && videoObj.videoId) {
        const initYT = () => {
          if (window.YT && window.YT.Player) {
            try {
              ytPlayerRef.current = new window.YT.Player(`yt-player-${activeLesson.id}`, {
                events: {
                  onStateChange: (event) => {
                    // YT.PlayerState.PLAYING === 1
                    if (event.data === 1) {
                      setIsPlaying(true);
                      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
                      ytIntervalRef.current = setInterval(() => {
                        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
                          const cur = ytPlayerRef.current.getCurrentTime() || 0;
                          const dur = ytPlayerRef.current.getDuration() || 0;
                          setCurrentTime(cur);
                          if (dur > 0) setDuration(dur);
                          setMaxWatchedTime((prev) => Math.max(prev, cur));
                        }
                      }, 1000);
                    } else {
                      setIsPlaying(false);
                      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
                    }
                    // YT.PlayerState.ENDED === 0
                    if (event.data === 0) {
                      if (ytPlayerRef.current && typeof ytPlayerRef.current.getDuration === "function") {
                        const dur = ytPlayerRef.current.getDuration() || 100;
                        setMaxWatchedTime(dur);
                        setCurrentTime(dur);
                      }
                    }
                  },
                },
              });
            } catch (err) {
              console.warn("YouTube iframe API binding fallback:", err);
            }
          }
        };

        const timer = setTimeout(initYT, 1200);
        return () => {
          clearTimeout(timer);
          if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
        };
      }
    }
  }, [activeLesson?.id]);

  async function loadClassroom() {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      setCurrentUser(user);

      let courseData = null;
      let modulesList = [];

      try {
        courseData = await getCourseDetails(courseId);
        if (courseData?.modules && courseData.modules.length > 0) {
          modulesList = courseData.modules;
        } else {
          const mods = await getModulesByCourse(courseId);
          modulesList = Array.isArray(mods) ? mods : [];
        }
      } catch (e) {
        courseData = await getCourseById(courseId);
        const mods = await getModulesByCourse(courseId);
        modulesList = Array.isArray(mods) ? mods : [];
      }

      setCourse(courseData);
      setModules(modulesList);

      // Expand all modules by default
      const exp = {};
      modulesList.forEach((m, idx) => {
        exp[m.id || idx] = true;
      });
      setExpandedModules(exp);

      // Select first available lesson across modules
      if (modulesList.length > 0) {
        let firstLesson = null;
        for (const mod of modulesList) {
          if (mod.lessons && mod.lessons.length > 0) {
            firstLesson = mod.lessons[0];
            break;
          }
        }
        if (firstLesson) {
          setActiveLesson(firstLesson);
        }
      }

      if (user?.id) {
        try {
          const prog = await getProgress(user.id, courseId);
          if (prog?.completedLessonIds) {
            const completedSet = new Set(prog.completedLessonIds);
            setCompletedLessons(completedSet);

            // Check if 100% completed already
            checkAndAwardCertificate(modulesList, completedSet, user, courseData);
          }
        } catch (e) {
          console.error("Progress fetch error:", e);
        }

        // Fetch existing review & course rating stats
        try {
          const rev = getUserCourseReview(courseId, user.id);
          if (rev) {
            setExistingReview(rev);
            setSelectedRating(rev.rating || 5);
            setFeedbackComment(rev.comment || "");
          }
        } catch (e) {}
      }

      try {
        const stats = getCourseRatingData(courseId);
        setCourseRatingStats(stats);
      } catch (e) {}
    } catch (err) {
      console.error("Classroom load error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ── Sync course reviews on storage events ──
  useEffect(() => {
    const handleStorage = () => {
      if (courseId) {
        const stats = getCourseRatingData(courseId);
        setCourseRatingStats(stats);
        if (currentUser?.id) {
          const rev = getUserCourseReview(courseId, currentUser.id);
          if (rev) {
            setExistingReview(rev);
          }
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [courseId, currentUser?.id]);

  // ── 5-Star Feedback Submission Handler ──
  const handleSubmitFeedback = async (e) => {
    if (e) e.preventDefault();
    if (!courseId) return;

    try {
      setSubmittingFeedback(true);
      const user = currentUser || (await getCurrentUser());
      const result = submitCourseReview(courseId, {
        userId: user?.id || "usr_student",
        userName: user?.fullName || "Student Learner",
        userEmail: user?.email || "",
        rating: selectedRating,
        comment: feedbackComment,
        courseTitle: course?.title || "Course Track",
      });

      if (result) {
        setExistingReview(result.userReview);
        setCourseRatingStats({ rating: result.rating, count: result.count });
        setFeedbackSubmittedSuccess(true);

        // Notify course instructor in real-time
        try {
          const instructorId = course?.ownerUserId || course?.instructorId || 3;
          await notifyInstructor({
            instructorId,
            subject: `New Course Rating (${selectedRating} ★) for ${course?.title || "Course"}`,
            message: `${user?.fullName || "A learner"} submitted a ${selectedRating}-star rating for course "${course?.title || "your course"}": "${feedbackComment ? feedbackComment : "Great course content!"}"`,
          });
        } catch (notifErr) {
          console.warn("Could not notify instructor of review:", notifErr);
        }

        setTimeout(() => {
          setShowFeedbackModal(false);
          setFeedbackSubmittedSuccess(false);
        }, 1800);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // ── Certificate Verification Check ──
  const checkAndAwardCertificate = async (mods, completedSet, user, courseObj, triggerCelebration = false) => {
    if (!user?.id || !mods || mods.length === 0) return;
    const allLessonIds = mods.flatMap((m) => m.lessons || []).map((l) => l.id);
    if (allLessonIds.length === 0) return;

    const allFinished = allLessonIds.every((id) => completedSet.has(id));
    if (allFinished) {
      try {
        const cert = await claimCourseCertificate({
          userId: user.id,
          userName: user.fullName || "Student Scholar",
          courseId: Number(courseId),
          courseTitle: courseObj?.title || `Course #${courseId}`,
          grade: "Passed with Distinction (100% Completed)",
        });
        if (cert) {
          setUnlockedCertificate(cert);
        }

        // Persist completion state in realtime enrollment registry
        updateEnrollmentProgress(user.id, courseId, {
          status: "COMPLETED",
          progress: 100,
          isCompleted: true,
          courseTitle: courseObj?.title || `Course #${courseId}`,
        });

        if (triggerCelebration) {
          triggerCelebrationBlast();
          setShowCertificateModal(true);
        }
      } catch (err) {
        console.warn("Could not claim certificate:", err);
      }
    }
  };

  // ── Anti-Skipping Video Time Update Handler for HTML5 ──
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    if (cur > maxWatchedTime) {
      setMaxWatchedTime(cur);
    }
  };

  const handleSeeking = () => {
    if (!videoRef.current) return;
    const requestedTime = videoRef.current.currentTime;

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

  // ── Completion Calculation ──
  const percentWatched = duration > 0
    ? Math.min(100, Math.round((maxWatchedTime / duration) * 100))
    : (maxWatchedTime > 0 ? Math.min(100, Math.round(maxWatchedTime * 3)) : 0);

  const isAlreadyCompleted = activeLesson && completedLessons.has(activeLesson.id);
  const isWatchRequirementMet = percentWatched >= 80 || isAlreadyCompleted;

  // ── Total Course Progress Calculation ──
  const totalLessonsInCourse = modules.flatMap((m) => m.lessons || []).length;
  const completedLessonsInCourse = modules.flatMap((m) => m.lessons || []).filter((l) => completedLessons.has(l.id)).length;
  const courseCompletionPercentage = totalLessonsInCourse > 0
    ? Math.round((completedLessonsInCourse / totalLessonsInCourse) * 100)
    : 0;
  const isCourseFullyCompleted = totalLessonsInCourse > 0 && completedLessonsInCourse >= totalLessonsInCourse;

  const handleCompleteLesson = async () => {
    if (!currentUser?.id || !activeLesson) return;

    if (!isWatchRequirementMet) {
      setWatchRequirementError(true);
      setTimeout(() => setWatchRequirementError(false), 5000);
      return;
    }

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

      // Check if this lesson completed the entire course 100%
      const allLessonIds = modules.flatMap((m) => m.lessons || []).map((l) => l.id);
      const isNow100Percent = allLessonIds.length > 0 && allLessonIds.every((id) => nextCompleted.has(id));

      await checkAndAwardCertificate(modules, nextCompleted, currentUser, course, isNow100Percent);

      // Auto-suggest next lesson if not completed yet
      if (!isNow100Percent) {
        findAndSuggestNextLesson();
      }
    } catch (err) {
      console.error("Progress save failed:", err);
    } finally {
      setSavingProgress(false);
    }
  };

  const findAndSuggestNextLesson = () => {
    if (!activeLesson) return;
    let foundCurrent = false;
    for (const mod of modules) {
      for (const les of mod.lessons || []) {
        if (foundCurrent) {
          setActiveLesson(les);
          return;
        }
        if (les.id === activeLesson.id) {
          foundCurrent = true;
        }
      }
    }
  };

  const toggleModuleAccordion = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const videoObj = formatVideoUrl(activeLesson?.videoUrl || activeLesson?.contentRef);

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
        {/* ── Top Bar with Live Course Progress & Certificate Unlock ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <button
            onClick={() => navigate("/my-learning")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to My Learning
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Live Progress Pill */}
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium">Syllabus:</span>
              <span className="font-bold text-slate-900">
                {completedLessonsInCourse}/{totalLessonsInCourse} Lessons ({courseCompletionPercentage}%)
              </span>
            </div>

            {/* Unlocked Certificate & Feedback Actions */}
            {isCourseFullyCompleted && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 animate-pulse cursor-pointer"
                >
                  <Trophy size={14} className="text-amber-200" />
                  Certificate Unlocked
                </button>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Star size={14} className="text-amber-300 fill-amber-300" />
                  {existingReview ? "Edit Feedback" : "Give Feedback"}
                </button>
              </div>
            )}

            <button
              onClick={() => navigate("/ai-mentor")}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 hover:text-blue-600 font-semibold inline-flex items-center gap-1.5 shadow-xs"
            >
              <Bot size={13} className="text-blue-600" /> Ask AI Mentor
            </button>
          </div>
        </div>

        {/* ── 100% Course Completion Celebration Banner on Screen ── */}
        {isCourseFullyCompleted && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
                <Trophy size={32} className="text-amber-200" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 border border-white/30 text-amber-100">
                  100% Curriculum Mastered
                </span>
                <h2 className="text-lg font-bold mt-1">
                  Congratulations! You've Completed {course?.title || "the Course"}!
                </h2>
                <p className="text-xs text-amber-100 mt-0.5">
                  Your official certificate is unlocked. You can also rate this course & instructor below.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="px-4 py-2.5 bg-indigo-950/40 hover:bg-indigo-950/60 border border-white/30 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
              >
                <Star size={15} className="text-amber-300 fill-amber-300" />
                {existingReview ? "Edit Rating & Review" : "Give Feedback"}
              </button>
              <button
                onClick={() => setShowCertificateModal(true)}
                className="px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Award size={15} className="text-amber-600" /> View & Download Certificate
              </button>
            </div>
          </div>
        )}

        {/* ── Main Classroom Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left / Center 3 Cols: Video Player & Slide Notes */}
          <div className="lg:col-span-3 space-y-5">
            {activeLesson ? (
              <div className="space-y-4">
                {/* ── In-App Video Player Container ── */}
                <div className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-md border border-slate-800">
                  {/* Anti-Skipping Warning Toast */}
                  {skipWarning && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-900/90 backdrop-blur-md border border-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xl animate-bounce">
                      <ShieldAlert size={16} className="text-rose-300" />
                      Anti-Skipping Protection: Fast-forwarding past unwatched content is disabled.
                    </div>
                  )}

                  {videoObj.isYouTube ? (
                    <div className="aspect-video w-full bg-black flex flex-col items-center justify-center relative">
                      <iframe
                        id={`yt-player-${activeLesson.id}`}
                        src={videoObj.embedUrl}
                        title={activeLesson.title || "Lesson Video"}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video w-full bg-black">
                      <video
                        ref={videoRef}
                        src={videoObj.embedUrl}
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

                {/* ── Watch Progress Bar & Requirement Notification ── */}
                {!isAlreadyCompleted && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isWatchRequirementMet ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {isWatchRequirementMet ? <Unlock size={13} /> : <Lock size={13} />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {isWatchRequirementMet
                            ? "Completion Unlocked! You have met the 80% lecture viewing requirement."
                            : `Watch at least 80% of the video to unlock completion (${percentWatched}% / 80%).`}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-36 bg-slate-200 h-2 rounded-full overflow-hidden shrink-0">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isWatchRequirementMet ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${Math.min(100, (percentWatched / 80) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {watchRequirementError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2 animate-shake">
                    <AlertCircle size={15} className="text-rose-600 shrink-0" />
                    <span>Please watch at least 80% of this lecture video before marking it as complete.</span>
                  </div>
                )}

                {/* ── Lesson Title Bar & Action Controls ── */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        Current Lesson Lecture
                      </span>
                      {activeLesson.durationInMinutes && (
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <Clock size={11} /> {activeLesson.durationInMinutes} mins
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-1">
                      {activeLesson.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review slide notes, complete lab assignments, and verify lesson learning outcomes.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {isCourseFullyCompleted && (
                      <button
                        onClick={() => setShowFeedbackModal(true)}
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Star size={13} className="text-amber-500 fill-amber-500" />
                        {existingReview ? "Edit Rating" : "Give Feedback"}
                      </button>
                    )}

                    {videoObj.rawUrl && (
                      <a
                        href={videoObj.rawUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <ExternalLink size={13} /> Open Video Link
                      </a>
                    )}

                    <button
                      onClick={handleCompleteLesson}
                      disabled={savingProgress || (!isWatchRequirementMet && !isAlreadyCompleted)}
                      title={!isWatchRequirementMet && !isAlreadyCompleted ? "Watch at least 80% of the video to unlock completion" : ""}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-2 shrink-0 transition-colors shadow-xs ${
                        isAlreadyCompleted
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isWatchRequirementMet
                          ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                          : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-80"
                      }`}
                    >
                      {isAlreadyCompleted ? (
                        <>
                          <CheckCircle size={14} className="text-emerald-600" />
                          Lesson Completed
                        </>
                      ) : isWatchRequirementMet ? (
                        <>
                          <CheckCircle size={14} />
                          Mark as Complete
                        </>
                      ) : (
                        <>
                          <Lock size={13} />
                          Locked ({percentWatched}% Watched)
                        </>
                      )}
                    </button>
                  </div>
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
                          "## AI-Prepared Slide Notes & Key Concepts\n\n- In-depth architectural walk-through of the current lecture.\n- Key takeaways and best practices are extracted automatically from the lecture video.\n- Review slide bullet points and complete hands-on lab exercises."}
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

          {/* Right 1 Col: Course Outline Playlist with Accordion */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers size={14} className="text-blue-600" />
                Curriculum Outline
              </h3>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {modules.length} {modules.length === 1 ? "Module" : "Modules"}
              </span>
            </div>

            {modules.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg">
                <BookOpen size={24} className="mx-auto text-slate-300 mb-1" />
                <p className="text-xs text-slate-500">No modules available yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                {modules.map((mod, mIdx) => {
                  const isExpanded = expandedModules[mod.id || mIdx] !== false;
                  const lessons = mod.lessons || [];

                  return (
                    <div
                      key={mod.id || mIdx}
                      className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-2xs"
                    >
                      {/* Module Header / Accordion Toggle */}
                      <button
                        onClick={() => toggleModuleAccordion(mod.id || mIdx)}
                        className="w-full text-left px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between gap-2 transition-colors border-b border-slate-100"
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                            Module {mod.sequenceNumber || mIdx + 1}
                          </p>
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {mod.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                          <span className="text-[10px] font-semibold text-slate-500">
                            {lessons.length}
                          </span>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                      </button>

                      {/* Lessons List */}
                      {isExpanded && (
                        <div className="divide-y divide-slate-100">
                          {lessons.length === 0 ? (
                            <p className="text-[11px] text-slate-400 p-3 italic text-center">
                              No lessons added in this module.
                            </p>
                          ) : (
                            lessons.map((lesson) => {
                              const isSelected = activeLesson?.id === lesson.id;
                              const isDone = completedLessons.has(lesson.id);

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => setActiveLesson(lesson)}
                                  className={`w-full text-left p-3 text-xs flex items-center justify-between gap-2 transition-all ${
                                    isSelected
                                      ? "bg-blue-50/80 text-blue-700 font-bold border-l-4 border-blue-600"
                                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/60"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    {isDone ? (
                                      <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                                    ) : (
                                      <PlayCircle size={14} className={isSelected ? "text-blue-600 shrink-0" : "text-slate-400 shrink-0"} />
                                    )}
                                    <span className="truncate">{lesson.title}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                    {lesson.durationInMinutes || 15}m
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Certificate Preview & Download Modal ── */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Trophy size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Official Certificate of Completion</h3>
                  <p className="text-[11px] text-slate-500">Accredited Academic Certification Credential</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  onClick={() => {
                    setShowCertificateModal(false);
                    navigate(`/certificates/${unlockedCertificate?.id || `CERT-DLM-${courseId}`}`);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download size={13} /> Full Certificate Page
                </button>
                <button
                  onClick={() => setShowCertificateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Certificate Preview Frame */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
              <div className="bg-white border-8 border-double border-slate-200 rounded-2xl p-10 text-center space-y-6 shadow-md bg-radial from-amber-50/40 via-white to-white">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                    <Award size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs font-bold tracking-widest text-slate-900 uppercase">
                      Digital Learning Management System
                    </h4>
                    <p className="text-[9px] text-slate-500 tracking-wider uppercase font-semibold">
                      Accredited Professional Certification Board
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500 uppercase tracking-[3px] font-bold">
                    Certificate of Excellence
                  </p>
                  <p className="text-xs text-slate-400">This is to proudly certify that</p>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
                    {currentUser?.fullName || "Distinguished Scholar"}
                  </h1>
                  <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                    has successfully fulfilled 100% of curriculum modules, completed all video lectures, and demonstrated proficient mastery in
                  </p>
                  <h3 className="text-xl font-bold text-amber-600">
                    {course?.title || "Python"}
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} /> Passed with Distinction (100% Completed)
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 items-end text-center">
                  <div>
                    <p className="text-xs font-serif italic text-slate-700 font-bold">Prakhar Parth</p>
                    <div className="h-0.5 w-24 bg-slate-300 mx-auto my-1" />
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Lead Instructor</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full border-2 border-dashed border-amber-500 flex items-center justify-center text-amber-600">
                      <Award size={24} />
                    </div>
                    <p className="text-[8px] font-mono text-slate-400 mt-1 uppercase">
                      UID: {unlockedCertificate?.id || `CERT-DLM-${courseId}`}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-serif italic text-slate-700 font-bold">Academic Board</p>
                    <div className="h-0.5 w-24 bg-slate-300 mx-auto my-1" />
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Program Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Give Feedback & 5-Star Rating Modal ── */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                  <Star size={20} className="fill-amber-400 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Course Feedback & Rating</h3>
                  <p className="text-xs text-slate-500">{course?.title || "Curriculum Track"}</p>
                </div>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitFeedback} className="p-6 space-y-6">
              {feedbackSubmittedSuccess ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in zoom-in-95 duration-200">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-900">Feedback Submitted Successfully!</h4>
                  <p className="text-xs text-emerald-700">
                    Your {selectedRating}-star rating and comments have been recorded. Platform averages and instructor metrics are now updated in real-time.
                  </p>
                </div>
              ) : (
                <>
                  {/* Star Rating Section */}
                  <div className="text-center space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Rate Your Learning Experience
                    </label>
                    <div className="flex items-center justify-center gap-2 py-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = (hoverRating || selectedRating) >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setSelectedRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1.5 transition-transform hover:scale-125 cursor-pointer focus:outline-hidden"
                          >
                            <Star
                              size={32}
                              className={`transition-colors ${
                                isFilled
                                  ? "text-amber-400 fill-amber-400 drop-shadow-xs"
                                  : "text-slate-300 hover:text-amber-300"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    {/* Dynamic Rating Label */}
                    <p className="text-xs font-bold text-amber-600">
                      {selectedRating === 5 && "5.0 - Outstanding Experience!"}
                      {selectedRating === 4 && "4.0 - Very Good & Informative!"}
                      {selectedRating === 3 && "3.0 - Good Course"}
                      {selectedRating === 2 && "2.0 - Needs Improvement"}
                      {selectedRating === 1 && "1.0 - Poor"}
                    </p>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        Comments & Review <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Shared with Instructor & Classmates
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your experience with the lectures, instructor guidance, lab exercises, and what you learned..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Live Stats Info Pill */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs text-slate-600">
                    <span className="text-[11px] font-medium">Current Platform Rating:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      {courseRatingStats.rating > 0 ? courseRatingStats.rating : "5.0"}
                      <span className="text-slate-400 font-normal text-[10px]">
                        ({courseRatingStats.count} total {courseRatingStats.count === 1 ? "review" : "reviews"})
                      </span>
                    </span>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackModal(false)}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Star size={14} className="fill-white" />
                      {submittingFeedback ? "Submitting..." : existingReview ? "Update Feedback" : "Submit Feedback"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CourseLearning;
