import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FadeInSection from "../common/FadeInSection";

import {
  FaBookOpen,
  FaClipboardCheck,
  FaAward,
  FaChartLine,
} from "react-icons/fa";
import { getAdminStats } from "../../services/adminService";
import { getAllCourses } from "../../services/courseService";
import { getAllAssessments } from "../../services/assessmentService";
import { getAllCertificates } from "../../services/certificateService";

function PlatformStats() {
  const [learnerCount, setLearnerCount] = useState(5);
  const [courseCount, setCourseCount] = useState(0);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [certCount, setCertCount] = useState(1);
  const [completionRate, setCompletionRate] = useState("0%");

  useEffect(() => {
    let isMounted = true;

    const fetchRealTimeStats = async () => {
      try {
        const [statsRes, coursesRes, assessRes, certsRes] = await Promise.allSettled([
          getAdminStats(),
          getAllCourses(),
          getAllAssessments(),
          getAllCertificates(),
        ]);

        if (!isMounted) return;

        // Dynamic courses
        if (coursesRes.status === "fulfilled" && Array.isArray(coursesRes.value)) {
          setCourseCount(coursesRes.value.length);
        }

        // Dynamic assessments
        if (assessRes.status === "fulfilled" && Array.isArray(assessRes.value)) {
          setAssessmentCount(assessRes.value.length);
        }

        // Dynamic certificates
        if (certsRes.status === "fulfilled" && Array.isArray(certsRes.value) && certsRes.value.length > 0) {
          setCertCount(certsRes.value.length);
        } else {
          try {
            const rawCerts = JSON.parse(localStorage.getItem("dlm_user_certificates_store") || "[]");
            if (rawCerts.length > 0) setCertCount(rawCerts.length);
          } catch {}
        }

        // Dynamic admin & platform telemetry stats
        if (statsRes.status === "fulfilled" && statsRes.value) {
          const data = statsRes.value;
          setLearnerCount(data.totalLearners || data.activeLearners || 5);
          if (data.totalCertificates) {
            setCertCount(data.totalCertificates);
          }
          if (data.completionRate !== undefined) {
            setCompletionRate(`${data.completionRate}%`);
          } else if (data.totalEnrollments && data.completedEnrollments) {
            const rate = Math.round((data.completedEnrollments / data.totalEnrollments) * 100);
            setCompletionRate(`${rate}%`);
          }
        } else {
          setLearnerCount(5);
        }
      } catch (err) {
        console.error("Error fetching live platform stats:", err);
      }
    };

    fetchRealTimeStats();

    const handleStorage = () => fetchRealTimeStats();
    window.addEventListener("storage", handleStorage);

    // Poll live platform telemetry every 10 seconds
    const interval = setInterval(fetchRealTimeStats, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const stats = [
    {
      icon: FaBookOpen,
      value: courseCount.toLocaleString(),
      label: "Courses",
      color: "#C98A3D",
    },
    {
      icon: FaClipboardCheck,
      value: assessmentCount.toLocaleString(),
      label: "Assessments",
      color: "#3E7C74",
    },
    {
      icon: FaAward,
      value: certCount.toLocaleString(),
      label: "Certificates Issued",
      color: "#C98A3D",
    },
    {
      icon: FaChartLine,
      value: completionRate,
      label: "Completion Rate",
      color: "#3E7C74",
    },
  ];

  return (
    <FadeInSection>
      <section
        id="platform-stats"
        className="
        py-16

        max-w-7xl
        mx-auto

        px-8
        "
      >
        <div className="text-center">
          <p
            className="
            uppercase

            tracking-[6px]

            text-[#3E7C74]

            mb-4
            "
          >
            Platform Impact
          </p>

          <h2
            className="
            text-6xl

            font-bold

            text-[#C98A3D]
            "
          >
            {learnerCount.toLocaleString()}
          </h2>

          <p
            className="
            mt-4

            text-2xl

            text-[#F1ECE0]
            "
          >
            Active Learners
          </p>
        </div>

        <div
          className="
          mt-16

          grid
          md:grid-cols-4

          gap-10

          text-center
          "
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -8,
                  scale: 1.03,
                }}
              >
                <Icon
                  className="
                  text-5xl

                  mx-auto
                  "
                  style={{
                    color: stat.color,
                  }}
                />

                <h3
                  className="
                  mt-4

                  text-5xl

                  font-bold
                  "
                  style={{
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </h3>

                <p
                  className="
                  mt-3

                  text-[#F1ECE0]
                  "
                >
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </FadeInSection>
  );
}

export default PlatformStats;