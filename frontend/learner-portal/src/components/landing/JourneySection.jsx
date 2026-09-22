function JourneySection() {
  const steps = [
    "Enroll",
    "Learn",
    "Practice",
    "Assess",
    "Get Certified",
  ];

  return (
    <section
      className="
      py-32

      max-w-6xl
      mx-auto

      px-8
      "
    >
      <h2
        className="
        text-4xl
        font-bold

        text-center

        mb-20
        "
      >
        Your Learning Journey
      </h2>

      <div
        className="
        flex

        flex-wrap

        justify-center

        gap-8
        "
      >
        {steps.map((step) => (
          <div
            key={step}
            className="
            px-8
            py-6

            rounded-2xl

            border
            border-[#C98A3D]/30

            bg-[#161A34]
            "
          >
            {step}
          </div>
        ))}
      </div>
    </section>
  );
}

export default JourneySection;