import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import '@/App.css';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ATSScorePage from './pages/ATSScorePage';
import ResumeOptimizerPage from './pages/ResumeOptimizerPage';
import ProfileCompletion from './pages/ProfileCompletion';
import { Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function AuthCallback() {
  // Removed - not needed with Supabase
  return null;
}

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes('session_id=')) {
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch(`${API}/auth/me`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Not authenticated');
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{typeof children === 'function' ? children(user) : children}</>;
}

function ProfileCheckRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    if (window.location.hash?.includes('session_id=')) {
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch(`${API}/auth/me`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Not authenticated');
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if profile is completed
  if (user && !user.profile_completed) {
    return <ProfileCompletion user={user} />;
  }

  // Profile completed, show dashboard
  return <>{typeof children === 'function' ? children(user) : children}</>;
}

function AppRouter() {
  const location = useLocation();

  // Check URL fragment (not query params) for session_id
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<EmailVerification />} />
      <Route
        path="/dashboard"
        element={
          <ProfileCheckRoute>
            {(user) => <Dashboard user={user} />}
          </ProfileCheckRoute>
        }
      />
      <Route
        path="/results/:analysisId"
        element={
          <ProtectedRoute>
            {(user) => <ResultsPage user={user} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            {(user) => <HistoryPage user={user} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            {(user) => <SettingsPage user={user} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/ats-score"
        element={
          <ProtectedRoute>
            {(user) => <ATSScorePage user={user} />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume-optimizer"
        element={
          <ProtectedRoute>
            {(user) => <ResumeOptimizerPage user={user} />}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" richColors />
    </div>
  );
}

export default App;