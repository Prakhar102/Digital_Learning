import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  ClipboardCheck,
  CalendarDays,
  Award,
  FileText,
  Users,
  Plus,
  X,
  Upload,
} from "lucide-react";

import InstructorLayout from "../../components/instructor/InstructorLayout";

import {
  createAssignment,
  getInstructorAssignments,
  uploadAssignmentFile,
} from "../../services/assignmentService";

import {
  getAllCourses,
} from "../../services/courseService";

import {
  getCurrentUser,
} from "../../services/userService";

function MyAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] =
    useState([]);

  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    createLoading,
    setCreateLoading,
  ] = useState(false);

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [file, setFile] =
    useState(null);

  const [dueDate, setDueDate] =
    useState(null);

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      courseId: "",
      maxMarks: 100,
    });

useEffect(() => {

  const loadInitialData =
    async () => {

      try {

        setLoading(true);

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

        const assignmentData =
          await getInstructorAssignments(
            user.id
          );

        setAssignments(
          assignmentData
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }
    };

  loadInitialData();

}, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      courseId: "",
      maxMarks: 100,
    });

    setDueDate(null);

    setFile(null);
  };

  const handleCreateAssignment =
    async (e) => {
      e.preventDefault();

      try {
        setCreateLoading(true);

        const user =
          await getCurrentUser();

        let fileName =
          null;

        let fileUrl =
          null;

        if (file) {
          fileName =
            await uploadAssignmentFile(
              file
            );

          fileUrl =
            `/api/assignments/download/${fileName}`;
        }

        await createAssignment({
          ...form,

          courseId:
            Number(
              form.courseId
            ),

          instructorId:
            user.id,

          dueDate:
            dueDate,

          assignmentFileName:
            fileName,

          assignmentFileUrl:
            fileUrl,
        });

        setShowCreateModal(
          false
        );

        resetForm();

        window.location.reload();

      } catch (error) {
        console.error(error);

        alert(
          "Failed To Create Assignment"
        );
      } finally {
        setCreateLoading(false);
      }
    };
    return (
  <InstructorLayout>

    <div className="space-y-8">

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
    via-[#10192A]
    to-[#17253A]

    p-10
    "
  >
    <div
      className="
      absolute

      top-0
      right-0

      w-72
      h-72

      rounded-full

      bg-blue-500/10

      blur-[120px]
      "
    />

    <div className="relative z-10">

      <p
        className="
        uppercase

        tracking-[5px]

        text-blue-400

        text-sm
        "
      >
        Assignment Management
      </p>

      <h1
        className="
        mt-4

        text-5xl

        font-bold
        "
      >
        My Assignments
      </h1>

      <p
        className="
        mt-4

        max-w-3xl

        text-slate-400
        "
      >
        Manage assignments,
        evaluate submissions,
        review learner performance
        and track deadlines.
      </p>

      <button
        onClick={() =>
          setShowCreateModal(true)
        }
        className="
        mt-8

        inline-flex
        items-center
        gap-3

        px-6
        py-3

        rounded-2xl

        bg-blue-600

        hover:bg-blue-500

        transition-all
        "
      >
        <Plus size={18} />

        Create Assignment
      </button>

    </div>
  </div>

  {/* STATS */}

  <div
    className="
    grid

    md:grid-cols-3

    gap-6
    "
  >

    <div
      className="
      rounded-3xl

      border
      border-slate-800

      bg-[#0D1524]

      p-8
      "
    >
      <ClipboardCheck
        className="
        text-blue-400
        "
      />

      <h2
        className="
        mt-5

        text-4xl

        font-bold
        "
      >
        {assignments.length}
      </h2>

      <p
        className="
        mt-2

        text-slate-400
        "
      >
        Total Assignments
      </p>
    </div>

    <div
      className="
      rounded-3xl

      border
      border-slate-800

      bg-[#0D1524]

      p-8
      "
    >
      <Award
        className="
        text-blue-400
        "
      />

      <h2
        className="
        mt-5

        text-4xl

        font-bold
        "
      >
        Active
      </h2>

      <p
        className="
        mt-2

        text-slate-400
        "
      >
        Assignment Pipeline
      </p>
    </div>

    <div
      className="
      rounded-3xl

      border
      border-slate-800

      bg-[#0D1524]

      p-8
      "
    >
      <Users
        className="
        text-blue-400
        "
      />

      <h2
        className="
        mt-5

        text-4xl

        font-bold
        "
      >
        --
      </h2>

      <p
        className="
        mt-2

        text-slate-400
        "
      >
        Total Submissions
      </p>
    </div>

  </div>

  {/* LOADING */}

  {loading && (
    <div
      className="
      rounded-3xl

      border
      border-slate-800

      bg-[#0D1524]

      p-12

      text-center
      "
    >
      Loading Assignments...
    </div>
  )}

  {/* EMPTY */}

  {!loading &&
    assignments.length ===
      0 && (
      <div
        className="
        rounded-3xl

        border
        border-slate-800

        bg-[#0D1524]

        p-12

        text-center
        "
      >
        <ClipboardCheck
          size={60}
          className="
          mx-auto

          text-blue-400
          "
        />

        <h2
          className="
          mt-6

          text-2xl

          font-semibold
          "
        >
          No Assignments Yet
        </h2>

        <p
          className="
          mt-3

          text-slate-400
          "
        >
          Create your first
          assignment to start
          engaging learners.
        </p>
      </div>
    )}

  {/* ASSIGNMENT LIST */}

  <div
    className="
    grid

    lg:grid-cols-2

    gap-8
    "
  >
    {assignments.map(
      (assignment) => (

        <div
          key={assignment.id}
          className="
          rounded-[32px]

          border
          border-slate-800

          bg-[#0D1524]

          p-8

          hover:border-blue-500/40

          transition-all
          "
        >

          <h2
            className="
            text-2xl

            font-bold
            "
          >
            {assignment.title}
          </h2>

          <p
            className="
            mt-3

            text-slate-400
            "
          >
            {assignment.description}
          </p>

          <div
            className="
            mt-6

            grid

            grid-cols-2

            gap-4
            "
          >

            <div
              className="
              rounded-2xl

              bg-[#08101F]

              p-4
              "
            >
              <Award
                size={18}
                className="
                text-blue-400
                "
              />

              <p
                className="
                mt-2

                text-sm

                text-slate-400
                "
              >
                Max Marks
              </p>

              <h3
                className="
                text-xl

                font-bold
                "
              >
                {
                  assignment.maxMarks
                }
              </h3>
            </div>

            <div
              className="
              rounded-2xl

              bg-[#08101F]

              p-4
              "
            >
              <CalendarDays
                size={18}
                className="
                text-blue-400
                "
              />

              <p
                className="
                mt-2

                text-sm

                text-slate-400
                "
              >
                Deadline
              </p>

              <h3
                className="
                text-sm

                font-medium
                "
              >
                {
                  assignment.dueDate
                }
              </h3>
            </div>

          </div>

          {assignment.assignmentFileUrl && (

            (
              <a
                href={assignment.assignmentFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                mt-4

                inline-flex
                items-center
                gap-2

                text-blue-400

                hover:underline
                "
              >
                <FileText
                  size={18}
                />

                Download Assignment PDF
              </a>
            )
          )}

          <div
            className="
            mt-8

            flex

            gap-4
            "
          >

            <button
              onClick={() =>
                navigate(
                  `/instructor/submissions/${assignment.id}`
                )
              }
              className="
              flex-1

              flex
              items-center
              justify-center

              gap-2

              py-3

              rounded-xl

              bg-blue-600

              hover:bg-blue-500

              transition-all
              "
            >
              <Users
                size={18}
              />

              View Submissions
            </button>

          </div>

        </div>
      )
    )}
  </div>
</div>

{/* CREATE ASSIGNMENT MODAL */}

{showCreateModal && (
  <div
    className="
    fixed
    inset-0
    z-50

    bg-black/80

    flex
    items-center
    justify-center

    p-6
    "
  >
    <div
      className="
      w-full
      max-w-5xl

      max-h-[90vh]

      overflow-y-auto

      rounded-[32px]

      border
      border-slate-800

      bg-[#0D1524]

      p-8
      "
    >
      {/* HEADER */}

      <div
        className="
        flex
        items-center
        justify-between
        "
      >
        <div>
          <h2
            className="
            text-3xl
            font-bold
            "
          >
            Create Assignment
          </h2>

          <p
            className="
            mt-2
            text-slate-400
            "
          >
            Create and publish a new
            assignment for learners.
          </p>
        </div>

        <button
          onClick={() =>
            setShowCreateModal(false)
          }
          className="
          h-10
          w-10

          rounded-xl

          border
          border-slate-700

          flex
          items-center
          justify-center
          "
        >
          <X size={18} />
        </button>
      </div>

      {/* FORM */}

      <form
        onSubmit={
          handleCreateAssignment
        }
        className="mt-8"
      >
        <div
          className="
          grid
          md:grid-cols-2

          gap-6
          "
        >

          {/* TITLE */}

          <div>
            <label
              className="
              block
              mb-3

              text-slate-300
              "
            >
              Assignment Title
            </label>

            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={
                handleChange
              }
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

          {/* COURSE */}

          <div>
            <label
              className="
              block
              mb-3

              text-slate-300
              "
            >
              Course
            </label>

            <select
              required
              name="courseId"
              value={
                form.courseId
              }
              onChange={
                handleChange
              }
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
              block
              mb-3

              text-slate-300
              "
            >
              Maximum Marks
            </label>

            <input
              type="number"
              required
              name="maxMarks"
              value={
                form.maxMarks
              }
              onChange={
                handleChange
              }
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

          {/* DATE */}

          <div>
            <label
              className="
              block
              mb-3

              text-slate-300
              "
            >
              Assignment Deadline
            </label>

            <DatePicker
              selected={dueDate}
              onChange={(date) =>
                setDueDate(date)
              }
              showTimeSelect
              required
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

        </div>

        {/* DESCRIPTION */}

        <div className="mt-6">
          <label
            className="
            block
            mb-3

            text-slate-300
            "
          >
            Description
          </label>

          <textarea
            rows="6"
            required
            name="description"
            value={
              form.description
            }
            onChange={
              handleChange
            }
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

        {/* FILE UPLOAD */}

        <div className="mt-8">

          <label
            className="
            block
            mb-4

            text-slate-300
            "
          >
            Assignment Resources
          </label>

          <label
            className="
            flex
            flex-col

            items-center
            justify-center

            min-h-[220px]

            rounded-[32px]

            border-2
            border-dashed

            border-blue-500/30

            bg-[#08101F]

            cursor-pointer
            "
          >
            <input
              type="file"
              className="hidden"
              accept="
              .pdf,
              .doc,
              .docx,
              .ppt,
              .pptx,
              .zip
              "
              onChange={(e) =>
                setFile(
                  e.target.files[0]
                )
              }
            />

            <Upload
              size={50}
              className="
              text-blue-400
              "
            />

            <h3
              className="
              mt-4

              font-semibold
              "
            >
              Upload Assignment File
            </h3>

            <p
              className="
              mt-2

              text-slate-400
              "
            >
              PDF, DOC, DOCX, PPT, ZIP
            </p>

            {file && (
              <div
                className="
                mt-6

                px-5
                py-3

                rounded-2xl

                bg-green-500/10

                border
                border-green-500/20

                text-green-300
                "
              >
                {file.name}
              </div>
            )}
          </label>
        </div>

        {/* BUTTONS */}

        <div
          className="
          mt-8

          flex
          justify-end

          gap-4
          "
        >
          <button
            type="button"
            onClick={() =>
              setShowCreateModal(false)
            }
            className="
            px-6
            py-3

            rounded-2xl

            border
            border-slate-700
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              createLoading
            }
            className="
            px-8
            py-3

            rounded-2xl

            bg-blue-600

            hover:bg-blue-500

            transition-all
            "
          >
            {createLoading
              ? "Creating..."
              : "Create Assignment"}
          </button>
        </div>

      </form>
    </div>
  </div>
      )}
    </InstructorLayout>
  );
}


export default MyAssignments;