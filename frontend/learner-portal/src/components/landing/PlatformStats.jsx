import { motion } from "framer-motion";
import FadeInSection from "../common/FadeInSection";

import {
  FaBookOpen,
  FaClipboardCheck,
  FaAward,
  FaChartLine,
} from "react-icons/fa";

const stats = [
  {
    icon: FaBookOpen,
    value: "350+",
    label: "Courses",
    color: "#C98A3D",
  },
  {
    icon: FaClipboardCheck,
    value: "850+",
    label: "Assessments",
    color: "#3E7C74",
  },
  {
    icon: FaAward,
    value: "5,200+",
    label: "Certificates Issued",
    color: "#C98A3D",
  },
  {
    icon: FaChartLine,
    value: "98%",
    label: "Completion Rate",
    color: "#3E7C74",
  },
];

function PlatformStats() {
  return (
    <FadeInSection>
      <section
        id="platform-stats"
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
            Platform Impact
          </p>

          <h2
            className="
            text-6xl

            font-bold

            text-[#C98A3D]
            "
          >
            12,500+
          </h2>

          <p
            className="
            mt-4

            text-2xl

            text-[#F1ECE0]
            "
          >
            Active Learners
          </p>
        </div>

        <div
          className="
          mt-16

          grid
          md:grid-cols-4

          gap-10

          text-center
          "
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                }}
              >
                <Icon
                  className="
                  text-5xl

                  mx-auto
                  "
                  style={{
                    color: stat.color,
                  }}
                />

                <h3
                  className="
                  mt-4

                  text-5xl

                  font-bold
                  "
                  style={{
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </h3>

                <p
                  className="
                  mt-3

                  text-[#F1ECE0]
                  "
                >
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </FadeInSection>
  );
}

export default PlatformStats;