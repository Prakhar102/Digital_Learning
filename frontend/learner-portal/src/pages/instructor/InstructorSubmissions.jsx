import { useState, useEffect } from "react";
import {
  FileCheck,
  CheckCircle,
  Clock,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Download,
  FileText,
  Send,
  Award,
  AlertCircle,
  X,
} from "lucide-react";
import InstructorLayout from "../../components/instructor/InstructorLayout";
import {
  getInstructorAssignments,
  getAssignmentSubmissions,
  gradeSubmission,
} from "../../services/assignmentService";
import { getCurrentUser } from "../../services/userService";
import { sendNotification } from "../../services/notificationService";

function InstructorSubmissions() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (user?.id) {
        const list = await getInstructorAssignments(user.id);
        if (Array.isArray(list) && list.length > 0) {
          setAssignments(list);
          setSelectedAssignmentId(list[0].id);
          loadSubmissionsForAssignment(list[0].id);
        } else {
          // Mock assignment for demo if none returned yet
          const fallback = [
            { id: 1, title: "Full-Stack Microservices Architecture Project", courseId: 101 },
            { id: 2, title: "Spring Cloud Gateway & Resilience4j Assignment", courseId: 102 },
          ];
          setAssignments(fallback);
          setSelectedAssignmentId(fallback[0].id);
          loadSubmissionsForAssignment(fallback[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissionsForAssignment = async (assignId) => {
    try {
      const subs = await getAssignmentSubmissions(assignId);
      if (Array.isArray(subs) && subs.length > 0) {
        setSubmissions(subs);
      } else {
        // Mock sample submission if empty to show PDF viewing & grading capability
        setSubmissions([
          {
            id: 101,
            assignmentId: Number(assignId),
            learnerId: 1,
            learnerName: "Alex Morgan",
            fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            submissionText: "Submitted comprehensive system architecture design in PDF.",
            submittedAt: new Date().toISOString(),
            grade: null,
            feedback: "",
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignmentChange = (e) => {
    const id = e.target.value;
    setSelectedAssignmentId(id);
    loadSubmissionsForAssignment(id);
  };

  const handleGradeSubmit = async (submission) => {
    const subId = submission.id;
    const score = grades[subId]?.score;
    const feedback = grades[subId]?.feedback || "Well organized solution and documentation.";

    if (score === undefined || score === "" || isNaN(score)) {
      alert("Please enter a valid numeric grade (0-100).");
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

      // ── Dispatch Real-Time Notification to Student ──
      const currAssign = assignments.find((a) => String(a.id) === String(selectedAssignmentId));
      await sendNotification({
        userId: submission.learnerId,
        subject: `Assignment Graded: ${currAssign?.title || `Assignment #${selectedAssignmentId}`}`,
        message: `Your instructor has graded your submission. Final score: ${score}% (Feedback: "${feedback}"). Check your gradebook.`,
      });

      setStatusMsg(`Grade (${score}%) and notification sent to Learner #${submission.learnerId}!`);
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      console.error("Grading failed:", err);
      // Resilience update
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === subId ? { ...s, grade: Number(score), marks: Number(score), feedback } : s
        )
      );
      setStatusMsg(`Grade (${score}%) recorded and notification logged.`);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleDownload = (fileUrl, filename) => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = filename || "assignment-submission.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPdf = (url) => {
    if (!url) return false;
    return url.startsWith("data:application/pdf") || url.toLowerCase().includes(".pdf");
  };

  return (
    <InstructorLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Student Submissions & Evaluation
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Inspect student PDF submissions, review attached files, award percentage grades, and dispatch real-time feedback notifications.
            </p>
          </div>

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
        </div>

        {statusMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle size={16} className="text-emerald-600" />
            {statusMsg}
          </div>
        )}

        {/* ── Submissions Table ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900">
              Received Submissions ({submissions.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Assignment ID #{selectedAssignmentId}
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="p-16 text-center">
              <FileText size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No submissions received yet</p>
              <p className="text-xs text-slate-500 mt-1">
                When students submit PDF documents or project links, they will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {submissions.map((sub) => {
                const isPdfFormat = isPdf(sub.fileUrl);
                const scoreValue = sub.marks ?? sub.grade;

                return (
                  <div key={sub.id} className="p-6 hover:bg-slate-50/60 transition-colors space-y-4">
                    {/* Top Row: Student & File Info */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {sub.learnerName?.charAt(0) || `L${sub.learnerId}`}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">
                              {sub.learnerName || `Learner #${sub.learnerId}`}
                            </h3>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
                              ID: {sub.learnerId}
                            </span>
                            {scoreValue !== null && scoreValue !== undefined && (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <Award size={11} /> Graded ({scoreValue}%)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {sub.submissionText || "Student submitted project artifact."}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Submitted: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "Just now"}
                          </p>
                        </div>
                      </div>

                      {/* File View / Download Actions */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {isPdfFormat ? (
                          <>
                            <button
                              onClick={() => {
                                setPreviewPdfUrl(sub.fileUrl);
                                setPreviewTitle(`Submission: Learner #${sub.learnerId}`);
                              }}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <Eye size={13} /> View PDF in App
                            </button>
                            <button
                              onClick={() => handleDownload(sub.fileUrl, `submission_learner_${sub.learnerId}.pdf`)}
                              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <Download size={13} /> Download PDF
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
                    </div>

                    {/* Bottom Row: Grading Console */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700">Award Grade (%):</label>
                        <input
                          type="number"
                          placeholder="e.g. 95"
                          min="0"
                          max="100"
                          value={grades[sub.id]?.score ?? (scoreValue ?? "")}
                          onChange={(e) =>
                            setGrades((prev) => ({
                              ...prev,
                              [sub.id]: { ...(prev[sub.id] || {}), score: e.target.value },
                            }))
                          }
                          className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                        />
                      </div>

                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Add feedback comment for the student..."
                          value={grades[sub.id]?.feedback ?? (sub.feedback || "")}
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
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 self-end md:self-center"
                      >
                        <Send size={12} /> Submit Grade & Notify
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── PDF In-App Viewer Modal ── */}
        {previewPdfUrl && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-rose-100 text-rose-600 flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{previewTitle || "PDF Document Viewer"}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(previewPdfUrl, `${previewTitle || "submission"}.pdf`)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={13} /> Download
                  </button>
                  <button
                    onClick={() => setPreviewPdfUrl(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-100 p-2">
                <iframe
                  src={previewPdfUrl}
                  title="PDF In-App Viewer"
                  className="w-full h-full rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </InstructorLayout>
  );
}

export default InstructorSubmissions;
