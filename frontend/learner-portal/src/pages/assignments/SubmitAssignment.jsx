import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  CheckCircle,
  ArrowLeft,
  Link as LinkIcon,
  FileCheck,
  Eye,
  Trash2,
  AlertCircle,
  Send,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { submitAssignment, getAssignmentById } from "../../services/assignmentService";
import { getCurrentUser } from "../../services/userService";
import { sendNotification } from "../../services/notificationService";

function SubmitAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [assignmentInfo, setAssignmentInfo] = useState(null);
  const [submissionType, setSubmissionType] = useState("pdf"); // 'pdf' or 'link'
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDataUrl, setPdfDataUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [remarks, setRemarks] = useState("");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);

      if (assignmentId) {
        try {
          const assign = await getAssignmentById(assignmentId);
          setAssignmentInfo(assign);
        } catch {
          // fallback if endpoint differs
          setAssignmentInfo({ id: assignmentId, title: `Assignment #${assignmentId}`, courseId: 1 });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Please upload a valid PDF document.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg("PDF file size must be less than 25MB.");
      return;
    }

    setErrorMsg("");
    setPdfFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPdfDataUrl(reader.result);
      setFileUrl(reader.result); // Base64 data URL for direct viewing & download
    };
    reader.readAsDataURL(file);
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfDataUrl("");
    if (submissionType === "pdf") {
      setFileUrl("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const targetUrl = submissionType === "pdf" ? pdfDataUrl : fileUrl.trim();

    if (!currentUser?.id) {
      setErrorMsg("User session not found. Please log in.");
      return;
    }

    if (!targetUrl) {
      setErrorMsg(submissionType === "pdf" ? "Please select a PDF file to upload." : "Please enter a valid submission URL.");
      return;
    }

    try {
      setSubmitting(true);
      await submitAssignment({
        assignmentId: Number(assignmentId),
        learnerId: currentUser.id,
        fileUrl: targetUrl,
        submissionText: remarks.trim() || `Submitted via ${submissionType === "pdf" ? `PDF Document (${pdfFile?.name || "upload.pdf"})` : "Project URL"}`,
      });

      // ── Trigger Real-Time Notification to Instructor ──
      const instructorId = assignmentInfo?.instructorId || 2; // fallback to assigned instructor
      await sendNotification({
        userId: instructorId,
        subject: `New Assignment Submission: Assignment #${assignmentId}`,
        message: `Learner ${currentUser.fullName || `Learner #${currentUser.id}`} has submitted their assignment (${submissionType === "pdf" ? "PDF Document" : "Project Link"}). Ready for grading.`,
      });

      // Also notify student confirmation
      await sendNotification({
        userId: currentUser.id,
        subject: `Submission Received: Assignment #${assignmentId}`,
        message: `Your assignment submission for "${assignmentInfo?.title || `Assignment #${assignmentId}`}" was received and dispatched to the instructor for evaluation.`,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/my-submissions");
      }, 1500);
    } catch (err) {
      console.error("Assignment submission error:", err);
      setErrorMsg("Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Learning
          </button>
          <span className="text-xs font-medium text-slate-500">
            Course Track #{assignmentInfo?.courseId || 1}
          </span>
        </div>

        {/* ── Assignment Info Header ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded mb-2">
                Assignment #{assignmentId}
              </span>
              <h1 className="text-xl font-bold text-slate-900">
                {assignmentInfo?.title || `Assignment Evaluation #${assignmentId}`}
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {assignmentInfo?.description || "Submit your completed project report, code documentation, or analysis in PDF format or cloud repository link for instructor review."}
              </p>
            </div>
            {assignmentInfo?.maxMarks && (
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Marks</span>
                <p className="text-xl font-bold text-slate-900">{assignmentInfo.maxMarks} pts</p>
              </div>
            )}
          </div>
        </div>

        {success ? (
          <div className="p-10 text-center bg-white border border-emerald-200 rounded-xl space-y-3 shadow-xs">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Assignment Submitted Successfully!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your submission has been dispatched to your instructor. Real-time notification was logged. Redirecting to your submissions tracker...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-6 shadow-xs">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-700 font-medium">
                <AlertCircle size={15} />
                {errorMsg}
              </div>
            )}

            {/* ── Submission Type Toggle ── */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Submission Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSubmissionType("pdf")}
                  className={`flex items-center justify-center gap-2.5 p-3.5 rounded-lg border text-xs font-semibold transition-all ${
                    submissionType === "pdf"
                      ? "bg-blue-50/80 border-blue-600 text-blue-700 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                  }`}
                >
                  <FileText size={16} />
                  Upload PDF Document (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionType("link")}
                  className={`flex items-center justify-center gap-2.5 p-3.5 rounded-lg border text-xs font-semibold transition-all ${
                    submissionType === "link"
                      ? "bg-blue-50/80 border-blue-600 text-blue-700 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                  }`}
                >
                  <LinkIcon size={16} />
                  Repository / Web Project Link
                </button>
              </div>
            </div>

            {/* ── PDF Upload Section ── */}
            {submissionType === "pdf" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Attach PDF File
                </label>

                {!pdfFile ? (
                  <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/60 hover:bg-blue-50/20 transition-all group">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Upload size={22} />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to choose or drag & drop PDF assignment
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Standard PDF files supported (Max: 25MB)
                    </p>
                  </label>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{pdfFile.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalOpen(true)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye size={13} /> Preview PDF
                      </button>
                      <button
                        type="button"
                        onClick={removePdf}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Repository / Project URL
                </label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/project-repo or hosted demo URL"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            {/* ── Notes / Remarks ── */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Submission Notes & Remarks (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Mention key setup details, assumptions, or summary of your work..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors resize-none"
              />
            </div>

            {/* ── Submit Action ── */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (submissionType === "pdf" && !pdfFile) || (submissionType === "link" && !fileUrl.trim())}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Send size={14} />
                {submitting ? "Uploading & Notifying..." : "Submit Assignment"}
              </button>
            </div>
          </form>
        )}

        {/* ── PDF Preview Modal ── */}
        {previewModalOpen && pdfDataUrl && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900">{pdfFile?.name}</h3>
                </div>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Close Preview
                </button>
              </div>
              <div className="flex-1 bg-slate-100 p-2">
                <iframe
                  src={pdfDataUrl}
                  title="PDF Preview"
                  className="w-full h-full rounded-lg border border-slate-200"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default SubmitAssignment;
