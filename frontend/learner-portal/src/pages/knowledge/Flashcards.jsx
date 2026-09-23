import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { getAllCourses } from "../../services/courseService";


function Flashcards() {
  const navigate = useNavigate();
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

      let dynamicDeck = [];

      if (Array.isArray(courses) && courses.length > 0) {
        courses.forEach((c, idx) => {
          dynamicDeck.push({
            id: `course-card-${c.id}`,
            topic: c.title,
            category: c.category || "Software Engineering",
            difficulty: c.level || "INTERMEDIATE",
            question: `What are the primary architectural objectives and design requirements in "${c.title}"?`,
            answer: c.description || `Mastery of ${c.title} requires implementing scalable service discovery, resilient fault-tolerance, and decoupled asynchronous event messaging.`,
          });
          dynamicDeck.push({
            id: `course-deep-${c.id}`,
            topic: `${c.title} — Key Patterns`,
            category: "Distributed Design",
            difficulty: "ADVANCED",
            question: `Which fault-tolerance pattern prevents downstream latency failures in "${c.title}" from cascading?`,
            answer: `Circuit Breakers (e.g. Resilience4j) combined with Bulkhead thread isolation isolate failure domains and execute graceful fallback handlers.`,
          });
        });
      }

      // Add core architecture cards
      dynamicDeck.push(
        {
          id: "core-1",
          topic: "Spring Cloud Gateway",
          category: "Microservices",
          difficulty: "INTERMEDIATE",
          question: "What is the difference between a Route Predicate and a Gateway Filter in Spring Cloud Gateway?",
          answer: "A Route Predicate evaluates whether an incoming HTTP request matches specific criteria. A Gateway Filter mutates the request/response (auth headers, rate limiting) before/after forwarding to microservices.",
        },
        {
          id: "core-2",
          topic: "Distributed Saga Pattern",
          category: "System Design",
          difficulty: "ADVANCED",
          question: "Why is Saga preferred over Two-Phase Commit (2PC) in cloud-native microservices?",
          answer: "2PC requires synchronous database locks across independent nodes, creating bottlenecks. Saga coordinates independent local transactions with compensating rollbacks.",
        }
      );

      setCards(dynamicDeck);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = cards[currentIdx] || {
    id: 0,
    topic: "Loading Deck...",
    category: "General",
    difficulty: "INTERMEDIATE",
    question: "Fetching real-time course flashcards...",
    answer: "Please wait.",
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIdx((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleMarkMastered = () => {
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
                Dynamic Real-Time Deck
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Spaced-Repetition AI Flashcards
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Generated in real-time from your active courses, syllabus modules, and architecture references.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShuffle}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Shuffle size={13} /> Shuffle Deck
            </button>
            <button
              onClick={loadDynamicFlashcards}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw size={13} /> Refresh From Database
            </button>
          </div>
        </div>

        {/* ── Progress Bar ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Brain size={16} className="text-indigo-600" />
            Card {cards.length > 0 ? currentIdx + 1 : 0} of {cards.length} (Live Catalog)
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
          onClick={() => setIsFlipped(!isFlipped)}
          className="min-h-[320px] bg-white border-2 border-slate-200 hover:border-indigo-400 rounded-2xl p-10 flex flex-col justify-between cursor-pointer shadow-sm transition-all relative select-none"
        >
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
        </div>

        {/* ── Navigation & Mastery Controls ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ChevronLeft size={16} /> Previous Card
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <XCircle size={14} className="text-rose-500" /> Need Review
            </button>
            <button
              onClick={handleMarkMastered}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 size={14} /> Mastered!
            </button>
          </div>

          <button
            onClick={handleNext}
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
