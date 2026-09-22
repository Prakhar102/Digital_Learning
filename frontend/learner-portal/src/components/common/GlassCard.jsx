import { motion } from "framer-motion";

function GlassCard({ children }) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      transition={{
        duration: 0.2,
      }}
      className="
      bg-white/5

      backdrop-blur-xl

      border
      border-white/10

      rounded-[32px]

      shadow-[0_0_30px_rgba(62,124,116,0.08)]
      "
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;