import {
  useEffect,
  useState,
} from "react";

import AdminSidebar from "../../components/admin/AdminSidebar";

import {
  getAllInstructors,
} from "../../services/adminService";

function AdminInstructors() {
  const [
    instructors,
    setInstructors,
  ] = useState([]);

  useEffect(() => {
    const loadData =
      async () => {
        try {
          const data =
            await getAllInstructors();

          setInstructors(data);
        } catch (error) {
          console.error(error);
        }
      };

    loadData();
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
          Instructors
        </h1>

        <p
          className="
          mt-3
          text-white/60
          "
        >
          Manage all instructors
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
          {instructors.map(
            (instructor) => (
              <div
                key={
                  instructor.id
                }
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
                    text-lg
                    font-semibold
                    "
                  >
                    {instructor.fullName}
                  </h3>

                  <p
                    className="
                    text-white/60
                    "
                  >
                    {instructor.email}
                  </p>
                </div>

                <div
                  className="
                  text-white/60
                  "
                >
                  {instructor.phoneNumber}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminInstructors;