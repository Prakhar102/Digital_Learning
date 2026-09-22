import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Shield,
  CheckCircle,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAllInstructors } from "../../services/adminService";

function AdminInstructors() {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      const list = await getAllInstructors();
      if (Array.isArray(list)) {
        setInstructors(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = instructors.filter(
    (ins) =>
      ins.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      ins.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-10 max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Faculty Directory & Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Authorized faculty personnel with curriculum authoring and grading permissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search instructors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-xs"
              />
            </div>
            <button
              onClick={() => navigate("/admin/create-instructor")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <UserPlus size={14} /> Provision Faculty
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-16 text-center">
              <div className="h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500">
              No faculty accounts found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <div className="col-span-4">Faculty Member</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {filtered.map((ins) => (
                <div key={ins.id} className="grid grid-cols-12 px-6 py-4 items-center text-xs hover:bg-slate-50/70 transition-colors">
                  <div className="col-span-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                      {ins.fullName?.charAt(0) || "I"}
                    </div>
                    {ins.fullName}
                  </div>

                  <div className="col-span-4 text-slate-500 font-mono text-[11px]">
                    {ins.email}
                  </div>

                  <div className="col-span-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded">
                      INSTRUCTOR
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle size={12} /> Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminInstructors;