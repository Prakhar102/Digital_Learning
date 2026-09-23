import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ExternalLink,
  Eye,
  Download,
  FileText,
  Send,
  Award,
  X,
  PlusCircle,
  AlertCircle,
  Lock,
} from "lucide-react";
import {
  getInstructorAssignments,
  getAssignmentSubmissions,
  gradeSubmission,
} from "../../services/assignmentService";
import { getCurrentUser } from "../../services/userService";
import { sendNotification } from "../../services/notificationService";

function InstructorSubmissions() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [grades, setGrades] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);
  const [activePreviewDoc, setActivePreviewDoc] = useState(null); // { url, name, type, size }

  useEffect(() => {
    loadAssignments();
    const handleStorage = () => {
      if (selectedAssignmentId) {
        loadSubmissionsForAssignment(selectedAssignmentId);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  async function loadAssignments() {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      const list = await getInstructorAssignments(user?.id);
      if (Array.isArray(list) && list.length > 0) {
        setAssignments(list);
        setSelectedAssignmentId(list[0].id);
        await loadSubmissionsForAssignment(list[0].id);
      } else {
        setAssignments([]);
        setSelectedAssignmentId("");
        setSubmissions([]);
      }
    } catch (e) {
      console.error("Failed to load assignments:", e);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadSubmissionsForAssignment(assignId) {
    if (!assignId) {
      setSubmissions([]);
      return;
    }
    try {
      setLoadingSubmissions(true);
      const subs = await getAssignmentSubmissions(assignId);
      setSubmissions(Array.isArray(subs) ? subs : []);
    } catch (e) {
      console.error("Failed to load submissions:", e);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  }

  const handleAssignmentChange = (e) => {
    const id = e.target.value;
    setSelectedAssignmentId(id);
    loadSubmissionsForAssignment(id);
  };

  const handleGradeSubmit = async (submission) => {
    const subId = submission.id;
    const existingScore = submission.marks ?? submission.grade;
    if (existingScore !== null && existingScore !== undefined && existingScore !== "") {
      alert("This submission has already been graded and locked. Grades cannot be modified once submitted.");
      return;
    }

    const score = grades[subId]?.score;
    const feedback = grades[subId]?.feedback || "Well organized solution and documentation.";
    const currAssign = assignments.find((a) => String(a.id) === String(selectedAssignmentId));
    const maxMarks = currAssign?.maxMarks || 100;
    const learnerDisplayName =
      submission.learnerName ||
      (submission.learnerId ? `Learner #${submission.learnerId}` : "Learner");

    if (score === undefined || score === "" || isNaN(score)) {
      alert(`Please enter valid numeric marks between 0 and ${maxMarks}.`);
      return;
    }

    if (Number(score) < 0 || Number(score) > maxMarks) {
      alert(`Marks cannot exceed the maximum score of ${maxMarks} points.`);
      return;
    }

    try {
      await gradeSubmission(subId, {
        grade: Number(score),
        marks: Number(score),
        feedback,
      });

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === subId ? { ...s, grade: Number(score), marks: Number(score), feedback } : s
        )
      );

      // Dispatch Real-Time Notification to Student
      if (submission.learnerId) {
        await sendNotification({
          userId: Number(submission.learnerId),
          subject: `Assignment Graded: ${currAssign?.title || `Assignment #${selectedAssignmentId}`}`,
          message: `Your instructor has graded your submission. Final score: ${score}/${maxMarks} marks (Feedback: "${feedback}"). Check your gradebook.`,
        });
      }

      setStatusMsg(`Marks (${score}/${maxMarks} pts) and feedback recorded for ${learnerDisplayName}!`);
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      console.error("Grading failed:", err);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === subId ? { ...s, grade: Number(score), marks: Number(score), feedback } : s
        )
      );
      setStatusMsg(`Marks (${score}/${maxMarks} pts) recorded for ${learnerDisplayName}.`);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleDownload = (fileUrl, filename) => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename || "document_download.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPdf = (url, name) => {
    if (!url && !name) return false;
    const combined = `${url || ""} ${name || ""}`.toLowerCase();
    return combined.includes("application/pdf") || combined.includes(".pdf");
  };

  const selectedAssignment = assignments.find((a) => String(a.id) === String(selectedAssignmentId));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Student Submissions & Evaluation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Inspect student PDF and Word Doc submissions, review attached files, award percentage grades, and dispatch real-time feedback notifications.
          </p>
        </div>

        {assignments.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">Select Assignment:</label>
            <select
              value={selectedAssignmentId}
              onChange={handleAssignmentChange}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 shadow-xs"
            >
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} (Course #{a.courseId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {statusMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle size={16} className="text-emerald-600" />
          {statusMsg}
        </div>
      )}

      {/* ── Instructor Attached Assignment Document Banner ── */}
      {selectedAssignment?.attachmentUrl && (
        <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                isPdf(selectedAssignment.attachmentUrl, selectedAssignment.attachmentName)
                  ? "bg-rose-100 text-rose-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-slate-900">
                  {selectedAssignment.attachmentName || "Assignment_Problem_Document.pdf"}
                </p>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Attached Assignment Document
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {selectedAssignment.attachmentSize || "Problem Statement"} • Distributed to all enrolled learners
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                setActivePreviewDoc({
                  url: selectedAssignment.attachmentUrl,
                  name: selectedAssignment.attachmentName || "Assignment_Problem_Document",
                  type: selectedAssignment.attachmentType || "PDF",
                  size: selectedAssignment.attachmentSize,
                })
              }
              className="px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Eye size={13} /> View Problem Doc
            </button>
            <button
              onClick={() =>
                handleDownload(
                  selectedAssignment.attachmentUrl,
                  selectedAssignment.attachmentName || "assignment_problem_doc.pdf"
                )
              }
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download size={13} /> Download
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white shadow-xs">
          <FileText size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-700">No assignments created yet</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Publish an assignment for your courses to start receiving and grading student submissions.
          </p>
          <button
            onClick={() => navigate("/instructor/assignments")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <PlusCircle size={14} />
            Create Assignment
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900">
              Received Submissions ({submissions.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Assignment ID #{selectedAssignmentId}
            </span>
          </div>

          {loadingSubmissions ? (
            <div className="p-12 text-center">
              <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-16 text-center">
              <FileText size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No submissions received yet</p>
              <p className="text-xs text-slate-500 mt-1">
                When enrolled students submit PDF or Word Doc solutions for this assignment, they will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {submissions.map((sub) => {
                const isPdfFormat = isPdf(sub.fileUrl, sub.fileName);
                const scoreValue = sub.marks ?? sub.grade;
                const isGraded = scoreValue !== null && scoreValue !== undefined && scoreValue !== "" && !isNaN(scoreValue);
                const isDocFormat =
                  sub.fileType === "DOC" ||
                  sub.fileName?.toLowerCase().endsWith(".doc") ||
                  sub.fileName?.toLowerCase().endsWith(".docx");

                return (
                  <div key={sub.id} className="p-6 hover:bg-slate-50/60 transition-colors space-y-4">
                    {/* Top Row: Student & File Info */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {sub.learnerName?.charAt(0) || `L${sub.learnerId || "S"}`}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900">
                              {sub.learnerName || `Learner #${sub.learnerId || sub.id}`}
                            </h3>
                            {sub.learnerId && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
                                ID: {sub.learnerId}
                              </span>
                            )}
                            {isGraded ? (
                              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                                <Award size={11} className="text-emerald-600" /> Graded & Locked ({scoreValue}/{selectedAssignment?.maxMarks || 100} pts)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                Pending Grading
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {sub.submissionText || "Student submitted solution artifact."}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Submitted: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "Recently"}
                            {sub.fileName && ` • ${sub.fileName}`}
                          </p>
                        </div>
                      </div>

                      {/* File View / Download Actions */}
                      {sub.fileUrl && (
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {isPdfFormat || isDocFormat || sub.fileUrl.startsWith("data:") ? (
                            <>
                              <button
                                onClick={() =>
                                  setActivePreviewDoc({
                                    url: sub.fileUrl,
                                    name: sub.fileName || `Submission_Learner_${sub.learnerId || sub.id}`,
                                    type: isPdfFormat ? "PDF" : "DOC",
                                    size: sub.fileSize,
                                  })
                                }
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                              >
                                <Eye size={13} /> {isPdfFormat ? "View PDF in App" : "View Word Doc"}
                              </button>
                              <button
                                onClick={() =>
                                  handleDownload(
                                    sub.fileUrl,
                                    sub.fileName || `submission_learner_${sub.learnerId || sub.id}.${isPdfFormat ? "pdf" : "docx"}`
                                  )
                                }
                                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                              >
                                <Download size={13} /> Download {isPdfFormat ? "PDF" : "Doc"}
                              </button>
                            </>
                          ) : (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <ExternalLink size={13} /> Open External Project
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: Grading Console */}
                    {isGraded ? (
                      <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-700">Awarded Marks:</span>
                          <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-md shadow-2xs">
                            {scoreValue} / {selectedAssignment?.maxMarks || 100} pts
                          </span>
                        </div>

                        <div className="flex-1 md:px-3">
                          <p className="text-xs text-slate-600 bg-white border border-slate-200/80 rounded-lg px-3 py-1.5 italic">
                            <span className="font-semibold text-slate-700 not-italic">Feedback: </span>
                            "{sub.feedback || "Graded and verified by instructor."}"
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            disabled
                            className="px-3.5 py-1.5 bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-not-allowed shadow-2xs"
                            title="Grades are finalized and locked"
                          >
                            <Lock size={12} className="text-slate-400" /> Grade Locked
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-700">
                            Award Marks (Max: {selectedAssignment?.maxMarks || 100}):
                          </label>
                          <input
                            type="number"
                            placeholder={`0 - ${selectedAssignment?.maxMarks || 100}`}
                            min="0"
                            max={selectedAssignment?.maxMarks || 100}
                            value={grades[sub.id]?.score ?? ""}
                            onChange={(e) =>
                              setGrades((prev) => ({
                                ...prev,
                                [sub.id]: { ...(prev[sub.id] || {}), score: e.target.value },
                              }))
                            }
                            className="w-28 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                          />
                        </div>

                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Add feedback comment for the student..."
                            value={grades[sub.id]?.feedback ?? ""}
                            onChange={(e) =>
                              setGrades((prev) => ({
                                ...prev,
                                [sub.id]: { ...(prev[sub.id] || {}), feedback: e.target.value },
                              }))
                            }
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs"
                          />
                        </div>

                        <button
                          onClick={() => handleGradeSubmit(sub)}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 self-end md:self-center cursor-pointer"
                        >
                          <Send size={12} /> Submit Grade & Notify
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Document In-App Preview Modal ── */}
      {activePreviewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-7 w-7 rounded-md flex items-center justify-center ${
                    activePreviewDoc.type === "PDF" ||
                    activePreviewDoc.name?.toLowerCase().endsWith(".pdf")
                      ? "bg-rose-100 text-rose-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  <FileText size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activePreviewDoc.name}</h3>
                  <p className="text-[11px] text-slate-500">{activePreviewDoc.size || "Submitted Artifact"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleDownload(
                      activePreviewDoc.url,
                      activePreviewDoc.name || "submission_download.pdf"
                    )
                  }
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
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
                  title="Document In-App Viewer"
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
                    This is a Word Document (.doc / .docx) submitted by the student. You can download and open it directly in Microsoft Word or Google Docs for full review and annotations.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(
                        activePreviewDoc.url,
                        activePreviewDoc.name || "student_solution.docx"
                      )
                    }
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

export default InstructorSubmissions;
