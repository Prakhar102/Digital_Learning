import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FadeInSection from "../common/FadeInSection";

import {
  FaBookOpen,
  FaClipboardCheck,
  FaAward,
  FaChartLine,
} from "react-icons/fa";
import { getAdminStats, getStoredInstructors } from "../../services/adminService";
import { getAllCourses } from "../../services/courseService";
import { getAllAssessments } from "../../services/assessmentService";
import { getAllCertificates } from "../../services/certificateService";
import { getAllRealtimeEnrollments } from "../../services/enrollmentService";

function PlatformStats() {
  const [learnerCount, setLearnerCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [assessmentCount, setAssessmentCount] = useState(0);
  const [certCount, setCertCount] = useState(0);
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

        // 1. Dynamic courses count
        if (coursesRes.status === "fulfilled" && Array.isArray(coursesRes.value)) {
          setCourseCount(coursesRes.value.length);
        } else {
          setCourseCount(0);
        }

        // 2. Dynamic assessments count
        if (assessRes.status === "fulfilled" && Array.isArray(assessRes.value)) {
          setAssessmentCount(assessRes.value.length);
        } else {
          setAssessmentCount(0);
        }

        // 3. Dynamic Certificates Issued
        let certificatesCount = 0;
        if (certsRes.status === "fulfilled" && Array.isArray(certsRes.value)) {
          certificatesCount = certsRes.value.length;
        }
        setCertCount(certificatesCount);

        // 4. Dynamic Active Learners: Count ONLY genuine learners (exclude instructors, admins, faculty)
        const instructors = getStoredInstructors();
        const staffEmails = new Set(
          instructors.map((i) => (i.email || "").toLowerCase().trim()).filter(Boolean)
        );
        staffEmails.add("admin@dlm.edu");
        staffEmails.add("instructor@dlm.edu");
        staffEmails.add("faculty@dlm.edu");

        const staffIds = new Set(
          instructors.map((i) => String(i.id)).filter(Boolean)
        );
        staffIds.add("1"); // Root admin / default instructor ID

        const genuineLearnerEmails = new Set();
        const genuineLearnerIds = new Set();

        // Enrolled students registry
        const enrollments = getAllRealtimeEnrollments();
        enrollments.forEach((e) => {
          const email = (e.learnerEmail || "").toLowerCase().trim();
          const uid = String(e.userId || "");
          const isStaff =
            (email && staffEmails.has(email)) ||
            (uid && staffIds.has(uid)) ||
            (e.role && (e.role.includes("INSTRUCTOR") || e.role.includes("ADMIN")));

          if (!isStaff) {
            if (email) genuineLearnerEmails.add(email);
            if (uid) genuineLearnerIds.add(uid);
          }
        });

        // Registered users in localStorage (if any)
        try {
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          if (Array.isArray(users)) {
            users.forEach((u) => {
              const role = (u.role || "").toUpperCase();
              const email = (u.email || "").toLowerCase().trim();
              const uid = String(u.id || "");
              const isStaff =
                role.includes("INSTRUCTOR") ||
                role.includes("ADMIN") ||
                role.includes("FACULTY") ||
                (email && staffEmails.has(email)) ||
                (uid && staffIds.has(uid));

              if (!isStaff) {
                if (email) genuineLearnerEmails.add(email);
                if (uid) genuineLearnerIds.add(uid);
              }
            });
          }
        } catch {}

        // Current user session if learner
        try {
          const currUser = JSON.parse(localStorage.getItem("user") || "null");
          if (currUser) {
            const role = (currUser.role || "").toUpperCase();
            const email = (currUser.email || "").toLowerCase().trim();
            const uid = String(currUser.id || "");
            const isStaff =
              role.includes("INSTRUCTOR") ||
              role.includes("ADMIN") ||
              role.includes("FACULTY") ||
              (email && staffEmails.has(email)) ||
              (uid && staffIds.has(uid));

            if (!isStaff) {
              if (email) genuineLearnerEmails.add(email);
              if (uid) genuineLearnerIds.add(uid);
            }
          }
        } catch {}

        const activeLearners = Math.max(genuineLearnerEmails.size, genuineLearnerIds.size);
        setLearnerCount(activeLearners);

        // 5. Completion Rate calculation
        if (enrollments.length > 0) {
          const completedCount = enrollments.filter(
            (e) => e.status === "COMPLETED" || e.progress >= 100 || e.isCompleted
          ).length;
          const rate = Math.round((completedCount / enrollments.length) * 100);
          setCompletionRate(`${rate}%`);
        } else if (certificatesCount > 0 && activeLearners > 0) {
          const rate = Math.min(100, Math.round((certificatesCount / activeLearners) * 100));
          setCompletionRate(`${rate}%`);
        } else if (statsRes.status === "fulfilled" && statsRes.value?.completionRate !== undefined) {
          setCompletionRate(`${statsRes.value.completionRate}%`);
        } else {
          setCompletionRate("0%");
        }
      } catch (err) {
        console.error("Error fetching live platform stats:", err);
      }
    };

    fetchRealTimeStats();

    // Listen to real-time storage events (enrollments, certificates claimed, auth changes)
    const handleStorageUpdate = () => {
      fetchRealTimeStats();
    };
    window.addEventListener("storage", handleStorageUpdate);

    // Poll live platform telemetry every 5 seconds
    const interval = setInterval(fetchRealTimeStats, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageUpdate);
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