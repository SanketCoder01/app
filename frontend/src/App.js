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
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    checkAuth();
    
    // Setup inactivity detection
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      localStorage.setItem('last_activity', Date.now().toString());
    };

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    // Check for inactivity every minute
    const inactivityCheck = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem('last_activity') || Date.now().toString());
      const now = Date.now();
      
      if (now - lastActivity > INACTIVITY_TIMEOUT) {
        // Auto logout
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('supabase_refresh_token');
        localStorage.removeItem('last_activity');
        window.location.href = '/';
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(inactivityCheck);
    };
  }, [location.pathname]);

  const checkAuth = async () => {
    const token = localStorage.getItem('supabase_token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const response = await fetch(`${API}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Not authenticated');
      
      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      
      // Update last activity
      localStorage.setItem('last_activity', Date.now().toString());
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('supabase_token');
      localStorage.removeItem('supabase_refresh_token');
      setIsAuthenticated(false);
    }
  };

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
    return <Navigate to="/login" replace />;
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