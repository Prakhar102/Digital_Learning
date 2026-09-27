import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, GraduationCap } from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getKnowledgeByDomain, searchKnowledgeBase, syncLiveKnowledgeFromBackend } from "../../services/ragService";

export default function SocraticDebate() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [answer, setAnswer] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    syncLiveKnowledgeFromBackend().then(() => {
      if (!active) return;
      const content = getKnowledgeByDomain("course-materials");
      setMaterials(content);
      setSelectedId(content[0]?.id || "");
    }).catch((err) => setError(err?.message || "Could not load course material."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const current = materials.find((item) => item.id === selectedId);
  const handleReview = async () => {
    if (!answer.trim() || !current) return;
    setSearching(true);
    setEvidence([]);
    setError("");
    try {
      const results = await searchKnowledgeBase({ query: `${current.title} ${answer}`, courseId: current.courseId, limit: 5 });
      setEvidence(results);
    } catch (err) {
      setError(err?.message || "Course content search failed.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded uppercase tracking-wider">LMS Grounded Reflection</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">Course Reflection</h1>
            <p className="text-sm text-slate-500 mt-1">Reflect on actual course material and retrieve related passages. This page does not score or generate AI feedback.</p>
          </div>
          <button onClick={() => navigate("/agent-studio")} className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg">Open Agent Studio</button>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading course materials from the LMS…</p> : materials.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {materials.map((item) => <button key={item.id} onClick={() => { setSelectedId(item.id); setEvidence([]); }} className={`p-4 rounded-xl text-left border text-xs ${selectedId === item.id ? "bg-blue-50 border-blue-500 text-blue-900" : "bg-white border-slate-200 text-slate-700"}`}>
              <span className="text-[10px] text-slate-400 block mb-1">{item.category} · Course {item.courseId}</span>{item.title}
            </button>)}
          </div>
        ) : <div className="p-8 bg-white border border-slate-200 rounded-xl text-sm text-slate-600">No course descriptions, module notes, or lesson text are available to reflect on yet.</div>}

        {current && <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2"><BookOpen size={18} className="text-blue-600"/><h2 className="font-bold text-slate-900">{current.title}</h2></div>
          <p className="text-xs text-slate-500">Source: {current.source}</p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 whitespace-pre-line">{current.content}</div>
          <label className="block text-xs font-bold text-slate-700">Your reflection</label>
          <textarea rows={5} placeholder="Write your understanding or a question about this material…" value={answer} onChange={(event) => setAnswer(event.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 resize-y" />
          <button onClick={handleReview} disabled={!answer.trim() || searching} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2"><Search size={14}/>{searching ? "Searching course material…" : "Find related passages"}</button>
        </section>}

        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        {evidence.length > 0 && <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2"><GraduationCap size={18} className="text-blue-600"/><h2 className="font-bold text-slate-900">Related course material</h2></div>
          {evidence.map((item) => <article key={item.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl"><h3 className="text-sm font-bold">{item.title}</h3><p className="text-xs text-slate-500 mt-1">{item.source}</p><p className="text-sm text-slate-700 mt-3">{item.matchedExcerpt}</p></article>)}
        </section>}
        {!loading && current && answer.trim() && !searching && evidence.length === 0 && <p className="text-sm text-slate-500">No matching passage found for the reflection in this course's current content.</p>}
      </div>
    </DashboardLayout>
  );
}
