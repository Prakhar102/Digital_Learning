function QuickActions() {
  return (
    <div
      className="
      mt-10

      grid

      md:grid-cols-3

      gap-6
      "
    >
      <button
        className="
        p-6

        bg-white/5

        border
        border-white/10

        rounded-3xl
        "
      >
        Continue Course
      </button>

      <button
        className="
        p-6

        bg-white/5

        border
        border-white/10

        rounded-3xl
        "
      >
        Take Assessment
      </button>

      <button
        className="
        p-6

        bg-white/5

        border
        border-white/10

        rounded-3xl
        "
      >
        View Certificates
      </button>
    </div>
  );
}

export default QuickActions;