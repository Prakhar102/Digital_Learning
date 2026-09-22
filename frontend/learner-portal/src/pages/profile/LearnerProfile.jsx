import { useState, useEffect } from "react";
import {
  UserCircle,
  Mail,
  Shield,
  Key,
  CheckCircle,
  Save,
  BookOpen,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import LeetCodeStreakHeatmap from "../../components/profile/LeetCodeStreakHeatmap";
import { getCurrentUser } from "../../services/userService";

function LearnerProfile() {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
      if (u) {
        setFullName(u.fullName || "");
        setEmail(u.email || "");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Account Profile & Learning Streak
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal profile details, authenticated credentials, and LeetCode-style activity streak.
          </p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle size={16} /> Profile preferences updated successfully!
          </div>
        )}

        {/* ── LeetCode-style Streak & 52-Week Activity Heatmap ── */}
        <LeetCodeStreakHeatmap user={user} />

        {/* ── Profile Form ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="h-16 w-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shadow-xs">
              {fullName?.charAt(0) || "U"}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{fullName || "Student User"}</h2>
              <p className="text-xs text-slate-500">{email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded">
                Learner Role
              </span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <Save size={14} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default LearnerProfile;
