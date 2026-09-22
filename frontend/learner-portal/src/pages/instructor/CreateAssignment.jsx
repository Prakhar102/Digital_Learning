import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  ArrowLeft,
  Calendar,
  ClipboardCheck,
  BookOpen,
} from "lucide-react";

import InstructorLayout from "../../components/instructor/InstructorLayout";

import {
  createAssignment,
} from "../../services/assignmentService";

import {
  getAllCourses,
} from "../../services/courseService";

import {
  getCurrentUser,
} from "../../services/userService";



function CreateAssignment() {
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [courses, setCourses] =
    useState([]);

    const [dueDate, setDueDate] =
  useState(null);

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      courseId: "",
      maxMarks: 100,
      dueDate: "",
    });

    const [file, setFile] =  useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user =
          await getCurrentUser();

        const allCourses =
          await getAllCourses();

        const instructorCourses =
          allCourses.filter(
            (course) =>
              course.ownerUserId ===
              user.id
          );

        setCourses(
          instructorCourses
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const user =
        await getCurrentUser();

      await createAssignment({
        ...form,
        courseId: Number(
          form.courseId
        ),
        instructorId:
          user.id,
        dueDate: dueDate,
      });

      alert(
        "Assignment Created Successfully"
      );

      navigate(
        "/instructor/my-assignments"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed To Create Assignment"
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
        border-slate-800

        bg-gradient-to-br
        from-[#0B1220]
        via-[#111C2E]
        to-[#17253A]

        p-12
        "
      >
        <div
          className="
          absolute

          right-0
          top-0

          h-[300px]
          w-[300px]

          rounded-full

          bg-blue-500/10

          blur-[120px]
          "
        />

        <button
          onClick={() =>
            navigate(
              "/instructor"
            )
          }
          className="
          flex
          items-center
          gap-3

          text-slate-400

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
            uppercase

            tracking-[5px]

            text-blue-400

            text-sm
            "
          >
            Assignment Studio
          </p>

          <h1
            className="
            mt-4

            text-6xl

            font-bold
            "
          >
            Create Assignment
          </h1>

          <p
            className="
            mt-5

            max-w-3xl

            text-slate-300

            leading-8
            "
          >
            Design practical tasks,
            evaluate learner
            understanding and
            measure outcomes with
            structured assignments.
          </p>
        </div>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="
        mt-10

        rounded-[40px]

        border
        border-slate-800

        bg-[#0D1524]

        p-10
        "
      >
        <div className="grid lg:grid-cols-2 gap-8">

          {/* TITLE */}

          <div>
            <label
              className="
              mb-3
              block

              text-slate-300
              "
            >
              Assignment Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={
                handleChange
              }
              required
              placeholder="Spring Boot CRUD Assignment"
              className="
              w-full

              px-5
              py-4

              rounded-2xl

              bg-[#08101F]

              border
              border-slate-700

              outline-none

              focus:border-blue-500
              "
            />
          </div>

          {/* COURSE */}

          <div>
            <label
              className="
              mb-3
              block

              text-slate-300
              "
            >
              Course
            </label>

            <select
              name="courseId"
              value={
                form.courseId
              }
              onChange={
                handleChange
              }
              required
              className="
              w-full

              px-5
              py-4

              rounded-2xl

              bg-[#08101F]

              border
              border-slate-700
              "
            >
              <option value="">
                Select Course
              </option>

              {courses.map(
                (course) => (
                  <option
                    key={
                      course.id
                    }
                    value={
                      course.id
                    }
                  >
                    {
                      course.title
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {/* MARKS */}

          <div>
            <label
              className="
              mb-3
              block

              text-slate-300
              "
            >
              Maximum Marks
            </label>

            <input
              type="number"
              name="maxMarks"
              value={
                form.maxMarks
              }
              onChange={
                handleChange
              }
              required
              className="
              w-full

              px-5
              py-4

              rounded-2xl

              bg-[#08101F]

              border
              border-slate-700
              "
            />
          </div>

          {/* DUE DATE */}

        <div>
        <label
            className="
            mb-3
            block
            text-slate-300
            "
        >
            Assignment Deadline
        </label>

        <div
            className="
            relative
            "
        >
            <Calendar
            size={20}
            className="
            absolute
            left-5
            top-1/2
            -translate-y-1/2
            text-blue-400

            pointer-events-none
            "
            />

               <DatePicker
            selected={dueDate}
            onChange={(date) =>
                setDueDate(date)
            }
            showTimeSelect
            dateFormat="dd MMM yyyy h:mm aa"
            placeholderText="Select Deadline"
            className="
                w-full
                px-5
                py-4
                rounded-2xl
                bg-[#08101F]
                border
                border-slate-700
                text-white
            "
            />
        </div>

        <p
            className="
            mt-2

            text-sm
            text-slate-500
            "
        >
            Learners will no longer be able to submit after this date.
        </p>
        </div>
        </div>

        {/* DESCRIPTION */}

        <div className="mt-8">
          <label
            className="
            mb-3
            block

            text-slate-300
            "
          >
            Assignment Description
          </label>

          <textarea
            name="description"
            value={
              form.description
            }
            onChange={
              handleChange
            }
            rows="8"
            required
            placeholder="Describe assignment objectives, expected deliverables and grading criteria..."
            className="
            w-full

            px-5
            py-4

            rounded-2xl

            bg-[#08101F]

            border
            border-slate-700

            focus:border-blue-500

            outline-none
            "
          />
        </div>

        <div className="mt-8">
        <label
            className="
            block
            mb-4

            text-slate-300
            font-medium
            "
        >
            Assignment Resources
        </label>

        <label
            className="
            relative

            flex
            flex-col
            items-center
            justify-center

            w-full

            min-h-[220px]

            rounded-[32px]

            border-2
            border-dashed
            border-blue-500/30

            bg-gradient-to-br
            from-[#08101F]
            to-[#0E1728]

            cursor-pointer

            hover:border-blue-500
            hover:bg-[#0F1A2D]

            transition-all
            duration-300
            "
        >
            <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
            className="hidden"
            onChange={(e) =>
                setFile(
                e.target.files[0]
                )
            }
            />

            <div className="text-center px-8">
            <div
                className="
                mx-auto

                h-20
                w-20

                rounded-3xl

                bg-blue-500/10

                flex
                items-center
                justify-center
                "
            >
                <BookOpen
                size={36}
                className="text-blue-400"
                />
            </div>

            <h3
                className="
                mt-6

                text-xl
                font-semibold
                "
            >
                Upload Assignment Files
            </h3>

            <p
                className="
                mt-3

                text-slate-400
                "
            >
                Drag & drop files here
                or click to browse
            </p>

            <p
                className="
                mt-2

                text-sm
                text-slate-500
                "
            >
                PDF, DOC, DOCX, PPT, ZIP
            </p>

            {file && (
                <div
                className="
                mt-6

                inline-flex
                items-center

                px-4
                py-2

                rounded-2xl

                bg-green-500/10

                border
                border-green-500/30

                text-green-300
                "
                >
                ✅ {file.name}
                </div>
            )}
            </div>
        </label>
        </div>


        {/* INFO CARDS */}

        {/* <div
          className="
          mt-10

          grid
          lg:grid-cols-3

          gap-6
          "
        >
          <div className="rounded-3xl border border-slate-800 bg-[#08101F] p-6">
            <BookOpen className="text-blue-400" />
            <h3 className="mt-4 font-semibold">
              Course Aligned
            </h3>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#08101F] p-6">
            <Award className="text-blue-400" />
            <h3 className="mt-4 font-semibold">
              Marks Evaluation
            </h3>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#08101F] p-6">
            <Calendar className="text-blue-400" />
            <h3 className="mt-4 font-semibold">
              Deadline Tracking
            </h3>
          </div>
        </div> */}

        <button
          type="submit"
          disabled={loading}
          className="
          mt-10

          w-full

          flex
          items-center
          justify-center
          gap-3

          py-5

          rounded-2xl

          bg-gradient-to-r
          from-blue-500
          to-indigo-600

          font-semibold

          hover:scale-[1.01]

          transition-all

          disabled:opacity-50
          "
        >
          <ClipboardCheck size={20} />

          {loading
            ? "Creating Assignment..."
            : "Create Assignment"}
        </button>
      </form>
    </InstructorLayout>
  );
}

export default CreateAssignment;