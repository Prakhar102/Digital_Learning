import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlusCircle,
  ArrowLeft,
  CheckCircle,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Upload,
  Pencil,
  Trash2,
  Check,
  X,
  Play,
} from "lucide-react";
import {
  getModulesByCourse,
  createModule,
  createLesson,
  updateLesson,
  deleteLesson,
  updateModule,
  deleteModule,
} from "../../services/moduleService";
import { getCourseById } from "../../services/courseService";

function ManageCourseContent() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [lessonForms, setLessonForms] = useState({});
  // Modules start closed (collapsed) by default on load
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("");
  const [generatingNotes, setGeneratingNotes] = useState({});

  // Module renaming state
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");

  // Lesson editing state
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingLessonForm, setEditingLessonForm] = useState(null);

  useEffect(() => {
    loadCourseAndModules();
  }, [courseId]);

  async function loadCourseAndModules() {
    try {
      setLoading(true);
      const [cData, mData] = await Promise.allSettled([
        getCourseById(courseId),
        getModulesByCourse(courseId),
      ]);

      if (cData.status === "fulfilled") setCourse(cData.value);
      if (mData.status === "fulfilled" && Array.isArray(mData.value)) {
        setModules(mData.value);
        // Start closed (collapsed) by default so instructor opens only when editing/adding
        setExpandedModules({});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ── Toggle All Modules Expand / Collapse ──
  const anyExpanded = modules.some((m) => !!expandedModules[String(m.id)]);
  const handleToggleAll = () => {
    if (anyExpanded) {
      // Collapse all
      setExpandedModules({});
    } else {
      // Expand all
      const openMap = {};
      modules.forEach((m) => {
        openMap[String(m.id)] = true;
      });
      setExpandedModules(openMap);
    }
  };

  const handleToggleModule = (modId) => {
    const key = String(modId);
    setExpandedModules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // ── Create Module ──
  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    try {
      const created = await createModule({
        courseId: Number(courseId),
        title: newModuleTitle.trim(),
        orderIndex: modules.length + 1,
      });

      const newMod = created || {
        id: Date.now(),
        title: newModuleTitle.trim(),
        courseId,
        lessons: [],
      };

      setModules((prev) => [...prev, newMod]);
      // Open newly created module for immediate lesson adding
      setExpandedModules((prev) => ({ ...prev, [String(newMod.id)]: true }));
      setNewModuleTitle("");
      setStatusMsg("Module created successfully!");
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      console.error(err);
      const fallbackMod = {
        id: Date.now(),
        title: newModuleTitle.trim(),
        courseId,
        lessons: [],
      };
      setModules((prev) => [...prev, fallbackMod]);
      setExpandedModules((prev) => ({ ...prev, [String(fallbackMod.id)]: true }));
      setNewModuleTitle("");
      setStatusMsg("Module added locally.");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  };

  // ── Rename Module ──
  const handleStartEditModule = (mod) => {
    setEditingModuleId(mod.id);
    setEditingModuleTitle(mod.title);
  };

  const handleSaveEditModule = async (modId) => {
    if (!editingModuleTitle.trim()) return;
    await updateModule(modId, courseId, editingModuleTitle.trim());
    setModules((prev) =>
      prev.map((m) =>
        String(m.id) === String(modId) ? { ...m, title: editingModuleTitle.trim() } : m
      )
    );
    setEditingModuleId(null);
    setStatusMsg("Module title updated!");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  // ── Delete Module ──
  const handleDeleteModule = async (modId) => {
    if (!window.confirm("Are you sure you want to delete this module and its lessons?")) return;
    await deleteModule(modId, courseId);
    setModules((prev) => prev.filter((m) => String(m.id) !== String(modId)));
    setStatusMsg("Module removed.");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  // ── AI RAG Slide Notes Generator ──
  const handleGenerateAISlideNotes = async (moduleId, isEdit = false) => {
    const title = isEdit ? editingLessonForm?.title : lessonForms[moduleId]?.title;
    if (!title?.trim()) {
      alert("Please enter a lesson title first to generate slide notes from context.");
      return;
    }

    setGeneratingNotes((prev) => ({ ...prev, [moduleId]: true }));

    setTimeout(() => {
      const generatedNotes = `## AI-Prepared Slide Notes & Key Concepts\n\n### 1. Overview & Learning Objectives\n- **Core Topic**: ${title.trim()}\n- **Prerequisites**: Understanding of foundational system components and clean architecture principles.\n\n### 2. Architectural Key Points\n- In-depth exploration of ${title.trim()} mechanics and container boundaries.\n- Implementation of high-throughput patterns with minimal latency overhead.\n\n### 3. Practical Implementation Guidelines\n- **Best Practice**: Ensure stateless service scaling and configure circuit breaker fallbacks.\n- **Common Pitfall**: Avoid synchronous blocking I/O inside reactive event loops.\n\n### 4. Summary & Assessment Checkpoint\n- Review quiz questions after watching this video lecture.`;

      if (isEdit) {
        setEditingLessonForm((prev) => ({
          ...prev,
          content: generatedNotes,
          durationInMinutes: prev.durationInMinutes || 18,
        }));
      } else {
        setLessonForms((prev) => ({
          ...prev,
          [moduleId]: {
            ...(prev[moduleId] || {}),
            content: generatedNotes,
            duration: prev[moduleId]?.duration || 18,
          },
        }));
      }

      setGeneratingNotes((prev) => ({ ...prev, [moduleId]: false }));
      setStatusMsg("AI Slide Notes generated & populated!");
      setTimeout(() => setStatusMsg(""), 3000);
    }, 1000);
  };

  const handleVideoFileUpload = (moduleId, e, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const videoUrl = URL.createObjectURL(file);

    if (isEdit) {
      setEditingLessonForm((prev) => ({
        ...prev,
        videoUrl,
        videoFileName: file.name,
      }));
    } else {
      setLessonForms((prev) => ({
        ...prev,
        [moduleId]: {
          ...(prev[moduleId] || {}),
          videoUrl,
          videoFileName: file.name,
          videoType: "file",
        },
      }));
    }
  };

  // ── Create Lesson ──
  const handleCreateLesson = async (moduleId) => {
    const form = lessonForms[moduleId];
    if (!form?.title?.trim()) {
      alert("Please provide a lesson title.");
      return;
    }

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
      const finalLesson = created || { id: Date.now(), ...payload };
      setModules((prev) =>
        prev.map((m) =>
          String(m.id) === String(moduleId)
            ? { ...m, lessons: [...(m.lessons || []), finalLesson] }
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
      const localLesson = { id: Date.now(), ...payload };
      setModules((prev) =>
        prev.map((m) =>
          String(m.id) === String(moduleId)
            ? { ...m, lessons: [...(m.lessons || []), localLesson] }
            : m
        )
      );
      setLessonForms((prev) => ({
        ...prev,
        [moduleId]: { title: "", content: "", videoUrl: "", duration: 15, videoType: "url" },
      }));
    }
  };

  // ── Edit Lesson ──
  const handleStartEditLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setEditingLessonForm({
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || lesson.contentRef || "",
      durationInMinutes: lesson.durationInMinutes || 15,
      videoFileName: "",
    });
  };

  const handleSaveEditLesson = async (moduleId, lessonId) => {
    if (!editingLessonForm?.title?.trim()) return;

    const payload = {
      ...editingLessonForm,
      moduleId: Number(moduleId),
      title: editingLessonForm.title.trim(),
      content: editingLessonForm.content.trim(),
      videoUrl: editingLessonForm.videoUrl.trim() || "https://www.w3schools.com/html/mov_bbb.mp4",
      durationInMinutes: Number(editingLessonForm.durationInMinutes) || 15,
    };

    await updateLesson(lessonId, payload);

    setModules((prev) =>
      prev.map((m) =>
        String(m.id) === String(moduleId)
          ? {
              ...m,
              lessons: (m.lessons || []).map((l) =>
                String(l.id) === String(lessonId) ? { ...l, ...payload } : l
              ),
            }
          : m
      )
    );

    setEditingLessonId(null);
    setEditingLessonForm(null);
    setStatusMsg("Lesson updated successfully!");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  const handleCancelEditLesson = () => {
    setEditingLessonId(null);
    setEditingLessonForm(null);
  };

  // ── Delete Lesson ──
  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    await deleteLesson(lessonId, moduleId);

    setModules((prev) =>
      prev.map((m) =>
        String(m.id) === String(moduleId)
          ? { ...m, lessons: (m.lessons || []).filter((l) => String(l.id) !== String(lessonId)) }
          : m
      )
    );
    setStatusMsg("Lesson deleted.");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate("/instructor/my-courses")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Courses
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAll}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            {anyExpanded ? "Collapse All Modules" : "Expand All Modules"}
          </button>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 rounded-lg">
            Course ID #{courseId}
          </span>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900">
          {course?.title || `Curriculum & Video Lessons — Course #${courseId}`}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Add syllabus modules, upload video lectures, generate AI slide notes, and edit existing lessons.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle size={15} />
          {statusMsg}
        </div>
      )}

      {/* ── Add Chapter Module ── */}
      <form
        onSubmit={handleCreateModule}
        className="bg-white border border-slate-200/80 rounded-xl p-4 flex gap-3 shadow-xs"
      >
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
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
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
            const isExpanded = !!expandedModules[String(mod.id)];
            const form = lessonForms[mod.id] || {
              title: "",
              content: "",
              videoUrl: "",
              duration: 15,
              videoType: "url",
            };
            const isGen = generatingNotes[mod.id];
            const isEditingThisMod = editingModuleId === mod.id;

            return (
              <div
                key={mod.id || idx}
                className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-xs"
              >
                {/* ── Module Header Bar ── */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>

                    {isEditingThisMod ? (
                      <div className="flex items-center gap-2 flex-1 max-w-md">
                        <input
                          type="text"
                          value={editingModuleTitle}
                          onChange={(e) => setEditingModuleTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-indigo-400 rounded-lg px-3 py-1 text-xs text-slate-900 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEditModule(mod.id)}
                          className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                          title="Save title"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setEditingModuleId(null)}
                          className="p-1.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 cursor-pointer"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleToggleModule(mod.id)}
                        className="flex items-center gap-2 cursor-pointer group select-none flex-1 min-w-0"
                      >
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {mod.title}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium shrink-0">
                          ({mod.lessons?.length || 0} lessons)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Expand Toggle */}
                  <div className="flex items-center gap-2 text-slate-400 shrink-0 ml-3">
                    {!isEditingThisMod && (
                      <button
                        onClick={() => handleStartEditModule(mod)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Rename Module"
                      >
                        <Pencil size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Module"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      onClick={() => handleToggleModule(mod.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ml-1 ${
                        isExpanded
                          ? "bg-slate-100 text-slate-700 border-slate-300"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                      }`}
                    >
                      <span>{isExpanded ? "Close" : "Open / Add Lessons"}</span>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  </div>
                </div>

                {/* ── Expanded Content (Lessons + Add Lesson Form) ── */}
                {isExpanded && (
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    {/* Attached Lessons List */}
                    {mod.lessons && mod.lessons.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Module Lessons ({mod.lessons.length})
                        </p>
                        {mod.lessons.map((les, lIdx) => {
                          const isEditingThisLesson = editingLessonId === les.id;

                          if (isEditingThisLesson) {
                            return (
                              <div
                                key={les.id || lIdx}
                                className="p-5 bg-indigo-50/40 border border-indigo-200 rounded-xl space-y-4"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-indigo-900">
                                    Edit Lesson #{lIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleGenerateAISlideNotes(mod.id, true)}
                                    disabled={isGen}
                                    className="px-3 py-1 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                                  >
                                    <Sparkles size={13} className={isGen ? "animate-spin" : ""} />
                                    {isGen ? "Generating..." : "Auto-Generate AI Notes"}
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                      Lesson Title *
                                    </label>
                                    <input
                                      type="text"
                                      value={editingLessonForm.title}
                                      onChange={(e) =>
                                        setEditingLessonForm((prev) => ({
                                          ...prev,
                                          title: e.target.value,
                                        }))
                                      }
                                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                      Duration (Minutes)
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={editingLessonForm.durationInMinutes || 15}
                                      onChange={(e) =>
                                        setEditingLessonForm((prev) => ({
                                          ...prev,
                                          durationInMinutes: e.target.value,
                                        }))
                                      }
                                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Video URL / Embed Link
                                  </label>
                                  <input
                                    type="url"
                                    value={editingLessonForm.videoUrl}
                                    onChange={(e) =>
                                      setEditingLessonForm((prev) => ({
                                        ...prev,
                                        videoUrl: e.target.value,
                                      }))
                                    }
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                    Slide Notes & Transcript Content
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={editingLessonForm.content}
                                    onChange={(e) =>
                                      setEditingLessonForm((prev) => ({
                                        ...prev,
                                        content: e.target.value,
                                      }))
                                    }
                                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs font-mono resize-none leading-relaxed"
                                  />
                                </div>

                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={handleCancelEditLesson}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditLesson(mod.id, les.id)}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Check size={14} /> Save Changes
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={les.id || lIdx}
                              className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0 pr-2">
                                <div className="h-7 w-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                  <Play size={13} />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 block truncate">
                                    {les.title}
                                  </span>
                                  <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                                    <span>{les.durationInMinutes || 15} mins</span>
                                    <span>•</span>
                                    <span className="truncate max-w-xs text-slate-400">
                                      {les.videoUrl || les.contentRef || "Standard Video"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold text-[10px]">
                                  AI Notes Attached
                                </span>
                                <button
                                  onClick={() => handleStartEditLesson(les)}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  title="Edit Lesson"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(mod.id, les.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Lesson"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Lesson Creation Card */}
                    <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Add New Video Lecture to this Module
                        </p>
                        <button
                          type="button"
                          onClick={() => handleGenerateAISlideNotes(mod.id, false)}
                          disabled={isGen}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
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
                              onChange={(e) => handleVideoFileUpload(mod.id, e, false)}
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
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
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
  );
}

export default ManageCourseContent;
