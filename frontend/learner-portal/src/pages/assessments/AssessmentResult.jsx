import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Trophy,
  CheckCircle,
  XCircle,
  RotateCcw,
  Award,
  ArrowRight,
  ListOrdered,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";

function AssessmentResult() {
  const { assessmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    score = 80,
    passed = true,
    totalQuestions = 10,
    correctAnswers = 8,
  } = location.state || {};

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl mx-auto space-y-6">
        {/* ── Result Card ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center space-y-5 shadow-xs">
          <div
            className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto ${
              passed ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
            }`}
          >
            {passed ? <Trophy size={32} /> : <XCircle size={32} />}
          </div>

          <div>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                passed
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {passed ? "Evaluation Cleared (Passed)" : "Passing Threshold Not Met"}
            </span>
            <h1 className="text-3xl font-bold text-slate-900 mt-3">{score}%</h1>
            <p className="text-xs text-slate-500 mt-1">
              You answered {correctAnswers} out of {totalQuestions} questions correctly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/assessments/${assessmentId}/take`)}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw size={13} /> Retake Assessment
            </button>

            <button
              onClick={() => navigate(`/leaderboard/${assessmentId}`)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ListOrdered size={13} /> View Leaderboard
            </button>

            {passed && (
              <button
                onClick={() => navigate("/certificates")}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Award size={13} /> View Certificate
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AssessmentResult;
