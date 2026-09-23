import { useState, useEffect } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  MCP_SERVERS,
  sendJsonRpcRequest,
} from "../../services/mcpService";
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
} from "lucide-react";

export default function MCPExplorer() {
  const [selectedServer, setSelectedServer] = useState(MCP_SERVERS[0]);
  const [selectedTool, setSelectedTool] = useState(MCP_SERVERS[0].tools[0]);
  const [toolInputs, setToolInputs] = useState({});
  const [activeTab, setActiveTab] = useState("tools"); // 'tools' | 'resources' | 'inspector'
  const [selectedResource, setSelectedResource] = useState(MCP_SERVERS[0].resources[0] || null);

  const [isLoading, setIsLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [copiedReq, setCopiedReq] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);
  const [execHistory, setExecHistory] = useState([]);

  // Set default tool inputs when tool changes
  useEffect(() => {
    if (selectedTool?.inputSchema?.properties) {
      const initial = {};
      Object.keys(selectedTool.inputSchema.properties).forEach((key) => {
        const prop = selectedTool.inputSchema.properties[key];
        if (key === "userId") initial[key] = "usr_student_01";
        else if (key === "courseId") initial[key] = "1";
        else if (key === "watchPercentage") initial[key] = 95;
        else if (key === "gradeScore") initial[key] = 92;
        else if (prop.default) initial[key] = prop.default;
        else if (prop.type === "string") initial[key] = key === "query" ? "vector search" : "Sample Parameter";
        else if (prop.type === "number") initial[key] = 100;
        else initial[key] = "";
      });
      setToolInputs(initial);
    }
  }, [selectedTool]);

  const handleSelectServer = (server) => {
    setSelectedServer(server);
    setSelectedTool(server.tools[0] || null);
    setSelectedResource(server.resources[0] || null);
  };

  const handleInputChange = (field, value) => {
    setToolInputs((prev) => ({ ...prev, [field]: value }));
  };

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

    setExecHistory((prev) => [
      {
        id: Date.now(),
        tool: selectedTool.name,
        server: selectedServer.name,
        latency: resp?.meta?.latencyMs || 15,
        status: resp?.error ? "ERROR" : "SUCCESS",
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 7),
    ]);
  };

  const executeResourceRead = async (resUri) => {
    setIsLoading(true);
    const rpcReq = {
      jsonrpc: "2.0",
      id: "req_" + Math.random().toString(36).substring(2, 9),
      method: "resources/read",
      params: { uri: resUri },
    };
    setLastRequest(rpcReq);
    const resp = await sendJsonRpcRequest(selectedServer.uri, "resources/read", { uri: resUri });
    setLastResponse(resp);
    setIsLoading(false);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    if (type === "req") {
      setCopiedReq(true);
      setTimeout(() => setCopiedReq(false), 2000);
    } else {
      setCopiedRes(true);
      setTimeout(() => setCopiedRes(false), 2000);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                <Cpu size={12} />
                Phase 4 Protocol Integration
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck size={12} />
                JSON-RPC 2.0 Compliant
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1.5 flex items-center gap-2">
              Model Context Protocol (MCP) Server Explorer
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Inspect, query, and invoke tools across all 4 enterprise MCP servers using standard JSON-RPC 2.0 transport.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSelectServer(selectedServer)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              <RefreshCw size={13} />
              Ping Protocol Gateways
            </button>
          </div>
        </div>

        {/* ── 4 MCP Server Grid Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {MCP_SERVERS.map((server) => {
            const isSelected = selectedServer.id === server.id;
            return (
              <div
                key={server.id}
                onClick={() => handleSelectServer(server)}
                className={`
                  p-4 rounded-xl border transition-all cursor-pointer relative
                  ${isSelected
                    ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    <Server size={18} />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {server.latency}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3 truncate">{server.name}</h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{server.uri}</p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {server.description}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{server.tools.length} Tools</span>
                  <span>{server.resources.length} Resources</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Main Protocol Studio Area ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tool Catalog & Input Schema Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Tabs for Tools vs Resources */}
            <div className="bg-white rounded-xl border border-slate-200 p-1 flex gap-1 shadow-xs">
              <button
                onClick={() => setActiveTab("tools")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                  activeTab === "tools"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Zap size={14} />
                Tools Sandbox ({selectedServer.tools.length})
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                  activeTab === "resources"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Layers size={14} />
                Server Resources ({selectedServer.resources.length})
              </button>
            </div>

            {activeTab === "tools" ? (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SELECT MCP TOOL FUNCTION
                  </label>
                  <select
                    value={selectedTool?.name}
                    onChange={(e) => {
                      const t = selectedServer.tools.find((x) => x.name === e.target.value);
                      setSelectedTool(t);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {selectedServer.tools.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTool && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      {selectedTool.description}
                    </p>
                  </div>
                )}

                {/* Dynamic Parameter Fields based on inputSchema */}
                {selectedTool?.inputSchema?.properties && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 block">
                      TOOL PARAMETERS (INPUT SCHEMA)
                    </span>
                    {Object.entries(selectedTool.inputSchema.properties).map(([key, schema]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-mono font-semibold text-slate-700">
                            {key}{" "}
                            {selectedTool.inputSchema.required?.includes(key) && (
                              <span className="text-rose-500">*</span>
                            )}
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {schema.type}
                          </span>
                        </div>

                        {schema.enum ? (
                          <select
                            value={toolInputs[key] || schema.default || ""}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          >
                            {schema.enum.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={schema.type === "number" ? "number" : "text"}
                            value={toolInputs[key] !== undefined ? toolInputs[key] : ""}
                            onChange={(e) =>
                              handleInputChange(
                                key,
                                schema.type === "number" ? Number(e.target.value) : e.target.value
                              )
                            }
                            placeholder={schema.description}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          {schema.description}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={executeJsonRpcCall}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Dispatching JSON-RPC 2.0...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Invoke Tool via JSON-RPC 2.0
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Resources Tab */
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
                <span className="text-xs font-bold text-slate-700 block">
                  AVAILABLE SERVER RESOURCES
                </span>
                <div className="space-y-2">
                  {selectedServer.resources.map((res) => (
                    <div
                      key={res.uri}
                      onClick={() => {
                        setSelectedResource(res);
                        executeResourceRead(res.uri);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        selectedResource?.uri === res.uri
                          ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-800">{res.name}</p>
                      <p className="text-[10px] text-blue-600 font-mono mt-0.5 break-all">{res.uri}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{res.mimeType}</span>
                        <span className="text-blue-600 font-semibold hover:underline">Read Resource &rarr;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Execution History Tracker */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                <Activity size={13} className="text-blue-600" />
                RECENT JSON-RPC INVOCATIONS
              </span>
              {execHistory.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-3 text-center">
                  No MCP tools called yet. Select a tool and execute to record traces.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {execHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[11px] font-bold text-slate-800 truncate">
                          {item.tool}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{item.server}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-500">{item.latency}ms</span>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: JSON-RPC 2.0 Live Inspector (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Inspector Header */}
              <div className="px-5 py-3.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={15} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">
                    JSON-RPC 2.0 PROTOCOL INSPECTOR
                  </span>
                </div>
                {lastResponse?.meta && (
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] flex items-center gap-1">
                      <Clock size={11} className="text-blue-500" />
                      {lastResponse.meta.latencyMs}ms
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-[11px] font-bold">
                      200 OK
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-5">
                {/* Outgoing Request Payload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Code2 size={13} />
                      OUTGOING REQUEST (CLIENT &rarr; MCP SERVER)
                    </span>
                    {lastRequest && (
                      <button
                        onClick={() => copyToClipboard(lastRequest, "req")}
                        className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        {copiedReq ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        {copiedReq ? "Copied" : "Copy Payload"}
                      </button>
                    )}
                  </div>
                  <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-52 border border-slate-800">
                    {lastRequest
                      ? JSON.stringify(lastRequest, null, 2)
                      : `// Ready to dispatch JSON-RPC 2.0 request\n{\n  "jsonrpc": "2.0",\n  "method": "tools/call",\n  "params": {\n    "name": "${selectedTool?.name || "get_student_enrollments"}"\n  }\n}`}
                  </pre>
                </div>

                {/* Incoming Response Payload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <FileCode size={13} />
                      INCOMING RESPONSE (MCP SERVER &rarr; CLIENT)
                    </span>
                    {lastResponse && (
                      <button
                        onClick={() => copyToClipboard(lastResponse, "res")}
                        className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1"
                      >
                        {copiedRes ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        {copiedRes ? "Copied" : "Copy Response"}
                      </button>
                    )}
                  </div>
                  <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-96 border border-slate-800">
                    {lastResponse
                      ? JSON.stringify(lastResponse, null, 2)
                      : `// Execute tool or read resource above to inspect incoming JSON-RPC payload\n{\n  "jsonrpc": "2.0",\n  "result": {\n    "status": "IDLE_AWAITING_CALL"\n  }\n}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Architecture Standards & Specification Badge */}
            <div className="p-4 bg-slate-100/60 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">
                Model Context Protocol Architectural Adherence:
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                All 4 MCP Servers implement bidirectional JSON-RPC 2.0 framing over standard transport. Tool definitions declare explicit JSON Schema primitives, supporting multi-agent tool binding, continuous telemetry logging, and tamper-resistant audit verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
