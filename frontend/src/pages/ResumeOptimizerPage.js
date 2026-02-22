import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Upload, FileEdit, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Progress } from '@/components/ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ResumeOptimizerPage({ user }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
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

      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`${API}/analyze/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
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

  const handleOptimize = async () => {
    if (!resumeText) {
      toast.error('Please upload a resume first');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsOptimizing(true);
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
      const token = localStorage.getItem('supabase_token');
      const response = await fetch(`${API}/analyze/optimize`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) throw new Error('Optimization failed');

      const data = await response.json();
      setResult(data);
      toast.success('Resume optimization complete!');
    } catch (error) {
      console.error('Optimization error:', error);
      clearInterval(progressInterval);
      setProgress(0);
      toast.error('Optimization failed. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <FileEdit className="w-8 h-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground" data-testid="resume-optimizer-title">
                Resume Optimizer
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Get AI-powered suggestions to improve your resume</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              {/* Resume Upload */}
              <div className="glass-card rounded-3xl p-6" data-testid="optimizer-resume-upload-card">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Upload Resume</h2>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="optimizer-resume-file-input"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 transition-all hover:bg-white/5"
                  data-testid="optimizer-resume-upload-dropzone"
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

              {/* Job Description */}
              <div className="glass-card rounded-3xl p-6" data-testid="optimizer-job-description-card">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Job Description</h2>
                <Textarea
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-500 text-white resize-none"
                  data-testid="optimizer-job-description-textarea"
                />
              </div>

              {/* Optimize Button */}
              <Button
                onClick={handleOptimize}
                disabled={isOptimizing || !resumeText || !jobDescription}
                size="lg"
                className="w-full h-14 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                data-testid="optimize-resume-button"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Optimize Resume
                  </>
                )}
              </Button>

              {/* Progress */}
              {isOptimizing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-2xl p-4"
                  data-testid="optimizer-progress-card"
                >
                  <p className="text-sm text-center text-muted-foreground mb-2">Optimizing your resume...</p>
                  <Progress value={progress} className="h-2" data-testid="optimizer-progress-bar" />
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
                  {/* Optimization Score */}
                  <div className="glass-card rounded-3xl p-8 text-center" data-testid="optimization-score-card">
                    <h3 className="text-2xl font-semibold text-foreground mb-4">Optimization Score</h3>
                    <div className="text-6xl font-bold text-primary mb-2" data-testid="optimization-score-value">
                      {result.optimization_score}%
                    </div>
                    <Progress value={result.optimization_score} className="h-3" />
                  </div>

                  {/* Optimized Summary */}
                  <div className="glass-card rounded-3xl p-6" data-testid="optimized-summary-card">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Optimized Summary</h3>
                    <p className="text-muted-foreground leading-relaxed" data-testid="optimized-summary-text">
                      {result.optimized_summary}
                    </p>
                  </div>

                  {/* Optimized Skills */}
                  {result.optimized_skills && result.optimized_skills.length > 0 && (
                    <div className="glass-card rounded-3xl p-6" data-testid="optimized-skills-card">
                      <h3 className="text-xl font-semibold text-foreground mb-4">Optimized Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.optimized_skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience Improvements */}
                  {result.experience_improvements && result.experience_improvements.length > 0 && (
                    <div className="glass-card rounded-3xl p-6" data-testid="experience-improvements-card">
                      <h3 className="text-xl font-semibold text-foreground mb-4">Experience Improvements</h3>
                      <div className="space-y-4">
                        {result.experience_improvements.map((improvement, idx) => (
                          <div key={idx} className="space-y-2">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Original:</p>
                              <p className="text-foreground">{improvement.original}</p>
                            </div>
                            <div>
                              <p className="text-sm text-primary mb-1">Improved:</p>
                              <p className="text-foreground font-medium">{improvement.improved}</p>
                            </div>
                            <p className="text-sm text-muted-foreground italic">{improvement.reason}</p>
                            {idx < result.experience_improvements.length - 1 && (
                              <div className="border-t border-white/10 pt-4" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Overall Tips */}
                  <div className="glass-card rounded-3xl p-6" data-testid="overall-tips-card">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Overall Tips</h3>
                    <ul className="space-y-2">
                      {result.overall_tips?.map((tip, idx) => (
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
                    <FileEdit className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Upload a resume and job description to get optimization suggestions</p>
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
