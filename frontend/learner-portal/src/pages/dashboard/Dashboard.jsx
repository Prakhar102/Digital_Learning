import {useEffect, useState,} from "react";

import DashboardNavbar from "../../components/dashboard/DashboardNavbar";
import { getCurrentUser,getDashboardStats, } from "../../services/userService";
import WelcomeSection from "../../components/dashboard/WelcomeSection";
import ProgressOverview from "../../components/dashboard/ProgressOverview";
import QuickActions from "../../components/dashboard/QuickActions";

function Dashboard() {

  const [user, setUser] = useState(null);

  const [stats, setStats] = useState(null);

useEffect(() => {

const loadUser = async () => {
  try {
    const userData =
      await getCurrentUser();

    setUser(userData);

    const statsData =
      await getDashboardStats();

    setStats(statsData);

  } catch (error) {
    console.error(
      "Dashboard API Error:",
      error
    );
  }
};

  loadUser();

}, []);
  return (
    <div
      className="
      min-h-screen

      bg-[#0F1226]
      "
    >
      <DashboardNavbar user={user} />

      <div
        className="
        max-w-7xl
        mx-auto

        px-8

        py-12
        "
      >
        {/* HERO */}

        <WelcomeSection user={user} />

        <ProgressOverview />

        <QuickActions />

        {/* STATS */}

        <div
          className="
          mt-12

          grid

          md:grid-cols-4

          gap-6
          "
        >
          <div
            className="
            p-6

            bg-white/5

            rounded-3xl

            border
            border-white/10
            "
          >
            <h3 className="text-4xl font-bold">
              {stats ? stats.enrolledCourses : 0}
            </h3>

            <p className="mt-2 text-white/70">
              Courses
            </p>
          </div>

          <div
            className="
            p-6

            bg-white/5

            rounded-3xl

            border
            border-white/10
            "
          >
            <h3 className="text-4xl font-bold">
              {stats ? stats.completedAssessments : 0}
            </h3>

            <p className="mt-2 text-white/70">
              Assessments
            </p>
          </div>

          <div
            className="
            p-6

            bg-white/5

            rounded-3xl

            border
            border-white/10
            "
          >
            <h3 className="text-4xl font-bold">
              {stats ? stats.certificatesEarned : 0}
            </h3>

            <p className="mt-2 text-white/70">
              Certificates
            </p>
          </div>

          <div
            className="
            p-6

            bg-white/5

            rounded-3xl

            border
            border-white/10
            "
          >
            <h3 className="text-4xl font-bold">
              {stats ? stats.learningHours : 0}
            </h3>

            <p className="mt-2 text-white/70">
              Hours Learned
            </p>
          </div>
        </div>

        {/* CONTINUE LEARNING */}

        <div
          className="
          mt-12

          bg-gradient-to-r
          from-[#0E4B46]
          to-[#123B49]

          rounded-[36px]

          p-8
          "
        >
          <p
            className="
            text-[#C98A3D]

            uppercase

            tracking-[4px]
            "
          >
            Continue Learning
          </p>

          <h2
            className="
            mt-4

            text-4xl

            font-bold
            "
          >
            Spring Boot Microservices
          </h2>

          <p
            className="
            mt-4

            text-[#F1ECE0]
            "
          >
            68% completed
          </p>

          <button
            className="
            mt-6

            px-6
            py-3

            rounded-xl

            bg-[#C98A3D]

            text-[#161A34]

            font-bold
            "
          >
            Resume Course
          </button>
        </div>

        {/* RECOMMENDED */}

        <div className="mt-12">
          <h2
            className="
            text-3xl

            font-bold
            "
          >
            Recommended For You
          </h2>

          <div
            className="
            mt-6

            grid

            md:grid-cols-3

            gap-6
            "
          >
            {[
              "Java Fundamentals",
              "Spring Security",
              "Apache Kafka",
            ].map((course) => (
              <div
                key={course}
                className="
                p-6

                bg-white/5

                border
                border-white/10

                rounded-3xl
                "
              >
                <h3
                  className="
                  text-xl

                  font-bold
                  "
                >
                  {course}
                </h3>

                <p
                  className="
                  mt-3

                  text-white/70
                  "
                >
                  Recommended based on your
                  learning goals.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;