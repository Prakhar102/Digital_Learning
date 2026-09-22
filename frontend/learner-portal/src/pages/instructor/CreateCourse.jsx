import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import { createCourse } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";

import InstructorLayout from "../../components/instructor/InstructorLayout";

function CreateCourse() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      level: "BEGINNER",
    });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const user =
        await getCurrentUser();

      await createCourse({
        ...form,
        categoryId: 1,
        ownerUserId: user.id,
      });

      alert(
        "Course Created Successfully"
      );

      navigate(
        "/instructor/my-courses"
      );
    } catch (error) {
      console.log(error);

      alert(
        "Failed To Create Course"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorLayout>
      {/* HERO */}

      <div
        className="
        relative
        overflow-hidden

        rounded-[40px]

        border
        border-cyan-500/10

        bg-gradient-to-br
        from-[#081426]
        via-[#10213A]
        to-[#18304E]

        p-12
        "
      >
        <div
          className="
          absolute

          top-0
          right-0

          h-[300px]
          w-[300px]

          rounded-full

          bg-cyan-500/10

          blur-[100px]
          "
        />

        <button
          onClick={() =>
            navigate("/instructor")
          }
          className="
          flex
          items-center
          gap-2

          text-slate-300

          hover:text-white

          transition-all
          "
        >
          <ArrowLeft size={18} />

          Back to Dashboard
        </button>

        <div className="mt-8">
          <p
            className="
            text-cyan-400

            uppercase

            tracking-[5px]

            text-sm
            "
          >
            COURSE STUDIO
          </p>

          <h1
            className="
            mt-4

            text-6xl

            font-bold

            leading-tight
            "
          >
            Create a Learning
            Experience
          </h1>

          <p
            className="
            mt-6

            max-w-3xl

            text-slate-300

            leading-8
            "
          >
            Build structured learning
            journeys, publish professional
            courses and help learners
            achieve measurable outcomes.
          </p>
        </div>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="
        mt-10

        max-w-5xl

        rounded-[40px]

        border
        border-cyan-500/10

        bg-[#0D1728]

        shadow-2xl

        p-10
        "
      >
        <div className="space-y-8">

          {/* TITLE */}

          <div>
            <label
              className="
              block

              mb-3

              text-sm

              tracking-wide

              text-slate-300
              "
            >
              Course Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Spring Boot Microservices"

              className="
              w-full

              px-5
              py-4

              rounded-2xl

              bg-[#08101F]

              border
              border-slate-700

              outline-none

              focus:border-cyan-500

              transition-all
              "
            />
          </div>

          {/* DESCRIPTION */}

          <div>
            <label
              className="
              block

              mb-3

              text-sm

              tracking-wide

              text-slate-300
              "
            >
              Course Description
            </label>

            <textarea
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              rows="6"
              required

              placeholder="Describe the learning outcomes, curriculum and goals..."

              className="
              w-full

              px-5
              py-4

              rounded-2xl

              bg-[#08101F]

              border
              border-slate-700

              outline-none

              focus:border-cyan-500

              transition-all
              "
            />
          </div>

          {/* LEVEL */}

          <div>
            <label
              className="
              block

              mb-3

              text-sm

              tracking-wide

              text-slate-300
              "
            >
              Difficulty Level
            </label>

            <select
              name="level"
              value={form.level}
              onChange={handleChange}

              className="
              w-full

              px-5
             py-4

              rounded-2xl

              bg-[#08101F]

              border
              border-slate-700

              outline-none

              focus:border-cyan-500

              transition-all
              "
            >
              <option value="BEGINNER">
                Beginner
              </option>

              <option value="INTERMEDIATE">
                Intermediate
              </option>

              <option value="ADVANCED">
                Advanced
              </option>
            </select>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}

            className="
            w-full

            flex
            items-center
            justify-center
            gap-3

            py-5

            rounded-2xl

            bg-gradient-to-r
            from-cyan-500
            to-blue-600

            text-white

            font-semibold

            text-lg

            hover:scale-[1.01]

            transition-all

            disabled:opacity-50
            "
          >
            <Sparkles size={20} />

            {loading
              ? "Creating Course..."
              : "Publish Learning Experience"}
          </button>
        </div>
      </form>
    </InstructorLayout>
  );
}

export default CreateCourse;