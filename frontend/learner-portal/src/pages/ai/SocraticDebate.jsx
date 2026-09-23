import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Zap,
  Award,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

function SocraticDebate() {
  const navigate = useNavigate();
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [userSolution, setUserSolution] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const scenarios = [
    {
      title: "Distributed Payment Saga Failure",
      context: "A customer initiates a payment on an e-commerce platform. Order-Service creates the order, Payment-Service charges the credit card, but Inventory-Service throws an OutOfMemoryError and crashes before stock is reserved.",
      challenge: "How do you ensure data consistency without using synchronous 2-Phase Commit locks, and how should compensating events be routed?",
    },
    {
      title: "API Gateway Cascading Outage",
      context: "During a peak flash-sale, Recommendation-Service encounters high database lock contention and response latency degrades from 20ms to 4500ms, causing the API Gateway thread pool to exhaust completely.",
      challenge: "What fault-tolerance patterns (CircuitBreaker, Bulkhead, Fallback) will you configure in Spring Cloud Gateway to prevent the entire platform from going down?",
    },
    {
      title: "Kafka Event Duplication & Idempotency",
      context: "Due to transient network rebalancing, Kafka consumer receives the same 'OrderPaidEvent' message three times within a 5-second window.",
      challenge: "How must the downstream Notification & Fulfillment microservices handle duplicate delivery to avoid double-shipping products?",
    },
  ];

  const currentScenario = scenarios[scenarioIndex];

  const handleEvaluateSolution = () => {
    if (!userSolution.trim()) return;

    setIsEvaluating(true);
    setTimeout(() => {
      // Socratic analysis
      setEvaluation({
        score: 92,
        feedback: "Excellent architectural reasoning! You accurately identified compensating transactions and asynchronous event publishing.",
        socraticQuestion: "Now consider: What happens if the compensating transaction event itself fails to reach the Payment Service due to a broker network partition?",
        strengths: [
          "Appropriate use of Choreography/Orchestration compensation",
          "Decoupled asynchronous state changes",
          "Identified idempotency key requirements",
        ],
      });
      setIsEvaluating(false);
    }, 1200);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded uppercase tracking-wider">
                Phase 3 Innovation
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Socratic Architecture & Code Debate Arena
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Test your system design reasoning against real-world distributed failure scenarios with AI Coach critique.
            </p>
          </div>

          <button
            onClick={() => navigate("/agent-studio")}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Agent Studio
          </button>
        </div>

        {/* ── Scenario Picker ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenarios.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setScenarioIndex(idx);
                setEvaluation(null);
                setUserSolution("");
              }}
              className={`p-4 rounded-xl text-left border text-xs transition-all ${
                scenarioIndex === idx
                  ? "bg-blue-50/70 border-blue-600 text-blue-900 font-bold shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                Scenario #{idx + 1}
              </span>
              {s.title}
            </button>
          ))}
        </div>

        {/* ── Active Problem Statement ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">{currentScenario.title}</h2>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">System Failure Context:</p>
            <p className="leading-relaxed">{currentScenario.context}</p>
            <p className="font-bold text-blue-700 pt-2 border-t border-slate-200">
              Socratic Challenge: {currentScenario.challenge}
            </p>
          </div>

          {/* Solution Editor */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Propose Your Architectural Solution & Rationale
            </label>
            <textarea
              rows={5}
              placeholder="Explain which design patterns, messaging models, and retry/rollback policies you will apply..."
              value={userSolution}
              onChange={(e) => setUserSolution(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleEvaluateSolution}
              disabled={isEvaluating || !userSolution.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles size={14} />
              {isEvaluating ? "Analyzing Reasoning..." : "Submit to Socratic Coach"}
            </button>
          </div>
        </div>

        {/* ── AI Coach Evaluation & Follow-Up Challenge ── */}
        {evaluation && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-xs animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">AI Coach Assessment</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-xs">
                {evaluation.score}% Reasoning Quality
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {evaluation.feedback}
            </p>

            {/* Strengths */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Key Strengths Identified:
              </span>
              {evaluation.strengths.map((st, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-800">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>{st}</span>
                </div>
              ))}
            </div>

            {/* Follow-up Socratic Counter-Scenario */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={13} /> Socratic Counter-Challenge:
              </span>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {evaluation.socraticQuestion}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default SocraticDebate;
