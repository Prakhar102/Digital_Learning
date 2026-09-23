import { useState, useEffect } from "react";
import {
  Flame,
  Zap,
  Calendar,
} from "lucide-react";
import { calculateLearnerStreak } from "../../services/streakService";

export default function LeetCodeStreakHeatmap({ user, enrollments = [] }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [streakData, setStreakData] = useState(() => calculateLearnerStreak(user, enrollments));

  useEffect(() => {
    setStreakData(calculateLearnerStreak(user, enrollments));

    const handleStorage = () => {
      setStreakData(calculateLearnerStreak(user, enrollments));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user, enrollments]);

  const { weeks, stats } = streakData;

  // Color mappings for LeetCode green tiers
  const getCellColor = (level) => {
    switch (level) {
      case 1:
        return "bg-emerald-200 hover:ring-2 hover:ring-emerald-400";
      case 2:
        return "bg-emerald-400 hover:ring-2 hover:ring-emerald-500";
      case 3:
        return "bg-emerald-600 hover:ring-2 hover:ring-emerald-700";
      case 4:
        return "bg-emerald-800 hover:ring-2 hover:ring-emerald-900";
      default:
        return "bg-slate-100 hover:bg-slate-200";
    }
  };

  const monthsHeader = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* ── Top Metric Cards (LeetCode Style) ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-xs">
            <Flame size={24} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Learning Streak & Activity Heatmap</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                <Flame size={11} />
                LeetCode Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Consistent daily video completion, non-skip lectures, and assessment milestones
            </p>
          </div>
        </div>

        {/* Quick Streak Counters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Streak</p>
            <p className="text-lg font-bold text-orange-600 flex items-center justify-center gap-1">
              <Flame size={16} />
              {stats.currentStreak} Days
            </p>
          </div>

          <div className="flex-1 md:flex-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Longest Streak</p>
            <p className="text-lg font-bold text-blue-600 flex items-center justify-center gap-1">
              <Zap size={16} />
              {stats.maxStreak} Days
            </p>
          </div>

          <div className="flex-1 md:flex-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Active</p>
            <p className="text-lg font-bold text-emerald-600 flex items-center justify-center gap-1">
              <Calendar size={16} />
              {stats.totalActiveDays} Days
            </p>
          </div>
        </div>
      </div>

      {/* ── 52-Week LeetCode Heatmap Grid ── */}
      <div className="space-y-2 overflow-x-auto pb-2">
        {/* Month Labels */}
        <div className="flex text-[10px] text-slate-400 font-mono pl-7 justify-between pr-2 min-w-[680px]">
          {monthsHeader.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>

        {/* Heatmap Matrix with Weekday Labels */}
        <div className="flex items-start gap-1.5 min-w-[680px]">
          {/* Weekday indicator column */}
          <div className="flex flex-col justify-between text-[9px] text-slate-400 font-mono h-[86px] pr-1 select-none">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* 52 Columns Grid */}
          <div className="flex-1 flex gap-1 justify-between">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    onClick={() => setSelectedDay(day)}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`
                      h-2.5 w-2.5 rounded-2xs cursor-pointer transition-all duration-150
                      ${getCellColor(day.level)}
                    `}
                    title={`${day.displayDate}: ${day.count} activities (${day.minutes} mins)`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>Less</span>
            <div className="h-2.5 w-2.5 rounded-2xs bg-slate-100" />
            <div className="h-2.5 w-2.5 rounded-2xs bg-emerald-200" />
            <div className="h-2.5 w-2.5 rounded-2xs bg-emerald-400" />
            <div className="h-2.5 w-2.5 rounded-2xs bg-emerald-600" />
            <div className="h-2.5 w-2.5 rounded-2xs bg-emerald-800" />
            <span>More Activity</span>
          </div>

          <p className="text-[11px] text-slate-400 font-mono">
            {hoveredDay
              ? `${hoveredDay.displayDate} — ${hoveredDay.count} activities (${hoveredDay.minutes} mins studied)`
              : "Hover over any day square to inspect activity breakdown"}
          </p>
        </div>
      </div>

      {/* ── Selected Day Detail Card ── */}
      {selectedDay && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-white ${selectedDay.count > 0 ? "bg-emerald-600" : "bg-slate-400"}`}>
              {selectedDay.count}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{selectedDay.displayDate}</p>
              <p className="text-[11px] text-slate-500">
                {selectedDay.count > 0
                  ? `Completed ${selectedDay.lessons} video lessons • ${selectedDay.minutes} minutes active non-skip watch time`
                  : "No platform learning activity recorded on this date."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedDay.quizzes > 0 && (
              <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-purple-100 text-purple-700 border border-purple-200">
                1 Assessment Cleared
              </span>
            )}
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
