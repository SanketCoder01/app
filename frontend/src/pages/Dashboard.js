import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Upload, FileText, Briefcase, Linkedin, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Progress } from '@/components/ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
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

    // Extract text from PDF
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

    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    // Simulate progress
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
      const response = await fetch(`${API}/analyze/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
          linkedin_profile: linkedinProfile || null,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      toast.success('Analysis complete!');

      setTimeout(() => {
        navigate(`/results/${data.analysis_id}`);
      }, 500);
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
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3 text-foreground" data-testid="dashboard-title">
              Career Analysis
            </h1>
            <p className="text-muted-foreground text-lg" data-testid="dashboard-subtitle">
              Upload your resume and job description to get AI-powered insights
            </p>
          </div>

          <div className="space-y-6">
            {/* Resume Upload */}
            <div className="glass-card rounded-3xl p-8" data-testid="resume-upload-card">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-heading font-semibold text-foreground">Upload Resume</h2>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="resume-file-input"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all hover:bg-white/5"
                data-testid="resume-upload-dropzone"
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                {resumeFile ? (
                  <div>
                    <p className="text-foreground font-medium" data-testid="uploaded-file-name">{resumeFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-foreground font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF only (Max 10MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="glass-card rounded-3xl p-8" data-testid="job-description-card">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-heading font-semibold text-foreground">Job Description</h2>
              </div>

              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px] bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-500 text-white resize-none"
                data-testid="job-description-textarea"
              />
            </div>

            {/* LinkedIn Profile (Optional) */}
            <div className="glass-card rounded-3xl p-8" data-testid="linkedin-profile-card">
              <div className="flex items-center gap-3 mb-4">
                <Linkedin className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-heading font-semibold text-foreground">LinkedIn Profile (Optional)</h2>
              </div>

              <Input
                placeholder="https://linkedin.com/in/your-profile"
                value={linkedinProfile}
                onChange={(e) => setLinkedinProfile(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-gray-500 text-white"
                data-testid="linkedin-profile-input"
              />
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText || !jobDescription}
                size="lg"
                className="h-14 px-10 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] disabled:opacity-50 disabled:hover:scale-100 text-lg"
                data-testid="analyze-button"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-6 w-6" />
                    Analyze Now
                  </>
                )}
              </Button>
            </div>

            {/* Progress */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6"
                data-testid="analysis-progress-card"
              >
                <div className="text-center mb-4">
                  <p className="text-foreground font-medium mb-2" data-testid="analysis-status-text">
                    Gemini AI is evaluating your profile...
                  </p>
                  <p className="text-sm text-muted-foreground">This may take a few moments</p>
                </div>
                <Progress value={progress} className="h-2" data-testid="analysis-progress-bar" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
