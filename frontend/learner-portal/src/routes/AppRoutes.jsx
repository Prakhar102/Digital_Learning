import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// Learner pages
import Dashboard from "../pages/dashboard/Dashboard";
import MyLearning from "../pages/dashboard/MyLearning";
import CourseCatalog from "../pages/catalog/CourseCatalog";
import CourseDetail from "../pages/catalog/CourseDetail";
import CourseLearning from "../pages/learning/CourseLearning";
import AIMentor from "../pages/ai/AIMentor";
import AgentStudio from "../pages/ai/AgentStudio";
import SocraticDebate from "../pages/ai/SocraticDebate";
import KnowledgeHub from "../pages/knowledge/KnowledgeHub";
import Flashcards from "../pages/knowledge/Flashcards";
import MCPExplorer from "../pages/mcp/MCPExplorer";
import AgentObservability from "../pages/observability/AgentObservability";
import MyCertificates from "../pages/certificates/MyCertificates";
import CertificateView from "../pages/certificates/CertificateView";
import Notifications from "../pages/notifications/Notifications";
import LearnerProfile from "../pages/profile/LearnerProfile";
import TakeAssessment from "../pages/assessments/TakeAssessment";
import AssessmentResult from "../pages/assessments/AssessmentResult";
import MyAssessments from "../pages/assessments/MyAssessments";
import Leaderboard from "../pages/assessments/Leaderboard";
import SubmitAssignment from "../pages/assignments/SubmitAssignment";
import MySubmissions from "../pages/assignments/MySubmissions";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import CreateInstructor from "../pages/admin/CreateInstructor";
import AdminInstructors from "../pages/admin/AdminInstructors";
import AdminCourses from "../pages/admin/AdminCourses";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminSettings from "../pages/admin/AdminSettings";

// Instructor pages
import InstructorLayout from "../components/instructor/InstructorLayout";
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import CreateCourse from "../pages/instructor/CreateCourse";
import MyCourses from "../pages/instructor/MyCourses";
import ManageCourseContent from "../pages/instructor/ManageCourseContent";
import CreateAssessment from "../pages/instructor/CreateAssessment";
import InstructorAssessments from "../pages/instructor/InstructorAssessments";
import CreateAssignments from "../pages/instructor/CreateAssignment";
import MyAssignments from "../pages/instructor/MyAssignments";
import InstructorSubmissions from "../pages/instructor/InstructorSubmissions";
import InstructorAnalytics from "../pages/instructor/InstructorAnalytics";

import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../components/dashboard/DashboardLayout";

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public / Auth Routes ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Learner Portal Routes (Persistent Sidebar & Seamless Layout) ── */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<CourseCatalog />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/learn/:courseId" element={<CourseLearning />} />
        <Route path="/my-learning" element={<MyLearning />} />
        <Route path="/my-assessments" element={<MyAssessments />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/leaderboard/:assessmentId" element={<Leaderboard />} />
        <Route path="/take-assessment/:assessmentId" element={<TakeAssessment />} />
        <Route path="/assessments/:assessmentId/take" element={<TakeAssessment />} />
        <Route path="/assessments/:assessmentId/result" element={<AssessmentResult />} />
        <Route path="/assessments/:assessmentId/leaderboard" element={<Leaderboard />} />
        <Route path="/assignments/:assignmentId/submit" element={<SubmitAssignment />} />
        <Route path="/assignments" element={<MySubmissions />} />
        <Route path="/my-submissions" element={<MySubmissions />} />
        <Route path="/ai-mentor" element={<AIMentor />} />
        <Route path="/agent-studio" element={<AgentStudio />} />
        <Route path="/socratic-debate" element={<SocraticDebate />} />
        <Route path="/knowledge-hub" element={<KnowledgeHub />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/mcp-explorer" element={<MCPExplorer />} />
        <Route path="/agent-observability" element={<AgentObservability />} />
        <Route path="/certificates" element={<MyCertificates />} />
        <Route path="/certificates/:certificateId" element={<CertificateView />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<LearnerProfile />} />
      </Route>

      {/* ── Admin Portal Routes ── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/create-instructor"
        element={
          <ProtectedRoute>
            <CreateInstructor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/instructors"
        element={
          <ProtectedRoute>
            <AdminInstructors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute>
            <AdminCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      {/* ── Instructor Portal Routes ── */}
      <Route
        path="/instructor"
        element={
          <ProtectedRoute>
            <InstructorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InstructorDashboard />} />
        <Route path="create-course" element={<CreateCourse />} />
        <Route path="my-courses" element={<MyCourses />} />
        <Route path="courses/:courseId/content" element={<ManageCourseContent />} />
        <Route path="course/:courseId/manage" element={<ManageCourseContent />} />
        <Route path="courses/:courseId/assessment" element={<CreateAssessment />} />
        <Route path="create-assessment" element={<CreateAssessment />} />
        <Route path="assessments" element={<InstructorAssessments />} />
        <Route path="my-assessments" element={<InstructorAssessments />} />
        <Route path="assignments" element={<CreateAssignments />} />
        <Route path="my-assignments" element={<MyAssignments />} />
        <Route path="submissions" element={<InstructorSubmissions />} />
        <Route path="analytics" element={<InstructorAnalytics />} />
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;