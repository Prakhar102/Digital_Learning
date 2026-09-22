import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import FadeInSection from "../common/FadeInSection";

const paths = [
  {
    title: "Backend Engineering",
    skills: "Spring Boot • Microservices • Kafka • AWS",
    duration: "12 Weeks",
  },
  {
    title: "Cloud Engineering",
    skills: "Linux • Docker • Kubernetes • Azure",
    duration: "10 Weeks",
  },
  {
    title: "AI Engineering",
    skills: "Python • LLMs • RAG • Vector DBs",
    duration: "14 Weeks",
  },
  {
    title: "Frontend Engineering",
    skills: "React • TypeScript • Next.js • Tailwind",
    duration: "10 Weeks",
  },
  {
    title: "Data Engineering",
    skills: "Python • Spark • Airflow • Snowflake",
    duration: "12 Weeks",
  },
  {
    title: "Cyber Security",
    skills: "Networking • SIEM • SOC • Incident Response",
    duration: "11 Weeks",
  },
  {
    title: "DevOps Engineering",
    skills: "Docker • Jenkins • Kubernetes • Terraform",
    duration: "12 Weeks",
  },
  {
    title: "Mobile Development",
    skills: "Flutter • Android • iOS • Firebase",
    duration: "10 Weeks",
  },
  {
    title: "Machine Learning",
    skills: "Python • TensorFlow • PyTorch • MLOps",
    duration: "14 Weeks",
  },
  {
    title: "Data Science",
    skills: "Python • Pandas • ML • Visualization",
    duration: "12 Weeks",
  },
  {
    title: "QA Automation",
    skills: "Selenium • Cypress • API Testing",
    duration: "8 Weeks",
  },
  {
    title: "Site Reliability",
    skills: "Monitoring • Reliability • Kubernetes",
    duration: "10 Weeks",
  },
  {
    title: "Blockchain",
    skills: "Ethereum • Solidity • Web3",
    duration: "12 Weeks",
  },
  {
    title: "Game Development",
    skills: "Unity • C# • Unreal",
    duration: "14 Weeks",
  },
  {
    title: "UI/UX Design",
    skills: "Figma • Design System • Accessibility",
    duration: "8 Weeks",
  },
  {
    title: "Product Management",
    skills: "Roadmaps • Metrics • Agile",
    duration: "8 Weeks",
  },
];

function CareerPaths() {
  const [active, setActive] = useState(null);
  const [paused, setPaused] = useState(false);

  const firstRow = paths.slice(0, 8);
  const secondRow = paths.slice(8, 16);

  return (
    <FadeInSection>
      <section
        id="career-paths"
        className="
        py-10
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
            Career Paths
          </p>

          <h2
            className="
            text-5xl
            font-bold
            "
          >
            Choose Your Future
          </h2>

          <p
            className="
            mt-5
            text-[#F1ECE0]
            max-w-3xl
            mx-auto
            "
          >
            Explore learning journeys designed
            around real industry careers.
          </p>
        </div>

        {/* POPUP */}

        <div className="relative mt-2 h-[70px]">
          <AnimatePresence>
            {active !== null && (
              <motion.div
                key={active}
                initial={{
                  opacity: 0,
                  y: 15,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 15,
                  scale: 0.95,
                }}
                transition={{
                  duration: 0.2,
                }}
                className="
                absolute

                left-45
                -translate-x-1/2

                bottom-[10px]

                w-[280px]
                min-h-[220px]

                rounded-[28px]

                bg-white/10

                backdrop-blur-2xl

                border
                border-white/10

                p-6

                shadow-[0_0_40px_rgba(62,124,116,0.2)]

                z-50
                "
              >
                <h3
                  className="
                  text-[#C98A3D]
                  text-xl
                  font-bold
                  "
                >
                  {paths[active].title}
                </h3>

                <div
                  className="
                  mt-4

                  flex
                  flex-wrap

                  gap-2
                  "
                >
                  {paths[active].skills
                    .split(" • ")
                    .map((skill) => (
                      <span
                        key={skill}
                        className="
                        px-3
                        py-1

                        rounded-full

                        bg-[#161A34]

                        text-sm
                        "
                      >
                        {skill}
                      </span>
                    ))}
                </div>

                <div
                  className="
                  mt-4

                  text-[#3E7C74]

                  font-semibold
                  "
                >
                  Duration: {paths[active].duration}
                </div>

                <div
                  className="
                  mt-2

                  text-[#C98A3D]
                  "
                >
                  Certificate Included
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ROW 1 */}

        <div
          className="overflow-visible mt-2"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            setPaused(false);
            setActive(null);
          }}
        >
          <motion.div
            animate={
              paused
                ? {}
                : {
                    x: ["0%", "-50%"],
                  }
            }
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
            flex
            gap-4
            w-max
            "
          >
            {[...firstRow, ...firstRow].map(
              (path, index) => (
                <motion.button
                  key={`${path.title}-${index}`}
                  onMouseEnter={() =>
                    setActive(
                      paths.findIndex(
                        (p) =>
                          p.title === path.title
                      )
                    )
                  }
                  whileHover={{
                    y: -8,
                    scale: 1.06,
                  }}
                  className="
                  px-6
                  py-4

                  rounded-full

                  bg-white/5

                  border
                  border-white/10

                  backdrop-blur-xl

                  text-white

                  hover:border-[#C98A3D]

                  hover:shadow-[0_0_25px_rgba(201,138,61,0.35)]

                  transition-all

                  whitespace-nowrap
                  "
                >
                  {path.title}
                </motion.button>
              )
            )}
          </motion.div>
        </div>

        {/* ROW 2 */}

        <div
          className="overflow-visible mt-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            setPaused(false);
            setActive(null);
          }}
        >
          <motion.div
            animate={
              paused
                ? {}
                : {
                    x: ["-50%", "0%"],
                  }
            }
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
            flex
            gap-4
            w-max
            "
          >
            {[...secondRow, ...secondRow].map(
              (path, index) => (
                <motion.button
                  key={`${path.title}-${index}`}
                  onMouseEnter={() =>
                    setActive(
                      paths.findIndex(
                        (p) =>
                          p.title === path.title
                      )
                    )
                  }
                  whileHover={{
                    y: -8,
                    scale: 1.06,
                  }}
                  className="
                  px-6
                  py-4

                  rounded-full

                  bg-white/5

                  border
                  border-white/10

                  backdrop-blur-xl

                  text-white

                  hover:border-[#C98A3D]

                  hover:shadow-[0_0_25px_rgba(201,138,61,0.35)]

                  transition-all

                  whitespace-nowrap
                  "
                >
                  {path.title}
                </motion.button>
              )
            )}
          </motion.div>
        </div>
      </section>
    </FadeInSection>
  );
}

export default CareerPaths;