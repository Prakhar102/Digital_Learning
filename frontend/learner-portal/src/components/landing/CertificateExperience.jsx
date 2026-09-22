import { motion } from "framer-motion";
import FadeInSection from "../common/FadeInSection";
import { IoCheckmarkCircle } from "react-icons/io5";

function CertificateExperience() {
  return (
    <FadeInSection>
      <section
        className="
        py-12
        max-w-7xl
        mx-auto
        px-8
        "
      >
        <div
          className="
          grid
          lg:grid-cols-2
          gap-16
          items-center
          "
        >
          {/* LEFT */}

          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 1, -1, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
            }}
            className="
            rounded-[40px]

            border-2
            border-[#C98A3D]

            bg-gradient-to-br
            from-[#161A34]
            via-[#2B2F52]
            to-[#161A34]

            p-10

            shadow-[0_0_80px_rgba(201,138,61,0.25)]
            "
          >
            <h3
              className="
              text-3xl
              font-bold

              text-[#C98A3D]
              "
            >
              Certificate Of Completion
            </h3>

            <p className="mt-12 text-[#F1ECE0]">
              Presented To
            </p>

            <h4
              className="
              mt-4

              text-4xl
              font-bold
              "
            >
              Learner Name
            </h4>

            <p className="mt-12 text-[#F1ECE0]">
              Successfully completed
            </p>

            <h4
              className="
              mt-4

              text-2xl
              font-bold
              "
            >
              Spring Boot Microservices
            </h4>

            <div
              className="
              mt-12

              flex
              justify-between

              text-sm

              text-[#F1ECE0]
              "
            >
              <span>CERT-123456</span>

              <span>Verified</span>
            </div>
          </motion.div>

          {/* RIGHT */}

          <div>
            <p
              className="
              uppercase

              tracking-[6px]

              text-[#C98A3D]

              mb-4
              "
            >
              Achievement
            </p>

            <h2
              className="
              text-5xl
              font-bold
              "
            >
              Proof Of Learning
            </h2>

            <p
              className="
              mt-8

              text-lg

              text-[#F1ECE0]
              "
            >
              Every certificate is generated
              after progress completion and
              assessment success, ensuring
              meaningful recognition of learning.
            </p>

            <div
              className="
              mt-10

              flex
              flex-col

              gap-4
              "
            >
              <div className="flex items-center gap-3">
  <IoCheckmarkCircle className="text-[#C98A3D] text-xl shrink-0" />
  <span>Assessment Verified</span>
</div>

<div className="flex items-center gap-3 mt-4">
  <IoCheckmarkCircle className="text-[#C98A3D] text-xl shrink-0" />
  <span>Progress Verified</span>
</div>

<div className="flex items-center gap-3 mt-4">
  <IoCheckmarkCircle className="text-[#C98A3D] text-xl shrink-0" />
  <span>Certificate Generated</span>
</div>

<div className="flex items-center gap-3 mt-4">
  <IoCheckmarkCircle className="text-[#C98A3D] text-xl shrink-0" />
  <span>Downloadable PDF</span>
</div>
            </div>
          </div>
        </div>
      </section>
    </FadeInSection>
  );
}

export default CertificateExperience;