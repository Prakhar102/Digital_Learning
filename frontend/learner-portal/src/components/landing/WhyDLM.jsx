import { motion } from "framer-motion";
import FadeInSection from "../common/FadeInSection";
import GlassCard from "../common/GlassCard";

function WhyDLM() {
  return (
    <FadeInSection>
      <section
        className="
        py-16

        max-w-7xl
        mx-auto

        px-8
        "
      >
        <div className="text-center">
          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            viewport={{
              once: true,
            }}
            className="
            uppercase

            tracking-[6px]

            text-[#3E7C74]

            mb-4
            "
          >
            Why Digital Learning Mentor
          </motion.p>

          <motion.h2
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            viewport={{
              once: true,
            }}
            className="
            text-5xl
            md:text-6xl

            font-bold

            leading-tight
            "
          >
            Most Platforms
            <br />

            Sell Courses.

            <span
              className="
              block

              text-[#C98A3D]
              "
            >
              We Build Careers.
            </span>
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
            }}
            whileInView={{
              opacity: 1,
            }}
            transition={{
              delay: 0.2,
              duration: 0.7,
            }}
            viewport={{
              once: true,
            }}
            className="
            mt-8

            max-w-3xl
            mx-auto

            text-lg

            text-[#F1ECE0]
            "
          >
            Digital Learning Mentor combines
            courses, assessments, certifications,
            progress tracking and AI guidance
            into a single ecosystem designed to
            help learners achieve real career goals.
          </motion.p>
        </div>

        <div
          className="
          mt-14

          grid

          md:grid-cols-2
          lg:grid-cols-4

          gap-8
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            viewport={{
              once: true,
            }}
          >
            <GlassCard>
              <div className="p-8">
                <h3
                  className="
                  text-[#3E7C74]

                  text-2xl
                  font-bold
                  "
                >
                  AI Mentor
                </h3>

                <p className="mt-4 text-[#F1ECE0]">
                  Personalized learning
                  guidance powered by AI.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
            }}
            viewport={{
              once: true,
            }}
          >
            <GlassCard>
              <div className="p-8">
                <h3
                  className="
                  text-[#C98A3D]

                  text-2xl
                  font-bold
                  "
                >
                  Assessments
                </h3>

                <p className="mt-4 text-[#F1ECE0]">
                  Validate knowledge through
                  structured tests and quizzes.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
            }}
            viewport={{
              once: true,
            }}
          >
            <GlassCard>
              <div className="p-8">
                <h3
                  className="
                  text-[#3E7C74]

                  text-2xl
                  font-bold
                  "
                >
                  Progress
                </h3>

                <p className="mt-4 text-[#F1ECE0]">
                  Monitor growth through
                  intelligent learning analytics.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.55,
            }}
            viewport={{
              once: true,
            }}
          >
            <GlassCard>
              <div className="p-8">
                <h3
                  className="
                  text-[#C98A3D]

                  text-2xl
                  font-bold
                  "
                >
                  Certificates
                </h3>

                <p className="mt-4 text-[#F1ECE0]">
                  Earn recognized proof of
                  learning achievement.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </FadeInSection>
  );
}

export default WhyDLM;