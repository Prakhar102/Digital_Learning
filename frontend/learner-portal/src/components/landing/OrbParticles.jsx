import { motion } from "framer-motion";

function OrbParticles() {
  return (
    <>
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
        absolute
        inset-0
        "
      >
        <div
          className="
          absolute

          top-0
          left-1/2

          h-3
          w-3

          rounded-full

          bg-[#DCEBE8]
          "
        />
      </motion.div>

      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
        absolute
        inset-0
        "
      >
        <div
          className="
          absolute

          bottom-0
          left-1/2

          h-2
          w-2

          rounded-full

          bg-[#C98A3D]
          "
        />
      </motion.div>

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
        absolute
        inset-0
        "
      >
        <div
          className="
          absolute

          top-1/2
          left-0

          h-2
          w-2

          rounded-full

          bg-[#3E7C74]
          "
        />
      </motion.div>
    </>
  );
}

export default OrbParticles;