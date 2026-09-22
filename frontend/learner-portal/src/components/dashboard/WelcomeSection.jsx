function WelcomeSection({ user }) {
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
          "
        >
          Welcome Back
        </p>

        <h1
          className="
          mt-3

          text-5xl

          font-bold
          "
        >
          {user
            ? user.fullName
            : "Loading..."}
        </h1>

        <p
          className="
          mt-4

          text-[#F1ECE0]
          "
        >
          Continue your learning journey.
        </p>
      </div>

      <div
        className="
        bg-white/5

        border
        border-white/10

        rounded-3xl

        p-6

        min-w-[280px]
        "
      >
        <p className="text-white/70">
          Current Streak
        </p>

        <h2
          className="
          text-4xl

          font-bold

          mt-3
          "
        >
          14 Days
        </h2>
      </div>
    </div>
  );
}

export default WelcomeSection;