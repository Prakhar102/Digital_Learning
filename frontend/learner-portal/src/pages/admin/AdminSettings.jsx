import { useState } from "react";
import {
  CheckCircle,
  Save,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [gatewayUrl, setGatewayUrl] = useState("http://localhost:8080");
  const [jwtExpiry, setJwtExpiry] = useState("86400");

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="p-10 max-w-4xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            System & Security Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global microservices routing parameters, authentication limits, and database pools.
          </p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle size={16} /> Cluster configuration saved!
          </div>
        )}

        {/* ── Config Form ── */}
        <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-xl p-8 space-y-6 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              API Gateway Base URL
            </label>
            <input
              type="text"
              value={gatewayUrl}
              onChange={(e) => setGatewayUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              JWT Token Expiration (Seconds)
            </label>
            <input
              type="number"
              value={jwtExpiry}
              onChange={(e) => setJwtExpiry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors font-mono"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2"
            >
              <Save size={14} /> Update Cluster Config
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default AdminSettings;