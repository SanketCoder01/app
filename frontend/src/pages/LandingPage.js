import { motion } from 'framer-motion';
import { Hexagon, Sparkles, TrendingUp, Target, Zap, Award, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('supabase_token');
    if (token) {
      // Verify token is still valid
      fetch(`${API}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.ok ? setIsLoggedIn(true) : setIsLoggedIn(false))
        .catch(() => setIsLoggedIn(false));
    }
  }, []);

  const handleGetStarted = () => {
    window.location.href = '/register';
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('supabase_token');
    localStorage.removeItem('supabase_refresh_token');
    localStorage.removeItem('last_activity');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10" data-testid="main-header">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2" data-testid="header-logo">
              <Hexagon className="w-8 h-8 text-primary" />
              <span className="font-heading font-bold text-xl text-foreground">SkillMirror AI</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('features')} 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-features"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('how-it-works')} 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-how-it-works"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="nav-about"
              >
                About
              </button>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Button
                    onClick={handleDashboard}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                    data-testid="header-dashboard-btn"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                    data-testid="header-logout-btn"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => window.location.href = '/login'}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                    data-testid="header-login-btn"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                    data-testid="header-signup-btn"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pt-4 pb-2 border-t border-white/10 mt-4"
            >
              <nav className="flex flex-col gap-4">
                <button 
                  onClick={() => scrollToSection('features')} 
                  className="text-left text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')} 
                  className="text-left text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => scrollToSection('about')} 
                  className="text-left text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  About
                </button>
                <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                  {isLoggedIn ? (
                    <>
                      <Button onClick={handleDashboard} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                      <Button onClick={handleLogout} variant="outline" className="border-white/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => window.location.href = '/login'} variant="outline" className="border-white/10">
                        Login
                      </Button>
                      <Button onClick={handleGetStarted} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20">
        {/* Spline Embed */}
        <div className="absolute inset-0 z-0">
          <iframe
            src="https://my.spline.design/claritystream-5Zbzp4mjOUbn05WTXVHRrl72/"
            frameBorder="0"
            width="100%"
            height="100%"
            style={{ pointerEvents: 'none' }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-10" />

        {/* Content */}
        <div className="relative z-20 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Hexagon className="w-12 h-12 text-primary" data-testid="hero-logo-icon" />
              <h1 className="text-2xl font-heading font-bold text-foreground" data-testid="hero-brand-name">
                SkillMirror AI
              </h1>
            </div>

            <h2
              className="text-5xl md:text-7xl font-heading font-bold tracking-tight gradient-text"
              data-testid="hero-main-heading"
            >
              Your AI Career Copilot
            </h2>

            <p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              data-testid="hero-subheading"
            >
              Analyze. Optimize. Dominate Your Dream Job.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="h-12 px-8 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                data-testid="start-free-analysis-btn"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="absolute bottom-20 left-0 right-0 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-4xl mx-auto px-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="glass-card rounded-3xl p-6 text-center hover:border-white/20 transition-all duration-300"
                data-testid="stat-card-accuracy"
              >
                <div className="text-4xl font-bold text-primary mb-2">92%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div
                className="glass-card rounded-3xl p-6 text-center hover:border-white/20 transition-all duration-300"
                data-testid="stat-card-resumes"
              >
                <div className="text-4xl font-bold text-accent mb-2">50K+</div>
                <div className="text-sm text-muted-foreground">Resumes Analyzed</div>
              </div>
              <div
                className="glass-card rounded-3xl p-6 text-center hover:border-white/20 transition-all duration-300"
                data-testid="stat-card-fields"
              >
                <div className="text-4xl font-bold text-purple-400 mb-2">120+</div>
                <div className="text-sm text-muted-foreground">Career Fields</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Intelligence Section - How it Works */}
      <section id="how-it-works" className="py-24 md:py-32 px-6" data-testid="ai-intelligence-section">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4 text-foreground">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to unlock your career potential
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: <TrendingUp />, title: 'Upload Resume', desc: 'Upload your PDF resume' },
              { icon: <Sparkles />, title: 'AI Analysis', desc: 'Our AI analyzes your profile' },
              { icon: <Target />, title: 'Match Score', desc: 'Get instant match percentage' },
              { icon: <Zap />, title: 'Career Plan', desc: 'Receive personalized roadmap' },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative"
                data-testid={`step-card-${index + 1}`}
              >
                <div className="glass-card rounded-3xl p-8 text-center hover:border-white/20 transition-all duration-300 group">
                  <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-heading font-medium mb-2 text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 px-6 bg-muted/20" data-testid="features-section">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4 text-foreground">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground">Everything you need to land your dream job</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'ATS Score Analysis',
                desc: 'Check how well your resume passes Applicant Tracking Systems',
                icon: <Award className="w-8 h-8" />,
              },
              {
                title: 'Skill Gap Analysis',
                desc: 'Identify missing skills and get personalized recommendations',
                icon: <Target className="w-8 h-8" />,
              },
              {
                title: 'Career Roadmap',
                desc: 'Get a 30-day action plan to improve your profile',
                icon: <TrendingUp className="w-8 h-8" />,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                data-testid={`feature-card-${index + 1}`}
              >
                <div className="glass-card rounded-3xl p-8 hover:border-white/20 transition-all duration-300 h-full">
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-heading font-medium mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 px-6" data-testid="testimonials-section">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4 text-foreground">
              Trusted by Professionals
            </h2>
            <p className="text-lg text-muted-foreground">See what our users say about SkillMirror AI</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rahul Sharma',
                role: 'Software Engineer',
                text: 'SkillMirror AI helped me land my dream job at a top tech company. The ATS analysis was incredibly accurate!',
              },
              {
                name: 'Priya Patel',
                role: 'Data Scientist',
                text: 'The career roadmap feature is amazing. It gave me a clear path to improve my skills and increase my market value.',
              },
              {
                name: 'Arjun Mehta',
                role: 'Product Manager',
                text: 'I got 3 interview calls within a week of optimizing my resume using SkillMirror AI. Highly recommended!',
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                data-testid={`testimonial-card-${index + 1}`}
              >
                <div className="glass-card rounded-3xl p-8 hover:border-white/20 transition-all duration-300">
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-medium text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 px-6" data-testid="about-section">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-4 text-foreground">
              About SkillMirror AI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with passion to help professionals land their dream jobs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-3xl p-8 md:p-12"
            data-testid="about-card"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shrink-0">
                SG
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                  Sanket Gaikwad
                </h3>
                <p className="text-primary mb-4">Creator & Developer</p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  SkillMirror AI was created to revolutionize how job seekers optimize their resumes and prepare for their career journey. 
                  Using advanced AI technology, we analyze resumes against ATS systems and provide actionable insights to help you stand out 
                  in the competitive job market.
                </p>
                <div className="flex justify-center md:justify-start gap-4">
                  <a
                    href="https://www.linkedin.com/in/sanket-gaikwad-50134a314/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0077B5]/20 text-[#0077B5] hover:bg-[#0077B5]/30 transition-colors"
                    data-testid="about-linkedin-link"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                  <a
                    href="https://instagram.com/mr.sanketgofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E4405F]/20 text-[#E4405F] hover:bg-[#E4405F]/30 transition-colors"
                    data-testid="about-instagram-link"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-6 gradient-text">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have already accelerated their career growth with SkillMirror AI.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="h-14 px-10 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] text-lg"
              data-testid="cta-get-started-btn"
            >
              <Sparkles className="mr-2 h-6 w-6" />
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6" data-testid="footer">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            <div className="flex items-center gap-3">
              <Hexagon className="w-8 h-8 text-primary" />
              <span className="font-heading font-bold text-xl">SkillMirror AI</span>
            </div>
            <div className="flex gap-6">
              <a
                href="https://www.linkedin.com/in/sanket-gaikwad-50134a314/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="footer-linkedin-link"
              >
                LinkedIn
              </a>
              <a
                href="https://instagram.com/mr.sanketgofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="footer-instagram-link"
              >
                Instagram
              </a>
            </div>
            <div className="text-sm text-muted-foreground">© 2025 SkillMirror AI. All rights reserved.</div>
          </div>
          
          {/* Login Button in Footer */}
          {!isLoggedIn && (
            <div className="text-center pt-6 border-t border-white/10">
              <Button
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                data-testid="footer-login-btn"
              >
                Login to Your Account
              </Button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
