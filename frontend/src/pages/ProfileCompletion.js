import { motion } from 'framer-motion';
import { useState } from 'react';
import { Hexagon, User, GraduationCap, Calendar, Globe, Linkedin, Github, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Singapore',
  'UAE',
  'Other',
];

const CURRENT_YEAR = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR + 5 - i);

export default function ProfileCompletion({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    university: '',
    course: '',
    prn_number: '',
    graduation_year: '',
    country: '',
    linkedin_url: '',
    github_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.full_name || !formData.university || !formData.course || !formData.prn_number || !formData.graduation_year || !formData.country) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API}/profile/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          full_name: formData.full_name,
          university: formData.university,
          course: formData.course,
          prn_number: formData.prn_number,
          graduation_year: parseInt(formData.graduation_year),
          country: formData.country,
          linkedin_url: formData.linkedin_url || null,
          github_url: formData.github_url || null,
        }),
      });

      if (!response.ok) throw new Error('Profile completion failed');

      const updatedUser = await response.json();
      toast.success(`Profile completed! Your Unique ID: ${updatedUser.skill_mirror_id}`);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Profile completion error:', error);
      toast.error('Failed to complete profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Hexagon className="w-12 h-12 text-primary" data-testid="profile-completion-logo" />
            <h1 className="text-3xl font-heading font-bold text-foreground">SkillMirror AI</h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-semibold text-foreground mb-2" data-testid="profile-completion-title">
            Complete Your Profile
          </h2>
          <p className="text-muted-foreground">
            We need a few details to create your unique SkillMirror ID
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-6">
          {/* Full Name */}
          <div data-testid="full-name-field">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <User className="w-4 h-4 text-primary" />
              Full Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              className="bg-white/5 border-white/10 text-white"
              required
              data-testid="full-name-input"
            />
          </div>

          {/* University */}
          <div data-testid="university-field">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              University / College Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={formData.university}
              onChange={(e) => handleChange('university', e.target.value)}
              placeholder="Enter your university name"
              className="bg-white/5 border-white/10 text-white"
              required
              data-testid="university-input"
            />
          </div>

          {/* Course */}
          <div data-testid="course-field">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Award className="w-4 h-4 text-primary" />
              Course / Department <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={formData.course}
              onChange={(e) => handleChange('course', e.target.value)}
              placeholder="e.g., Computer Science Engineering"
              className="bg-white/5 border-white/10 text-white"
              required
              data-testid="course-input"
            />
          </div>

          {/* PRN Number */}
          <div data-testid="prn-field">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Award className="w-4 h-4 text-primary" />
              PRN / Enrollment Number <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={formData.prn_number}
              onChange={(e) => handleChange('prn_number', e.target.value)}
              placeholder="Enter your PRN or enrollment number"
              className="bg-white/5 border-white/10 text-white"
              required
              data-testid="prn-input"
            />
          </div>

          {/* Graduation Year & Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div data-testid="graduation-year-field">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 text-primary" />
                Graduation Year <span className="text-destructive">*</span>
              </label>
              <Select value={formData.graduation_year} onValueChange={(value) => handleChange('graduation_year', value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="graduation-year-select">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {GRADUATION_YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div data-testid="country-field">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Globe className="w-4 h-4 text-primary" />
                Country <span className="text-destructive">*</span>
              </label>
              <Select value={formData.country} onValueChange={(value) => handleChange('country', value)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="country-select">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* LinkedIn (Optional) */}
          <div data-testid="linkedin-field">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Linkedin className="w-4 h-4 text-primary" />
              LinkedIn Profile <span className="text-muted-foreground text-xs">(Optional)</span>
            </label>
            <Input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => handleChange('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className="bg-white/5 border-white/10 text-white"
              data-testid="linkedin-input"
            />
          </div>

          {/* GitHub (Optional) */}
          <div data-testid="github-field">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Github className="w-4 h-4 text-primary" />
              GitHub Profile <span className="text-muted-foreground text-xs">(Optional)</span>
            </label>
            <Input
              type="url"
              value={formData.github_url}
              onChange={(e) => handleChange('github_url', e.target.value)}
              placeholder="https://github.com/yourusername"
              className="bg-white/5 border-white/10 text-white"
              data-testid="github-input"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full h-14 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            data-testid="submit-profile-btn"
          >
            {isSubmitting ? 'Creating Profile...' : 'Complete Profile & Get My ID'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Your unique SkillMirror ID will be generated automatically
          </p>
        </form>
      </motion.div>
    </div>
  );
}
