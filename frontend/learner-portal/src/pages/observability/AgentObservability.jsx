import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  AGENT_REGISTRY,
  runMultiAgentCollaborationWorkflow,
  generateLearningPathDecisionTree,
} from "../../services/multiAgentOrchestrator";
import { getAllCourses } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";
import {
  Cpu,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  GitBranch,
  Eye,
  Terminal,
  ChevronRight,
  Workflow,
  ArrowRight,
} from "lucide-react";

export default function AgentObservability() {
  const [isRunning, setIsRunning] = useState(false);
  const [traces, setTraces] = useState([]);
  const [workflowSummary, setWorkflowSummary] = useState(null);
  const [decisionTree, setDecisionTree] = useState(null);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [courses, setCourses] = useState([]);

  // Config parameters
  const [targetRole, setTargetRole] = useState("Senior Cloud-Native & AI Architect");
  const [weakDomain, setWeakDomain] = useState("Distributed Concurrency & Caching");

  useEffect(() => {
    const init = async () => {
      try {
        const c = await getAllCourses();
        setCourses(c);
        const user = getCurrentUser();
        const initialTree = generateLearningPathDecisionTree(user, targetRole, weakDomain, c[0]);
        setDecisionTree(initialTree);
        setSelectedNode(initialTree.nodes[0]);
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);

  const handleRunWorkflow = async () => {
    setIsRunning(true);
    setTraces([]);
    setWorkflowSummary(null);

    try {
      const result = await runMultiAgentCollaborationWorkflow(
        "COMPREHENSIVE_DIAGNOSTIC_AND_CAREER_PATH",
        { targetRole, weakDomain },
        (newTrace, currentTraces) => {
          setTraces([...currentTraces]);
        }
      );

      setWorkflowSummary(result.summary);
      setDecisionTree(result.decisionGraph);
      if (result.traces.length > 0) {
        setSelectedTrace(result.traces[0]);
      }
    } catch (e) {
      console.error("Workflow failed:", e);
    } finally {
      setIsRunning(false);
    }
  };

  const totalTokensUsed = traces.reduce(
    (acc, t) => acc + (t.tokens?.prompt || 0) + (t.tokens?.completion || 0),
    0
  );
  const totalLatency = traces.reduce((acc, t) => acc + (t.latencyMs || 0), 0);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                <Workflow size={12} />
                Phase 5 Multi-Agent System
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5">
                <Eye size={12} />
                Observability & Decision Tree Traceability
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              Multi-Agent Orchestration & Observability
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Inspect autonomous multi-agent reasoning traces, tool dispatches, latency timelines, and explainable decision graphs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunWorkflow}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              {isRunning ? (
                <>
                  <RotateCcw size={14} className="animate-spin" />
                  Orchestrating 5 Agents...
                </>
              ) : (
                <>
                  <Play size={14} />
                  Run Multi-Agent Collaboration
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Active Agent Swarm Registry ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.values(AGENT_REGISTRY).map((agent) => (
            <div
              key={agent.id}
              className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl">{agent.avatar}</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {agent.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-2 truncate">{agent.name}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{agent.role}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{agent.model}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Live Workflow Execution Banner ── */}
        {workflowSummary && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Multi-Agent Swarm Successfully Converged
                </h3>
                <p className="text-xs text-slate-600">
                  Collaborative consensus reached across all 5 specialized agents in {workflowSummary.totalLatencyMs}ms.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-center px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-semibold">TOTAL LATENCY</p>
                <p className="font-mono font-bold text-slate-800">{totalLatency}ms</p>
              </div>
              <div className="text-center px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-semibold">TOKENS CONSUMED</p>
                <p className="font-mono font-bold text-blue-600">{totalTokensUsed}</p>
              </div>
              <div className="text-center px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <p className="text-[10px] text-slate-400 font-semibold">PROJECTED READINESS</p>
                <p className="font-mono font-bold text-emerald-600">{workflowSummary.overallReadiness}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Section 1: Dynamic Learning Path Decision Tree & Visibility Graph ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GitBranch size={18} className="text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Explainable Learning Path Decision Tree
                </h3>
                <p className="text-xs text-slate-500">
                  Transparent graph representation of why specific courses, remediation labs, and credentials are recommended.
                </p>
              </div>
            </div>

            {decisionTree?.rootGoal && (
              <span className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                {decisionTree.rootGoal.label}
              </span>
            )}
          </div>

          {decisionTree && (
            <div className="space-y-4">
              {/* Interactive Node Flowchart Strip */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                {decisionTree.nodes.map((node, index) => {
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`
                        p-3.5 rounded-xl border transition cursor-pointer relative flex flex-col justify-between
                        ${isSelected
                          ? "bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }
                      `}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-blue-600">
                            STEP 0{index + 1}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-200/70 text-slate-700 font-mono">
                            {node.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {node.label}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {node.details}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="font-semibold text-slate-700">{node.weight}</span>
                        {index < decisionTree.nodes.length - 1 && (
                          <ArrowRight size={12} className="text-slate-400 hidden md:block" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Node Inspector Drawer */}
              {selectedNode && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-blue-600" />
                      DECISION NODE REASONING TRACE: {selectedNode.label}
                    </span>
                    <span className="text-xs font-mono text-slate-500">ID: {selectedNode.id}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {selectedNode.details}
                  </p>
                  <div className="pt-2 flex items-center gap-3 text-xs font-mono text-slate-600">
                    <span>Category: <strong className="text-slate-900">{selectedNode.category}</strong></span>
                    <span>•</span>
                    <span>Mathematical Weight: <strong className="text-blue-600">{selectedNode.weight}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Section 2: Step-by-Step Multi-Agent Execution Traces (Waterfall Timeline) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Trace List (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Terminal size={14} className="text-blue-600" />
                EXECUTION STEP TRACES ({traces.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {traces.length > 0 ? "LIVE SYNCHRONIZED" : "IDLE"}
              </span>
            </div>

            {traces.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Play size={18} />
                </div>
                <p className="text-xs text-slate-500">
                  Click <strong>Run Multi-Agent Collaboration</strong> above to trigger the 5-agent reasoning pipeline.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {traces.map((trace) => {
                  const isSelected = selectedTrace?.traceId === trace.traceId;
                  return (
                    <div
                      key={trace.traceId}
                      onClick={() => setSelectedTrace(trace)}
                      className={`
                        p-3 rounded-xl border transition cursor-pointer
                        ${isSelected
                          ? "bg-blue-50/80 border-blue-400 ring-1 ring-blue-400"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{trace.avatar}</span>
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {trace.agentName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {trace.latencyMs}ms
                        </span>
                      </div>

                      <p className="text-[11px] font-mono font-semibold text-blue-700 mt-1">
                        {trace.action}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {trace.thought}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Tokens: {(trace.tokens?.prompt || 0) + (trace.tokens?.completion || 0)}</span>
                        <span className="text-blue-600 font-semibold flex items-center gap-1">
                          Inspect <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Detailed Trace Inspector (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Cpu size={14} className="text-blue-600" />
                AGENT REASONING & TOOL PAYLOAD INSPECTOR
              </span>
              {selectedTrace && (
                <span className="text-[10px] font-mono text-slate-500">
                  Trace ID: {selectedTrace.traceId}
                </span>
              )}
            </div>

            {selectedTrace ? (
              <div className="space-y-4">
                {/* Agent Card Header */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedTrace.avatar}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{selectedTrace.agentName}</h4>
                      <p className="text-[11px] text-slate-500">{selectedTrace.agentRole}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-600">
                    <p>Model: <strong className="text-slate-900">{selectedTrace.model}</strong></p>
                    <p>Latency: <strong className="text-blue-600">{selectedTrace.latencyMs}ms</strong></p>
                  </div>
                </div>

                {/* Thought Process Chain */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    INTERNAL CHAIN-OF-THOUGHT REASONING
                  </span>
                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-slate-800 leading-relaxed font-sans">
                    {selectedTrace.thought}
                  </div>
                </div>

                {/* Tool Invocation Payload */}
                {selectedTrace.toolCall && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      TOOL DISPATCH PARAMETERS
                    </span>
                    <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40 border border-slate-800">
                      {JSON.stringify(selectedTrace.toolCall, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Output State Payload */}
                {selectedTrace.output && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      STRUCTURED RESULT & OUTPUT STATE
                    </span>
                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-56 border border-slate-800">
                      {JSON.stringify(selectedTrace.output, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                Select a trace from the left panel to inspect full internal reasoning and tool payloads.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
