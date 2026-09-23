import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  ArrowLeft,
  Send,
  AlertCircle,
  Upload,
  FileText,
  FileCode,
  Trash2,
  Eye,
  Download,
  X,
  FileCheck,
} from "lucide-react";
import { createAssignment } from "../../services/assignmentService";
import { getAllCourses } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";
import { sendNotification } from "../../services/notificationService";
import { getRealtimeEnrollmentRegistry } from "../../services/enrollmentService";

function CreateAssignment() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    maxMarks: 100,
  });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentDataUrl, setAttachmentDataUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentType, setAttachmentType] = useState("");
  const [attachmentSize, setAttachmentSize] = useState("");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const [user, courseList] = await Promise.all([
        getCurrentUser(),
        getAllCourses(),
      ]);
      setCurrentUser(user);
      if (Array.isArray(courseList) && courseList.length > 0) {
        setCourses(courseList);
        setFormData((prev) => ({ ...prev, courseId: courseList[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
    const isDoc =
      file.type === "application/msword" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lowerName.endsWith(".doc") ||
      lowerName.endsWith(".docx");

    if (!isPdf && !isDoc) {
      setStatus({
        type: "error",
        msg: "Please upload a valid PDF or Word Document (.pdf, .doc, .docx).",
      });
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setStatus({
        type: "error",
        msg: "File size exceeds 30MB limit. Please choose a smaller document.",
      });
      return;
    }

    setStatus({ type: "", msg: "" });
    setAttachmentFile(file);
    setAttachmentName(file.name);
    setAttachmentType(isPdf ? "PDF" : "DOC");
    setAttachmentSize((file.size / (1024 * 1024)).toFixed(2) + " MB");

    const reader = new FileReader();
    reader.onload = () => {
      setAttachmentDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    setAttachmentDataUrl("");
    setAttachmentName("");
    setAttachmentType("");
    setAttachmentSize("");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.courseId || !formData.title.trim()) {
      setStatus({ type: "error", msg: "Please select a course and provide an assignment title." });
      return;
    }

    try {
      setSubmitting(true);
      const res = await createAssignment({
        courseId: Number(formData.courseId),
        instructorId: currentUser?.id || 1,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
        maxMarks: Number(formData.maxMarks) || 100,
        attachmentUrl: attachmentDataUrl || null,
        attachmentName: attachmentName || "",
        attachmentType: attachmentType || "",
        attachmentSize: attachmentSize || "",
      });

      // ── Dispatch Real-Time Notification to Enrolled Students ──
      const selectedCourse = courses.find((c) => String(c.id) === String(formData.courseId));
      const courseTitle = selectedCourse?.title || `Course #${formData.courseId}`;
      const enrollments = getRealtimeEnrollmentRegistry();
      const enrolledLearners = enrollments.filter(
        (e) => String(e.courseId) === String(formData.courseId)
      );

      const targetUserIds = new Set(enrolledLearners.map((e) => Number(e.userId)).filter(Boolean));
      // Always include student ID 1 for demonstration
      targetUserIds.add(1);

      const docNote = attachmentName ? ` (Attached Document: ${attachmentName})` : "";
      for (const learnerId of targetUserIds) {
        await sendNotification({
          userId: Number(learnerId),
          subject: `New Assignment: ${formData.title}`,
          message: `Instructor ${currentUser?.fullName || "Faculty"} published a new assignment "${formData.title}" in "${courseTitle}". Due date: ${formData.dueDate || "Next week"}.${docNote} Download problem statement & submit your solutions from the Assignments page.`,
        });
      }

      setStatus({ type: "success", msg: "Assignment created successfully! Real-time notifications dispatched to all enrolled learners." });
      setTimeout(() => {
        navigate("/instructor/my-assignments");
      }, 1500);
    } catch (err) {
      console.error("Assignment creation error:", err);
      setStatus({ type: "error", msg: "Failed to publish assignment. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadAttachment = (dataUrl, fileName) => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName || "assignment_document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => navigate("/instructor/my-assignments")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Assignments
          </button>
          <span className="text-xs font-medium text-slate-500">Instructor Workspace</span>
        </div>

        {/* ── Header ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <h1 className="text-xl font-bold text-slate-900">
            Publish New Assignment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create homework tasks, attach PDF/DOCX problem statements, and set due dates for enrolled learners.
          </p>
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

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-xl p-8 space-y-5 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Target Course Track *
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (ID: #{c.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Database Clustering & Replication Report"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Due Date
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Maximum Grade Points
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Problem Statement & Instructions
            </label>
            <textarea
              rows={4}
              placeholder="Describe assignment objectives, submission guidelines (e.g. PDF report, Word Document, GitHub link), and evaluation rubric..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* ── Attach Assignment Document (PDF / DOC / DOCX) ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Attach Assignment Document (PDF or Word DOC)
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Optional • Max 30MB</span>
            </div>

            {!attachmentFile ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/60 hover:bg-indigo-50/20 transition-all group">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <Upload size={20} />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Click to choose or drag & drop Assignment File
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supported formats: PDF Documents (.pdf) or Word Docs (.doc, .docx)
                </p>
              </label>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      attachmentType === "PDF"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">{attachmentName}</p>
                      <span
                        className={`px-2 py-0.2 text-[10px] font-bold rounded ${
                          attachmentType === "PDF"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {attachmentType} Document
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {attachmentSize} • Ready to be downloaded by enrolled learners
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Eye size={13} /> Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadAttachment(attachmentDataUrl, attachmentName)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={13} /> Download
                  </button>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove attachment"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/instructor/my-assignments")}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Send size={14} />
              {submitting ? "Publishing & Notifying..." : "Publish Assignment"}
            </button>
          </div>
        </form>

        {/* ── Document Preview Modal ── */}
        {previewModalOpen && attachmentDataUrl && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-md flex items-center justify-center ${
                      attachmentType === "PDF"
                        ? "bg-rose-100 text-rose-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <FileText size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{attachmentName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadAttachment(attachmentDataUrl, attachmentName)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={13} /> Download
                  </button>
                  <button
                    onClick={() => setPreviewModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-100 p-2 flex items-center justify-center">
                {attachmentType === "PDF" ? (
                  <iframe
                    src={attachmentDataUrl}
                    title="PDF Assignment Preview"
                    className="w-full h-full rounded-lg border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-lg text-center space-y-4">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                      <FileText size={32} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{attachmentName}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Microsoft Word Document ({attachmentSize})
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      This Word Document (.doc / .docx) is attached to the assignment. Students will be able to download and open it in Microsoft Word / Docs.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDownloadAttachment(attachmentDataUrl, attachmentName)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                    >
                      <Download size={14} /> Download Word Document
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

export default CreateAssignment;