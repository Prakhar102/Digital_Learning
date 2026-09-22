import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  PlusCircle,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Send,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  Eye,
} from "lucide-react";
import InstructorLayout from "../../components/instructor/InstructorLayout";
import { createCourse } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";
import { TECH_THUMBNAIL_PRESETS, getAutoThumbnail } from "../../utils/courseThumbnails";
import UdemyCourseCard from "../../components/course/UdemyCourseCard";

function CreateCourse() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Software Engineering",
    level: "BEGINNER",
    imageUrl: "",
    price: 449,
  });

  const [selectedPresetId, setSelectedPresetId] = useState(TECH_THUMBNAIL_PRESETS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  // Automatically update suggested 3D thumbnail when title or category changes
  useEffect(() => {
    if (!formData.imageUrl || TECH_THUMBNAIL_PRESETS.some((p) => p.url === formData.imageUrl)) {
      const autoUrl = getAutoThumbnail(formData.title, formData.category);
      setFormData((prev) => ({ ...prev, imageUrl: autoUrl }));
      const matched = TECH_THUMBNAIL_PRESETS.find((p) => p.url === autoUrl);
      if (matched) setSelectedPresetId(matched.id);
    }
  }, [formData.title, formData.category]);

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setFormData((prev) => ({ ...prev, imageUrl: preset.url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSubmitting(true);
      const user = await getCurrentUser();
      const payload = {
        ...formData,
        instructorId: user?.id || 1,
        instructorName: user?.fullName || "Faculty Instructor",
        imageUrl: formData.imageUrl || getAutoThumbnail(formData.title, formData.category),
        status: "PUBLISHED",
      };

      const res = await createCourse(payload);
      setStatus({ type: "success", msg: "Course curriculum created and published successfully!" });
      setTimeout(() => {
        navigate("/instructor/my-courses");
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: "Failed to publish course. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => navigate("/instructor/my-courses")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Courses
          </button>
          <span className="text-xs font-medium text-slate-500">Course Creation Studio</span>
        </div>

        {/* ── Header ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              Author New Course Track & 3D Artwork
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create curriculum tracks with automatically generated 3D tech banners and live Udemy-style card previews.
            </p>
          </div>
        </div>

        {status.msg && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs ${
              status.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {status.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {status.msg}
          </div>
        )}

        {/* ── Grid: Form (7 cols) + Live Udemy Card Preview (5 cols) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Course Creator Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-5 shadow-xs">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Complete Python & Full Stack AI Engineering Bootcamp"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>

              {/* Category & Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Category Taxonomy
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-colors"
                  >
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Java & Spring Boot">Java & Spring Boot</option>
                    <option value="Python & Full Stack">Python & Full Stack</option>
                    <option value="Cybersecurity & SOC">Cybersecurity & SOC</option>
                    <option value="Cloud & DevOps (K8s)">Cloud & DevOps (K8s)</option>
                    <option value="Frontend (React & Next.js)">Frontend (React & Next.js)</option>
                    <option value="System Design & Architecture">System Design & Architecture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Target Skill Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-colors"
                  >
                    <option value="BEGINNER">Beginner Level</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced / Bootcamp</option>
                  </select>
                </div>
              </div>

              {/* ── 3D Tech Artwork Preset Picker ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-indigo-600" />
                    Select 3D Tech Course Artwork
                  </label>
                  <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                    <Sparkles size={11} /> Auto-suggested based on title
                  </span>
                </div>

                {/* Preset Thumbnails Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {TECH_THUMBNAIL_PRESETS.map((preset) => {
                    const isSelected = formData.imageUrl === preset.url;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`
                          p-1.5 rounded-xl border-2 transition cursor-pointer relative group overflow-hidden
                          ${isSelected
                            ? "border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-400 bg-slate-50"
                          }
                        `}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-16 object-cover rounded-lg"
                        />
                        <p className="text-[10px] font-bold text-slate-800 mt-1 truncate">
                          {preset.category}
                        </p>
                        {isSelected && (
                          <span className="absolute top-2 right-2 h-4 w-4 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Curriculum Summary & Learning Outcomes
                </label>
                <textarea
                  rows={4}
                  placeholder="Outline what students will build, prerequisites, and learning outcomes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-600 focus:bg-white transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/instructor/my-courses")}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Send size={14} />
                  {submitting ? "Publishing Track..." : "Publish Course Track"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Udemy-Style Card Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Eye size={14} className="text-indigo-600" />
                Live Learner Catalog Preview
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Learner Viewport
              </span>
            </div>

            {/* Live Udemy Course Card Component */}
            <UdemyCourseCard
              course={{
                id: "preview_01",
                title: formData.title || "The Complete Full Stack AI & Microservices Engineering Bootcamp",
                category: formData.category,
                level: formData.level,
                imageUrl: formData.imageUrl,
                instructorName: "Faculty Instructor",
                description: formData.description,
              }}
              isEnrolled={false}
            />

            <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Dynamic Card Features:</p>
              <ul className="text-[11px] text-slate-500 space-y-1 list-disc pl-4">
                <li>3D Tech Banner automatically matched based on course topic.</li>
                <li>Live view counters & <i>Most Viewed</i> badge computed in real time.</li>
                <li>Star ratings & review counts displayed in modern enterprise format.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}

export default CreateCourse;