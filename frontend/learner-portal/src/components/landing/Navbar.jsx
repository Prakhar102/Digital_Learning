import { PiBrainFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  return (
    <nav
      className="
      fixed
      top-0
      left-0
      right-0

      z-50

      border-b
      border-white/10

      bg-white/5
      backdrop-blur-xl
      "
    >
      <div
        className="
        max-w-7xl
        mx-auto

        px-8
        py-4

        flex
        items-center
        justify-between
        "
      >
        {/* LOGO */}

        <div
          onClick={() => scrollToSection("hero")}
          className="
          flex
          items-center
          gap-3

          cursor-pointer
          "
        >
          <div
            className="
            h-10
            w-10

            rounded-xl

            bg-gradient-to-br
            from-[#C98A3D]
            to-[#D9A65A]

            flex
            items-center
            justify-center

            shadow-[0_0_20px_rgba(201,138,61,0.35)]
            "
          >
            <PiBrainFill
              className="
              text-[#161A34]
              text-xl
              "
            />
          </div>

          <h1
            className="
            text-xl
            font-bold

            text-white
            "
          >
            Digital Learning Mentor
          </h1>
        </div>

        {/* NAVIGATION */}

        <div
          className="
          hidden
          md:flex

          gap-8

          text-[#F1ECE0]
          "
        >
          <button
            onClick={() => scrollToSection("why-dlm")}
            className="
            hover:text-[#C98A3D]
            transition-colors
            "
          >
            Features
          </button>

          <button
            onClick={() =>
              scrollToSection("career-paths")
            }
            className="
            hover:text-[#C98A3D]
            transition-colors
            "
          >
            Learning Paths
          </button>

          <button
            onClick={() =>
              scrollToSection("certificates")
            }
            className="
            hover:text-[#C98A3D]
            transition-colors
            "
          >
            Certificates
          </button>
        </div>

        {/* CTA */}

        <button
          onClick={() => navigate("/register")}
          className="
          px-5
          py-2

          rounded-full

          bg-[#C98A3D]

          text-[#161A34]

          font-semibold

          hover:scale-105

          transition-all
          "
        >
          Get Started
        </button>
      </div>
    </nav>
  );
}

export default Navbar;