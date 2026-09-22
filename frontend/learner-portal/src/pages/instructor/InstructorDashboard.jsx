import { useNavigate } from "react-router-dom";
import InstructorLayout from "../../components/instructor/InstructorLayout";

import {
  ArrowRight,
  BookOpen,
  Plus,
  Layers3,
} from "lucide-react";

function InstructorDashboard() {
  const navigate = useNavigate();

  return (
    <InstructorLayout>
      <div
      className="
      min-h-screen
      bg-[#07111F]
      text-white
      px-8
      py-8
      "
    >
      {/* HERO */}

      <div
        className="
        relative
        overflow-hidden

        rounded-[40px]

        border
        border-[#1B2B42]

        bg-gradient-to-br
        from-[#0B1B2B]
        via-[#10243A]
        to-[#142D47]

        p-12
        "
      >
        <div className="max-w-3xl">
          <p
            className="
            uppercase
            tracking-[5px]

            text-[#6AA7FF]
            text-sm
            "
          >
            Instructor Workspace
          </p>

          <h1
            className="
            mt-4

            text-6xl
            font-bold

            leading-tight
            "
          >
            Build Learning
            Experiences
          </h1>

          <p
            className="
            mt-6

            text-lg
            text-slate-300

            leading-8
            "
          >
            Create, publish and manage
            professional learning journeys
            that help learners achieve
            meaningful career outcomes.
          </p>

          <div
            className="
            mt-8

            flex
            flex-wrap

            gap-4
            "
          >
            <button
              onClick={() =>
                navigate(
                  "/instructor/create-course"
                )
              }
              className="
              flex
              items-center
              gap-3

              px-8
              py-4

              rounded-2xl

              bg-[#4F8CFF]

              font-semibold

              hover:bg-[#6AA7FF]

              transition-all
              "
            >
              <Plus size={18} />

              Create Course
            </button>

            <button
              onClick={() =>
                navigate(
                  "/instructor/my-courses"
                )
              }
              className="
              flex
              items-center
              gap-3

              px-8
              py-4

              rounded-2xl

              border
              border-white/10

              bg-white/5

              hover:bg-white/10

              transition-all
              "
            >
              <BookOpen size={18} />

              My Courses
            </button>
          </div>
        </div>

        <div
          className="
          absolute

          right-0
          top-0

          h-full
          w-[420px]

          bg-gradient-to-l
          from-[#4F8CFF]/10
          to-transparent
          "
        />
      </div>

      {/* OVERVIEW */}

      <div
        className="
        mt-10

        grid
        lg:grid-cols-3

        gap-6
        "
      >
        <div
          className="
          rounded-[32px]

          border
          border-white/10

          bg-white/[0.03]

          p-8
          "
        >
          <div
            className="
            flex
            items-center
            justify-between
            "
          >
            <h3
              className="
              text-lg
              font-semibold
              "
            >
              Course Library
            </h3>

            <BookOpen
              className="
              text-[#6AA7FF]
              "
            />
          </div>

          <h2
            className="
            mt-8

            text-5xl
            font-bold
            "
          >
            --
          </h2>

          <p
            className="
            mt-3

            text-slate-400
            "
          >
            Total courses created
          </p>
        </div>

        <div
          className="
          rounded-[32px]

          border
          border-white/10

          bg-white/[0.03]

          p-8
          "
        >
          <div
            className="
            flex
            items-center
            justify-between
            "
          >
            <h3
              className="
              text-lg
              font-semibold
              "
            >
              Published Courses
            </h3>

            <Layers3
              className="
              text-[#6AA7FF]
              "
            />
          </div>

          <h2
            className="
            mt-8

            text-5xl
            font-bold
            "
          >
            --
          </h2>

          <p
            className="
            mt-3

            text-slate-400
            "
          >
            Live learning experiences
          </p>
        </div>

        <div
          className="
          rounded-[32px]

          border
          border-white/10

          bg-white/[0.03]

          p-8
          "
        >
          <div
            className="
            flex
            items-center
            justify-between
            "
          >
            <h3
              className="
              text-lg
              font-semibold
              "
            >
              Learner Reach
            </h3>

            <ArrowRight
              className="
              text-[#6AA7FF]
              "
            />
          </div>

          <h2
            className="
            mt-8

            text-5xl
            font-bold
            "
          >
            --
          </h2>

          <p
            className="
            mt-3

            text-slate-400
            "
          >
            Students enrolled
          </p>
        </div>
      </div>

      {/* NEXT ACTION */}

      <div
        className="
        mt-10

        rounded-[32px]

        border
        border-white/10

        bg-white/[0.03]

        p-10
        "
      >
        <p
          className="
          uppercase

          tracking-[4px]

          text-[#6AA7FF]

          text-sm
          "
        >
          Next Recommended Action
        </p>

        <h2
          className="
          mt-4

          text-3xl
          font-bold
          "
        >
          Create your next course
        </h2>

        <p
          className="
          mt-3

          max-w-2xl

          text-slate-400

          leading-7
          "
        >
          Build a structured learning
          experience and publish it to
          your learners. Once published,
          it will automatically become
          available in the learner catalog.
        </p>

        <button
          onClick={() =>
            navigate(
              "/instructor/create-course"
            )
          }
          className="
          mt-8

          px-8
          py-4

          rounded-2xl

          bg-[#4F8CFF]

          font-semibold

          hover:bg-[#6AA7FF]

          transition-all
          "
        >
          Start Building
        </button>
      </div>
    </div>
    </InstructorLayout>
  );
}

export default InstructorDashboard;