import { motion } from "framer-motion";

function FloatingEcosystem() {
  return (
    <>
      {/* TOP */}

      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="
        absolute

        top-17.5
        left-1/2

        -translate-x-1/2

        px-5
        py-3

        rounded-3xl

        bg-[#161A34]

        border
        border-white/10

        backdrop-blur-xl
        "
      >
        Courses
      </motion.div>

      {/* LEFT */}

      <motion.div
        animate={{
          x: [0, -8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
        className="
        absolute

        left-10
        top-1/2

        -translate-y-1/2

        px-5
        py-3

        rounded-3xl

        bg-[#2B2F52]
        "
      >
        Mentor AI
      </motion.div>

      {/* RIGHT */}

      <motion.div
        animate={{
          x: [0, 8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
        className="
        absolute

        right-10
        top-1/2

        -translate-y-1/2

        px-5
        py-3

        rounded-3xl

        bg-[#C98A3D]

        text-[#161A34]

        font-semibold
        "
      >
        Assessments
      </motion.div>

      {/* BOTTOM */}

      <motion.div
        animate={{
          y: [0, 8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="
        absolute

        bottom-17.5
        left-1/2

        -translate-x-1/2

        px-5
        py-3

        rounded-3xl

        bg-[#3E7C74]
        "
      >
        Certificates
      </motion.div>
    </>
  );
}

export default FloatingEcosystem;