import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import InstructorLayout from "../../components/instructor/InstructorLayout";
import { getAllCourses } from "../../services/courseService";
import { getInstructorAssignments } from "../../services/assignmentService";
import { getCurrentUser } from "../../services/userService";

function InstructorAnalytics() {
  const [stats, setStats] = useState({
    activeStudents: 142,
    completionRate: 94,
    avgScore: 88,
    totalEvaluations: 48,
  });

  return (
    <InstructorLayout>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Teaching Analytics & Cohort Telemetry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Performance indicators, assessment distribution curves, and assignment grading velocity.
          </p>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Students</span>
              <Users size={16} className="text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.activeStudents}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={11} /> +12% this quarter
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Completion Rate</span>
              <CheckCircle size={16} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.completionRate}%</p>
            <p className="text-[11px] text-slate-500 mt-1">Syllabus benchmark</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cohort Average</span>
              <Award size={16} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.avgScore}%</p>
            <p className="text-[11px] text-slate-500 mt-1">Across all quizzes</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Evaluations Cleared</span>
              <FileSpreadsheet size={16} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalEvaluations}</p>
            <p className="text-[11px] text-slate-500 mt-1">Graded PDF submissions</p>
          </div>
        </div>

        {/* ── Performance Summary ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Curriculum Engagement Overview</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Module 1: Architecture & Foundations</span>
                <span className="text-slate-900">98% Finished</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[98%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Module 2: Microservice API Gateways</span>
                <span className="text-slate-900">85% Finished</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[85%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Module 3: Distributed Transactions & Resiliency</span>
                <span className="text-slate-900">72% Finished</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[72%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </InstructorLayout>
  );
}

export default InstructorAnalytics;
