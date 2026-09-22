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
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import CreateCourse from "../pages/instructor/CreateCourse";
import MyCourses from "../pages/instructor/MyCourses";
import ManageCourseContent from "../pages/instructor/ManageCourseContent";
import CreateAssessment from "../pages/instructor/CreateAssessment";
import CreateAssignments from "../pages/instructor/CreateAssignment";
import MyAssignments from "../pages/instructor/MyAssignments";
import InstructorSubmissions from "../pages/instructor/InstructorSubmissions";
import InstructorAnalytics from "../pages/instructor/InstructorAnalytics";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public / Auth Routes ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Learner Portal Routes ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CourseCatalog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/learn/:courseId"
        element={
          <ProtectedRoute>
            <CourseLearning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-learning"
        element={
          <ProtectedRoute>
            <MyLearning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-assessments"
        element={
          <ProtectedRoute>
            <MyAssessments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessments/:assessmentId/take"
        element={
          <ProtectedRoute>
            <TakeAssessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessments/:assessmentId/result"
        element={
          <ProtectedRoute>
            <AssessmentResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard/:assessmentId"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments/:assignmentId/submit"
        element={
          <ProtectedRoute>
            <SubmitAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-submissions"
        element={
          <ProtectedRoute>
            <MySubmissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-mentor"
        element={
          <ProtectedRoute>
            <AIMentor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent-studio"
        element={
          <ProtectedRoute>
            <AgentStudio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/socratic-debate"
        element={
          <ProtectedRoute>
            <SocraticDebate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/knowledge-hub"
        element={
          <ProtectedRoute>
            <KnowledgeHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/flashcards"
        element={
          <ProtectedRoute>
            <Flashcards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mcp-explorer"
        element={
          <ProtectedRoute>
            <MCPExplorer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent-observability"
        element={
          <ProtectedRoute>
            <AgentObservability />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute>
            <MyCertificates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates/:certificateId"
        element={
          <ProtectedRoute>
            <CertificateView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <LearnerProfile />
          </ProtectedRoute>
        }
      />

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
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/create-course"
        element={
          <ProtectedRoute>
            <CreateCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/my-courses"
        element={
          <ProtectedRoute>
            <MyCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/content"
        element={
          <ProtectedRoute>
            <ManageCourseContent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/courses/:courseId/assessment"
        element={
          <ProtectedRoute>
            <CreateAssessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/assignments"
        element={
          <ProtectedRoute>
            <CreateAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/my-assignments"
        element={
          <ProtectedRoute>
            <MyAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/submissions"
        element={
          <ProtectedRoute>
            <InstructorSubmissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instructor/analytics"
        element={
          <ProtectedRoute>
            <InstructorAnalytics />
          </ProtectedRoute>
        }
      />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes;