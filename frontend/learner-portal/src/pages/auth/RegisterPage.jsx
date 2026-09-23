import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaBrain,
  FaAward,
  FaChartLine,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import { RiRoadMapLine } from "react-icons/ri";

import { registerUser } from "../../services/authService";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      form.password !==
      form.confirmPassword
    ) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await registerUser({
  fullName: form.fullName,
  phoneNumber: form.mobileNumber,
  email: form.email,
  password: form.password,
});

      alert("Registration Successful");

      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data ||
          "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
      min-h-screen
      grid
      lg:grid-cols-[58%_42%]
      bg-[#0F1226]
      "
    >
      {/* LEFT PANEL */}

      <div
        className="
        hidden
        lg:flex

        flex-col
        justify-between

        p-16

        bg-gradient-to-br
        from-[#0E4B46]
        via-[#123B49]
        to-[#161A34]

        overflow-hidden
        relative
        "
      >
        <div
          className="
          absolute

          top-0
          left-0

          h-[500px]
          w-[500px]

          rounded-full

          bg-[#3E7C74]/10

          blur-[150px]
          "
        />

        <div className="relative z-10">
          <p
            className="
            text-[#C98A3D]

            uppercase

            tracking-[5px]

            text-sm
            "
          >
            DIGITAL LEARNING MENTOR
          </p>

          <h1
            className="
            mt-8

            text-7xl

            font-bold

            leading-none
            "
            >
            Start
            <br />
            Your
            <br />
            Journey
            </h1>

          <p
            className="
            mt-8

            max-w-xl

            text-xl

            leading-10

            text-[#F1ECE0]
            "
          >
            Create your account and unlock
            personalized learning journeys,
            AI guidance, structured career
            paths and industry-recognized
            certifications.
          </p>
        </div>

        <div
            className="
            relative
            z-10

            grid
            grid-cols-2

            gap-6
            "
            >
            <div className="flex items-center gap-4">
                <FaBrain
                className="
                text-[#C98A3D]
                text-xl
                "
                />
                <span>
                AI Recommendations
                </span>
            </div>

            <div className="flex items-center gap-4">
                <RiRoadMapLine
                className="
                text-[#3E7C74]
                text-xl
                "
                />
                <span>
                Career Discovery
                </span>
            </div>

            <div className="flex items-center gap-4">
                <FaAward
                className="
                text-[#C98A3D]
                text-xl
                "
                />
                <span>
                Earn Certifications
                </span>
            </div>

            <div className="flex items-center gap-4">
                <FaChartLine
                className="
                text-[#3E7C74]
                text-xl
                "
                />
                <span>
                Track Growth
                </span>
            </div>
            </div>
            </div>

      {/* RIGHT SIDE */}

      <div
        className="
        flex
        items-center
        justify-center

        px-12
        "
      >
        <motion.form
          initial={{
            x: -150,
            opacity: 0,
            scale: 0.96,
          }}
          animate={{
            x: 0,
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.9,
            ease: "easeOut",
          }}
          onSubmit={handleSubmit}
          className="
          w-full
          max-w-[650px]

          bg-[#1A1F3B]

          border
          border-white/10

          rounded-[36px]

          px-8
          py-7

          shadow-[0_20px_60px_rgba(0,0,0,.35)]
          "
        >
          <div className="text-center">
            <p
              className="
              text-[#C98A3D]

              uppercase

              tracking-[5px]

              text-sm
              "
            >
              Create Account
            </p>

            <h2
              className="
              mt-3

              text-5xl

              font-bold
              "
            >
              Join DLM
            </h2>

            <p
              className="
              mt-2

              text-[#F1ECE0]
              "
            >
              Start your learning journey
            </p>
          </div>

          {/* NAME + MOBILE */}

          <div className="grid grid-cols-2 gap-4 mt-8">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="
              p-4

              rounded-xl

              bg-[#0F1226]

              border
              border-white/10

              outline-none

              focus:border-[#C98A3D]

              transition-all
              "
            />

            <input
              type="tel"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={form.mobileNumber}
              onChange={handleChange}
              className="
              p-4

              rounded-xl

              bg-[#0F1226]

              border
              border-white/10

              outline-none

              focus:border-[#C98A3D]

              transition-all
              "
            />
          </div>

          {/* EMAIL */}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="
            mt-4

            w-full

            p-4

            rounded-xl

            bg-[#0F1226]

            border
            border-white/10

            outline-none

            focus:border-[#C98A3D]

            transition-all
            "
          />

          {/* PASSWORDS */}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="
                w-full

                p-4

                rounded-xl

                bg-[#0F1226]

                border
                border-white/10

                outline-none

                focus:border-[#C98A3D]

                focus:ring-2
                focus:ring-[#C98A3D]/20

                transition-all
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="
                absolute

                right-4
                top-1/2

                -translate-y-1/2

                text-[#C98A3D]

                hover:text-[#E6B86A]

                transition-colors
                "
              >
                {showPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="
                w-full

                p-4

                rounded-xl

                bg-[#0F1226]

                border
                border-white/10

                outline-none

                focus:border-[#C98A3D]

                focus:ring-2
                focus:ring-[#C98A3D]/20

                transition-all
                "
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="
                absolute

                right-4
                top-1/2

                -translate-y-1/2

                text-[#C98A3D]

                hover:text-[#E6B86A]

                transition-colors
                "
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                 <FaEye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="
            mt-6

            w-full

            py-4

            rounded-xl

            bg-[#C98A3D]

            text-[#161A34]

            font-bold

            hover:scale-[1.02]

            transition-all
            "
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          <p
            className="
            mt-5

            text-center

            text-[#F1ECE0]
            "
          >
            Already have an account?

            <Link
              to="/login"
              className="
              ml-2

              text-[#C98A3D]

              font-semibold
              "
            >
              Login
            </Link>
          </p>

          <div className="mt-3 text-center">
            <Link
              to="/"
              className="
              text-sm

              text-white/60

              hover:text-white
              "
            >
              ← Back to Home
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

export default RegisterPage;