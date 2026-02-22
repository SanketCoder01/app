import { motion } from 'framer-motion';
import { useState } from 'react';
import { Hexagon, User, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    contact_number: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.contact_number || !formData.email || !formData.password || !formData.confirm_password) {
      toast.error('Please fill all fields');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          contact_number: formData.contact_number,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if email already exists
        if (response.status === 400 && data.detail?.includes('already registered')) {
          toast.error('Email already registered. Please login instead.', {
            duration: 4000,
            action: {
              label: 'Go to Login',
              onClick: () => navigate('/login'),
            },
          });
          return;
        }
        throw new Error(data.detail || 'Registration failed');
      }

      toast.success('Registration successful! Please verify your email.');
      
      // Navigate to verification page with token (in production, send via email)
      setTimeout(() => {
        navigate(`/verify-email?token=${data.verification_token}`);
      }, 1000);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
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
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-4">
            <Hexagon className="w-12 h-12 text-primary" data-testid="register-logo" />
            <h1 className="text-3xl font-heading font-bold text-foreground">SkillMirror AI</h1>
          </Link>
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-2" data-testid="register-title">
            Create Your Account
          </h2>
          <p className="text-muted-foreground">Join the global resume verification platform</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-4">
          {/* Name */}
          <div data-testid="name-field">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <User className="w-4 h-4 text-primary" />
              Full Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="bg-white/5 border-white/10 text-white"
              required
              data-testid="name-input"
            />
          </div>

          {/* Contact */}
          <div data-testid="contact-field">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Phone className="w-4 h-4 text-primary" />
              Contact Number
            </label>
            <Input
              type="tel"
              value={formData.contact_number}
              onChange={(e) => handleChange('contact_number', e.target.value)}
              placeholder="Enter your contact number"
              className="bg-white/5 border-white/10 text-white"
              required
              data-testid="contact-input"
            />
          </div>

          {/* Email */}
          <div data-testid="email-field">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Mail className="w-4 h-4 text-primary" />
              Email Address
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter your email"
              className="bg-white/5 border-white/10 text-white"
              required
              data-testid="email-input"
            />
          </div>

          {/* Password */}
          <div data-testid="password-field">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Lock className="w-4 h-4 text-primary" />
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Create a password"
                className="bg-white/5 border-white/10 text-white pr-10"
                required
                data-testid="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div data-testid="confirm-password-field">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Lock className="w-4 h-4 text-primary" />
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => handleChange('confirm_password', e.target.value)}
                placeholder="Confirm your password"
                className="bg-white/5 border-white/10 text-white pr-10"
                required
                data-testid="confirm-password-input"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full h-12 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50"
            data-testid="register-submit-btn"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Login Link */}
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline" data-testid="login-link">
              Login here
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
