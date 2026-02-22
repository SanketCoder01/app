import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { History, Trash2, Eye, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HistoryPage({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API}/history`, {
        credentials: 'include',
      });
      const data = await response.json();
      setAnalyses(data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (analysisId) => {
    try {
      const response = await fetch(`${API}/history/${analysisId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Delete failed');

      toast.success('Analysis deleted');
      setAnalyses(analyses.filter((a) => a.analysis_id !== analysisId));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete analysis');
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <History className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground" data-testid="history-title">
                Analysis History
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">View and manage your previous career analyses</p>
          </div>

          {analyses.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center" data-testid="empty-history-message">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No analyses yet</h3>
              <p className="text-muted-foreground mb-6">Start by analyzing your resume on the dashboard</p>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
              >
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis, idx) => (
                <motion.div
                  key={analysis.analysis_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="glass-card rounded-3xl p-6 hover:border-white/20 transition-all"
                  data-testid={`history-item-${idx}`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {new Date(analysis.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-primary">{analysis.result?.matchScore}%</div>
                        <div>
                          <p className="text-sm text-muted-foreground">Match Score</p>
                          <p className="text-xs text-muted-foreground">
                            ATS: {analysis.result?.ATSScore}% | Level: {analysis.result?.jobLevelFit}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/results/${analysis.analysis_id}`)}
                        variant="outline"
                        className="border-white/10 hover:bg-white/5"
                        data-testid={`view-btn-${idx}`}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDelete(analysis.analysis_id)}
                        variant="outline"
                        className="border-white/10 hover:bg-destructive/20 hover:text-destructive"
                        data-testid={`delete-btn-${idx}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
