import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Bot,
  Send,
  User,
  BookOpen,
  RefreshCw,
  ChevronDown,
  Database,
  Cpu,
  FileText,
  CheckCircle2,
  AlertCircle,
  Key,
  ExternalLink,
  Layers,
  Clock,
} from "lucide-react";
import { askRAGMentor, getAllKnowledgeDomains, syncLiveKnowledgeFromBackend } from "../../services/ragService";
import { getAllCourses } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";
import { isApiKeySet } from "../../services/geminiService";

function AIMentor() {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const domains = getAllKnowledgeDomains();

  useEffect(() => {
    boot();
  }, []);

  async function boot() {
    setApiKeyReady(isApiKeySet());
    try {
      const [u, cList] = await Promise.allSettled([getCurrentUser(), getAllCourses()]);
      if (u.status === "fulfilled") setCurrentUser(u.value);
      if (cList.status === "fulfilled" && Array.isArray(cList.value)) setCourses(cList.value);

      const params = new URLSearchParams(location.search);
      const q = params.get("query");
      if (q) setInputQuery(q);

      // Sync knowledge base
      setIsSyncing(true);
      const chunks = await syncLiveKnowledgeFromBackend();
      setChunkCount(chunks.length);
      setIsSyncing(false);

      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: `Hello ${u.value?.fullName || "Learner"}! I am your RAG Mentor powered by Google Gemini. I retrieve content from ${chunks.length} indexed sections of your course materials and generate grounded answers.\n\nI can answer questions about:\n- Course concepts and content\n- Your learning progress and records\n- Assessment topics\n- Career paths in the LMS catalog`,
          citations: [],
          model: isApiKeySet() ? "gemini-3.8-flash" : "retrieval-only",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e) {
      console.error(e);
      setIsSyncing(false);
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const saveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem("GEMINI_API_KEY", apiKeyInput.trim());
      setApiKeyReady(true);
      setShowApiSetup(false);
      setApiKeyInput("");
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isThinking) return;

    const queryToSend = inputQuery.trim();
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: queryToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsThinking(true);

    try {
      const chatHistory = messages.filter((m) => m.sender !== "system");
      const result = await askRAGMentor({
        query: queryToSend,
        domain: selectedDomain,
        courseId: selectedCourseId || null,
        learnerId: currentUser?.id,
        learner: currentUser,
        chatHistory,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: result.answer,
          citations: result.sources || [],
          model: result.model,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: `Error: ${err?.message || "Request failed. Check your API key and try again."}`,
          citations: [],
          model: "error",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const quickPrompts = [
    "Explain the main concepts in my enrolled courses",
    "What are my current learning gaps?",
    "Summarize my learning progress",
    "What topics are covered in this course?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">RAG Mentor</h1>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Database size={10} />
                  {isSyncing ? "Indexing..." : `${chunkCount} chunks indexed`}
                </span>
                <span className={`flex items-center gap-1 text-[11px] font-medium ${apiKeyReady ? "text-emerald-600" : "text-amber-600"}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${apiKeyReady ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {apiKeyReady ? "Gemini connected" : "No API key"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Scope selectors */}
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="all">All content</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.title} ({d.count})</option>
              ))}
            </select>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm"
            >
              <option value="">All courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>

            {!apiKeyReady && (
              <button
                onClick={() => setShowApiSetup(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <Key size={13} />
                Set API Key
              </button>
            )}

            <button
              onClick={() => { setIsSyncing(true); syncLiveKnowledgeFromBackend().then((c) => { setChunkCount(c.length); setIsSyncing(false); }); }}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Re-index knowledge base"
            >
              <RefreshCw size={15} className={isSyncing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* ── API Key Setup Banner ── */}
      {showApiSetup && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 shrink-0">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-start gap-3">
              <Key size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-900">Configure Gemini API Key</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Get a free key at{" "}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-semibold">
                    aistudio.google.com
                  </a>
                  {" "}or set VITE_GEMINI_API_KEY in your .env file.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIza..."
                    className="flex-1 bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                    onKeyDown={(e) => e.key === "Enter" && saveApiKey()}
                  />
                  <button onClick={saveApiKey} className="px-4 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors">
                    Save
                  </button>
                  <button onClick={() => setShowApiSetup(false)} className="px-3 py-1.5 text-amber-700 text-xs hover:bg-amber-100 rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Messages ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div key={m.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot size={16} />
                  </div>
                )}

                <div className={`max-w-3xl space-y-3 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`rounded-2xl px-4 py-3.5 text-[13px] leading-relaxed shadow-sm ${isUser
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
                    }`}>
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Citations */}
                    {!isUser && m.citations && m.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <Layers size={10} />
                          Retrieved Sources ({m.citations.length})
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {m.citations.slice(0, 4).map((src, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                              <div className="min-w-0">
                                <p className="text-[11px] font-semibold text-slate-900 truncate">{src.title}</p>
                                <p className="text-[10px] text-slate-500 truncate">{src.source}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                  {src.matchedTermCount > 0 ? `${src.matchedTermCount} terms` : "match"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                    {!isUser && m.model && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${m.model.startsWith("gemini")
                          ? "text-blue-600 bg-blue-50"
                          : m.model === "error"
                            ? "text-rose-600 bg-rose-50"
                            : "text-slate-500 bg-slate-100"
                        }`}>
                        {m.model}
                      </span>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-1">
                    {currentUser?.fullName?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm">
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span>Retrieving and generating answer...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ── Quick Prompts ── */}
      {messages.length <= 1 && (
        <div className="px-6 pb-3 shrink-0">
          <div className="max-w-5xl mx-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick prompts</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setInputQuery(p)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-[11px] text-slate-600 font-medium rounded-lg shadow-sm transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className="bg-white border-t border-slate-200 px-6 py-4 shrink-0">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask anything about your courses, progress, or learning goals..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors shadow-sm"
            />
            <button
              type="submit"
              disabled={isThinking || !inputQuery.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-40 flex items-center gap-2 shrink-0"
            >
              <Send size={16} />
              {isThinking ? "Thinking..." : "Ask"}
            </button>
          </form>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Responses grounded in {chunkCount} indexed course content chunks via Retrieval-Augmented Generation
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIMentor;
