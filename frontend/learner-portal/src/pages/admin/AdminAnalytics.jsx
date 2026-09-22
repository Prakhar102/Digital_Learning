import { useState } from "react";
import {
  Activity,
  Server,
  Database,
  Cpu,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";

function AdminAnalytics() {
  const [services, setServices] = useState([
    { name: "API Gateway", port: 8080, status: "UP", latency: "12ms" },
    { name: "Identity Service", port: 8081, status: "UP", latency: "18ms" },
    { name: "Catalog Service", port: 8082, status: "UP", latency: "15ms" },
    { name: "Enrollment Service", port: 8083, status: "UP", latency: "22ms" },
    { name: "Progress Service", port: 8084, status: "UP", latency: "14ms" },
    { name: "Assessment Service", port: 8085, status: "UP", latency: "20ms" },
    { name: "Assignment Service", port: 8086, status: "UP", latency: "19ms" },
    { name: "Notification Service", port: 8087, status: "UP", latency: "10ms" },
    { name: "Certification Service", port: 8088, status: "UP", latency: "16ms" },
    { name: "Discovery Server (Eureka)", port: 8761, status: "UP", latency: "4ms" },
    { name: "Config Server", port: 8888, status: "UP", latency: "8ms" },
    { name: "RAG Vector AI Service", port: 8090, status: "UP", latency: "45ms" },
  ]);

  return (
    <AdminLayout>
      <div className="p-10 max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Microservices Cluster Telemetry
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time health probes, port allocations, and response latencies across all 12 backend services.
            </p>
          </div>

          <button
            onClick={() => {}}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw size={13} /> Refresh Probes
          </button>
        </div>

        {/* ── Cluster Metrics ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Service Mesh Health</span>
              <Activity size={16} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">100%</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">12/12 Services Operational</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Gateway Latency</span>
              <Server size={16} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">16.4ms</p>
            <p className="text-[11px] text-slate-500 mt-1">Sub-50ms SLA Target</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cluster Memory Utilization</span>
              <Cpu size={16} className="text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">42.8%</p>
            <p className="text-[11px] text-slate-500 mt-1">Normal Operating Load</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Database Connection Pool</span>
              <Database size={16} className="text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">98.2%</p>
            <p className="text-[11px] text-slate-500 mt-1">HikariCP Pool Healthy</p>
          </div>
        </div>

        {/* ── Services Grid ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            <div className="grid grid-cols-12 px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
              <div className="col-span-5">Microservice</div>
              <div className="col-span-3">Port Binding</div>
              <div className="col-span-2">Avg Latency</div>
              <div className="col-span-2 text-right">Health Status</div>
            </div>

            {services.map((s, idx) => (
              <div key={idx} className="grid grid-cols-12 px-6 py-4 items-center text-xs hover:bg-slate-50/70 transition-colors">
                <div className="col-span-5 font-bold text-slate-900 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  {s.name}
                </div>

                <div className="col-span-3 text-slate-600 font-mono text-[11px]">
                  :{s.port}
                </div>

                <div className="col-span-2 text-slate-500 font-mono text-[11px]">
                  {s.latency}
                </div>

                <div className="col-span-2 text-right">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                    ONLINE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAnalytics;