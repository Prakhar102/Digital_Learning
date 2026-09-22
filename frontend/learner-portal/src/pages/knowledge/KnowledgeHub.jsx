import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpen,
  FileText,
  Award,
  Brain,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  Tag,
  Copy,
  Calendar,
  X,
  Bot,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import {
  searchKnowledgeBase,
  getAllKnowledgeDomains,
  getKnowledgeByDomain,
} from "../../services/ragService";

function KnowledgeHub() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [copied, setCopied] = useState(false);

  const domains = getAllKnowledgeDomains();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchKnowledgeBase({
        query: searchQuery,
        domain: activeTab === "all" ? "all" : activeTab,
        limit: 8,
      });
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    }
  }, [activeTab]);

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentItems =
    activeTab === "all"
      ? domains.flatMap((d) => getKnowledgeByDomain(d.id).map((i) => ({ ...i, domain: d.id })))
      : getKnowledgeByDomain(activeTab).map((i) => ({ ...i, domain: activeTab }));

  const getDomainIcon = (domainKey) => {
    switch (domainKey) {
      case "course-materials":
        return <BookOpen size={16} className="text-blue-600" />;
      case "learning-references":
        return <FileText size={16} className="text-indigo-600" />;
      case "certification-guides":
        return <Award size={16} className="text-amber-600" />;
      case "skill-frameworks":
        return <Brain size={16} className="text-purple-600" />;
      default:
        return <Layers size={16} className="text-slate-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded uppercase tracking-wider">
                Phase 2 Knowledge Assistant
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              RAG Knowledge Base Explorer
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Semantic repository covering Course Materials, Architecture References, Certification Blueprints, and Skill Frameworks.
            </p>
          </div>

          <button
            onClick={() => navigate("/ai-mentor")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Bot size={15} />
            Ask AI Mentor (RAG)
          </button>
        </div>

        {/* ── Semantic Search Box ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search across lecture transcripts, certification roadmaps, SFIA skills, or design patterns (e.g. 'Saga pattern', 'Eureka heartbeat', 'Kubernetes rubric')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Sparkles size={14} />
              {isSearching ? "Searching Vector Index..." : "Semantic Search"}
            </button>
          </form>

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Filter Domain:
            </span>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              All Domains
            </button>
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveTab(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === d.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                {d.title}
                <span className="text-[10px] opacity-75 font-normal">({d.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Semantic Search Results (If query active) ── */}
        {searchQuery.trim() && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                RAG Vector Search Results ({searchResults.length})
              </h2>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Clear Search
              </button>
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500">No direct semantic matches found. Try broadening your query terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => setSelectedDoc(res)}
                    className="bg-white border border-slate-200/80 rounded-xl p-5 hover:border-blue-500/60 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          {getDomainIcon(res.domain)}
                          {res.category}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {res.confidenceScore}% Match
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {res.title}
                      </h3>

                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {res.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[200px]">Source: {res.source}</span>
                      <span className="text-blue-600 font-semibold flex items-center gap-1">
                        Read Excerpt <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 4 Knowledge Domain Overview Cards ── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Curated Knowledge Collections
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {domains.map((d) => (
              <div
                key={d.id}
                onClick={() => setActiveTab(d.id)}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  activeTab === d.id
                    ? "bg-blue-50/50 border-blue-500 shadow-xs"
                    : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div>
                  <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                    {getDomainIcon(d.id)}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{d.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{d.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{d.count} Indexed Documents</span>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Documents List for Active Tab ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">
              Repository Index: {activeTab === "all" ? "All Collections" : domains.find((d) => d.id === activeTab)?.title}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {currentItems.length} documents
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {currentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedDoc(item)}
                className="p-6 hover:bg-slate-50/70 transition-colors cursor-pointer space-y-3 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {getDomainIcon(item.domain)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.source} • Updated: {item.lastUpdated || "2026"}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded self-start md:self-auto">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-10">
                  {item.content}
                </p>

                <div className="flex items-center gap-2 pl-10 pt-1 flex-wrap">
                  {item.tags?.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200/80 rounded"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Document Reader Modal ── */}
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    {getDomainIcon(selectedDoc.domain)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedDoc.title}</h3>
                    <p className="text-[11px] text-slate-500">{selectedDoc.source}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-slate-800 leading-relaxed text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Verified Citation Metadata
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-900">
                    ID: {selectedDoc.id} • Category: {selectedDoc.category}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Indexed for RAG semantic vector similarity search
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Document Text & Content Payload
                  </h4>
                  <p className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-sans">
                    {selectedDoc.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedDoc.tags?.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-lg"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <button
                  onClick={() => handleCopyText(selectedDoc.content)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Copy size={13} />
                  {copied ? "Copied to Clipboard!" : "Copy Excerpt"}
                </button>

                <button
                  onClick={() => navigate(`/ai-mentor?query=${encodeURIComponent(selectedDoc.title)}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Bot size={14} /> Ask AI Mentor About This
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default KnowledgeHub;
