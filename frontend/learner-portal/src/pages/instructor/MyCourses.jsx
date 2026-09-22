import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InstructorLayout from "../../components/instructor/InstructorLayout";

import {
  getAllCourses,
  publishCourse,
} from "../../services/courseService";

import {
  getCurrentUser,
} from "../../services/userService";

import {
  BookOpen,
  Eye,
  Send,
} from "lucide-react";

function MyCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const loadCourses = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadCourses();
    };

    init();
  }, []);

  const handlePublish =
    async (courseId) => {
      try {
        await publishCourse(
          courseId
        );

        await loadCourses();

        alert(
          "Course Published Successfully"
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed To Publish Course"
        );
      }
    };

  return (
    <InstructorLayout>
    <div
      className="
      min-h-screen
      bg-[#07111F]
      px-8
      py-8
      text-white
      "
    >
      {/* HEADER */}

      <div
        className="
        flex
        justify-between
        items-center
        "
      >
        <div>
          <h1
            className="
            text-5xl
            font-bold
            "
          >
            My Courses
          </h1>

          <p
            className="
            mt-3
            text-slate-400
            "
          >
            Manage all your courses
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              "/instructor/create-course"
            )
          }
          className="
          px-6
          py-4
          rounded-2xl
          bg-[#4F8CFF]
          hover:bg-[#6AA7FF]
          transition-all
          font-semibold
          "
        >
          Create Course
        </button>
      </div>

      {/* CONTENT */}

      {loading ? (
        <div className="mt-12">
          Loading...
        </div>
      ) : (
        <div
          className="
          mt-10

          grid
          lg:grid-cols-2

          gap-6
          "
        >
          {courses.length === 0 ? (
            <div
              className="
              p-10

              rounded-[32px]

              border
              border-white/10

              bg-white/[0.03]
              "
            >
              No Courses Found
            </div>
          ) : (
            courses.map(
              (course) => (
                <div
                  key={course.id}
                  className="
                  rounded-[32px]

                  border
                  border-white/10

                  bg-white/[0.03]

                  hover:border-[#4F8CFF]

                  transition-all

                  p-8
                  "
                >
                  <div
                    className="
                    flex
                    justify-between
                    items-center
                    "
                  >
                    <BookOpen
                      className="
                      text-[#4F8CFF]
                      "
                    />

                    <span
                      className={`
                        px-3
                        py-1

                        rounded-full

                        text-xs
                        font-medium

                        ${
                          course.status ===
                          "PUBLISHED"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-yellow-500/20 text-yellow-300"
                        }
                      `}
                    >
                      {course.status}
                    </span>
                  </div>

                  <h2
                    className="
                    mt-6

                    text-2xl
                    font-bold
                    "
                  >
                    {course.title}
                  </h2>

                  <p
                    className="
                    mt-3

                    text-slate-400

                    line-clamp-3
                    "
                  >
                    {course.description}
                  </p>

                  <div
                    className="
                    mt-6

                    flex
                    justify-between

                    text-sm
                    text-slate-400
                    "
                  >
                    <span>
                      {course.level}
                    </span>

                    <span>
                      Course #{course.id}
                    </span>
                  </div>

                  <div
                    className="
                    mt-8

                    flex
                    gap-3
                    "
                  >
                    <button
                      className="
                      flex
                      items-center
                      gap-2

                      px-4
                      py-3

                      rounded-xl

                      border
                      border-white/10

                      hover:border-[#4F8CFF]

                      transition-all
                      "
                    >
                      <Eye size={16} />

                      View
                    </button>

                    {course.status ===
                      "DRAFT" && (
                      <button
                        onClick={() =>
                          handlePublish(
                            course.id
                          )
                        }
                        className="
                        flex
                        items-center
                        gap-2

                        px-4
                        py-3

                        rounded-xl

                        bg-[#4F8CFF]

                        hover:bg-[#6AA7FF]

                        transition-all
                        "
                      >
                        <Send size={16} />

                        Publish
                      </button>
                    )}
                  </div>
                </div>
              )
            )
          )}
        </div>
      )}
    </div>
    </InstructorLayout>
  );
}

export default MyCourses;