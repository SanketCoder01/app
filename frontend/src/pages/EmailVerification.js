import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Hexagon, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid verification link');
      setVerifying(false);
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`${API}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      // Read JSON once
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Verification failed');
      }

      setVerified(true);
      toast.success('Email verified successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.message || 'Verification failed');
      toast.error(error.message || 'Email verification failed');
    } finally {
      setVerifying(false);
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
            <Hexagon className="w-12 h-12 text-primary" data-testid="verify-logo" />
            <h1 className="text-3xl font-heading font-bold text-foreground">SkillMirror AI</h1>
          </Link>
        </div>

        {/* Content */}
        <div className="glass-card rounded-3xl p-8 text-center">
          {verifying ? (
            <div data-testid="verifying-state">
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">Verifying Email</h2>
              <p className="text-muted-foreground">Please wait while we verify your email address...</p>
            </div>
          ) : verified ? (
            <div data-testid="success-state">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">Email Verified!</h2>
              <p className="text-muted-foreground mb-6">Your email has been successfully verified. You can now login to your account.</p>
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="w-full h-12 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                data-testid="goto-login-btn"
              >
                Go to Login
              </Button>
            </div>
          ) : error ? (
            <div data-testid="error-state">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">Verification Failed</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                className="w-full h-12 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                data-testid="goto-register-btn"
              >
                Try Again
              </Button>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
