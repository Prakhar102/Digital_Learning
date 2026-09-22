import {Routes,Route,Navigate,} from "react-router-dom";
import CreateCourse from "../pages/instructor/CreateCourse";
import LandingPage from "../pages/LandingPage/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import MyLearning from "../pages/dashboard/MyLearning";
import Dashboard from "../pages/dashboard/Dashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CreateInstructor from "../pages/admin/CreateInstructor";
import InstructorDashboard from "../pages/instructor/InstructorDashboard";
import MyCourses from "../pages/instructor/MyCourses";
import CreateAssignments from "../pages/instructor/CreateAssignment";
import MyAssignments from "../pages/instructor/MyAssignments";

import AdminInstructors from "../pages/admin/AdminInstructors";
 
import AdminCourses from "../pages/admin/AdminCourses";
 
import AdminAnalytics from "../pages/admin/AdminAnalytics";

import AdminSettings from "../pages/admin/AdminSettings";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      {/* Authentication */}

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      {/* Protected Dashboard */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
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
        path="/admin/instructors"
        element={<AdminInstructors />}
      />

      <Route
        path="/admin/courses"
        element={<AdminCourses />}
      />

      <Route
        path="/admin/analytics"
        element={<AdminAnalytics />}
      />

      <Route
        path="/admin/settings"
        element={<AdminSettings />}
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


      {/* Invalid Routes */}

      <Route
        path="*"
        element={<Navigate to="/" />}
      />
    </Routes>
  );
}

export default AppRoutes;