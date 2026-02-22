import { motion } from 'framer-motion';
import { useState } from 'react';
import { Hexagon, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error('Server response error. Please try again.');
      }

      if (!response.ok) {
        // Check specific error cases
        if (response.status === 401) {
          if (data.detail?.includes('verify your email')) {
            toast.error('Please verify your email first. Check your inbox.', {
              duration: 5000,
            });
            setIsSubmitting(false);
            return;
          }
          if (data.detail?.includes('Invalid email or password')) {
            toast.error('Invalid email or password. Please check your credentials or register first.', {
              duration: 4000,
              action: {
                label: 'Register',
                onClick: () => navigate('/register'),
              },
            });
            setIsSubmitting(false);
            return;
          }
        }
        throw new Error(data.detail || 'Login failed');
      }

      toast.success('Login successful!');
      
      // Navigate to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
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
            <Hexagon className="w-12 h-12 text-primary" data-testid="login-logo" />
            <h1 className="text-3xl font-heading font-bold text-foreground">SkillMirror AI</h1>
          </Link>
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-2" data-testid="login-title">
            Welcome Back
          </h2>
          <p className="text-muted-foreground">Login to continue your career journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 space-y-4">
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
                placeholder="Enter your password"
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="w-full h-12 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50"
            data-testid="login-submit-btn"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>

          {/* Register Link */}
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline" data-testid="register-link">
              Register here
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
