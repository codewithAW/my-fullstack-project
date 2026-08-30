import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import ChangePassword from './pages/ChangePassword';
import ReportIssue from './pages/ReportIssue';
import PublicFeed from './pages/PublicFeed';
import SharedLayout from './components/SharedLayout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" state={location.state} />;
  }

  return children;
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ComplaintProvider>
          <Router>
            <div className="app">
              <Routes>
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/verify-email" 
                  element={
                    <PublicRoute>
                      <VerifyEmail />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/" 
                  element={<Landing />} 
                />
                <Route 
                  path="/complaints" 
                  element={
                    <SharedLayout>
                      <PublicFeed />
                    </SharedLayout>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <SharedLayout>
                        <Dashboard />
                      </SharedLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/report" 
                  element={
                    <ProtectedRoute>
                      <SharedLayout>
                        <ReportIssue />
                      </SharedLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <SharedLayout>
                        <AdminDashboard />
                      </SharedLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/change-password" 
                  element={
                    <ProtectedRoute>
                      <ChangePassword />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </Router>
        </ComplaintProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
