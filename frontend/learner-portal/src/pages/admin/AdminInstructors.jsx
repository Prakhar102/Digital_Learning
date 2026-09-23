import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Search,
  Shield,
  ToggleLeft,
  ToggleRight,
  GraduationCap,
} from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAllInstructors } from "../../services/adminService";
import { getAllCourses } from "../../services/courseService";
import { getAllRealtimeEnrollments } from "../../services/enrollmentService";

const USER_STATUS_KEY = "dlm_admin_user_status_map";

function AdminInstructors() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("INSTRUCTORS"); // INSTRUCTORS or LEARNERS
  const [instructors, setInstructors] = useState([]);
  const [learners, setLearners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [userStatusMap, setUserStatusMap] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const handleStorageChange = () => {
      loadData();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [insList, courseList] = await Promise.allSettled([
        getAllInstructors(),
        getAllCourses(),
      ]);


      const storedStatus = JSON.parse(localStorage.getItem(USER_STATUS_KEY) || "{}");
      setUserStatusMap(storedStatus);

      const enrolled = getAllRealtimeEnrollments();
      setEnrollments(enrolled);

      if (insList.status === "fulfilled" && Array.isArray(insList.value)) {
        setInstructors(insList.value);
      } else {
        setInstructors([
          { id: 1, fullName: "Aritra Basak", email: "aritra@dlm.edu", role: "INSTRUCTOR" },
          { id: 2, fullName: "Dr. Evelyn Reed", email: "reed@dlm.edu", role: "INSTRUCTOR" },
          { id: 3, fullName: "Marcus Vance", email: "vance@dlm.edu", role: "INSTRUCTOR" },
        ]);
      }

      if (courseList.status === "fulfilled" && Array.isArray(courseList.value)) {
        setCourses(courseList.value);
      }

      // Generate learners directory from enrollments and default cohort
      const dynamicLearners = [
        { id: 101, fullName: "Prakhar Sharma", email: "prakhar@dlm.edu", role: "LEARNER" },
        { id: 102, fullName: "Sophia Martinez", email: "sophia@dlm.edu", role: "LEARNER" },
        { id: 103, fullName: "Ethan Reynolds", email: "ethan@dlm.edu", role: "LEARNER" },
        { id: 104, fullName: "Liam Chen", email: "liam@dlm.edu", role: "LEARNER" },
        { id: 105, fullName: "Ava Patel", email: "ava@dlm.edu", role: "LEARNER" },
      ];

      enrolled.forEach((e) => {
        if (!dynamicLearners.some((l) => l.email === e.learnerEmail)) {
          dynamicLearners.push({
            id: e.id || Date.now(),
            fullName: e.learnerName || "Student",
            email: e.learnerEmail || "student@dlm.edu",
            role: "LEARNER",
          });
        }
      });

      setLearners(dynamicLearners);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (userId) => {
    const key = String(userId);
    const current = userStatusMap[key] !== "DEACTIVE"; // default true
    const updated = {
      ...userStatusMap,
      [key]: current ? "DEACTIVE" : "ACTIVE",
    };
    setUserStatusMap(updated);
    localStorage.setItem(USER_STATUS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const isUserActive = (userId) => {
    return userStatusMap[String(userId)] !== "DEACTIVE";
  };

  const getInstructorCourseCount = (instructorName) => {
    return courses.filter((c) => (c.instructorName || "").toLowerCase() === (instructorName || "").toLowerCase()).length;
  };

  const getInstructorEnrollmentCount = (instructorName) => {
    return enrollments.filter((e) => (e.instructorName || "").toLowerCase() === (instructorName || "").toLowerCase()).length;
  };

  const activeList = activeTab === "INSTRUCTORS" ? instructors : learners;
  const filtered = activeList.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-10 max-w-7xl mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              User Directory & Status Administration
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Toggle Active/Deactive account statuses and monitor faculty curriculum authoring telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-xs"
              />
            </div>
            {activeTab === "INSTRUCTORS" && (
              <button
                onClick={() => navigate("/admin/create-instructor")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <UserPlus size={14} /> Provision Faculty
              </button>
            )}
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("INSTRUCTORS")}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "INSTRUCTORS"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Shield size={14} /> Instructors ({instructors.length})
          </button>
          <button
            onClick={() => setActiveTab("LEARNERS")}
            className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "LEARNERS"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <GraduationCap size={14} /> Registered Learners ({learners.length})
          </button>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-16 text-center">
              <div className="h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500">
              No users found matching your search query.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-12 px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <div className="col-span-4">User Details</div>
                <div className="col-span-3">Email</div>
                {activeTab === "INSTRUCTORS" ? (
                  <div className="col-span-3 text-center">Courses / Enrollments</div>
                ) : (
                  <div className="col-span-3">Role</div>
                )}
                <div className="col-span-2 text-right">Status Toggle</div>
              </div>

              {filtered.map((user) => {
                const active = isUserActive(user.id);
                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-12 px-6 py-4 items-center text-xs transition-colors ${
                      !active ? "bg-rose-50/30 opacity-75" : "hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="col-span-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        activeTab === "INSTRUCTORS" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}>
                        {user.fullName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.fullName}</p>
                        <span className="text-[10px] text-slate-400 font-mono">ID #{user.id}</span>
                      </div>
                    </div>

                    <div className="col-span-3 text-slate-500 font-mono text-[11px] truncate">
                      {user.email}
                    </div>

                    {activeTab === "INSTRUCTORS" ? (
                      <div className="col-span-3 text-center text-[11px] text-slate-600 font-semibold">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800">
                          {getInstructorCourseCount(user.fullName)} Courses
                        </span>
                        <span className="ml-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                          {getInstructorEnrollmentCount(user.fullName)} Students
                        </span>
                      </div>
                    ) : (
                      <div className="col-span-3">
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
                          LEARNER
                        </span>
                      </div>
                    )}

                    <div className="col-span-2 text-right flex items-center justify-end gap-2">
                      <span className={`text-[11px] font-bold ${active ? "text-emerald-700" : "text-rose-600"}`}>
                        {active ? "Active" : "Deactive"}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className="cursor-pointer transition-transform hover:scale-105"
                        title={`Click to set ${active ? "Deactive" : "Active"}`}
                      >
                        {active ? (
                          <ToggleRight size={26} className="text-emerald-600 fill-emerald-600" />
                        ) : (
                          <ToggleLeft size={26} className="text-rose-400" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminInstructors;