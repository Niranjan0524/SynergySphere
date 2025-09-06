// src/routes/Routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import SignUp from '../components/SignUp_New';
import ForgotPassword from '../components/ForgotPassword_New';
import Dashboard from '../components/Dashboard';
import TaskPage from '../components/TaskPage';
import ProjectPage from '../components/ProjectPage';

// Protected Route Component
export const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already authenticated)
export const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/dashboard" replace />;
};

// Main Routes Component
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={<Login />} 
      />
      <Route 
        path="/signup" 
        element={<SignUp />} 
      />
      <Route 
        path="/forgot-password" 
        element={<ForgotPassword />} 
      />

      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <TaskPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <ProjectPage />
          </ProtectedRoute>
        } 
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
