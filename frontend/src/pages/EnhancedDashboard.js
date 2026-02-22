import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  FileEdit, 
  Target, 
  Map, 
  Award, 
  Certificate,
  Eye,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function EnhancedDashboard({ user }) {
  const dashboardFeatures = [
    {
      title: 'Resume Global Verifier',
      description: 'Upload and verify your resume with AI-powered skill verification',
      icon: <Shield className="w-8 h-8" />,
      link: '/verify-resume',
      color: 'from-blue-500 to-cyan-500',
      status: 'Not Started',
      testId: 'resume-verifier-card'
    },
    {
      title: 'AI Resume Rewriter',
      description: 'Optimize your resume for specific job descriptions',
      icon: <FileEdit className="w-8 h-8" />,
      link: '/resume-optimizer',
      color: 'from-purple-500 to-pink-500',
      status: 'Available',
      testId: 'resume-rewriter-card'
    },
    {
      title: 'ATS Score Analyzer',
      description: 'Check how well your resume passes ATS systems',
      icon: <Target className="w-8 h-8" />,
      link: '/ats-score',
      color: 'from-green-500 to-emerald-500',
      status: 'Available',
      testId: 'ats-analyzer-card'
    },
    {
      title: 'Career Roadmap Generator',
      description: 'Get personalized career path with milestones',
      icon: <Map className="w-8 h-8" />,
      link: '/roadmap',
      color: 'from-orange-500 to-red-500',
      status: 'Coming Soon',
      testId: 'roadmap-card'
    },
    {
      title: 'Skill Verification Test',
      description: 'Take proctored test to verify your skills',
      icon: <Award className="w-8 h-8" />,
      link: '/skill-test',
      color: 'from-indigo-500 to-purple-500',
      status: 'Not Started',
      testId: 'skill-test-card'
    },
    {
      title: 'Certificates',
      description: 'View and download your verified certificates',
      icon: <Certificate className="w-8 h-8" />,
      link: '/certificates',
      color: 'from-yellow-500 to-amber-500',
      status: 'No Certificates',
      testId: 'certificates-card'
    },
    {
      title: 'Recruiter Visibility',
      description: 'Manage your profile visibility to recruiters',
      icon: <Eye className="w-8 h-8" />,
      link: '/recruiter-visibility',
      color: 'from-teal-500 to-cyan-500',
      status: 'Hidden',
      testId: 'visibility-card'
    },
    {
      title: 'Analysis History',
      description: 'View your previous resume analyses',
      icon: <Clock className="w-8 h-8" />,
      link: '/history',
      color: 'from-gray-500 to-slate-500',
      status: 'Available',
      testId: 'history-card'
    },
  ];

  const stats = [
    { label: 'Profile Completion', value: user?.profile_completed ? '100%' : '50%', icon: <CheckCircle2 />, color: 'text-green-500' },
    { label: 'Verification Status', value: 'Not Verified', icon: <AlertCircle />, color: 'text-yellow-500' },
    { label: 'ATS Score', value: 'N/A', icon: <Target />, color: 'text-blue-500' },
    { label: 'Skill Tests', value: '0/5', icon: <Award />, color: 'text-purple-500' },
  ];

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3 text-foreground" data-testid="dashboard-welcome">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Your global career verification hub - Track, verify, and optimize your professional profile
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-card rounded-3xl p-6"
                data-testid={`stat-card-${index}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`${stat.color}`}>{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                data-testid={feature.testId}
              >
                <Link
                  to={feature.link}
                  className={`block glass-card rounded-3xl p-6 hover:border-white/20 transition-all duration-300 group h-full ${
                    feature.status === 'Coming Soon' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => {
                    if (feature.status === 'Coming Soon') {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      feature.status === 'Available' ? 'bg-green-500/20 text-green-400' :
                      feature.status === 'Coming Soon' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {feature.status}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-12 glass-card rounded-3xl p-8">
            <h2 className="text-2xl font-heading font-semibold mb-6 text-foreground">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/verify-resume"
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all"
                data-testid="quick-action-verify"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Start Verification</div>
                  <div className="text-sm text-muted-foreground">Upload and verify your resume</div>
                </div>
              </Link>
              
              <Link
                to="/resume-optimizer"
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all"
                data-testid="quick-action-optimize"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <FileEdit className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Optimize Resume</div>
                  <div className="text-sm text-muted-foreground">AI-powered improvements</div>
                </div>
              </Link>
              
              <Link
                to="/ats-score"
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all"
                data-testid="quick-action-ats"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Check ATS Score</div>
                  <div className="text-sm text-muted-foreground">Get instant ATS analysis</div>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
