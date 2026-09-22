import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  FileText,
  Award,
  Brain,
  Layers,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Search,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { askRAGMentor, getAllKnowledgeDomains } from "../../services/ragService";
import { getAllCourses } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";

function AIMentor() {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const chatEndRef = useRef(null);

  const domains = getAllKnowledgeDomains();

  useEffect(() => {
    loadContext();
  }, []);

  const loadContext = async () => {
    try {
      const [u, cList] = await Promise.allSettled([
        getCurrentUser(),
        getAllCourses(),
      ]);
      if (u.status === "fulfilled") setCurrentUser(u.value);
      if (cList.status === "fulfilled" && Array.isArray(cList.value)) {
        setCourses(cList.value);
      }

      // Check URL query parameters
      const params = new URLSearchParams(location.search);
      const q = params.get("query");
      if (q) {
        setInputQuery(q);
      }

      // Welcome initial message
      setMessages([
        {
          id: "welcome-1",
          sender: "ai",
          text: `Hello ${u.value?.fullName || "Scholar"}! I am your **Digital Learning Mentor (RAG AI Assistant)**.\n\nI can retrieve grounded answers with direct citations across our **Course Material Repository**, **Learning References**, **Certification Guides**, and **Skill Framework Knowledge Base**. How can I assist your study today?`,
          citations: [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || isThinking) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputQuery.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const queryToSend = inputQuery.trim();
    setInputQuery("");
    setIsThinking(true);

    try {
      const result = await askRAGMentor({
        query: queryToSend,
        domain: selectedDomain,
        courseId: selectedCourseId || null,
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: result.answer,
        citations: result.sources || [],
        tokensUsed: result.tokensUsed || 250,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "I encountered a transient retrieval error querying the knowledge vector database. Please try again.",
          citations: [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const samplePrompts = [
    { title: "Explain Saga Pattern vs 2PC", domain: "course-materials" },
    { title: "What are the CCMA certification exam domains?", domain: "certification-guides" },
    { title: "How does Eureka client load balancing work?", domain: "course-materials" },
    { title: "What SFIA competency levels exist for Software Engineers?", domain: "skill-frameworks" },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6 flex flex-col h-[calc(100vh-2rem)]">
        {/* ── Top Bar / Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded uppercase tracking-wider">
                Phase 2 RAG Knowledge Assistant
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              AI Learning Mentor & Context Retriever
            </h1>
          </div>

          {/* Scope Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 shadow-xs"
            >
              <option value="all">🌐 All 4 Knowledge Domains</option>
              <option value="course-materials">📚 Course Materials Only</option>
              <option value="learning-references">📖 Learning References Only</option>
              <option value="certification-guides">🎓 Certification Guides Only</option>
              <option value="skill-frameworks">🧠 Skill Frameworks Only</option>
            </select>

            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600 shadow-xs"
            >
              <option value="">All Courses Context</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  Course #{c.id}: {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Chat Messages Stream ── */}
        <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-6 overflow-y-auto space-y-5 shadow-xs">
          {messages.map((m) => {
            const isUser = m.sender === "user";

            return (
              <div
                key={m.id}
                className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot size={18} />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4.5 space-y-3 text-xs leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white font-medium rounded-tr-xs"
                      : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Verified Citations List */}
                  {!isUser && m.citations && m.citations.length > 0 && (
                    <div className="pt-3 border-t border-slate-200/70 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Verified Grounded Sources ({m.citations.length})
                      </p>
                      <div className="space-y-1.5">
                        {m.citations.map((src, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-xs"
                          >
                            <div>
                              <p className="text-[11px] font-bold text-slate-900">{src.title}</p>
                              <p className="text-[10px] text-slate-500">{src.source}</p>
                            </div>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded shrink-0">
                              {src.confidenceScore || 95}% Match
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] ${
                      isUser ? "text-blue-100 text-right" : "text-slate-400"
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {currentUser?.fullName?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            );
          })}

          {isThinking && (
            <div className="flex gap-3.5 items-start">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Bot size={18} />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-4 flex items-center gap-2 text-xs text-slate-500">
                <Sparkles size={14} className="text-blue-600 animate-spin" />
                Retrieving vector embeddings & synthesizing verified answer...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ── Prompt Suggestions Bar ── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested Queries:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedDomain(p.domain);
                setInputQuery(p.title);
              }}
              className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium whitespace-nowrap shadow-xs transition-colors"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* ── Input Box ── */}
        <form onSubmit={handleSendMessage} className="flex gap-3 shrink-0">
          <input
            type="text"
            placeholder="Ask anything across your course lectures, certification guides, or skill taxonomy..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs transition-colors"
          />
          <button
            type="submit"
            disabled={isThinking || !inputQuery.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            <Send size={14} />
            Ask RAG Mentor
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AIMentor;
