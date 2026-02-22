import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Upload, Target, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Progress } from '@/components/ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TARGET_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Machine Learning Engineer',
  'Data Scientist',
  'Automation Engineer',
  'DevOps Engineer',
  'UI/UX Developer',
  'Cybersecurity',
  'Other',
];

export default function ATSScorePage({ user }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }

    setResumeFile(file);
    toast.success('Resume uploaded successfully');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API}/analyze/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to extract text');

      const data = await response.json();
      setResumeText(data.resume_text);
      toast.success('Resume text extracted successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to extract text from resume');
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText) {
      toast.error('Please upload a resume first');
      return;
    }

    if (!targetRole) {
      toast.error('Please select a target role');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 800);

    try {
      const response = await fetch(`${API}/analyze/ats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          resume_text: resumeText,
          target_role: targetRole,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
      toast.success('ATS analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      clearInterval(progressInterval);
      setProgress(0);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground" data-testid="ats-score-title">
                ATS Score Analyzer
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Check how well your resume passes Applicant Tracking Systems</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              {/* Resume Upload */}
              <div className="glass-card rounded-3xl p-6" data-testid="ats-resume-upload-card">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Upload Resume</h2>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="ats-resume-file-input"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 transition-all hover:bg-white/5"
                  data-testid="ats-resume-upload-dropzone"
                >
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  {resumeFile ? (
                    <div>
                      <p className="text-foreground font-medium">{resumeFile.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-foreground font-medium">Upload Resume</p>
                      <p className="text-sm text-muted-foreground mt-1">PDF only</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Role */}
              <div className="glass-card rounded-3xl p-6" data-testid="target-role-card">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Target Role</h2>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger
                    className="bg-white/5 border-white/10 text-white"
                    data-testid="target-role-select"
                  >
                    <SelectValue placeholder="Select target role" />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Analyze Button */}
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText || !targetRole}
                size="lg"
                className="w-full h-14 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                data-testid="ats-analyze-button"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-5 w-5" />
                    Run ATS Analysis
                  </>
                )}
              </Button>

              {/* Progress */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-2xl p-4"
                  data-testid="ats-analysis-progress-card"
                >
                  <p className="text-sm text-center text-muted-foreground mb-2">Analyzing your resume...</p>
                  <Progress value={progress} className="h-2" data-testid="ats-analysis-progress-bar" />
                </motion.div>
              )}
            </div>

            {/* Results Section */}
            <div>
              {result ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* ATS Score */}
                  <div className="glass-card rounded-3xl p-8 text-center" data-testid="ats-score-result-card">
                    <h3 className="text-2xl font-semibold text-foreground mb-4">ATS Score</h3>
                    <div className="text-6xl font-bold text-primary mb-2" data-testid="ats-score-value">
                      {result.ats_score}%
                    </div>
                    <Progress value={result.ats_score} className="h-3 mb-4" />
                    <p className="text-muted-foreground" data-testid="ats-summary-feedback">
                      {result.summary_feedback}
                    </p>
                  </div>

                  {/* Matching Skills */}
                  <div className="glass-card rounded-3xl p-6" data-testid="ats-matching-skills-card">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Matching Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matching_skills?.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="glass-card rounded-3xl p-6" data-testid="ats-missing-skills-card">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_skills?.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Improvement Tips */}
                  <div className="glass-card rounded-3xl p-6" data-testid="ats-improvement-tips-card">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Improvement Tips</h3>
                    <ul className="space-y-2">
                      {result.improvement_tips?.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <div className="glass-card rounded-3xl p-12 text-center h-full flex items-center justify-center">
                  <div>
                    <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Upload a resume and select a role to see your ATS score</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
