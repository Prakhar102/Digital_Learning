import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trophy,
  Medal,
  ArrowLeft,
  Search,
  Users,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import InstructorLayout from "../../components/instructor/InstructorLayout";
import { getCurrentUser } from "../../services/userService";
import { getLeaderboard, getGlobalDynamicLeaderboard } from "../../services/assessmentService";

function Leaderboard() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    loadData();
  }, [assessmentId]);

  async function loadData() {
    try {
      setLoading(true);
      const u = await getCurrentUser();
      if (u) setUser(u);

      if (assessmentId) {
        const list = await getLeaderboard(assessmentId);
        setBoard(Array.isArray(list) && list.length > 0 ? list : getGlobalDynamicLeaderboard());
      } else {
        setBoard(getGlobalDynamicLeaderboard());
      }
    } catch (e) {
      console.error(e);
      setBoard(getGlobalDynamicLeaderboard());
    } finally {
      setLoading(false);
    }
  }

  const isInstructor =
    user?.role === "ROLE_INSTRUCTOR" ||
    user?.role === "INSTRUCTOR" ||
    user?.role === "FACULTY" ||
    user?.role === "ROLE_FACULTY";

  const Layout = isInstructor ? InstructorLayout : DashboardLayout;

  const filteredBoard = board.filter((row) =>
    (row.learnerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.learnerEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-black shadow-xs">
          <Trophy size={14} className="text-amber-500 fill-amber-500" />
          <span>1st</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold shadow-xs">
          <Medal size={14} className="text-slate-400" />
          <span>2nd</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-900/10 text-amber-900 border border-amber-900/20 rounded-lg text-xs font-bold shadow-xs">
          <Medal size={14} className="text-amber-800" />
          <span>3rd</span>
        </div>
      );
    }
    return <span className="text-xs font-bold text-slate-500 pl-2">#{rank}</span>;
  };

  return (
    <Layout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => {
              if (isInstructor) {
                navigate("/instructor/assessments");
              } else {
                navigate(-1);
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to {isInstructor ? "Assessments Console" : "Dashboard"}
          </button>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
            {assessmentId ? `Assessment #${assessmentId} Ranking` : "Platform Global Leaderboard"}
          </span>
        </div>

        {/* ── Header ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" />
              Dynamic Cohort Leaderboard & Standings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live standings computed dynamically from verified assessment scores, quiz submissions, and assignment evaluations.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search learner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white shadow-xs transition-colors"
            />
          </div>
        </div>

        {/* ── Leaderboard Table ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            <div className="grid grid-cols-12 px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
              <div className="col-span-2">Rank</div>
              <div className="col-span-5">Learner</div>
              <div className="col-span-2 text-center">Tests Taken</div>
              <div className="col-span-3 text-right">Aggregate Score</div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading dynamic rankings...</div>
            ) : filteredBoard.length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-500">
                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">No Assessment Records Found</p>
                <p className="text-slate-400 mt-1">Complete your scheduled course assessments to appear on the leaderboard!</p>
              </div>
            ) : (
              filteredBoard.map((row, idx) => (
                <div
                  key={row.learnerId || idx}
                  className="grid grid-cols-12 px-6 py-4 items-center text-xs hover:bg-slate-50/80 transition-colors"
                >
                  <div className="col-span-2 flex items-center">
                    {getRankBadge(row.rank || idx + 1)}
                  </div>

                  <div className="col-span-5">
                    <p className="font-bold text-slate-900">{row.learnerName || `Learner #${row.learnerId}`}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{row.learnerEmail || `learner_${row.learnerId}@dlm.edu`}</p>
                  </div>

                  <div className="col-span-2 text-center font-medium text-slate-600">
                    {row.attemptsCount || row.attempts || 1}
                  </div>

                  <div className="col-span-3 text-right">
                    <span className="font-black text-emerald-600 text-sm">
                      {row.totalScore || row.score || 0} pts
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium">
                      Avg: {row.averageScore || row.score || 0}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Leaderboard;

