import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trophy,
  Award,
  ShieldCheck,
  Download,
  ArrowLeft,
  Printer,
  CheckCircle2,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { getCurrentUser } from "../../services/userService";

function CertificateView() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => navigate("/certificates")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Certificates
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer size={13} /> Print
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download size={13} /> Download Official PDF
            </button>
          </div>
        </div>

        {/* ── Certificate Preview Canvas ── */}
        <div className="bg-white border-8 border-double border-slate-200 rounded-2xl p-14 text-center space-y-8 relative overflow-hidden shadow-lg bg-radial from-amber-50/30 to-white">
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Award size={28} />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-bold tracking-widest text-slate-900 uppercase">
                Digital Learning Management System
              </h2>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
                Accredited Professional Certification Board
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-[4px] font-bold">
              Certificate of Excellence
            </p>
            <p className="text-xs text-slate-400">This is to proudly certify that</p>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight py-1 font-serif">
              {user?.fullName || "Distinguished Scholar"}
            </h1>
            <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
              has successfully fulfilled all curriculum requirements, passed comprehensive evaluations, and demonstrated proficient mastery in
            </p>
            <h3 className="text-xl font-bold text-amber-600">
              Cloud-Native Distributed Systems & Microservices Engineering
            </h3>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 items-end text-center">
            <div>
              <p className="text-xs font-serif italic text-slate-700 font-bold">Dr. Elizabeth Vance</p>
              <div className="h-0.5 w-28 bg-slate-300 mx-auto my-1" />
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Academic Dean</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full border-2 border-dashed border-amber-500 flex items-center justify-center text-amber-600">
                <ShieldCheck size={32} />
              </div>
              <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                UID: {certificateId}
              </p>
            </div>

            <div>
              <p className="text-xs font-serif italic text-slate-700 font-bold">Marcus Sterling, M.Sc.</p>
              <div className="h-0.5 w-28 bg-slate-300 mx-auto my-1" />
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Program Director</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CertificateView;
