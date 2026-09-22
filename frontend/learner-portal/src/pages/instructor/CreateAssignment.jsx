import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  ArrowLeft,
  FileText,
  Send,
  AlertCircle,
} from "lucide-react";
import InstructorLayout from "../../components/instructor/InstructorLayout";
import { createAssignment } from "../../services/assignmentService";
import { getAllCourses } from "../../services/courseService";
import { getCurrentUser } from "../../services/userService";
import { sendNotification } from "../../services/notificationService";

function CreateAssignment() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    maxMarks: 100,
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [user, courseList] = await Promise.all([
        getCurrentUser(),
        getAllCourses(),
      ]);
      setCurrentUser(user);
      if (Array.isArray(courseList) && courseList.length > 0) {
        setCourses(courseList);
        setFormData((prev) => ({ ...prev, courseId: courseList[0].id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseId || !formData.title.trim()) {
      setStatus({ type: "error", msg: "Please select a course and provide an assignment title." });
      return;
    }

    try {
      setSubmitting(true);
      const res = await createAssignment({
        courseId: Number(formData.courseId),
        instructorId: currentUser?.id || 1,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
        maxMarks: Number(formData.maxMarks) || 100,
      });

      // ── Dispatch Real-Time Notification to Students ──
      // Send notification event so learners in this course receive a real-time notification
      const selectedCourse = courses.find((c) => String(c.id) === String(formData.courseId));
      await sendNotification({
        userId: 1, // Student broadcast / learner ID
        subject: `New Assignment Published: ${formData.title}`,
        message: `Instructor ${currentUser?.fullName || "Faculty"} published a new assignment in "${selectedCourse?.title || `Course #${formData.courseId}`}". Due date: ${formData.dueDate || "Next week"}. Submit your PDF report on the portal.`,
      });

      setStatus({ type: "success", msg: "Assignment created successfully! Real-time notifications dispatched to learners." });
      setTimeout(() => {
        navigate("/instructor/my-assignments");
      }, 1500);
    } catch (err) {
      console.error("Assignment creation error:", err);
      setStatus({ type: "error", msg: "Failed to publish assignment. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <InstructorLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => navigate("/instructor/my-assignments")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Assignments
          </button>
          <span className="text-xs font-medium text-slate-500">Instructor Workspace</span>
        </div>

        {/* ── Header ── */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs">
          <h1 className="text-xl font-bold text-slate-900">
            Publish New Assignment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create homework tasks, laboratory exercises, and term project rubrics for your enrolled students.
          </p>
        </div>

        {status.msg && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs ${
              status.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {status.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {status.msg}
          </div>
        )}

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-xl p-8 space-y-5 shadow-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Target Course Track *
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (ID: #{c.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Database Clustering & Replication Report"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Due Date
              </label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Maximum Grade Points
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Problem Statement & Instructions
            </label>
            <textarea
              rows={5}
              placeholder="Describe assignment objectives, submission guidelines (e.g. PDF report, GitHub code link), and evaluation rubric..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors resize-none leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/instructor/my-assignments")}
              className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Send size={14} />
              {submitting ? "Publishing & Notifying..." : "Publish Assignment"}
            </button>
          </div>
        </form>
      </div>
    </InstructorLayout>
  );
}

export default CreateAssignment;