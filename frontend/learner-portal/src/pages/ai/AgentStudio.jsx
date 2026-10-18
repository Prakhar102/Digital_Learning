import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Cpu,
  Network,
  Play,
  Square,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wrench,
  MessageSquare,
  Layers,
  Zap,
  Brain,
  BookOpen,
  ClipboardCheck,
  Briefcase,
  GraduationCap,
  RefreshCw,
  ArrowRight,
  Workflow,
  Key,
} from "lucide-react";
import {
  AGENT_PERSONAS,
  runAgent,
  runOrchestration,
  agentBus,
} from "../../services/agentService";
import { isApiKeySet } from "../../services/geminiService";

// ── Color maps ────────────────────────────────────────────────────────────────
const AGENT_COLORS = {
  violet: { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", badge: "bg-violet-600", dot: "bg-violet-500" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-600", dot: "bg-blue-500" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", badge: "bg-emerald-600", dot: "bg-emerald-500" },
  purple: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", badge: "bg-purple-600", dot: "bg-purple-500" },
  amber: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", badge: "bg-amber-600", dot: "bg-amber-500" },
  rose: { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", badge: "bg-rose-600", dot: "bg-rose-500" },
  cyan: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200", badge: "bg-cyan-600", dot: "bg-cyan-500" },
};

const AGENT_ICONS = {
  orchestrator: Workflow,
  rag: Brain,
  assessment: ClipboardCheck,
  skillgap: Layers,
  career: Briefcase,
  socratic: GraduationCap,
  mcp: Cpu,
};

// ── Agent Card ────────────────────────────────────────────────────────────────
function AgentCard({ persona, isActive, isSelected, onSelect, busMessages }) {
  const colors = AGENT_COLORS[persona.color] || AGENT_COLORS.blue;
  const Icon = AGENT_ICONS[persona.id] || Bot;
  const myMessages = busMessages.filter((m) => m.from === persona.id || m.to === persona.id).slice(-3);

  return (
    <button
      onClick={() => onSelect(persona.id)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
        isSelected
          ? `${colors.border} ${colors.bg} shadow-md`
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-lg ${isSelected ? colors.badge : "bg-slate-700"} text-white flex items-center justify-center shrink-0 shadow-sm transition-colors`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 truncate">{persona.name}</span>
            {isActive && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                RUNNING
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{persona.role}</p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{persona.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {persona.tools.map((t) => (
              <span key={t} className="text-[9px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bus messages */}
      {myMessages.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
          {myMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-1.5 text-[10px] text-slate-500">
              <MessageSquare size={9} className="mt-0.5 shrink-0 text-slate-400" />
              <span className="truncate">{msg.from === persona.id ? `To ${msg.to}` : `From ${msg.from}`}: {msg.message.slice(0, 60)}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

// ── Orchestration Step ────────────────────────────────────────────────────────
function OrchestrationStep({ step, index }) {
  const [expanded, setExpanded] = useState(false);
  const colors = step.agentId ? AGENT_COLORS[AGENT_PERSONAS[step.agentId]?.color] : AGENT_COLORS.violet;
  const Icon = step.agentId ? (AGENT_ICONS[step.agentId] || Bot) : Workflow;

  const getStepLabel = () => {
    switch (step.type) {
      case "orchestrator_start": return "Orchestrator started";
      case "plan_decided": return `Plan: ${step.agents?.join(" → ")}`;
      case "agent_start": return `${step.agentName} started`;
      case "agent_complete": return `${step.agentName} completed`;
      case "tool_call": return `Tool: ${step.name}`;
      case "synthesis_start": return "Synthesizing results";
      case "synthesis_complete": return "Synthesis complete";
      case "orchestration_complete": return "Orchestration complete";
      default: return step.type;
    }
  };

  const hasDetail = step.text || step.finalAnswer || step.args || step.output;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${colors?.bg || "bg-slate-100"} border ${colors?.border || "border-slate-200"}`}>
          <Icon size={12} className={colors?.text || "text-slate-600"} />
        </div>
        <div className="w-px flex-1 bg-slate-200 mt-1" />
      </div>
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-700">{getStepLabel()}</span>
            {step.type === "tool_call" && (
              <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {step.name}
              </span>
            )}
          </div>
          {hasDetail && (
            <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
              {expanded ? "Hide" : "Show"} <ChevronRight size={10} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          )}
        </div>

        {step.message && (
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{step.message}</p>
        )}

        {expanded && (
          <div className="mt-2 bg-slate-900 rounded-lg p-3 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
            <pre className="whitespace-pre-wrap break-words">
              {step.text || step.finalAnswer
                ? (step.text || step.finalAnswer).slice(0, 800)
                : JSON.stringify(step.args || step.output || step, null, 2).slice(0, 800)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function AgentStudio() {
  const [mode, setMode] = useState("orchestrated"); // "orchestrated" | "single"
  const [selectedAgentId, setSelectedAgentId] = useState("rag");
  const [prompt, setPrompt] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState(null);
  const [orchestrationSteps, setOrchestrationSteps] = useState([]);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [singleResult, setSingleResult] = useState(null);
  const [busMessages, setBusMessages] = useState([]);
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const stepsEndRef = useRef(null);

  useEffect(() => {
    setApiKeyReady(isApiKeySet());

    // Subscribe to all bus messages
    const unsubs = Object.keys(AGENT_PERSONAS).map((id) =>
      agentBus.on(id, (event) => {
        setBusMessages((prev) => [...prev.slice(-99), event]);
      })
    );
    // Also subscribe to "system" messages
    agentBus.on("system", (event) => {
      setBusMessages((prev) => [...prev.slice(-99), event]);
    });

    return () => unsubs.forEach((u) => u && u());
  }, []);

  useEffect(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [orchestrationSteps]);

  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem("GEMINI_API_KEY", apiKeyInput.trim());
      setApiKeyReady(true);
      setShowApiSetup(false);
      setApiKeyInput("");
    }
  };

  const handleRun = async () => {
    if (!prompt.trim() || isRunning) return;
    setIsRunning(true);
    setFinalAnswer("");
    setSingleResult(null);
    setOrchestrationSteps([]);
    setBusMessages([]);
    agentBus.clear();

    try {
      if (mode === "orchestrated") {
        setActiveAgentId("orchestrator");
        const result = await runOrchestration({
          prompt: prompt.trim(),
          onStep: (step) => {
            setOrchestrationSteps((prev) => [...prev, step]);
            if (step.agentId) setActiveAgentId(step.agentId);
          },
        });
        setFinalAnswer(result.finalAnswer);
        setActiveAgentId(null);
      } else {
        setActiveAgentId(selectedAgentId);
        const result = await runAgent({
          agentId: selectedAgentId,
          prompt: prompt.trim(),
          onToolCall: (info) => {
            setOrchestrationSteps((prev) => [...prev, { type: "tool_call", agentId: selectedAgentId, ...info }]);
          },
        });
        setSingleResult(result);
        setActiveAgentId(null);
      }
    } catch (err) {
      setFinalAnswer(`Error: ${err.message}`);
      setActiveAgentId(null);
    } finally {
      setIsRunning(false);
    }
  };

  const QUICK_PROMPTS = {
    orchestrated: [
      "Analyze my skill gaps and recommend courses to fill them",
      "Find assessments on machine learning and review my progress",
      "Build a career learning path for a Data Engineer role",
      "What are the key concepts in my enrolled courses and how am I progressing?",
    ],
    single: {
      rag: ["Explain neural networks from the course material", "What topics are covered in Python programming?"],
      assessment: ["Find all available assessments on data science", "Show me questions about cloud computing"],
      skillgap: ["Show my complete learning record and progress", "What courses have I completed?"],
      career: ["Find courses for becoming a Machine Learning Engineer", "Show all Python courses available"],
      socratic: ["Challenge my understanding of RESTful APIs", "Help me think through database normalization"],
    },
  };

  const personas = Object.values(AGENT_PERSONAS).filter((p) => p.id !== "orchestrator");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-sm">
              <Network size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Agent Studio</h1>
              <p className="text-[11px] text-slate-500">Multi-agent orchestration powered by Gemini 1.5 Flash</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium ${apiKeyReady ? "text-emerald-600" : "text-amber-600"}`}>
              <div className={`h-2 w-2 rounded-full ${apiKeyReady ? "bg-emerald-500" : "bg-amber-500"}`} />
              {apiKeyReady ? "Gemini connected" : "No API key — fallback mode"}
            </span>

            {!apiKeyReady && (
              <button
                onClick={() => setShowApiSetup(!showApiSetup)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg"
              >
                <Key size={13} />
                Set API Key
              </button>
            )}

            {/* Mode switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setMode("orchestrated")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  mode === "orchestrated" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Workflow size={13} />
                Orchestrated
              </button>
              <button
                onClick={() => setMode("single")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  mode === "single" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Bot size={13} />
                Single Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Key setup */}
      {showApiSetup && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Key size={15} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 font-medium">
              Get a free key at{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold">aistudio.google.com</a>
            </p>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIza..."
              className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
              onKeyDown={(e) => e.key === "Enter" && saveApiKey()}
            />
            <button onClick={saveApiKey} className="px-4 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700">Save</button>
            <button onClick={() => setShowApiSetup(false)} className="px-3 py-1.5 text-amber-700 text-xs hover:bg-amber-100 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
          {/* ── Left: Agent Selection ── */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Cpu size={15} className="text-slate-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {mode === "orchestrated" ? "Active Agents" : "Select Agent"}
                </h2>
              </div>

              {mode === "orchestrated" && (
                <div className="mb-4 p-3 bg-violet-50 border border-violet-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-sm`}>
                      <Workflow size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-violet-900">Orchestrator</p>
                      <p className="text-[10px] text-violet-600">Delegates to all agents automatically</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {personas.map((persona) => (
                  <AgentCard
                    key={persona.id}
                    persona={persona}
                    isActive={activeAgentId === persona.id}
                    isSelected={mode === "single" && selectedAgentId === persona.id}
                    onSelect={mode === "single" ? setSelectedAgentId : () => {}}
                    busMessages={busMessages}
                  />
                ))}
              </div>
            </div>

            {/* Bus Activity */}
            {busMessages.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={13} className="text-slate-500" />
                    <h3 className="text-xs font-bold text-slate-700">Agent Bus Activity</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{busMessages.length} msgs</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {busMessages.slice(-12).map((msg) => (
                    <div key={msg.id} className="flex items-start gap-1.5 text-[10px]">
                      <div className={`h-1.5 w-1.5 rounded-full mt-1 shrink-0 ${AGENT_COLORS[AGENT_PERSONAS[msg.from]?.color]?.dot || "bg-slate-400"}`} />
                      <span className="text-slate-500 shrink-0 font-medium">{msg.from}</span>
                      <ArrowRight size={8} className="mt-0.5 text-slate-300 shrink-0" />
                      <span className="text-slate-400 shrink-0">{msg.to}</span>
                      <span className="text-slate-400 truncate">: {msg.message.slice(0, 50)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Prompt + Execution ── */}
          <div className="space-y-4">
            {/* Prompt input */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={15} className="text-slate-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {mode === "orchestrated" ? "Orchestrated Task" : `Run ${AGENT_PERSONAS[selectedAgentId]?.name}`}
                </h2>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === "orchestrated"
                    ? "Describe a complex task. The orchestrator will automatically select and coordinate the right agents..."
                    : `Ask the ${AGENT_PERSONAS[selectedAgentId]?.name} a specific question...`
                }
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none leading-relaxed"
                onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleRun(); }}
              />

              {/* Quick prompts */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(mode === "orchestrated"
                  ? QUICK_PROMPTS.orchestrated
                  : QUICK_PROMPTS.single[selectedAgentId] || []
                ).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(p)}
                    className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200"
                  >
                    {p.slice(0, 60)}{p.length > 60 ? "..." : ""}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <p className="text-[10px] text-slate-400">
                  {mode === "orchestrated"
                    ? "Gemini selects optimal agents automatically"
                    : `Using: ${AGENT_PERSONAS[selectedAgentId]?.tools.join(", ")}`}
                </p>
                <button
                  onClick={handleRun}
                  disabled={isRunning || !prompt.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                >
                  {isRunning ? (
                    <><RefreshCw size={15} className="animate-spin" /> Running...</>
                  ) : (
                    <><Play size={15} /> Run</>
                  )}
                </button>
              </div>
            </div>

            {/* Execution trace */}
            {orchestrationSteps.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Workflow size={15} className="text-slate-600" />
                  <h2 className="text-sm font-bold text-slate-900">Execution Trace</h2>
                  <span className="ml-auto text-[10px] text-slate-400 font-mono">{orchestrationSteps.length} steps</span>
                </div>
                <div className="space-y-0 max-h-64 overflow-y-auto">
                  {orchestrationSteps.map((step, i) => (
                    <OrchestrationStep key={i} step={step} index={i} />
                  ))}
                  <div ref={stepsEndRef} />
                </div>
              </div>
            )}

            {/* Final Answer */}
            {(finalAnswer || singleResult) && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    {mode === "orchestrated" ? "Synthesized Answer" : `${singleResult?.agent?.name} Response`}
                  </h2>
                  <span className="ml-auto text-[10px] font-mono text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                    gemini-3.8-flash
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[13px] text-slate-800 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {finalAnswer || singleResult?.text}
                </div>

                {/* Tool call log for single agent */}
                {singleResult?.toolLog?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Wrench size={10} />
                      Tool Calls ({singleResult.toolLog.length})
                    </p>
                    <div className="space-y-2">
                      {singleResult.toolLog.map((t, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px]">
                          <span className="font-mono text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded shrink-0">
                            {t.name}
                          </span>
                          <span className="text-slate-500 truncate">
                            {JSON.stringify(t.args || {}).slice(0, 80)}
                          </span>
                          <span className="text-emerald-600 shrink-0">✓ {t.round !== undefined ? `round ${t.round}` : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!isRunning && !finalAnswer && !singleResult && orchestrationSteps.length === 0 && (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Network size={24} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600">Enter a task and click Run</p>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === "orchestrated"
                    ? "The orchestrator will automatically coordinate multiple agents and synthesize their outputs"
                    : "The selected agent will use its tools to fulfill your request"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentStudio;
