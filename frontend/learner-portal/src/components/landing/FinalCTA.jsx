import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import FadeInSection from "../common/FadeInSection";

import {
  FaGraduationCap,
  FaAward,
} from "react-icons/fa";

import { HiOutlineChartBar } from "react-icons/hi";

import { RiRoadMapLine } from "react-icons/ri";

function FinalCTA() {
  const navigate = useNavigate();

  return (
    <FadeInSection>
      <section
        id="cta"
        className="
        relative

        py-16

        max-w-7xl
        mx-auto

        px-8

        overflow-hidden
        "
      >
        {/* BACKGROUND GLOW */}

        <div
          className="
          absolute

          left-1/2
          top-1/2

          -translate-x-1/2
          -translate-y-1/2

          h-[550px]
          w-[550px]

          rounded-full

          bg-[#3E7C74]/10

          blur-[180px]
          "
        />

        <div
          className="
          relative

          text-center

          z-10
          "
        >
          {/* TAG */}

          <p
            className="
            uppercase

            tracking-[6px]

            text-[#C98A3D]

            mb-6
            "
          >
            Get Started
          </p>

          {/* HEADING */}

          <motion.h2
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.8,
            }}
            className="
            text-5xl
            md:text-6xl
            lg:text-7xl

            font-bold

            leading-tight
            "
          >
            Build The Future
            <br />

            <span
              className="
              bg-gradient-to-r
              from-[#C98A3D]
              to-[#E6B86A]

              bg-clip-text

              text-transparent
              "
            >
              Of Your Career
            </span>
          </motion.h2>

          {/* DESCRIPTION */}

          <p
            className="
            mt-8

            max-w-3xl
            mx-auto

            text-lg
            md:text-xl

            text-[#F1ECE0]
            "
          >
            Start learning with personalized AI guidance,
            structured learning paths, assessments,
            certifications and measurable progress.
          </p>

          {/* BUTTONS */}

          <div
            className="
            mt-12

            flex
            flex-col
            sm:flex-row

            justify-center

            gap-5
            "
          >
            <motion.button
              onClick={() => navigate("/register")}
              whileHover={{
                scale: 1.06,
                y: -3,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="
              px-10
              py-4

              rounded-full

              bg-[#C98A3D]

              text-[#161A34]

              font-bold

              shadow-[0_0_35px_rgba(201,138,61,0.35)]

              transition-all
              "
            >
              Start Learning
            </motion.button>

            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{
                scale: 1.05,
                y: -3,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="
              px-10
              py-4

              rounded-full

              border
              border-white/10

              bg-white/5

              backdrop-blur-xl

              hover:border-[#C98A3D]

              font-semibold

              transition-all
              "
            >
              Login
            </motion.button>
          </div>

          {/* FEATURES */}

          <div
            className="
            mt-14

            flex
            flex-wrap

            justify-center

            gap-8

            text-[#F1ECE0]
            "
          >
            <div className="flex items-center gap-3">
              <FaGraduationCap
                className="
                text-[#C98A3D]
                text-xl
                "
              />

              <span>
                AI Guided Learning
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FaAward
                className="
                text-[#C98A3D]
                text-xl
                "
              />

              <span>
                Verified Certificates
              </span>
            </div>

            <div className="flex items-center gap-3">
              <HiOutlineChartBar
                className="
                text-[#3E7C74]
                text-xl
                "
              />

              <span>
                Track Progress
              </span>
            </div>

            <div className="flex items-center gap-3">
              <RiRoadMapLine
                className="
                text-[#3E7C74]
                text-xl
                "
              />

              <span>
                Career Growth
              </span>
            </div>
          </div>
        </div>
      </section>
    </FadeInSection>
  );
}

export default FinalCTA;