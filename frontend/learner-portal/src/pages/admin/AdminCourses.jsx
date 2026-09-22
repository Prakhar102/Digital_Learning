import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  CheckCircle,
  Eye,
  Filter,
  Layers,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAllCourses } from "../../services/courseService";

function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const list = await getAllCourses();
      if (Array.isArray(list)) {
        setCourses(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-10 max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Platform Course Registry & Auditing
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Global catalog of technical tracks, published curricula, and module assets.
            </p>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-xs"
            />
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
              No courses found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <div className="col-span-5">Course Title</div>
                <div className="col-span-3">Category</div>
                <div className="col-span-2">Instructor ID</div>
                <div className="col-span-2 text-right">Publication Status</div>
              </div>

              {filtered.map((c) => (
                <div key={c.id} className="grid grid-cols-12 px-6 py-4 items-center text-xs hover:bg-slate-50/70 transition-colors">
                  <div className="col-span-5 font-bold text-slate-900">
                    {c.title}
                  </div>

                  <div className="col-span-3 text-slate-500 text-[11px]">
                    {c.category || "Software Engineering"}
                  </div>

                  <div className="col-span-2 text-slate-600 font-mono text-[11px]">
                    Faculty #{c.instructorId || 1}
                  </div>

                  <div className="col-span-2 text-right">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      c.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {c.status || "PUBLISHED"}
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

export default AdminCourses;