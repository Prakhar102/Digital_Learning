import {useEffect,useState,} from "react";

import {useNavigate,} from "react-router-dom";

//import AdminNavbar from "../../components/admin/AdminNavbar";

import {getAdminStats,getAllInstructors,} from "../../services/adminService";

import AdminSidebar from "../../components/admin/AdminSidebar";

import {Users,GraduationCap,ShieldCheck,UserPlus,} from "lucide-react";

function AdminDashboard() {

  const navigate =
    useNavigate();

  const [stats, setStats] =
    useState(null);

  const [
    instructors,
    setInstructors,
  ] = useState([]);

  useEffect(() => {

    console.log(
      "ADMIN DASHBOARD LOADED"
    );

    const loadData =
      async () => {

        try {

          console.log(
            "Calling Stats API..."
          );

          const statsData =
            await getAdminStats();

          console.log(
            "Stats Response:",
            statsData
          );

          console.log(
            "Calling Instructors API..."
          );

          const instructorData =
            await getAllInstructors();

          console.log(
            "Instructor Response:",
            instructorData
          );

          setStats(
            statsData
          );

          setInstructors(
            instructorData
          );

        } catch (error) {

          console.error(
            "ADMIN DASHBOARD ERROR:",
            error
          );

          console.error(
            "ERROR RESPONSE:",
            error?.response
          );

          console.error(
            "ERROR DATA:",
            error?.response?.data
          );
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

    <main
      className="
      flex-1
      p-8
      "
    >
      {/* HERO */}

      <div
        className="
        relative

        overflow-hidden

        rounded-[32px]

        border
        border-white/10

        bg-gradient-to-r
        from-[#0E4B46]
        via-[#123B49]
        to-[#1A2144]

        p-10
        "
      >
        <div>

          <div
            className="
            relative
            overflow-hidden

            rounded-[32px]

            border
            border-white/10

            bg-gradient-to-br
            from-[#0E4B46]
            via-[#123B49]
            to-[#161A34]

            p-10
            "
            >
            <p
                className="
                uppercase
                tracking-[5px]

                text-[#C98A3D]
                text-sm
                "
            >
                ADMIN CONTROL CENTER
            </p>

            <h1
                className="
                mt-4

                text-6xl
                font-bold
                "
            >
                Welcome Back
            </h1>

            <p
                className="
                mt-5

                max-w-2xl

                text-white/75
                leading-8
                "
            >
                Monitor instructors,
                learners, platform growth
                and overall learning
                ecosystem from one place.
            </p>
            </div>
        </div>
      </div>

      {/* STATS */}

      <div
        className="
        grid
        md:grid-cols-3

        gap-6

        mt-10
        "
      >
        <div
          className="
          p-8

          rounded-[28px]

          bg-white/5

          border
          border-white/10
          "
        >
          <Users
            size={30}
            className="text-[#C98A3D]"
          />

          <h2
            className="
            text-5xl
            font-bold

            mt-6
            "
          >
            {stats?.totalLearners ?? 0}
          </h2>

          <p
            className="
            mt-3

            text-white/60
            "
          >
            Learners
          </p>
        </div>

        <div
          className="
          p-8

          rounded-[28px]

          bg-white/5

          border
          border-white/10
          "
        >
          <GraduationCap
            size={30}
            className="text-[#3E7C74]"
          />

          <h2
            className="
            text-5xl
            font-bold

            mt-6
            "
          >
            {stats?.totalInstructors ?? 0}
          </h2>

          <p
            className="
            mt-3

            text-white/60
            "
          >
            Instructors
          </p>
        </div>

        <div
          className="
          p-8

          rounded-[28px]

          bg-white/5

          border
          border-white/10
          "
        >
          <ShieldCheck
            size={30}
            className="text-[#C98A3D]"
          />

          <h2
            className="
            text-5xl
            font-bold

            mt-6
            "
          >
            {stats?.totalAdmins ?? 0}
          </h2>

          <p
            className="
            mt-3

            text-white/60
            "
          >
            Administrators
          </p>
        </div>
      </div>

      {/* QUICK ACTION */}

       <div className="mt-12">
        <h2
            className="
            text-3xl
            font-bold
            mb-6
            "
        >
            Quick Actions
        </h2>

        <div
            className="
            grid
            md:grid-cols-4
            gap-6
            "
        >
            <button
            onClick={() =>
                navigate(
                "/admin/create-instructor"
                )
            }
            className="
            p-6

            rounded-[28px]

            bg-white/5

            border
            border-white/10

            text-left

            hover:border-[#C98A3D]

            transition-all
            "
            >
            <h3
                className="
                text-xl
                font-semibold
                "
            >
                Create Instructor
            </h3>

            <p
                className="
                mt-2
                text-white/60
                "
            >
                Add new instructors
                to platform
            </p>
            </button>

            <button
            onClick={() =>
                navigate(
                "/admin/instructors"
                )
            }
            className="
            p-6

            rounded-[28px]

            bg-white/5

            border
            border-white/10

            text-left

            hover:border-[#C98A3D]

            transition-all
            "
            >
            <h3
                className="
                text-xl
                font-semibold
                "
            >
                View Instructors
            </h3>

            <p
                className="
                mt-2
                text-white/60
                "
            >
                Manage instructor directory
            </p>
            </button>

            <button
            onClick={() =>
                navigate("/admin/courses")
            }
            className="
            p-6

            rounded-[28px]

            bg-white/5

            border
            border-white/10

            text-left

            hover:border-[#C98A3D]

            transition-all
            "
            >
            <h3
                className="
                text-xl
                font-semibold
                "
            >
                Manage Courses
            </h3>

            <p
                className="
                mt-2
                text-white/60
                "
            >
                Review platform courses
            </p>
            </button>

            <button
            onClick={() =>
                navigate(
                "/admin/analytics"
                )
            }
            className="
            p-6

            rounded-[28px]

            bg-white/5

            border
            border-white/10

            text-left

            hover:border-[#C98A3D]

            transition-all
            "
            >
            <h3
                className="
                text-xl
                font-semibold
                "
            >
                Analytics
            </h3>

            <p
                className="
                mt-2
                text-white/60
                "
            >
                Platform insights
            </p>
            </button>
        </div>
        </div>

      {/* INSTRUCTORS */}

      <div
        className="
        mt-12
        "
      >
        <h2
        className="
        text-3xl
        font-bold
        "
        >
        Instructor Directory
        </h2>

        <p
        className="
        mt-2
        text-white/60
        "
        >
        All platform instructors
        </p>

        <div
          className="
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
                key={instructor.id}
                className="
                flex
                justify-between
                items-center

                p-6

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
                    flex
                    items-center
                    gap-4
                    "
                    >
                    <span
                        className="
                        px-3
                        py-1

                        rounded-full

                        text-xs

                        bg-green-500/15
                        text-green-300
                        "
                    >
                        ACTIVE
                    </span>

                    <span
                        className="
                        text-white/60
                        "
                    >
                        {instructor.phoneNumber}
                    </span>
                    </div>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  </div>
);
}

export default AdminDashboard;