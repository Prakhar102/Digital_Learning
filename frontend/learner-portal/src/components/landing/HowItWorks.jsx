import { motion } from "framer-motion";

import FadeInSection from "../common/FadeInSection";
import GlassCard from "../common/GlassCard";

const steps = [
  {
    title: "Choose Goal",
    description:
      "Select a learning path aligned with your career ambitions.",
  },
  {
    title: "Learn",
    description:
      "Complete structured courses and guided lessons.",
  },
  {
    title: "Assess",
    description:
      "Validate knowledge through quizzes and assessments.",
  },
  {
    title: "Track Progress",
    description:
      "Monitor growth with learning analytics.",
  },
  {
    title: "Get Certified",
    description:
      "Earn certificates proving your achievement.",
  },
];

function HowItWorks() {
  return (
    <FadeInSection>
      <section
        id="how-it-works"
        className="
        py-16
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
            How It Works
          </p>

          <h2
            className="
            text-5xl
            font-bold
            "
          >
            From Goal To Certification
          </h2>

          <p
            className="
            mt-6

            text-[#F1ECE0]

            max-w-2xl
            mx-auto
            "
          >
            A complete learning ecosystem that
            guides learners from their first course
            to industry-recognized certification.
          </p>
        </div>

        <div
          className="
          mt-12

          grid

          md:grid-cols-5

          gap-6
          "
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.15,
              }}
              viewport={{
                once: true,
              }}
            >
              <GlassCard>
                <div className="p-6 min-h-[260px]">
                  <div
                    className="
                    h-12
                    w-12

                    rounded-full

                    bg-[#C98A3D]

                    text-[#161A34]

                    flex
                    items-center
                    justify-center

                    font-bold
                    "
                  >
                    {index + 1}
                  </div>

                  <h3
                    className="
                    mt-6

                    text-xl
                    font-bold
                    "
                  >
                    {step.title}
                  </h3>

                  <p
                    className="
                    mt-4

                    text-sm

                    text-[#F1ECE0]
                    "
                  >
                    {step.description}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>
    </FadeInSection>
  );
}

export default HowItWorks;