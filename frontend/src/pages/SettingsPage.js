import { motion } from 'framer-motion';
import { useState } from 'react';
import { Settings, Moon, Sun, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function SettingsPage({ user }) {
  const [darkMode, setDarkMode] = useState(true);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(darkMode ? 'Light mode enabled' : 'Dark mode enabled');
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all your analysis history?')) return;

    try {
      const response = await fetch(`${API}/history`, {
        credentials: 'include',
      });
      const analyses = await response.json();

      await Promise.all(
        analyses.map((a) =>
          fetch(`${API}/history/${a.analysis_id}`, {
            method: 'DELETE',
            credentials: 'include',
          })
        )
      );

      toast.success('History cleared successfully');
    } catch (error) {
      console.error('Clear history error:', error);
      toast.error('Failed to clear history');
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground" data-testid="settings-title">
                Settings
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Manage your account preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="glass-card rounded-3xl p-8" data-testid="profile-settings-card">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-heading font-semibold text-foreground">Profile</h2>
              </div>

              <div className="space-y-4">
                {/* Unique SK_ID */}
                {user?.skill_mirror_id && (
                  <div className="glass-card p-4 rounded-xl border border-primary/30 bg-primary/5">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Your Unique ID</label>
                    <div className="text-2xl font-bold text-primary font-mono" data-testid="settings-skill-mirror-id">
                      {user.skill_mirror_id}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                  <Input
                    value={user?.name || ''}
                    readOnly
                    className="bg-white/5 border-white/10 text-white"
                    data-testid="profile-name-input"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <Input
                    value={user?.email || ''}
                    readOnly
                    className="bg-white/5 border-white/10 text-white"
                    data-testid="profile-email-input"
                  />
                </div>
                {user?.university && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">University</label>
                    <Input
                      value={user.university}
                      readOnly
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                )}
                {user?.course && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Course</label>
                    <Input
                      value={user.course}
                      readOnly
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                )}
                {user?.country && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Country</label>
                    <Input
                      value={user.country}
                      readOnly
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Appearance */}
            <div className="glass-card rounded-3xl p-8" data-testid="appearance-settings-card">
              <div className="flex items-center gap-3 mb-6">
                {darkMode ? <Moon className="w-6 h-6 text-primary" /> : <Sun className="w-6 h-6 text-primary" />}
                <h2 className="text-2xl font-heading font-semibold text-foreground">Appearance</h2>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={handleToggleDarkMode} data-testid="dark-mode-switch" />
              </div>
            </div>

            {/* Data Management */}
            <div className="glass-card rounded-3xl p-8" data-testid="data-management-card">
              <div className="flex items-center gap-3 mb-6">
                <Trash2 className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-heading font-semibold text-foreground">Data Management</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Clear History</p>
                    <p className="text-sm text-muted-foreground">Delete all your analysis history</p>
                  </div>
                  <Button
                    onClick={handleClearHistory}
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/20"
                    data-testid="clear-history-btn"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
