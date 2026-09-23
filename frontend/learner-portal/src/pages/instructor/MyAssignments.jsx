import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  PlusCircle,
  Calendar,
  ChevronRight,
  FileText,
  Download,
} from "lucide-react";
import { getInstructorAssignments } from "../../services/assignmentService";
import { getCurrentUser } from "../../services/userService";

function MyAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    try {
      const user = await getCurrentUser();
      if (user?.id) {
        const list = await getInstructorAssignments(user.id);
        setAssignments(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleDownloadAttachment = (dataUrl, fileName) => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName || "assignment_problem_doc.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Assigned Course Tasks
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review all active problem statements, homework assignments, attached documents, and due dates.
            </p>
          </div>

          <button
            onClick={() => navigate("/instructor/assignments")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <PlusCircle size={14} />
            Create Assignment
          </button>
        </div>

        {/* ── Assignment Grid ── */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white shadow-xs">
            <FileCheck size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No assignments created yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Publish your first assignment to assess student learning in your courses.
            </p>
            <button
              onClick={() => navigate("/instructor/assignments")}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Create Assignment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {assignments.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between hover:border-indigo-400 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded">
                      Course #{item.courseId}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Max: {item.maxMarks || 100} pts
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-3 mb-3 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>

                  {/* Attached Document Pill */}
                  {item.attachmentUrl && (
                    <div className="mb-4 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText size={14} className="text-indigo-600 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-800 truncate">
                          {item.attachmentName || "Attached Problem Document"}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownloadAttachment(item.attachmentUrl, item.attachmentName)}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition-colors shrink-0"
                        title="Download attached document"
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Calendar size={13} className="text-slate-400" />
                    Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "Flexible"}
                  </div>
                  <button
                    onClick={() => navigate("/instructor/submissions")}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                  >
                    Submissions <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}

export default MyAssignments;