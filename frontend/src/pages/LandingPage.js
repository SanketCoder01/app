import { motion } from 'framer-motion';
import { Hexagon, Sparkles, TrendingUp, Target, Zap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function LandingPage() {
  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
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
                onClick={handleLogin}
                size="lg"
                className="h-12 px-8 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                data-testid="start-free-analysis-btn"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Free Analysis
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded-full font-medium border border-white/10 hover:bg-white/5 transition-all"
                data-testid="watch-demo-btn"
              >
                Watch Demo
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

      {/* AI Intelligence Section */}
      <section className="py-24 md:py-32 px-6" data-testid="ai-intelligence-section">
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
      <section className="py-24 md:py-32 px-6 bg-muted/20" data-testid="features-section">
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
              onClick={handleLogin}
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
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
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
      </footer>
    </div>
  );
}
