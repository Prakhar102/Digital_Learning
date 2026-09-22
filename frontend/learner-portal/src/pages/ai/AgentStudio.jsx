import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Sparkles,
  Send,
  GraduationCap,
  ClipboardCheck,
  Brain,
  Briefcase,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  AGENT_PERSONAS,
  TOOL_DEFINITIONS,
  runAgentExecution,
} from "../../services/agentService";

function AgentStudio() {
  const navigate = useNavigate();
  const [selectedAgentId, setSelectedAgentId] = useState("assessment");
  const [prompt, setPrompt] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // Interactive Quiz State if generated
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const activePersona = AGENT_PERSONAS[selectedAgentId] || AGENT_PERSONAS.coach;

  const handleRunAgent = async (customPrompt) => {
    const promptToRun = customPrompt || prompt;
    if (!promptToRun.trim() || isRunning) return;

    setIsRunning(true);
    setExecutionResult(null);
    setQuizAnswers({});
    setQuizSubmitted(false);

    try {
      const result = await runAgentExecution({
        agentId: selectedAgentId,
        prompt: promptToRun.trim(),
      });
      setExecutionResult(result);
    } catch (err) {
      console.error("Agent execution error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleQuizAnswer = (qId, optionIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleScoreQuiz = (questions) => {
    let score = 0;
    questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    setQuizScore(Math.round((score / questions.length) * 100));
    setQuizSubmitted(true);
  };

  const promptShortcuts = {
    assessment: [
      "Generate a diagnostic quiz on Spring Cloud Gateway & Routing",
      "Generate an assessment on PostgreSQL Indexing & Connection Pooling",
      "Create a diagnostic test on Distributed Saga Transactions",
    ],
    skillgap: [
      "Analyze my skill gap for Cloud Solutions Architect",
      "What skills do I need for Senior DevOps Engineer?",
      "Audit my prerequisites for AI & Vector Search Engineering",
    ],
    career: [
      "Build a career pathway for Cloud Architect in 6 months",
      "How to become a Lead Microservices Engineer?",
      "Create milestone roadmap for Kubernetes & DevOps Specialist",
    ],
    coach: [
      "Explain the difference between Saga Choreography and Orchestration with an analogy",
      "How does Eureka heartbeat prevent stale service routing?",
      "Explain Circuit Breaker half-open state simply",
    ],
  };

  const getAgentIcon = (id) => {
    switch (id) {
      case "coach":
        return <GraduationCap size={18} className="text-blue-600" />;
      case "assessment":
        return <ClipboardCheck size={18} className="text-emerald-600" />;
      case "skillgap":
        return <Brain size={18} className="text-purple-600" />;
      case "career":
        return <Briefcase size={18} className="text-amber-600" />;
      default:
        return <Bot size={18} className="text-slate-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded uppercase tracking-wider">
                Phase 3 Context-Aware Agent Studio
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Autonomous Agent Control Center & Tool Calling
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Invoke specialized agents with executable function calling for diagnostic generation, skill gap audits, and career roadmapping.
            </p>
          </div>

          <button
            onClick={() => navigate("/knowledge-hub")}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            RAG Knowledge Hub
          </button>
        </div>

        {/* ── 4 Agent Persona Selection Grid ── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Select Active Agent Persona
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(AGENT_PERSONAS).map((agent) => {
              const isSelected = selectedAgentId === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgentId(agent.id);
                    setExecutionResult(null);
                  }}
                  className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-white border-blue-600 ring-2 ring-blue-600/10 shadow-sm"
                      : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                        {getAgentIcon(agent.id)}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {agent.tools.length} Tools
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{agent.name}</h3>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{agent.role}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                      {agent.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold">
                    <span className={isSelected ? "text-blue-600" : "text-slate-400"}>
                      {isSelected ? "Active Persona" : "Select Agent"}
                    </span>
                    {isSelected && <Zap size={13} className="text-blue-600 fill-blue-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Agent Command & Tool Trigger Bar ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Agent Interface: {activePersona.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Available Function Tools:</span>
              {activePersona.tools.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded"
                >
                  {t}()
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder={`Send instruction or tool trigger to ${activePersona.name}...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRunAgent()}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
            <button
              onClick={() => handleRunAgent()}
              disabled={isRunning || !prompt.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Sparkles size={14} />
              {isRunning ? "Executing Tool..." : "Run Agent"}
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Triggers:
            </span>
            {promptShortcuts[selectedAgentId]?.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(s);
                  handleRunAgent(s);
                }}
                className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tool Execution Output & Interactive Widgets ── */}
        {executionResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Tool Call Trace Card */}
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    [TOOL_CALL_EXECUTED]: {executionResult.toolCall.tool}()
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>Latency: {executionResult.toolCall.durationMs}ms</span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold">
                    HTTP 200 OK
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                {executionResult.response}
              </p>
            </div>

            {/* ── Tool Result Widget: Generated Assessment Quiz ── */}
            {executionResult.toolCall.tool === "generate_assessment" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded uppercase tracking-wider">
                      Dynamic Quiz Engine
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {executionResult.toolCall.result.assessmentTitle}
                    </h3>
                  </div>

                  {quizSubmitted && (
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Diagnostic Score</span>
                      <p className="text-2xl font-bold text-emerald-600">{quizScore}%</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {executionResult.toolCall.result.generatedQuestions.map((q, idx) => {
                    const selectedOpt = quizAnswers[q.id];
                    return (
                      <div key={q.id} className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                        <p className="text-xs font-bold text-slate-900">
                          {idx + 1}. {q.questionText}
                        </p>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedOpt === optIdx;
                            const isCorrect = optIdx === q.correctIndex;

                            let btnStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-100";
                            if (quizSubmitted) {
                              if (isCorrect) btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                              else if (isChosen && !isCorrect) btnStyle = "bg-rose-50 border-rose-500 text-rose-900";
                            } else if (isChosen) {
                              btnStyle = "bg-blue-50 border-blue-600 text-blue-900 font-bold";
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleQuizAnswer(q.id, optIdx)}
                                className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center gap-3 ${btnStyle}`}
                              >
                                <span className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-600">
                                  {["A", "B", "C", "D"][optIdx]}
                                </span>
                                <span className="flex-1">{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                            💡 <span className="font-bold">Explanation:</span> {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  {!quizSubmitted ? (
                    <button
                      onClick={() => handleScoreQuiz(executionResult.toolCall.result.generatedQuestions)}
                      disabled={Object.keys(quizAnswers).length === 0}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <ClipboardCheck size={14} /> Submit & Score Quiz
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                      }}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <RotateCcw size={13} /> Retake Diagnostic
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Tool Result Widget: Skill Gap Analysis ── */}
            {executionResult.toolCall.tool === "analyze_skill_gap" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded uppercase tracking-wider">
                      SFIA Competency Audit
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Skill Gap Report: {executionResult.toolCall.result.role}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Target Role Readiness</span>
                    <p className="text-2xl font-bold text-purple-600">
                      {executionResult.toolCall.result.readinessScore}%
                    </p>
                  </div>
                </div>

                {/* Acquired Skills */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Verified Competencies
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {executionResult.toolCall.result.acquiredCompetencies.map((c, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{c.name}</span>
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">{c.level}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Deficiencies */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                    Prerequisite Gaps to Close
                  </h4>
                  <div className="space-y-2.5">
                    {executionResult.toolCall.result.missingGaps.map((gap, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl flex items-start justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{gap.skill}</span>
                            <span className="px-2 py-0.2 text-[9px] font-bold rounded bg-rose-100 text-rose-700">
                              {gap.severity} PRIORITY
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            🎯 Recommendation: {gap.recommendation}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate("/courses")}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors shrink-0 shadow-xs"
                        >
                          Find Course
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Tool Result Widget: Career Roadmap ── */}
            {executionResult.toolCall.tool === "recommend_career_pathway" && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded uppercase tracking-wider">
                      Career Progression Architecture
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {executionResult.toolCall.result.title}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                    ⏱️ {executionResult.toolCall.result.estimatedMonths} Months Plan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {executionResult.toolCall.result.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                          {m.phase}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{m.title}</h4>

                        <div className="mt-3 space-y-1">
                          <p className="text-[11px] font-bold text-slate-500">Core Tracks:</p>
                          {m.courses.map((c, cIdx) => (
                            <p key={cIdx} className="text-xs text-slate-700 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              {c}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400">Target Credential:</span>
                        <p className="text-xs font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                          <Award size={13} className="text-amber-600" />
                          {m.milestoneCert}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AgentStudio;
