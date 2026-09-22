import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import AIOrb from "./AIOrb";
import FloatingEcosystem from "./FloatingEcosystem";
import OrbConnections from "./OrbConnections";
import GradientMesh from "./GradientMesh";

function HeroSection() {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    const section = document.getElementById("how-it-works");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      console.log(
        "Section with id='how-it-works' not found"
      );
    }
  };

  return (
    <section
      id="hero"
      className="
      min-h-[85vh]

      pt-24

      max-w-7xl
      mx-auto

      px-8

      flex
      items-center
      "
    >
      <div
        className="
        grid
        lg:grid-cols-2

        gap-12

        items-center

        w-full
        "
      >
        {/* LEFT SIDE */}

        <div>
          <motion.h1
            initial={{
              opacity: 0,
              y: 60,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            className="
            text-6xl
            lg:text-7xl

            font-bold

            leading-tight
            "
          >
            Transform

            <span
              className="
              block

              text-[#FAF7F1]
              "
            >
              Learning
            </span>

            <span
              className="
              block

              text-[#C98A3D]
              "
            >
              Into Mastery
            </span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.3,
            }}
            className="
            mt-8

            text-xl

            text-[#F1ECE0]

            max-w-xl

            leading-9
            "
          >
            Learn.
            Practice.
            Assess.
            Get Certified.

            Build your future with AI-powered
            mentoring and personalized learning
            journeys.
          </motion.p>

          <div
            className="
            mt-10

            flex
            gap-4

            flex-wrap

            relative
            z-50
            "
          >
            {/* REGISTER */}

            <button
              onClick={() => navigate("/register")}
              className="
              px-8
              py-4

              rounded-full

              bg-[#C98A3D]

              text-[#161A34]

              font-bold

              hover:scale-105

              transition-all
              "
            >
              Start Learning
            </button>

            {/* HOW IT WORKS */}

            <button
              onClick={scrollToHowItWorks}
              className="
              px-8
              py-4

              rounded-full

              border
              border-white/20

              bg-white/5

              backdrop-blur-xl

              hover:bg-white/10

              transition-all
              "
            >
              Explore Platform
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div
          className="
          relative

          h-[500px]

          flex
          items-center
          justify-center

          pointer-events-none
          "
        >
          <GradientMesh />

          <OrbConnections />

          <AIOrb />

          <FloatingEcosystem />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;