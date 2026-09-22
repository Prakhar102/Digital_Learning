import { motion } from "framer-motion";

function BackgroundEffects() {
  return (
    <>
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
        }}
        className="
        fixed

        top-20
        left-10

        h-72
        w-72

        rounded-full

        bg-[#3E7C74]

        blur-[120px]

        z-0
        "
      />

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
        }}
        className="
        fixed

        bottom-10
        right-10

        h-80
        w-80

        rounded-full

        bg-[#C98A3D]

        blur-[140px]

        z-0
        "
      />

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
        fixed

        top-[25%]
        left-[40%]

        h-96
        w-96

        rounded-full

        border

        border-[#3E7C74]/10

        z-0
        "
      />
    </>
  );
}

export default BackgroundEffects;