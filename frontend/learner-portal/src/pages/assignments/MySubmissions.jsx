import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  ExternalLink,
  Award,
  Eye,
  Download,
  X,
  PlusCircle,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Send,
  FileCheck,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getLearnerSubmissions, getAllAssignments } from "../../services/assignmentService";
import { getAllCourses } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";

function MySubmissions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assignments"); // 'assignments' or 'submissions'
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePreviewDoc, setActivePreviewDoc] = useState(null); // { url, name, type, size }

  useEffect(() => {
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      const [allAssigns, courseList, userSubs] = await Promise.all([
        getAllAssignments(),
        getAllCourses(),
        user?.id ? getLearnerSubmissions(user.id) : [],
      ]);

      setCourses(Array.isArray(courseList) ? courseList : []);
      setAssignments(Array.isArray(allAssigns) ? allAssigns : []);
      setSubmissions(Array.isArray(userSubs) ? userSubs : []);
    } catch (e) {
      console.error("Assignments data load error:", e);
    } finally {
      setLoading(false);
    }
  }

  const isPdf = (url, name) => {
    if (!url && !name) return false;
    const combined = `${url || ""} ${name || ""}`.toLowerCase();
    return combined.includes("application/pdf") || combined.includes(".pdf");
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

  // Map of course names
  const courseMap = new Map(courses.map((c) => [String(c.id), c.title]));

  // Submitted assignment IDs set
  const submittedAssignmentIds = new Set(
    submissions.map((s) => String(s.assignmentId))
  );

  const pendingAssignments = assignments.filter(
    (a) => !submittedAssignmentIds.has(String(a.id))
  );

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Course Assignments & Submissions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Access active homework assignments, download problem statements (PDF/DOC), submit your solutions, and review grades.
            </p>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Explore Courses
          </button>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="flex items-center gap-3 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              activeTab === "assignments"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen size={15} />
            <span>Active Assignments</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "assignments"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {assignments.length}
            </span>
            {pendingAssignments.length > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-500" title={`${pendingAssignments.length} pending`} />
            )}
          </button>

          <button
            onClick={() => setActiveTab("submissions")}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
              activeTab === "submissions"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileCheck size={15} />
            <span>My Submissions & Graded Work</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === "submissions"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {submissions.length}
            </span>
          </button>
        </div>

        {/* ── Tab 1: Active Assignments List ── */}
        {activeTab === "assignments" && (
          <div>
            {loading ? (
              <div className="p-16 text-center">
                <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white shadow-xs">
                <FileText size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">No active assignments published yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  When your instructors publish assignments or problem statements, they will appear here in real-time.
                </p>
                <button
                  onClick={() => navigate("/courses")}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Browse Course Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {assignments.map((item) => {
                  const isSubmitted = submittedAssignmentIds.has(String(item.id));
                  const courseTitle = courseMap.get(String(item.courseId)) || `Course #${item.courseId}`;
                  const hasDoc = !!item.attachmentUrl;
                  const isPdfDoc = isPdf(item.attachmentUrl, item.attachmentName);

                  return (
                    <div
                      key={item.id}
                      className={`bg-white border rounded-xl p-6 flex flex-col justify-between shadow-xs transition-all ${
                        isSubmitted
                          ? "border-emerald-200/80 hover:border-emerald-400"
                          : "border-slate-200/80 hover:border-blue-400"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded truncate max-w-[200px]">
                            {courseTitle}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {isSubmitted ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 size={11} /> Submitted
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                <Clock size={11} /> Action Required
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 font-bold">
                              {item.maxMarks || 100} pts
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                            {item.description || "Review problem requirements and submit solution."}
                          </p>
                        </div>

                        {/* Attached Problem Document Pill */}
                        {hasDoc && (
                          <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-lg flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div
                                className={`h-7 w-7 rounded flex items-center justify-center shrink-0 ${
                                  isPdfDoc ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                <FileText size={14} />
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-[11px] font-bold text-slate-800 truncate">
                                  {item.attachmentName || "Assignment_Problem.pdf"}
                                </p>
                                <p className="text-[10px] text-slate-500">Instructor Problem Document</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setActivePreviewDoc({
                                    url: item.attachmentUrl,
                                    name: item.attachmentName || "Assignment_Problem.pdf",
                                    type: isPdfDoc ? "PDF" : "DOC",
                                    size: item.attachmentSize,
                                  })
                                }
                                className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-semibold rounded transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <Eye size={11} /> View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(item.attachmentUrl, item.attachmentName)}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded transition-colors flex items-center gap-1 shadow-xs"
                              >
                                <Download size={11} /> Download
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Calendar size={13} className="text-slate-400" />
                          Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "Flexible"}
                        </div>

                        <button
                          onClick={() => navigate(`/assignments/${item.id}/submit`)}
                          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isSubmitted
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {isSubmitted ? "Resubmit / Update" : "Submit Solution"}
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 2: My Submissions & Graded Work ── */}
        {activeTab === "submissions" && (
          <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-16 text-center">
                <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-16 text-center">
                <FileText size={36} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">No submissions recorded yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Select an active assignment from the "Active Assignments" tab to submit your PDF or Word document solution.
                </p>
                <button
                  onClick={() => setActiveTab("assignments")}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
                >
                  View Active Assignments
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {submissions.map((sub) => {
                  const isPdfFormat = isPdf(sub.fileUrl, sub.fileName);
                  const scoreValue = sub.marks ?? sub.grade;
                  const isDocFormat =
                    sub.fileType === "DOC" ||
                    sub.fileName?.toLowerCase().endsWith(".doc") ||
                    sub.fileName?.toLowerCase().endsWith(".docx");

                  const parentAssign = assignments.find((a) => String(a.id) === String(sub.assignmentId));

                  return (
                    <div key={sub.id} className="p-6 hover:bg-slate-50/60 transition-colors space-y-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                              isPdfFormat
                                ? "bg-rose-100 text-rose-600"
                                : isDocFormat
                                ? "bg-blue-100 text-blue-600"
                                : "bg-indigo-100 text-indigo-600"
                            }`}
                          >
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900">
                                {parentAssign?.title || `Assignment #${sub.assignmentId}`}
                              </h3>
                              {sub.fileType && (
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                                    isPdfFormat
                                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                                      : "bg-blue-50 text-blue-700 border border-blue-200"
                                  }`}
                                >
                                  {sub.fileType} Solution
                                </span>
                              )}
                              {scoreValue !== null && scoreValue !== undefined ? (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <Award size={11} /> Graded: {scoreValue}/{parentAssign?.maxMarks || 100} pts
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
                              {sub.fileName && ` • ${sub.fileName}`}
                            </p>
                          </div>
                        </div>

                        {/* File actions */}
                        <div className="flex items-center gap-2">
                          {sub.fileUrl && (isPdfFormat || isDocFormat || sub.fileUrl.startsWith("data:")) ? (
                            <>
                              <button
                                onClick={() =>
                                  setActivePreviewDoc({
                                    url: sub.fileUrl,
                                    name: sub.fileName || `Submission_Assignment_${sub.assignmentId}`,
                                    type: isPdfFormat ? "PDF" : "DOC",
                                    size: sub.fileSize,
                                  })
                                }
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                              >
                                <Eye size={13} /> {isPdfFormat ? "View PDF" : "View Word Doc"}
                              </button>
                              <button
                                onClick={() =>
                                  handleDownload(
                                    sub.fileUrl,
                                    sub.fileName || `submission_assignment_${sub.assignmentId}.${isPdfFormat ? "pdf" : "docx"}`
                                  )
                                }
                                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                              >
                                <Download size={13} /> Download
                              </button>
                            </>
                          ) : sub.fileUrl ? (
                            <a
                              href={sub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <ExternalLink size={13} /> Open Project Link
                            </a>
                          ) : null}
                          <button
                            onClick={() => navigate(`/assignments/${sub.assignmentId}/submit`)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Resubmit
                          </button>
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
        )}

        {/* ── Document In-App Preview Modal ── */}
        {activePreviewDoc && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
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
                  <h3 className="text-sm font-bold text-slate-900">{activePreviewDoc.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleDownload(
                        activePreviewDoc.url,
                        activePreviewDoc.name || "submitted_solution.pdf"
                      )
                    }
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
                    title="PDF In-App Viewer"
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
                      Word Documents (.doc / .docx) can be downloaded directly to view and edit on your device.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(
                          activePreviewDoc.url,
                          activePreviewDoc.name || "submitted_solution.docx"
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
    </DashboardLayout>
  );
}

export default MySubmissions;
