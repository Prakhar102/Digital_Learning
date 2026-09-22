import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

import {FaBrain,FaAward,FaChartLine,FaEye,FaEyeSlash,} from "react-icons/fa";

import { RiRoadMapLine } from "react-icons/ri";
import { loginUser } from "../../services/authService";
import { getCurrentUser } from "../../services/userService";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [rememberMe, setRememberMe] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const response = await loginUser(form);

    localStorage.setItem(
      "accessToken",
      response.accessToken
    );

    localStorage.setItem(
      "refreshToken",
      response.refreshToken
    );

    const user =
      await getCurrentUser();

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    console.log(
      "Logged In User:",
      user
    );

    if (
      user.role ===
      "ROLE_ADMIN"
    ) {

      navigate("/admin");

    } else if (
      user.role ===
      "ROLE_INSTRUCTOR"
    ) {

      navigate("/instructor");

    } else {

      navigate("/dashboard");

    }

  } catch (error) {

    console.error(
      "Login Error:",
      error
    );

    alert(
      error?.response?.data?.message ||
      error?.response?.data ||
      "Login Failed"
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

        relative
        overflow-hidden
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
            Continue
            <br />
            Learning
            <br />
            Today
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
            Resume your courses, continue
            assessments, monitor progress
            and stay on track toward your
            career goals.
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
                Continue Courses
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
                Resume Learning Path
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
                View Certificates
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
                Monitor Progress
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
          max-w-[620px]

          bg-[#1A1F3B]

          border
          border-white/10

          rounded-[36px]

          px-8
          py-8

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
              Welcome Back
            </p>

            <h2
              className="
              mt-3

              text-5xl

              font-bold
              "
            >
              Login
            </h2>

            <p
              className="
              mt-2

              text-[#F1ECE0]
              "
            >
              Continue your learning journey
            </p>
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
            mt-8

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

          {/* PASSWORD */}

          <div className="relative mt-4">
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

          {/* REMEMBER */}

          <div
            className="
            mt-4

            flex
            items-center
            justify-between
            "
          >
            <label
              className="
              flex
              items-center

              gap-2

              text-sm

              text-[#F1ECE0]
              "
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
              />

              Remember Me
            </label>

            <button
              type="button"
              className="
              text-sm

              text-[#C98A3D]

              hover:underline
              "
            >
              Forgot Password?
            </button>
          </div>

          {/* LOGIN BUTTON */}

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

            hover:shadow-[0_10px_30px_rgba(201,138,61,0.35)]

            transition-all

            disabled:opacity-70
            disabled:cursor-not-allowed
            "
          >
            {loading
              ? "Logging In..."
             : "Login"}
          </button>

          {/* REGISTER */}

          <p
            className="
            mt-6

            text-center

            text-[#F1ECE0]
            "
          >
            Don't have an account?

            <Link
              to="/register"
              className="
              ml-2

              text-[#C98A3D]

              font-semibold

              hover:text-[#E6B86A]

              transition-colors
              "
            >
              Register
            </Link>
          </p>

          {/* HOME */}

          <div className="mt-3 text-center">
            <Link
              to="/"
              className="
              text-sm

              text-white/60

              hover:text-white

              transition-colors
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

export default LoginPage;