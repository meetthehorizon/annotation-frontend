import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./authContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import AnnotatorDashboard from "./pages/AnnotatorDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AddProject from "./pages/admin/AddProject";
import AddChapter from "./pages/admin/AddChapter";
import AddSentences from "./pages/admin/AddSentences";
import AddSegments from "./pages/admin/AddSegments";
import AddUSRs from "./pages/admin/AddUSRs";
import ProjectsPage from "./pages/admin/ProjectsPage";
import ChapterDetailsPage from "./pages/admin/ChapterDetailsPage";
import ChaptersPage from "./pages/admin/ChaptersPage";
import UsersPage from "./pages/admin/UsersPage";
import AssignmentsPage from "./pages/admin/AssignmentsPage";
import RegisterPage from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/annotator"
            element={
              <ProtectedRoute allowedRoles={["annotator"]}>
                <AnnotatorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviewer"
            element={
              <ProtectedRoute allowedRoles={["reviewer"]}>
                <ReviewerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddProject />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects/:projectId/chapters"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ChaptersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects/:projectId/chapters/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddChapter />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects/:projectId/chapters/:chapterId"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ChapterDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-sentences"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddSentences />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-segments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddSegments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-usrs"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddUSRs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/projects/:projectId/chapters/:chapterId/sentences/new"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddSentences />
              </ProtectedRoute>
            }
          />

          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/assignments" element={<AssignmentsPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
