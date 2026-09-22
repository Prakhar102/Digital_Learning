import { motion } from "framer-motion";

function MentorMessage() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: [0, -5, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
      }}
      className="
      absolute

      bottom-[-110px]
      left-1/2

      -translate-x-1/2

      w-[320px]

      rounded-3xl

      bg-white/5

      backdrop-blur-xl

      border
      border-[#3E7C74]/30

      p-5

      shadow-[0_0_60px_rgba(62,124,116,0.15)]
      "
    >
      <div
        className="
        text-xs

        tracking-[3px]

        text-[#3E7C74]

        uppercase
        "
      >
        AI Mentor Insight
      </div>

      <p
        className="
        mt-3

        text-[#DCEBE8]

        leading-7
        "
      >
        You are 2 skills away from becoming
        a Senior Backend Engineer.
      </p>
    </motion.div>
  );
}

export default MentorMessage;