import { calculateLearnerStreak } from "../../services/streakService";

function WelcomeSection({ user }) {
  const { stats } = calculateLearnerStreak(user);

  return (
    <div
      className="
      flex
      flex-col
      lg:flex-row
      justify-between
      gap-8
      "
    >
      <div>
        <p
          className="
          text-[#C98A3D]
          uppercase
          tracking-[4px]
          text-xs font-semibold
          "
        >
          Welcome Back
        </p>

        <h1
          className="
          mt-3
          text-4xl md:text-5xl
          font-bold text-slate-900
          "
        >
          {user ? user.fullName : "Loading..."}
        </h1>

        <p
          className="
          mt-3
          text-slate-600 text-sm
          "
        >
          Continue your engineering learning journey.
        </p>
      </div>

      <div
        className="
        bg-white
        border
        border-slate-200/90
        shadow-xs
        rounded-3xl
        p-6
        min-w-[280px]
        "
      >
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
          Current Streak
        </p>

        <h2
          className="
          text-4xl
          font-bold
          mt-2
          text-orange-600
          flex items-center gap-2
          "
        >
          <span>🔥</span> {stats.currentStreak} Days
        </h2>
        <p className="text-[11px] text-slate-400 mt-1">
          Longest: {stats.maxStreak} Days • {stats.totalActiveDays} Total Active Days
        </p>
      </div>
    </div>
  );
}

export default WelcomeSection;