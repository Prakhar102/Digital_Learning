
function Footer() {
  return (
 <footer
  className="
  relative

  bg-[#0F1226]

  py-14

  border-t
  border-[#C98A3D]/20

  overflow-hidden
  "
>
      {/* WATERMARK */}

      <div
        className="
        absolute
        inset-0

        flex
        items-center
        justify-center

        pointer-events-none
        select-none

        text-[8rem]
        md:text-[12rem]

        font-black

        text-white

        opacity-[0.03]
        "
      >
        DLM
      </div>

      <div
        className="
        relative

        max-w-7xl
        mx-auto

        px-8

        text-center

        z-10
        "
      >
        {/* BRAND */}

        <h2
          className="
          text-3xl
          md:text-5xl

          font-bold
          "
        >
          DIGITAL LEARNING MENTOR
        </h2>

        <p
          className="
          mt-4

          text-[#F1ECE0]

          text-lg
          "
        >
          Transform Knowledge Into Achievement
        </p>

        {/* DIVIDER */}

        <div
          className="
          mt-8

          h-px

          bg-gradient-to-r
          from-transparent
          via-white/10
          to-transparent
          "
        />

        {/* LINKS */}

        <div
          className="
          mt-8

          flex
          flex-wrap

          justify-center
          items-center

          gap-5

          text-[#F1ECE0]
          "
        >
          <span className="hover:text-[#C98A3D] transition-colors cursor-pointer">
            AI Mentor
          </span>

          <span className="text-[#C98A3D]">•</span>

          <span className="hover:text-[#C98A3D] transition-colors cursor-pointer">
            Learning Paths
          </span>

          <span className="text-[#C98A3D]">•</span>

          <span className="hover:text-[#C98A3D] transition-colors cursor-pointer">
            Assessments
          </span>

          <span className="text-[#C98A3D]">•</span>

          <span className="hover:text-[#C98A3D] transition-colors cursor-pointer">
            Certificates
          </span>

          <span className="text-[#C98A3D]">•</span>

          <span className="hover:text-[#C98A3D] transition-colors cursor-pointer">
            Progress
          </span>
        </div>

        {/* BOTTOM */}

        <div
          className="
          mt-8

          text-white/50

          text-sm
          "
        >
          © 2026 Digital Learning Mentor. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;