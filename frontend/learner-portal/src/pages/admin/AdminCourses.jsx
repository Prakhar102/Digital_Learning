import {
  useEffect,
  useState,
} from "react";

import AdminSidebar from "../../components/admin/AdminSidebar";

import {
  getAllCourses,
} from "../../services/courseService";

function AdminCourses() {

  const [
    courses,
    setCourses,
  ] = useState([]);

  useEffect(() => {

    const loadCourses =
      async () => {

        try {

          const data =
            await getAllCourses();

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
      bg-[#08101F]
      flex
      "
    >
      <AdminSidebar />

      <div
        className="
        flex-1
        p-8
        "
      >
        <h1
          className="
          text-5xl
          font-bold
          "
        >
          Course Management
        </h1>

        <p
          className="
          mt-3
          text-white/60
          "
        >
          All platform courses
        </p>

        <div
          className="
          mt-8

          bg-white/5

          border
          border-white/10

          rounded-[28px]

          overflow-hidden
          "
        >
          {courses.length === 0 ? (
            <div className="p-8">
              No Courses Found
            </div>
          ) : (
            courses.map(
              (course) => (
                <div
                  key={course.id}
                  className="
                  flex
                  justify-between
                  items-center

                  px-8
                  py-6

                  border-b
                  border-white/10
                  "
                >
                  <div>
                    <h3
                      className="
                      text-xl
                      font-semibold
                      "
                    >
                      {course.title}
                    </h3>

                    <p
                      className="
                      text-white/60
                      mt-1
                      "
                    >
                      {course.description}
                    </p>
                  </div>

                  <div
                    className="
                    text-right
                    "
                  >
                    <p>
                      {course.level}
                    </p>

                    <p
                      className="
                      text-[#C98A3D]
                      "
                    >
                      {course.status}
                    </p>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCourses;