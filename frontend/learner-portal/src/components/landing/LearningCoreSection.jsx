import LearningCore3D
from "../three/LearningCore3D";

function LearningCoreSection() {
  return (
    <section
      className="
      py-4

      max-w-7xl
      mx-auto

      px-8
      "
    >
      <div className="text-center">
        <p
          className="
          uppercase

          tracking-[6px]

          text-[#3E7C74]

          mb-4
          "
        >
          Connected Intelligence
        </p>

        <h2 className="text-5xl font-bold">
            Learning Intelligence Engine
            </h2>

            <p className="mt-6 text-[#F1ECE0] max-w-3xl mx-auto">
            Knowledge grows into skills,
            confidence and achievement,
            all guided by AI-powered learning.
            </p>
      </div>

      <div className="mt-0">
        <LearningCore3D />
      </div>
    </section>
  );
}

export default LearningCoreSection;