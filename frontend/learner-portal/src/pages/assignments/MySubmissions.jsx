import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  ExternalLink,
  Award,
  Eye,
  Download,
  AlertCircle,
  X,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getLearnerSubmissions } from "../../services/assignmentService";
import { getCurrentUser } from "../../services/userService";

function MySubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewPdf, setPreviewPdf] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const user = await getCurrentUser();
      if (user?.id) {
        const list = await getLearnerSubmissions(user.id);
        setSubmissions(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error("Submissions load error", e);
    } finally {
      setLoading(false);
    }
  };

  const isPdf = (url) => {
    if (!url) return false;
    return url.startsWith("data:application/pdf") || url.toLowerCase().includes(".pdf");
  };

  const handleDownload = (fileUrl) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "my_assignment_submission.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              My Assignment Submissions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track submitted projects, view instructor feedback, and check evaluation scores.
            </p>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Explore Courses
          </button>
        </div>

        {/* ── Submissions Feed / Table ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-16 text-center">
              <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-16 text-center">
              <FileText size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No submissions recorded yet</p>
              <p className="text-xs text-slate-500 mt-1">
                When you submit course assignments or project reports, they will be tracked here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {submissions.map((sub) => {
                const isPdfFormat = isPdf(sub.fileUrl);
                const scoreValue = sub.marks ?? sub.grade;

                return (
                  <div key={sub.id} className="p-6 hover:bg-slate-50/60 transition-colors space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">
                              Assignment #{sub.assignmentId}
                            </h3>
                            {scoreValue !== null && scoreValue !== undefined ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <Award size={11} /> Graded: {scoreValue}%
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                <Clock size={11} /> Under Review
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {sub.submissionText || "Assignment submission"}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Submitted on: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "Recent"}
                          </p>
                        </div>
                      </div>

                      {/* PDF actions */}
                      <div className="flex items-center gap-2">
                        {isPdfFormat ? (
                          <>
                            <button
                              onClick={() => setPreviewPdf(sub.fileUrl)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <Eye size={13} /> View Submitted PDF
                            </button>
                            <button
                              onClick={() => handleDownload(sub.fileUrl)}
                              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <Download size={13} /> Download
                            </button>
                          </>
                        ) : (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <ExternalLink size={13} /> Open Project Link
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Instructor Feedback Box */}
                    {sub.feedback && (
                      <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-xs text-emerald-900">
                        <span className="font-bold">Instructor Feedback: </span>
                        {sub.feedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── PDF Preview Modal ── */}
        {previewPdf && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900">Your Submitted PDF Document</h3>
                </div>
                <button
                  onClick={() => setPreviewPdf(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 bg-slate-100 p-2">
                <iframe
                  src={previewPdf}
                  title="PDF In-App Viewer"
                  className="w-full h-full rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MySubmissions;
