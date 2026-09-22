import { motion } from "framer-motion";

const skills = [
  "Spring Boot",
  "Microservices",
  "Kafka",
  "System Design",
  "AWS",
  "React",
];

function FloatingSkills() {
  return (
    <section
      className="
      py-32

      max-w-6xl
      mx-auto

      px-8
      "
    >
      <h2
        className="
        text-4xl
        font-bold

        text-center
        mb-16
        "
      >
        Your Learning Universe
      </h2>

      <div
        className="
        flex
        flex-wrap

        justify-center

        gap-8
        "
      >
        {skills.map((skill, index) => (
          <motion.div
            key={skill}
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 3 + index,
              repeat: Infinity,
            }}
            className="
            px-8
            py-5

            rounded-3xl

            bg-white/5

            backdrop-blur-xl

            border
            border-white/10

            text-[#FAF7F1]
            "
          >
            {skill}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default FloatingSkills;