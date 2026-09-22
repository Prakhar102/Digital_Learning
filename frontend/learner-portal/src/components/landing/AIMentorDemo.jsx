import { motion } from "framer-motion";
import FadeInSection from "../common/FadeInSection";
import { IoCheckmarkCircle } from "react-icons/io5";

function AIMentorDemo() {
  return (
    <FadeInSection>
      <section
        className="
        py-13

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
            AI Mentor
          </p>

          <h2
            className="
            text-5xl
            font-bold
            "
          >
            Learn With Intelligence
          </h2>

          <p
            className="
            mt-5

            text-[#F1ECE0]

            max-w-3xl
            mx-auto
            "
          >
            Personalized guidance generated from your skills,
            assessments and learning goals.
          </p>
        </div>

        <div
          className="
          mt-14

          grid
          lg:grid-cols-2

          gap-8
          "
        >
          {/* LEFT PANEL */}

          <motion.div
            whileHover={{
              y: -8,
              scale: 1.01,
            }}
            className="
            bg-white/5

            backdrop-blur-xl

            border
            border-white/10

            rounded-[32px]

            p-8
            "
          >
            <motion.div
              initial={{
                opacity: 0,
              }}
              whileInView={{
                opacity: 1,
              }}
              transition={{
                duration: 0.5,
              }}
              viewport={{
                once: true,
              }}
            >
              <p
                className="
                text-[#3E7C74]
                font-medium
                "
              >
                AI Mentor &gt; Analyzing Profile...
              </p>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.5,
              }}
              viewport={{
                once: true,
              }}
              className="mt-8"
            >
              <div className="flex items-center gap-3">
              <IoCheckmarkCircle className="text-[#C98A3D] text-xl shrink-0" />
              <span>Spring Boot ........ 82%</span>
              </div>
               
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 1,
              }}
              viewport={{
                once: true,
              }}
              className="mt-4"
            >
              <div className="flex items-center gap-3">
              <IoCheckmarkCircle className="text-[#C98A3D] text-xl shrink-0" />
              <span>Security ............. 74%</span>
              </div>
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 1.5,
              }}
              viewport={{
                once: true,
              }}
              className="
              mt-4

              text-[#C98A3D]
              "
            >
              ⚠ Kafka ................. 34%
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
              }}
              whileInView={{
                opacity: 1,
              }}
              transition={{
                delay: 2,
              }}
              viewport={{
                once: true,
              }}
              className="
              mt-8

              text-[#3E7C74]
              "
            >
              Skill Gaps Identified
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
              }}
              whileInView={{
                opacity: 1,
              }}
              transition={{
                delay: 2.5,
              }}
              viewport={{
                once: true,
              }}
              className="
              mt-8

              text-[#C98A3D]
              font-semibold
              "
            >
              Recommended Next:
            </motion.div>

            <motion.ul
              initial={{
                opacity: 0,
              }}
              whileInView={{
                opacity: 1,
              }}
              transition={{
                delay: 3,
              }}
              viewport={{
                once: true,
              }}
              className="
              mt-5

              space-y-3
              "
            >
              <li>→ Kafka Fundamentals</li>

              <li>
                → Event Driven Architecture
              </li>

              <li>
                → AWS Foundations
              </li>
            </motion.ul>
          </motion.div>

          {/* RIGHT PANEL */}

          <motion.div
            whileHover={{
              y: -8,
              scale: 1.01,
            }}
            className="
            bg-white/5

            backdrop-blur-xl

            border
            border-white/10

            rounded-[32px]

            p-8

            flex
            flex-col
            justify-center
            "
          >
            <div className="text-center">
              <p
                className="
                text-[#3E7C74]
                "
              >
                Skill Gap Score
              </p>

              <motion.h3
                initial={{
                  opacity: 0,
                  scale: 0.5,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: 2.5,
                }}
                viewport={{
                  once: true,
                }}
                className="
                mt-8

                text-7xl
                font-bold

                text-[#C98A3D]
                "
              >
                34%
              </motion.h3>

              <motion.div
                initial={{
                  opacity: 0,
                }}
                whileInView={{
                  opacity: 1,
                }}
                transition={{
                  delay: 3,
                }}
                viewport={{
                  once: true,
                }}
                className="
                mt-10

                rounded-3xl

                bg-[#161A34]

                p-6
                "
              >
                <p
                  className="
                  text-[#3E7C74]
                  "
                >
                  Target Role
                </p>

                <h4
                  className="
                  mt-4

                  text-2xl
                  font-bold
                  "
                >
                  Senior Backend Engineer
                </h4>

                <p
                  className="
                  mt-5

                  text-[#F1ECE0]
                  "
                >
                  Complete Kafka, AWS and
                  System Design to unlock
                  this career path.
                </p>

                <div
                  className="
                  mt-8

                  text-[#C98A3D]
                  font-bold
                  "
                >
                  Estimated Completion:
                  12 Weeks
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </FadeInSection>
  );
}

export default AIMentorDemo;