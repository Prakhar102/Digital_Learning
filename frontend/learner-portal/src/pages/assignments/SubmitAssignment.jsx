import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  CheckCircle,
  ArrowLeft,
  Link as LinkIcon,
  Eye,
  Download,
  Trash2,
  AlertCircle,
  Send,
  X,
  FileCheck,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { submitAssignment, getAssignmentById } from "../../services/assignmentService";
import { getCurrentUser } from "../../services/userService";
import { sendNotification, notifyInstructor } from "../../services/notificationService";

function SubmitAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [assignmentInfo, setAssignmentInfo] = useState(null);
  const [submissionType, setSubmissionType] = useState("file"); // 'file' (pdf/doc) or 'link'
  const [solutionFile, setSolutionFile] = useState(null);
  const [solutionDataUrl, setSolutionDataUrl] = useState("");
  const [solutionFileName, setSolutionFileName] = useState("");
  const [solutionFileType, setSolutionFileType] = useState("");
  const [solutionFileSize, setSolutionFileSize] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [remarks, setRemarks] = useState("");
  const [activePreviewDoc, setActivePreviewDoc] = useState(null); // { url, name, type, size }
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  async function loadData() {
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
      setErrorMsg("Please upload a valid PDF or Word Document (.pdf, .doc, .docx).");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setErrorMsg("File size must be less than 30MB.");
      return;
    }

    setErrorMsg("");
    setSolutionFile(file);
    setSolutionFileName(file.name);
    setSolutionFileType(isPdf ? "PDF" : "DOC");
    setSolutionFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");

    const reader = new FileReader();
    reader.onload = () => {
      setSolutionDataUrl(reader.result);
      setFileUrl(reader.result); // Base64 data URL for direct viewing & download
    };
    reader.readAsDataURL(file);
  };

  const removeSolutionFile = () => {
    setSolutionFile(null);
    setSolutionDataUrl("");
    setSolutionFileName("");
    setSolutionFileType("");
    setSolutionFileSize("");
    if (submissionType === "file") {
      setFileUrl("");
    }
  };

  const handleDownloadDoc = (url, name) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    const targetUrl = submissionType === "file" ? solutionDataUrl : fileUrl.trim();

    if (!currentUser?.id) {
      setErrorMsg("User session not found. Please log in.");
      return;
    }

    if (!targetUrl) {
      setErrorMsg(
        submissionType === "file"
          ? "Please select a PDF or Word Document to upload."
          : "Please enter a valid submission URL."
      );
      return;
    }

    try {
      setSubmitting(true);
      const docTypeLabel = solutionFileType === "PDF" ? "PDF Document" : "Word Document (.docx)";
      await submitAssignment({
        assignmentId: Number(assignmentId),
        learnerId: currentUser.id,
        learnerName: currentUser.fullName || currentUser.username || `Learner #${currentUser.id}`,
        fileUrl: targetUrl,
        fileName: solutionFileName || (submissionType === "file" ? "solution_submission" : "External Link"),
        fileType: solutionFileType || (submissionType === "file" ? "PDF" : "LINK"),
        fileSize: solutionFileSize || "",
        submissionText:
          remarks.trim() ||
          `Submitted via ${
            submissionType === "file"
              ? `${docTypeLabel} (${solutionFileName || "solution"})`
              : "Project Repository Link"
          }`,
      });

      // ── Trigger Real-Time Notification to Instructor ──
      const instructorId = assignmentInfo?.instructorId || 3;
      await notifyInstructor({
        instructorId: Number(instructorId) || 3,
        subject: `New Assignment Submission: ${assignmentInfo?.title || `Assignment #${assignmentId}`}`,
        message: `Learner ${currentUser.fullName || `Learner #${currentUser.id}`} has submitted their assignment (${
          submissionType === "file" ? docTypeLabel : "Project Link"
        }) for "${assignmentInfo?.courseTitle || assignmentInfo?.title || 'Curriculum Course'}". Ready for grading.`,
      });

      // Also notify student confirmation
      await sendNotification({
        userId: currentUser.id,
        subject: `Submission Received: ${assignmentInfo?.title || `Assignment #${assignmentId}`}`,
        message: `Your assignment solution document for "${assignmentInfo?.title || `Assignment #${assignmentId}`}" was received and dispatched to your instructor for evaluation.`,
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
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded mb-2">
                Assignment #{assignmentId}
              </span>
              <h1 className="text-xl font-bold text-slate-900">
                {assignmentInfo?.title || `Assignment Evaluation #${assignmentId}`}
              </h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {assignmentInfo?.description ||
                  "Review the attached assignment problem statement, prepare your solutions, and submit your work in PDF or Word Document format for grading."}
              </p>
            </div>
            {assignmentInfo?.maxMarks && (
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400">Total Marks</span>
                <p className="text-xl font-bold text-slate-900">{assignmentInfo.maxMarks} pts</p>
              </div>
            )}
          </div>

          {/* ── Instructor Attached Assignment Document (PDF / Word DOC) ── */}
          {assignmentInfo?.attachmentUrl && (
            <div className="pt-3 border-t border-slate-100">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${
                      assignmentInfo.attachmentType === "PDF" ||
                      assignmentInfo.attachmentName?.toLowerCase().endsWith(".pdf")
                        ? "bg-rose-100 text-rose-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <FileText size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900">
                        {assignmentInfo.attachmentName || "Assignment_Problem_Document.pdf"}
                      </p>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          assignmentInfo.attachmentType === "PDF" ||
                          assignmentInfo.attachmentName?.toLowerCase().endsWith(".pdf")
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        Instructor {assignmentInfo.attachmentType || "Document"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {assignmentInfo.attachmentSize || "Problem Statement & Rubric"} • Attached by Instructor
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePreviewDoc({
                        url: assignmentInfo.attachmentUrl,
                        name: assignmentInfo.attachmentName || "Assignment_Problem_Document.pdf",
                        type: assignmentInfo.attachmentType || "PDF",
                        size: assignmentInfo.attachmentSize,
                      })
                    }
                    className="px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Eye size={13} /> View Problem Doc
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadDoc(
                        assignmentInfo.attachmentUrl,
                        assignmentInfo.attachmentName || "Assignment_Problem_Document.pdf"
                      )
                    }
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={13} /> Download File
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {success ? (
          <div className="p-10 text-center bg-white border border-emerald-200 rounded-xl space-y-3 shadow-xs">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            <h2 className="text-base font-bold text-slate-900">Assignment Submitted Successfully!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your solution document has been dispatched to your instructor. Real-time notification was logged. Redirecting to your submissions tracker...
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
                  onClick={() => setSubmissionType("file")}
                  className={`flex items-center justify-center gap-2.5 p-3.5 rounded-lg border text-xs font-semibold transition-all ${
                    submissionType === "file"
                      ? "bg-blue-50/80 border-blue-600 text-blue-700 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                  }`}
                >
                  <FileText size={16} />
                  Upload PDF or Word DOC Document
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

            {/* ── File Upload Section (PDF / DOC / DOCX) ── */}
            {submissionType === "file" ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Attach Solution File (PDF or Word Document)
                </label>

                {!solutionFile ? (
                  <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/60 hover:bg-blue-50/20 transition-all group">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Upload size={22} />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Click to choose or drag & drop Solution File
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supported formats: PDF Documents (.pdf) or Word Docs (.doc, .docx) • Max 30MB
                    </p>
                  </label>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          solutionFileType === "PDF"
                            ? "bg-rose-100 text-rose-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{solutionFileName}</p>
                          <span
                            className={`px-2 py-0.2 text-[10px] font-bold rounded ${
                              solutionFileType === "PDF"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {solutionFileType} Solution
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {solutionFileSize} • Ready for submission
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActivePreviewDoc({
                            url: solutionDataUrl,
                            name: solutionFileName,
                            type: solutionFileType,
                            size: solutionFileSize,
                          })
                        }
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye size={13} /> Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(solutionDataUrl, solutionFileName)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Download size={13} /> Download
                      </button>
                      <button
                        type="button"
                        onClick={removeSolutionFile}
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
                placeholder="Mention key setup details, approach, assumptions, or summary of your work..."
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
                disabled={
                  submitting ||
                  (submissionType === "file" && !solutionFile) ||
                  (submissionType === "link" && !fileUrl.trim())
                }
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Send size={14} />
                {submitting ? "Uploading & Notifying..." : "Submit Assignment"}
              </button>
            </div>
          </form>
        )}

        {/* ── Document In-App Preview Modal ── */}
        {activePreviewDoc && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      activePreviewDoc.type === "PDF" ||
                      activePreviewDoc.name?.toLowerCase().endsWith(".pdf")
                        ? "bg-rose-100 text-rose-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <FileText size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{activePreviewDoc.name}</h3>
                    <p className="text-[11px] text-slate-500">{activePreviewDoc.size || "Document File"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadDoc(activePreviewDoc.url, activePreviewDoc.name)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={13} /> Download
                  </button>
                  <button
                    onClick={() => setActivePreviewDoc(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 bg-slate-100 p-2 flex items-center justify-center">
                {activePreviewDoc.type === "PDF" ||
                activePreviewDoc.name?.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={activePreviewDoc.url}
                    title="PDF Viewer"
                    className="w-full h-full rounded-lg border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-lg text-center space-y-4">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                      <FileText size={32} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{activePreviewDoc.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">Microsoft Word Document</p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Word Documents (.doc / .docx) can be downloaded directly to view and edit in Microsoft Word, Google Docs, or LibreOffice.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDownloadDoc(activePreviewDoc.url, activePreviewDoc.name)}
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
    </DashboardLayout>
  );
}

export default SubmitAssignment;
