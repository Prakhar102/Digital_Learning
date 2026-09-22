import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import OrbParticles from "./OrbParticles";

function AIOrb() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const move = (e) => {
      setPosition({
        x: (e.clientX - window.innerWidth / 2) * 0.01,
        y: (e.clientY - window.innerHeight / 2) * 0.01,
      });
    };

    window.addEventListener(
      "mousemove",
      move
    );

    return () =>
      window.removeEventListener(
        "mousemove",
        move
      );
  }, []);

  return (
    <motion.div
      animate={{
        x: position.x,
        y: position.y,
        scale: [1, 1.03, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
      }}
      className="
      relative

      h-60
      w-60
      "
    >
      <OrbParticles />

      {/* OUTER ENERGY */}

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.05, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="
        absolute
        inset-0

        rounded-full

        bg-[#3E7C74]

        blur-[110px]
        "
      />

      {/* RING 1 */}

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
        absolute
        inset-0

        rounded-full

        border
        border-[#3E7C74]/30
        "
      />

      {/* RING 2 */}

      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
        absolute
        inset-5

        rounded-full

        border
        border-white/10
        "
      />

      {/* CORE */}

      <div
        className="
        absolute
        inset-10

        rounded-full

        bg-gradient-to-br
        from-[#3E7C74]
        to-[#DCEBE8]

        flex
        flex-col
        items-center
        justify-center
        "
      >
        <span
          className="
          text-sm
          tracking-[6px]

          text-[#161A34]
          "
        >
          AI
        </span>

        <span
          className="
          text-2xl
          font-bold

          text-[#161A34]
          "
        >
          Mentor
        </span>
      </div>
    </motion.div>
  );
}

export default AIOrb;