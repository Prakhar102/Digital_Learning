import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Award,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Download,
  PlusCircle,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getUserCertificates } from "../../services/certificateService";
import { getCurrentUser } from "../../services/userService";

function MyCertificates() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
    const handleStorage = () => loadCertificates();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  async function loadCertificates() {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (user?.id) {
        const list = await getUserCertificates(user.id);
        setCertificates(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      console.error("Error loading certificates:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Verified Credentials & Certifications
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Official course completion certificates unlocked upon 100% curriculum completion.
            </p>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle size={14} /> Earn New Credentials
          </button>
        </div>

        {/* ── Certificate Grid ── */}
        {loading ? (
          <div className="p-16 text-center">
            <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white shadow-xs">
            <Trophy size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No certificates unlocked yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Complete 100% of all lessons and modules in an enrolled course to unlock your official verified certificate.
            </p>
            <button
              onClick={() => navigate("/my-learning")}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              Continue Learning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div
                key={cert.id || cert.certificateId}
                className="bg-white border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between hover:border-amber-400 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                      <Award size={20} />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-1">
                      <ShieldCheck size={11} /> 100% Verified
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                    {cert.courseTitle || `Course #${cert.courseId} Certification`}
                  </h3>

                  <p className="text-xs text-slate-500 mb-4 font-mono text-[11px]">
                    ID: {cert.id || cert.certificateId}
                  </p>

                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                    <p className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Recipient:</span>
                      <span className="font-semibold text-slate-800">{cert.userName || "Learner"}</span>
                    </p>
                    <p className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-semibold text-emerald-700">{cert.grade || "100% Completed"}</span>
                    </p>
                    <p className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Issued:</span>
                      <span className="font-mono text-slate-500">
                        {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "Today"}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/certificates/${cert.id || cert.certificateId}`)}
                  className="w-full py-2 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Award size={13} /> View & Download Certificate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MyCertificates;
