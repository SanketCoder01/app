import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Download, Loader2, Target, TrendingUp, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ResultsPage({ user }) {
  const { analysisId } = useParams();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [analysisId]);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`${API}/history`, {
        credentials: 'include',
      });
      const analyses = await response.json();
      const currentAnalysis = analyses.find((a) => a.analysis_id === analysisId);
      setAnalysis(currentAnalysis);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${API}/export/pdf/${analysisId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career_analysis_${analysisId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analysis) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Analysis not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const result = analysis.result;

  return (
    <DashboardLayout user={user}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-2 text-foreground" data-testid="results-title">
                Career Analysis Results
              </h1>
              <p className="text-muted-foreground" data-testid="results-date">
                {new Date(analysis.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
              data-testid="download-pdf-btn"
            >
              {downloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card rounded-3xl p-6" data-testid="match-score-card">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Match Score</h3>
              </div>
              <div className="text-5xl font-bold text-primary mb-2" data-testid="match-score-value">
                {result.matchScore}%
              </div>
              <Progress value={result.matchScore} className="h-2" />
            </div>

            <div className="glass-card rounded-3xl p-6" data-testid="ats-score-card">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">ATS Score</h3>
              </div>
              <div className="text-5xl font-bold text-accent mb-2" data-testid="ats-score-value">
                {result.ATSScore}%
              </div>
              <Progress value={result.ATSScore} className="h-2" />
            </div>

            <div className="glass-card rounded-3xl p-6" data-testid="job-level-card">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-foreground">Job Level Fit</h3>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-2" data-testid="job-level-value">
                {result.jobLevelFit}
              </div>
              <p className="text-sm text-muted-foreground">Career Position</p>
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card rounded-3xl p-6" data-testid="matched-skills-card">
              <h3 className="text-xl font-semibold text-foreground mb-4">Matched Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm"
                    data-testid={`matched-skill-${idx}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6" data-testid="missing-skills-card">
              <h3 className="text-xl font-semibold text-foreground mb-4">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm"
                    data-testid={`missing-skill-${idx}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Assessment */}
          <div className="glass-card rounded-3xl p-8 mb-8" data-testid="profile-assessment-card">
            <h3 className="text-2xl font-semibold text-foreground mb-6">Profile Assessment</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-primary mb-2">Strengths</h4>
                <p className="text-muted-foreground leading-relaxed" data-testid="strengths-summary">
                  {result.strengthsSummary}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-medium text-accent mb-2">Areas for Improvement</h4>
                <p className="text-muted-foreground leading-relaxed" data-testid="weaknesses-summary">
                  {result.weaknessesSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Career Insights */}
          <div className="glass-card rounded-3xl p-8 mb-8" data-testid="career-insights-card">
            <h3 className="text-2xl font-semibold text-foreground mb-6">Career Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-2 text-foreground">Salary Range</h4>
                <p className="text-muted-foreground" data-testid="salary-insight">
                  {result.salaryInsight}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-2 text-foreground">Career Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {result.careerFieldSuggestions?.map((field, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card rounded-3xl p-6" data-testid="certifications-card">
              <h3 className="text-xl font-semibold text-foreground mb-4">Recommended Certifications</h3>
              <ul className="space-y-2">
                {result.certificationRecommendations?.map((cert, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-3xl p-6" data-testid="projects-card">
              <h3 className="text-xl font-semibold text-foreground mb-4">Suggested Projects</h3>
              <ul className="space-y-2">
                {result.suggestedProjects?.map((project, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{project}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 30-Day Roadmap */}
          <div className="glass-card rounded-3xl p-8" data-testid="roadmap-card">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-semibold text-foreground">30-Day Career Roadmap</h3>
            </div>
            <div className="space-y-6">
              {result['30DayRoadmap']?.map((week, idx) => (
                <div key={idx} className="border-l-2 border-primary pl-6">
                  <h4 className="text-lg font-medium text-foreground mb-3" data-testid={`week-${week.week}-title`}>
                    Week {week.week}
                  </h4>
                  <ul className="space-y-2">
                    {week.tasks?.map((task, taskIdx) => (
                      <li key={taskIdx} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
