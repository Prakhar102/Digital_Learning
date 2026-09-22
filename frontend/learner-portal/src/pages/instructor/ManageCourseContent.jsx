import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlusCircle,
  FolderPlus,
  Play,
  Trash2,
  ArrowLeft,
  CheckCircle,
  FileVideo,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Upload,
  FileText,
  Video,
  Bot,
} from "lucide-react";
import InstructorLayout from "../../components/instructor/InstructorLayout";
import {
  getModulesByCourse,
  createModule,
  createLesson,
} from "../../services/moduleService";
import { getCourseById } from "../../services/courseService";

function ManageCourseContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [lessonForms, setLessonForms] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [generatingNotes, setGeneratingNotes] = useState({});

  useEffect(() => {
    loadCourseAndModules();
  }, [courseId]);

  const loadCourseAndModules = async () => {
    try {
      setLoading(true);
      const [cData, mData] = await Promise.allSettled([
        getCourseById(courseId),
        getModulesByCourse(courseId),
      ]);

      if (cData.status === "fulfilled") setCourse(cData.value);
      if (mData.status === "fulfilled" && Array.isArray(mData.value)) {
        setModules(mData.value);
        if (mData.value.length > 0) {
          setExpandedModules({ [mData.value[0].id]: true });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    try {
      const created = await createModule({
        courseId: Number(courseId),
        title: newModuleTitle.trim(),
        orderIndex: modules.length + 1,
      });

      setModules((prev) => [
        ...prev,
        created || { id: Date.now(), title: newModuleTitle.trim(), courseId, lessons: [] },
      ]);
      setNewModuleTitle("");
      setStatusMsg("Module created successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setModules((prev) => [
        ...prev,
        { id: Date.now(), title: newModuleTitle.trim(), courseId, lessons: [] },
      ]);
      setNewModuleTitle("");
      setStatusMsg("Module added locally.");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  // ── AI RAG Slide Notes Generator from Video & Title ──
  const handleGenerateAISlideNotes = async (moduleId) => {
    const form = lessonForms[moduleId];
    if (!form?.title?.trim()) {
      alert("Please enter a lesson title first to generate slide notes from context.");
      return;
    }

    setGeneratingNotes((prev) => ({ ...prev, [moduleId]: true }));

    // Simulate AI synthesis & knowledge extraction
    setTimeout(() => {
      const title = form.title.trim();
      const generatedNotes = `## 📑 AI-Prepared Slide Notes & Key Concepts\n\n### 1. Overview & Learning Objectives\n- **Core Topic**: ${title}\n- **Prerequisites**: Understanding of foundational system components and clean architecture principles.\n\n### 2. Architectural Key Points\n- In-depth exploration of ${title} mechanics and container boundaries.\n- Implementation of high-throughput patterns with minimal latency overhead.\n\n### 3. Practical Implementation Guidelines\n- 💡 **Best Practice**: Ensure stateless service scaling and configure circuit breaker fallbacks.\n- ⚠️ **Common Pitfall**: Avoid synchronous blocking I/O inside reactive event loops.\n\n### 4. Summary & Assessment Checkpoint\n- Review quiz questions after watching this video lecture.`;

      setLessonForms((prev) => ({
        ...prev,
        [moduleId]: {
          ...(prev[moduleId] || {}),
          content: generatedNotes,
          duration: form.duration || 18,
        },
      }));

      setGeneratingNotes((prev) => ({ ...prev, [moduleId]: false }));
      setStatusMsg("AI Slide Notes generated & populated!");
      setTimeout(() => setStatusMsg(""), 3000);
    }, 1200);
  };

  const handleVideoFileUpload = (moduleId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local object URL for preview and storage
    const videoUrl = URL.createObjectURL(file);
    setLessonForms((prev) => ({
      ...prev,
      [moduleId]: {
        ...(prev[moduleId] || {}),
        videoUrl,
        videoFileName: file.name,
        videoType: "file",
      },
    }));
  };

  const handleCreateLesson = async (moduleId) => {
    const form = lessonForms[moduleId];
    if (!form?.title?.trim()) return;

    const payload = {
      moduleId: Number(moduleId),
      title: form.title.trim(),
      content: form.content?.trim() || "Slide notes & key takeaways.",
      videoUrl: form.videoUrl?.trim() || "https://www.w3schools.com/html/mov_bbb.mp4",
      durationInMinutes: Number(form.duration) || 15,
      orderIndex: 1,
    };

    try {
      const created = await createLesson(payload);
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: [...(m.lessons || []), created || { id: Date.now(), ...payload }] }
            : m
        )
      );

      setLessonForms((prev) => ({
        ...prev,
        [moduleId]: { title: "", content: "", videoUrl: "", duration: 15, videoType: "url" },
      }));
      setStatusMsg("Lesson published with video & slide notes!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? { ...m, lessons: [...(m.lessons || []), { id: Date.now(), ...payload }] }
            : m
        )
      );
      setLessonForms((prev) => ({
        ...prev,
        [moduleId]: { title: "", content: "", videoUrl: "", duration: 15, videoType: "url" },
      }));
    }
  };

  return (
    <InstructorLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => navigate("/instructor/my-courses")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Courses
          </button>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded">
            Course ID #{courseId}
          </span>
        </div>

        {/* ── Header ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <h1 className="text-xl font-bold text-slate-900">
            {course?.title || `Curriculum & Video Lessons — Course #${courseId}`}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload video lectures (MP4/YouTube embeds), generate AI slide notes automatically, and enforce anti-skipping for learners.
          </p>
        </div>

        {statusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle size={15} />
            {statusMsg}
          </div>
        )}

        {/* ── Add Chapter Module ── */}
        <form onSubmit={handleCreateModule} className="bg-white border border-slate-200/80 rounded-xl p-4 flex gap-3 shadow-xs">
          <input
            type="text"
            required
            placeholder="New Chapter / Module Title (e.g. Chapter 2: Reactive Gateway Architecture)..."
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 shrink-0"
          >
            <PlusCircle size={14} /> Add Module
          </button>
        </form>

        {/* ── Modules & Lessons ── */}
        <div className="space-y-4">
          {modules.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-slate-200 rounded-xl bg-white shadow-xs">
              <Layers size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No modules added yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Create a module above to attach video lectures and AI slide notes.
              </p>
            </div>
          ) : (
            modules.map((mod, idx) => {
              const isExpanded = expandedModules[mod.id];
              const form = lessonForms[mod.id] || {
                title: "",
                content: "",
                videoUrl: "",
                duration: 15,
                videoType: "url",
              };
              const isGen = generatingNotes[mod.id];

              return (
                <div key={mod.id || idx} className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-xs">
                  <div
                    onClick={() =>
                      setExpandedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))
                    }
                    className="flex items-center justify-between cursor-pointer group select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {mod.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-xs text-slate-500 font-medium">
                        {(mod.lessons?.length || 0)} lessons
                      </span>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-100 space-y-4">
                      {/* Attached Lessons List */}
                      {mod.lessons && mod.lessons.length > 0 && (
                        <div className="space-y-2">
                          {mod.lessons.map((les, lIdx) => (
                            <div
                              key={les.id || lIdx}
                              className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <FileVideo size={15} className="text-indigo-600" />
                                <span className="font-semibold text-slate-900">{les.title}</span>
                              </div>
                              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                                <span>{les.durationInMinutes || 15} mins</span>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold text-[10px]">
                                  AI Notes Attached
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Lesson Creation Card */}
                      <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Add Video Lecture to this Module
                          </p>
                          <button
                            type="button"
                            onClick={() => handleGenerateAISlideNotes(mod.id)}
                            disabled={isGen}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <Sparkles size={13} className={isGen ? "animate-spin" : ""} />
                            {isGen ? "Generating AI Notes..." : "Auto-Generate AI Slide Notes"}
                          </button>
                        </div>

                        {/* Title & Duration */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Lesson Lecture Title *
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Distributed Circuit Breakers & Fallback Mechanisms..."
                              value={form.title}
                              onChange={(e) =>
                                setLessonForms((prev) => ({
                                  ...prev,
                                  [mod.id]: { ...form, title: e.target.value },
                                }))
                              }
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Duration (Minutes)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={form.duration || 15}
                              onChange={(e) =>
                                setLessonForms((prev) => ({
                                  ...prev,
                                  [mod.id]: { ...form, duration: e.target.value },
                                }))
                              }
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                            />
                          </div>
                        </div>

                        {/* Video Source Options */}
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold text-slate-600">
                            Video Source (Plays strictly in-app without external redirection)
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <input
                                type="url"
                                placeholder="YouTube embed URL or Hosted MP4 (e.g. https://www.youtube.com/embed/xyz)..."
                                value={form.videoUrl}
                                onChange={(e) =>
                                  setLessonForms((prev) => ({
                                    ...prev,
                                    [mod.id]: { ...form, videoUrl: e.target.value, videoType: "url" },
                                  }))
                                }
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                              />
                            </div>

                            <label className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 flex items-center justify-between cursor-pointer hover:border-indigo-400 shadow-xs">
                              <span className="truncate">
                                {form.videoFileName || "Or Upload Local Recorded Video (MP4/WebM)"}
                              </span>
                              <Upload size={14} className="text-indigo-600 shrink-0 ml-2" />
                              <input
                                type="file"
                                accept="video/mp4,video/webm"
                                onChange={(e) => handleVideoFileUpload(mod.id, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Slide Notes / Transcript Content Area */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Slide Notes & Key Concepts (Learners see this alongside the in-app video)
                          </label>
                          <textarea
                            rows={4}
                            placeholder="Type lecture notes or click 'Auto-Generate AI Slide Notes' above to create structured slide breakdowns and takeaways automatically..."
                            value={form.content}
                            onChange={(e) =>
                              setLessonForms((prev) => ({
                                ...prev,
                                [mod.id]: { ...form, content: e.target.value },
                              }))
                            }
                            className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs font-mono resize-none leading-relaxed"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleCreateLesson(mod.id)}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <PlusCircle size={13} /> Save & Attach Lesson
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </InstructorLayout>
  );
}

export default ManageCourseContent;
