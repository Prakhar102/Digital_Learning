function ProgressOverview() {
  return (
    <div
      className="
      mt-10

      bg-white/5

      border
      border-white/10

      rounded-[32px]

      p-8
      "
    >
      <h2
        className="
        text-2xl

        font-bold
        "
      >
        Learning Progress
      </h2>

      <div
        className="
        mt-8

        flex

        items-center

        gap-10
        "
      >
        <div
          className="
          h-40
          w-40

          rounded-full

          border-[10px]
          border-[#C98A3D]

          flex
          items-center
          justify-center
          "
        >
          <span
            className="
            text-3xl

            font-bold
            "
          >
            68%
          </span>
        </div>

        <div>
          <p className="mb-3">
            Spring Boot Completed
          </p>

          <p className="mb-3">
            Java Fundamentals Completed
          </p>

          <p>
            ⏳ Kafka In Progress
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProgressOverview;