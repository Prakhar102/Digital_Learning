import {
  useEffect,
  useState,
} from "react";

import {
  getMyCourses,
} from "../../services/enrollmentService";

import {
  getCurrentUser,
} from "../../services/userService";

function MyLearning() {
  const [courses, setCourses] =
    useState([]);

  useEffect(() => {
const loadCourses = async () => {
  try {
    const user = await getCurrentUser();

    console.log("USER:", user);

    const data = await getMyCourses(user.id);

    console.log("COURSES:", data);

    setCourses(data);
  } catch (error) {
    console.error(error);
  }
};

    loadCourses();
  }, []);

  return (
    <div
      className="
      min-h-screen
      bg-[#0F1226]
      p-8
      "
    >
      <h1
        className="
        text-4xl
        font-bold
        mb-8
        "
      >
        My Learning
      </h1>

      <div
        className="
        grid
        md:grid-cols-3
        gap-6
        "
      >
        {courses.map(
          (course) => (
            <div
              key={course.id}
              className="
              bg-white/5
              border
              border-white/10
              rounded-3xl
              p-6
              "
            >
              <h2
                className="
                text-xl
                font-semibold
                "
              >
                Course ID:
                {" "}
                {course.courseId}
              </h2>

              <p
                className="
                mt-3
                text-white/70
                "
              >
                Enrolled on:
              </p>

              <p>
                {
                  course.enrolledAt
                }
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default MyLearning;