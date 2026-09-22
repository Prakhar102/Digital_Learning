import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowRight,
  Target,
  Trophy,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getUserAttempts } from "../../services/assessmentService";
import { getCurrentUser } from "../../services/userService";

function MyAssessments() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      const user = await getCurrentUser();
      if (user?.id) {
        const list = await getUserAttempts(user.id);
        setAttempts(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Assessment History & Evaluation Records
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review all historical exam scores, certification thresholds, and retake eligibility.
            </p>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Browse Exams
          </button>
        </div>

        {/* ── Attempts Table ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-16 text-center">
              <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="p-16 text-center">
              <ClipboardCheck size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No assessment attempts recorded</p>
              <p className="text-xs text-slate-500 mt-1">
                Take course quizzes and exams to earn accredited badges and certificates.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <div className="col-span-4">Assessment Track</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-2">Score</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {attempts.map((att) => (
                <div
                  key={att.id}
                  className="grid grid-cols-12 px-6 py-4 items-center text-xs hover:bg-slate-50/70 transition-colors"
                >
                  <div className="col-span-4">
                    <p className="font-bold text-slate-900">Assessment #{att.assessmentId}</p>
                    <p className="text-[11px] text-slate-500">
                      {att.completedAt ? new Date(att.completedAt).toLocaleDateString() : "Completed"}
                    </p>
                  </div>

                  <div className="col-span-3">
                    {att.passed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        <CheckCircle size={12} /> Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        <XCircle size={12} /> Failed
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 font-bold text-slate-900 text-sm">
                    {att.score}%
                  </div>

                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/assessments/${att.assessmentId}/take`)}
                      className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <RotateCcw size={11} /> Retake
                    </button>
                    <button
                      onClick={() => navigate(`/leaderboard/${att.assessmentId}`)}
                      className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Trophy size={11} /> Board
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default MyAssessments;
