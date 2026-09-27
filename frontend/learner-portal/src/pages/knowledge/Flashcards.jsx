import { useState, useEffect } from "react";
import {
  Brain,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Shuffle,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getAllCourses, getCourseDetails } from "../../services/courseService";


function Flashcards() {
  const [cards, setCards] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [reviewedCards, setReviewedCards] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDynamicFlashcards();
  }, []);

  async function loadDynamicFlashcards() {
    try {
      setLoading(true);
      const courses = await getAllCourses();
      const courseDetails = await Promise.all((Array.isArray(courses) ? courses : []).map(async (course) => {
        try {
          return await getCourseDetails(course.id);
        } catch {
          return course;
        }
      }));
      const dynamicDeck = [];

      courseDetails.forEach((course) => {
        const courseContent = [course.description, course.summary, course.content]
          .find((value) => typeof value === "string" && value.trim());
        if (courseContent) {
          dynamicDeck.push({
            id: `course-${course.id}`,
            topic: course.title || `Course #${course.id}`,
            category: typeof course.category === "string" ? course.category : course.category?.name || "Course",
            difficulty: course.level || "Not specified",
            question: `What does the course "${course.title || `Course #${course.id}`}" cover?`,
            answer: courseContent.trim(),
          });
        }

        (Array.isArray(course.modules) ? course.modules : []).forEach((module) => {
          const moduleTitle = module.title || module.name || "Course module";
          const moduleContent = [module.description, module.summary, module.content, module.notes]
            .find((value) => typeof value === "string" && value.trim());
          if (moduleContent) {
            dynamicDeck.push({
              id: `module-${module.id}`,
              topic: moduleTitle,
              category: course.title || "Course Module",
              difficulty: module.difficulty || course.level || "Not specified",
              question: `What information is provided for "${moduleTitle}"?`,
              answer: moduleContent.trim(),
            });
          }

          (Array.isArray(module.lessons) ? module.lessons : []).forEach((lesson) => {
            const lessonTitle = lesson.title || lesson.name || "Course lesson";
            const lessonContent = [lesson.description, lesson.summary, lesson.content, lesson.notes, lesson.transcript]
              .find((value) => typeof value === "string" && value.trim());
            if (!lessonContent) return;
            dynamicDeck.push({
              id: `lesson-${lesson.id}`,
              topic: lessonTitle,
              category: moduleTitle,
              difficulty: lesson.difficulty || module.difficulty || course.level || "Not specified",
              question: `What does the lesson "${lessonTitle}" explain?`,
              answer: lessonContent.trim(),
            });
          });
        });
      });

      setMasteredCount(0);
      setReviewedCards(new Set());
      setCards(dynamicDeck);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = cards[currentIdx] || null;

  const handleNext = () => {
    if (!cards.length) return;
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (!cards.length) return;
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleMarkMastered = () => {
    if (!currentCard) return;
    if (!reviewedCards.has(currentCard.id)) {
      setMasteredCount((prev) => prev + 1);
      setReviewedCards((prev) => new Set(prev).add(currentCard.id));
    }
    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCards([...cards].sort(() => Math.random() - 0.5));
    setCurrentIdx(0);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded uppercase tracking-wider">
                Built from current LMS content
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Course Content Review Cards
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review cards use course, module, and lesson text available in the LMS. No generated or sample answers are added.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShuffle}
              disabled={!cards.length}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Shuffle size={13} /> Shuffle Deck
            </button>
            <button
              onClick={loadDynamicFlashcards}
              disabled={loading}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw size={13} /> Refresh LMS Content
            </button>
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Brain size={16} className="text-indigo-600" />
            Card {cards.length > 0 ? currentIdx + 1 : 0} of {cards.length}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-500">
              Mastered: <span className="font-bold text-emerald-600">{masteredCount}</span> / {cards.length}
            </span>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${cards.length > 0 ? (masteredCount / cards.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── 3D Flip Card Canvas ── */}
        <div
          onClick={() => currentCard && setIsFlipped(!isFlipped)}
          className="min-h-[320px] bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-2xl p-10 flex flex-col justify-between cursor-pointer shadow-sm transition-all relative select-none"
        >
          {!currentCard ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
              <p className="text-sm font-semibold text-slate-700">
                {loading ? "Loading LMS course content…" : "No flashcards are available yet."}
              </p>
              {!loading && <p className="mt-2 max-w-lg text-xs text-slate-500">Add descriptions, notes, or lesson content to courses in the LMS to create review cards.</p>}
            </div>
          ) : (
            <>
          {/* Top Tag */}
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 text-[10px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              {currentCard.topic} • {currentCard.category}
            </span>
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <RotateCw size={11} /> Click card to flip
            </span>
          </div>

          {/* Question / Answer Text */}
          <div className="py-8 text-center space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isFlipped ? "Core Concept / Solution" : "Architectural Question"}
            </span>
            <p className="text-lg font-bold text-slate-900 max-w-xl mx-auto leading-relaxed">
              {isFlipped ? currentCard.answer : currentCard.question}
            </p>
          </div>

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
              Level: {currentCard.difficulty}
            </span>
            <span className="text-indigo-600 font-semibold text-xs">
              {isFlipped ? "Flip to Question" : "Reveal Answer"} →
            </span>
          </div>
            </>
          )}
        </div>

        {/* ── Navigation & Mastery Controls ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={!cards.length}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ChevronLeft size={16} /> Previous Card
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNext}
              disabled={!cards.length}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <XCircle size={14} className="text-rose-500" /> Need Review
            </button>
            <button
              onClick={handleMarkMastered}
              disabled={!cards.length}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 size={14} /> Mastered!
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={!cards.length}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            Next Card <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Flashcards;
