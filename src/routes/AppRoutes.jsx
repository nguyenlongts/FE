// src/routes/AppRoutes.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context
import { AuthProvider } from "../context/AuthContext";
import PublicRoute from "../components/PublicRoute";
// Components
import ProtectedRoute from "../components/ProtectedRoute";

// Pages
import HomePage from "../pages/Home";
import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register";
import DashboardPage from "../pages/Dashboard";
import CreateMeetingPage from "../pages/CreateMeeting";
import MeetingPage from "../pages/Meeting";
import HistoryPage from "../pages/History";
import NotFoundPage from "../pages/NotFound";
import MeetingRoom from "../pages/Meeting";
function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-meeting"
            element={
              <ProtectedRoute>
                <CreateMeetingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Meeting Routes (Public - for guests) */}
          <Route path="/meeting/:roomName" element={<MeetingRoom />} />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;
