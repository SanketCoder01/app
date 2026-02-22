import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Target,
  FileEdit,
  Hexagon,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DashboardLayout({ children, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard' },
    { path: '/ats-score', icon: <Target />, label: 'ATS Score' },
    { path: '/resume-optimizer', icon: <FileEdit />, label: 'Resume Optimizer' },
    { path: '/history', icon: <History />, label: 'History' },
    { path: '/settings', icon: <Settings />, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-card border-r border-white/10 p-6">
        <div className="flex items-center gap-3 mb-8">
          <Hexagon className="w-8 h-8 text-primary" data-testid="sidebar-logo" />
          <span className="font-heading font-bold text-xl">SkillMirror</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 5 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`}
                  data-testid={`sidebar-${item.label.toLowerCase().replace(' ', '-')}-link`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 pt-6 mt-6">
          {/* SK_ID Display */}
          {user?.skill_mirror_id && (
            <div className="mb-4 glass-card p-3 rounded-xl border border-primary/30" data-testid="skill-mirror-id-display">
              <div className="text-xs text-muted-foreground mb-1">Your Unique ID</div>
              <div className="text-lg font-bold text-primary font-mono" data-testid="skill-mirror-id-value">
                {user.skill_mirror_id}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-4" data-testid="user-profile-section">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-10 h-10 rounded-full"
                data-testid="user-avatar"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate" data-testid="user-name">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-muted-foreground truncate" data-testid="user-email">
                {user?.email || ''}
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 border-white/10 hover:bg-white/5"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          className="fixed inset-0 z-50 md:hidden"
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full glass-card p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Hexagon className="w-8 h-8 text-primary" />
                <span className="font-heading font-bold text-xl">SkillMirror</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/10 pt-6 mt-6">
              <div className="flex items-center gap-3 mb-4">
                {user?.picture ? (
                  <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.email || ''}</div>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full justify-start gap-3 border-white/10 hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </aside>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden glass-card border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <Hexagon className="w-8 h-8 text-primary" />
              <span className="font-heading font-bold text-xl">SkillMirror</span>
            </div>
            <div className="w-6" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8">{children}</div>

        {/* Footer */}
        <footer className="glass-card border-t border-white/10 p-6" data-testid="dashboard-footer">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">© 2025 SkillMirror AI. All rights reserved.</div>
            <div className="flex gap-6">
              <a
                href="https://www.linkedin.com/in/sanket-gaikwad-50134a314/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="footer-linkedin-icon"
              >
                LinkedIn
              </a>
              <a
                href="https://instagram.com/mr.sanketgofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="footer-instagram-icon"
              >
                Instagram
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
