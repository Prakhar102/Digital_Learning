import { useState, useEffect } from "react";
import {
  MCP_SERVERS,
  sendJsonRpcRequest,
  mcpWireBus,
  executeMcpPromptWithGemini,
} from "../../services/mcpService";
import { getAllCourses } from "../../services/courseService";
import { isApiKeySet } from "../../services/geminiService";
import {
  Server,
  Terminal,
  Activity,
  Cpu,
  Layers,
  Send,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Code2,
  FileCode,
  ShieldCheck,
  Zap,
  BookOpen,
  UserCheck,
  Database,
  Search,
  Sparkles,
  ArrowRight,
  ListFilter,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function MCPExplorer() {
  const [selectedServer, setSelectedServer] = useState(MCP_SERVERS[0]);
  const [selectedTool, setSelectedTool] = useState(MCP_SERVERS[0].tools[0]);
  const [toolInputs, setToolInputs] = useState({});
  const [activeTab, setActiveTab] = useState("tools"); // 'tools' | 'resources' | 'prompts' | 'wire' | 'gemini'
  const [selectedResource, setSelectedResource] = useState(MCP_SERVERS[0].resources[0] || null);
  const [selectedPrompt, setSelectedPrompt] = useState(MCP_SERVERS[0].prompts?.[0] || null);
  const [promptArgs, setPromptArgs] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [resourceContent, setResourceContent] = useState(null);
  const [copiedReq, setCopiedReq] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);
  const [wireTraffic, setWireTraffic] = useState([]);
  const [courses, setCourses] = useState([]);

  // Gemini + MCP playground state
  const [aiPrompt, setAiPrompt] = useState(
    "Check my enrolled courses, calculate any skill gaps, and recommend 2 catalog courses to take next."
  );
  const [aiRunning, setAiRunning] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Subscribe to real-time MCP wire traffic
  useEffect(() => {
    setWireTraffic(mcpWireBus.getLog());
    const unsub = mcpWireBus.subscribe((entry, fullLog) => {
      setWireTraffic([...fullLog]);
    });
    return unsub;
  }, []);

  // Fetch courses for dropdown helper
  useEffect(() => {
    getAllCourses()
      .then((items) => setCourses(Array.isArray(items) ? items : []))
      .catch(() => setCourses([]));
  }, []);

  // Default tool inputs when tool changes
  useEffect(() => {
    if (selectedTool?.inputSchema?.properties) {
      const initial = {};
      Object.keys(selectedTool.inputSchema.properties).forEach((key) => {
        const prop = selectedTool.inputSchema.properties[key];
        if (key === "courseId") initial[key] = courses[0]?.id ? String(courses[0].id) : "1";
        else if (key === "assessmentId") initial[key] = "1";
        else if (key === "limit") initial[key] = 5;
        else if (key === "query") initial[key] = "machine learning";
        else if (prop.default) initial[key] = prop.default;
        else initial[key] = "";
      });
      setToolInputs(initial);
    }
  }, [selectedTool, courses]);

  // Default prompt arguments when prompt changes
  useEffect(() => {
    if (selectedPrompt?.arguments) {
      const initial = {};
      selectedPrompt.arguments.forEach((arg) => {
        if (arg.name === "targetRole") initial[arg.name] = "Cloud AI Architect";
        else if (arg.name === "hoursPerWeek") initial[arg.name] = 10;
        else if (arg.name === "topic") initial[arg.name] = "Neural Networks";
        else if (arg.name === "courseId") initial[arg.name] = courses[0]?.id ? String(courses[0].id) : "1";
        else initial[arg.name] = "Sample context";
      });
      setPromptArgs(initial);
    }
  }, [selectedPrompt, courses]);

  const handleSelectServer = (server) => {
    setSelectedServer(server);
    setSelectedTool(server.tools[0] || null);
    setSelectedResource(server.resources[0] || null);
    setSelectedPrompt(server.prompts?.[0] || null);
    setResourceContent(null);
  };

  const handleInputChange = (field, value) => {
    setToolInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handlePromptArgChange = (field, value) => {
    setPromptArgs((prev) => ({ ...prev, [field]: value }));
  };

  // Execute JSON-RPC tools/call
  const executeJsonRpcCall = async () => {
    if (!selectedTool) return;
    setIsLoading(true);

    const payload = {
      name: selectedTool.name,
      arguments: toolInputs,
    };

    const rpcReq = {
      jsonrpc: "2.0",
      id: "req_" + Math.random().toString(36).substring(2, 9),
      method: "tools/call",
      params: payload,
    };

    setLastRequest(rpcReq);

    const resp = await sendJsonRpcRequest(selectedServer.uri, "tools/call", payload);
    setLastResponse(resp);
    setIsLoading(false);
  };

  // Execute JSON-RPC resources/read
  const executeReadResource = async (res) => {
    const target = res || selectedResource;
    if (!target) return;
    setIsLoading(true);
    setSelectedResource(target);

    const rpcReq = {
      jsonrpc: "2.0",
      id: "req_" + Math.random().toString(36).substring(2, 9),
      method: "resources/read",
      params: { uri: target.uri },
    };

    setLastRequest(rpcReq);

    const resp = await sendJsonRpcRequest(selectedServer.uri, "resources/read", { uri: target.uri });
    setLastResponse(resp);
    try {
      const rawText = resp.result?.contents?.[0]?.text;
      setResourceContent(rawText ? JSON.parse(rawText) : resp.result);
    } catch {
      setResourceContent(resp.result);
    }
    setIsLoading(false);
  };

  // Execute JSON-RPC prompts/get
  const executeGetPrompt = async () => {
    if (!selectedPrompt) return;
    setIsLoading(true);

    const payload = {
      name: selectedPrompt.name,
      arguments: promptArgs,
    };

    const rpcReq = {
      jsonrpc: "2.0",
      id: "req_" + Math.random().toString(36).substring(2, 9),
      method: "prompts/get",
      params: payload,
    };

    setLastRequest(rpcReq);

    const resp = await sendJsonRpcRequest(selectedServer.uri, "prompts/get", payload);
    setLastResponse(resp);
    setIsLoading(false);
  };

  // Run Gemini with real MCP tools
  const handleRunAiWithMcp = async () => {
    if (!aiPrompt.trim()) return;
    setAiRunning(true);
    setAiResult(null);
    try {
      const result = await executeMcpPromptWithGemini({
        prompt: aiPrompt,
        serverIds: [selectedServer.id],
      });
      setAiResult(result);
    } catch (err) {
      setAiResult({
        answer: `Error executing MCP query with Gemini: ${err.message}`,
        mcpLog: [],
        error: true,
      });
    } finally {
      setAiRunning(false);
    }
  };

  const copyToClipboard = (data, type) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    if (type === "req") {
      setCopiedReq(true);
      setTimeout(() => setCopiedReq(false), 2000);
    } else {
      setCopiedRes(true);
      setTimeout(() => setCopiedRes(false), 2000);
    }
  };

  const getServerIcon = (id) => {
    switch (id) {
      case "lms-catalog-server":
        return BookOpen;
      case "learner-analytics-server":
        return UserCheck;
      case "assessment-engine-server":
        return ShieldCheck;
      case "rag-knowledge-server":
        return Database;
      default:
        return Server;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Cpu size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Model Context Protocol (MCP) Explorer
                  </h1>
                  <span className="px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    v2024-11-05 Spec
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Full standard JSON-RPC 2.0 MCP interface connecting live LMS microservices, vector storage, and Google Gemini.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Activity size={14} className="text-blue-600" />
              {MCP_SERVERS.length} Live MCP Servers
            </span>
            <span className={`text-xs font-medium px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
              isApiKeySet()
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}>
              <Sparkles size={14} />
              {isApiKeySet() ? "Gemini 3.8 Flash Connected" : "API Key Required"}
            </span>
          </div>
        </div>

        {/* ── Server Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MCP_SERVERS.map((server) => {
            const Icon = getServerIcon(server.id);
            const isSelected = selectedServer.id === server.id;
            return (
              <button
                key={server.id}
                onClick={() => handleSelectServer(server)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-300"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {server.status}
                  </span>
                </div>
                <h2 className="text-xs font-bold text-slate-900 line-clamp-1">{server.name}</h2>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 line-clamp-1">{server.uri}</p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{server.tools.length} Tools</span>
                  <span>{server.resources.length} Resources</span>
                  <span>{server.prompts?.length || 0} Prompts</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Main Work Area ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Navigation Tabs & Tool/Resource Picker (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Tab Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex gap-1 shadow-xs">
              {[
                { id: "tools", label: "Tools", icon: Terminal },
                { id: "resources", label: "Resources", icon: Layers },
                { id: "prompts", label: "Prompts", icon: Code2 },
                { id: "wire", label: "Wire Log", icon: Activity },
                { id: "gemini", label: "AI + MCP", icon: Sparkles },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <TabIcon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB: TOOLS */}
            {activeTab === "tools" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select MCP Tool (tools/list)
                  </label>
                  <div className="space-y-2">
                    {selectedServer.tools.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => setSelectedTool(t)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                          selectedTool?.name === t.name
                            ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-300 font-medium"
                            : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-700">{t.name}</span>
                          <span className="text-[10px] text-slate-400">tools/call</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tool Input Form */}
                {selectedTool && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Tool Arguments Schema
                    </h2>
                    {selectedTool.inputSchema?.properties &&
                    Object.keys(selectedTool.inputSchema.properties).length > 0 ? (
                      Object.keys(selectedTool.inputSchema.properties).map((key) => {
                        const prop = selectedTool.inputSchema.properties[key];
                        return (
                          <div key={key} className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                              <span>
                                {key}{" "}
                                {selectedTool.inputSchema.required?.includes(key) && (
                                  <span className="text-rose-500">*</span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {prop.type}
                              </span>
                            </label>
                            <input
                              type={prop.type === "number" ? "number" : "text"}
                              value={toolInputs[key] ?? ""}
                              onChange={(e) => handleInputChange(key, e.target.value)}
                              placeholder={prop.description || key}
                              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            {prop.description && (
                              <p className="text-[10px] text-slate-400">{prop.description}</p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        No arguments required for this tool.
                      </p>
                    )}

                    <button
                      onClick={executeJsonRpcCall}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors mt-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Executing JSON-RPC Call...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Dispatch JSON-RPC Call
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: RESOURCES */}
            {activeTab === "resources" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Available MCP Resources (resources/list)
                </label>
                <div className="space-y-2">
                  {selectedServer.resources.map((res) => (
                    <button
                      key={res.uri}
                      onClick={() => executeReadResource(res)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedResource?.uri === res.uri
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-300 font-medium"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{res.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-200/60 px-1.5 py-0.5 rounded">
                          {res.mimeType}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-600 font-mono mt-1">{res.uri}</p>
                      {res.description && (
                        <p className="text-[11px] text-slate-500 mt-1">{res.description}</p>
                      )}
                    </button>
                  ))}
                </div>

                {selectedResource && (
                  <button
                    onClick={() => executeReadResource()}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors mt-2"
                  >
                    <Layers size={14} />
                    Read Resource ({selectedResource.uri.split("/").pop()})
                  </button>
                )}
              </div>
            )}

            {/* TAB: PROMPTS */}
            {activeTab === "prompts" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  MCP Prompt Templates (prompts/list)
                </label>
                <div className="space-y-2">
                  {(selectedServer.prompts || []).map((p) => (
                    <button
                      key={p.name}
                      onClick={() => setSelectedPrompt(p)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedPrompt?.name === p.name
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-300 font-medium"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-purple-700">{p.name}</span>
                        <span className="text-[10px] text-slate-400">prompts/get</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{p.description}</p>
                    </button>
                  ))}
                </div>

                {selectedPrompt && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Prompt Arguments
                    </h2>
                    {(selectedPrompt.arguments || []).map((arg) => (
                      <div key={arg.name} className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                          <span>
                            {arg.name} {arg.required && <span className="text-rose-500">*</span>}
                          </span>
                        </label>
                        <input
                          type="text"
                          value={promptArgs[arg.name] ?? ""}
                          onChange={(e) => handlePromptArgChange(arg.name, e.target.value)}
                          placeholder={arg.description || arg.name}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <p className="text-[10px] text-slate-400">{arg.description}</p>
                      </div>
                    ))}

                    <button
                      onClick={executeGetPrompt}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors mt-2"
                    >
                      <Code2 size={14} />
                      Render Prompt (prompts/get)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: WIRE TRAFFIC LOG */}
            {activeTab === "wire" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Activity size={14} className="text-blue-600" />
                    Live JSON-RPC 2.0 Stream
                  </h2>
                  <button
                    onClick={() => mcpWireBus.clear()}
                    className="text-[11px] text-slate-500 hover:text-slate-700"
                  >
                    Clear Log
                  </button>
                </div>
                <div className="space-y-2 max-h-[460px] overflow-y-auto">
                  {wireTraffic.length === 0 ? (
                    <p className="text-xs text-slate-400 italic p-4 text-center">
                      No JSON-RPC calls recorded yet. Execute a tool or read a resource.
                    </p>
                  ) : (
                    wireTraffic.map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => {
                          setLastRequest(entry.request);
                          setLastResponse(entry.response);
                        }}
                        className="p-3 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl text-xs cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-800">{entry.method}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              entry.status === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {entry.latencyMs}ms
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-1">{entry.serverName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{entry.timestamp}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: GEMINI + MCP PLAYGROUND */}
            {activeTab === "gemini" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles size={16} className="text-blue-600" />
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Gemini + MCP Execution
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    Type any query. Gemini will dynamically discover, negotiate, and invoke MCP tools on{" "}
                    <strong>{selectedServer.name}</strong>.
                  </p>
                </div>

                <div>
                  <textarea
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask Gemini to query the MCP server..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleRunAiWithMcp}
                  disabled={aiRunning || !aiPrompt.trim()}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {aiRunning ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Gemini Invoking MCP Tools...
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      Run Prompt with MCP Tools
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Wire Payloads & Results (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* If in Gemini tab and has result, show AI output first */}
            {activeTab === "gemini" && aiResult && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Gemini MCP Synthesized Answer
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    gemini-3.8-flash
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {aiResult.answer}
                </div>

                {/* MCP Tool Call Audit */}
                {aiResult.mcpLog?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      MCP Tools Invoked by Gemini ({aiResult.mcpLog.length})
                    </h3>
                    <div className="space-y-2">
                      {aiResult.mcpLog.map((log, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900 text-slate-200 rounded-xl p-3 text-[11px] font-mono space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-emerald-400">
                            <span>
                              Call #{idx + 1}: {log.tool}()
                            </span>
                            <span className="text-[10px] text-slate-400">Round {log.round}</span>
                          </div>
                          <div className="text-slate-400 text-[10px]">
                            args: {JSON.stringify(log.args)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Outgoing Request Payload (JSON-RPC 2.0) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Terminal size={14} className="text-blue-600" />
                  JSON-RPC 2.0 REQUEST
                </span>
                {lastRequest && (
                  <button
                    onClick={() => copyToClipboard(lastRequest, "req")}
                    className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                  >
                    {copiedReq ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                    <span>{copiedReq ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
                {lastRequest
                  ? JSON.stringify(lastRequest, null, 2)
                  : `// Ready to send JSON-RPC 2.0 payload\n{\n  "jsonrpc": "2.0",\n  "method": "${
                      activeTab === "resources" ? "resources/read" : "tools/call"
                    }",\n  "params": {\n    "name": "${selectedTool?.name || "list_courses"}"\n  }\n}`}
              </pre>
            </div>

            {/* Incoming Response Payload (JSON-RPC 2.0) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode size={14} className="text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    JSON-RPC 2.0 RESPONSE
                  </span>
                  {lastResponse?.meta?.latencyMs && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {lastResponse.meta.latencyMs} ms
                    </span>
                  )}
                </div>
                {lastResponse && (
                  <button
                    onClick={() => copyToClipboard(lastResponse, "res")}
                    className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                  >
                    {copiedRes ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                    <span>{copiedRes ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
                {lastResponse
                  ? JSON.stringify(lastResponse, null, 2)
                  : `// Response payload will appear here after execution\n{\n  "jsonrpc": "2.0",\n  "result": {\n    "status": "READY_FOR_CALL"\n  }\n}`}
              </pre>
            </div>

            {/* Specification & Architecture Card */}
            <div className="p-4 bg-slate-100/70 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-600" />
                Real Model Context Protocol (MCP) Standards
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                This interface uses the standard MCP wire protocol (`tools/list`, `tools/call`, `resources/read`, `prompts/get`) with JSON-RPC 2.0. Tools map directly to live LMS microservices (Catalog, Progress, Assessments, and Vector RAG) and bridge dynamically into Google Gemini function calling.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
