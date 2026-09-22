import { motion } from "framer-motion";

function GradientMesh() {
  return (
    <>
      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
        }}
        className="
        fixed

        top-24
        left-[10%]

        h-[500px]
        w-[500px]

        rounded-full

        bg-[#3E7C74]/15

        blur-[180px]

        z-0
        "
      />

      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, -50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
        }}
        className="
        fixed

        bottom-0
        right-[10%]

        h-[550px]
        w-[550px]

        rounded-full

        bg-[#C98A3D]/15

        blur-[180px]

        z-0
        "
      />

      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 100,
          repeat: Infinity,
          ease: "linear",
        }}
        className="
        fixed

        top-[20%]
        left-[45%]

        h-[450px]
        w-[450px]

        rounded-full

        border

        border-[#3E7C74]/10

        z-0
        "
      />
    </>
  );
}

export default GradientMesh;
