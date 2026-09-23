import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Mail,
  Lock,
  User,
  Phone,
  Send,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { createInstructor } from "../../services/adminService";

function CreateInstructor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setStatus({ type: "error", msg: "Please fill in all required fields." });
      return;
    }

    try {
      setSubmitting(true);
      setStatus({ type: "", msg: "" });
      const res = await createInstructor(formData);
      setStatus({
        type: "success",
        msg: res?.message || "Faculty account provisioned successfully!",
      });
      setTimeout(() => {
        navigate("/admin/instructors");
      }, 1200);
    } catch (err) {
      console.error("Create instructor error:", err);
      const errorMsg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err?.response?.data : null) ||
        err?.message ||
        "Failed to create instructor account.";
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLayout>
      <div className="p-10 max-w-3xl mx-auto space-y-6">
        {/* ── Top Bar ── */}
        <button
          onClick={() => navigate("/admin/instructors")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Faculty Directory
        </button>

        {/* ── Header ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <h1 className="text-xl font-bold text-slate-900">
            Provision New Faculty Account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grant educator credentials to author courses, publish assessments, and grade learner submissions.
          </p>
        </div>

        {status.msg && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs ${
              status.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {status.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {status.msg}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-xl p-8 space-y-5 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Full Legal Name *
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Dr. Jordan Hayes"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Institutional Email Address *
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="jordan.hayes@dlm-university.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Contact Phone Number
            </label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                placeholder="+1 (555) 234-5678"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Initial Temporary Password *
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/instructors")}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
            >
              <Send size={14} />
              {submitting ? "Provisioning..." : "Provision Faculty Account"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default CreateInstructor;