import React, { useState, useEffect, useMemo } from 'react';
import { STAGES } from './mockData.js';
import {
  initStorage,
  authService,
  candidateService,
  interviewService,
  feedbackService,
  userService
} from './db.js';

// SVG Icons
const Icons = {
  Kanban: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  Directory: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Star: ({ filled }) => (
    <svg className={`w-3.5 h-3.5 ${filled ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  SwitchRole: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  ExternalLink: () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
};

const getStageBadgeStyle = (stage) => {
  switch (stage) {
    case 'Applied':
    case 'Screening':
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    case 'Technical Interview':
    case 'HR Interview':
      return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
    case 'Offered':
    case 'Hired':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
    case 'Rejected':
      return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

// INITIALS AVATAR BADGE COMPONENT (No external image dependencies)
const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const UserAvatar = ({ name, className = "w-8 h-8 text-xs font-bold" }) => {
  const initials = getInitials(name);
  return (
    <div className={`${className} rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white flex items-center justify-center border border-blue-400/30 dark:border-slate-700 shadow-sm flex-shrink-0 select-none font-semibold tracking-wider`}>
      {initials}
    </div>
  );
};

// THEME TOGGLE CONTROL COMPONENT (Light / Dark Mode Switch)
const ThemeToggle = ({ isDarkMode, onToggle, className = "" }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
      isDarkMode
        ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
    } ${className}`}
    title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
  >
    {isDarkMode ? (
      <>
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span className="hidden sm:inline">Light Theme</span>
      </>
    ) : (
      <>
        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <span className="hidden sm:inline">Dark Theme</span>
      </>
    )}
  </button>
);

// DEDICATED FULL-SCREEN LOGIN PAGE COMPONENT
function LoginPage({ onLoginSuccess, isDarkMode, onToggleTheme }) {
  const [selectedRole, setSelectedRole] = useState('Recruiter');
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState(1); // 1: Identifier input, 2: OTP verification
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultDemoUsers = [
    {
      id: 'usr_recruiter_1',
      name: 'Sarah Jenkins',
      role: 'Recruiter',
      title: 'Lead Talent Acquisition Partner',
      email: 'sarah.jenkins@company.com',
      phone: '+1 (555) 987-6543'
    },
    {
      id: 'usr_interviewer_1',
      name: 'Alex Chen',
      role: 'Interviewer',
      title: 'Staff Frontend Engineer',
      email: 'alex.chen@company.com',
      phone: '+1 (555) 876-5432'
    },
    {
      id: 'usr_interviewer_2',
      name: 'Maria Rodriguez',
      role: 'Interviewer',
      title: 'Engineering Director',
      email: 'maria.rodriguez@company.com',
      phone: '+1 (555) 765-4321'
    }
  ];

  const handleSendCode = (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg(authMethod === 'email' ? 'Please enter a valid email address.' : 'Please enter a valid phone number.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(2);
      setOtpCode(['1', '2', '3', '4']); // Pre-fill sample OTP hint
    }, 400);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const session = authService.loginWithIdentifier(identifier, selectedRole);
        setIsSubmitting(false);
        onLoginSuccess(session);
      } catch (err) {
        setIsSubmitting(false);
        setErrorMsg(err.message || 'Authentication failed.');
      }
    }, 300);
  };

  const handleQuickDemoLogin = (userId) => {
    const session = authService.loginById(userId);
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-800 dark:text-slate-100 font-sans relative overflow-hidden transition-colors duration-200">
      {/* Background Decorative Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
            HS
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">Hiring Suite</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Enterprise Candidate Pipeline</p>
          </div>
        </div>

        {/* Theme Toggle Button in Login Page Header */}
        <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl space-y-6">
          
          {/* Header & Title */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Sign In to Enterprise Portal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select your account role and authenticate via email or phone</p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setSelectedRole('Recruiter'); setStep(1); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'Recruiter'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Recruiter</span>
              <span className="text-[10px] opacity-75 font-normal">(Full Admin)</span>
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('Interviewer'); setStep(1); }}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'Interviewer'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Interviewer</span>
              <span className="text-[10px] opacity-75 font-normal">(Evaluations)</span>
            </button>
          </div>

          {/* STEP 1: Email or Phone Input */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              
              {/* Method Toggle: Email vs Phone */}
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Authentication Method:</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setAuthMethod('email'); setIdentifier(''); setErrorMsg(''); }}
                    className={`font-semibold transition ${authMethod === 'email' ? 'text-blue-600 dark:text-blue-400 underline' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                  >
                    Email Address
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMethod('phone'); setIdentifier(''); setErrorMsg(''); }}
                    className={`font-semibold transition ${authMethod === 'phone' ? 'text-blue-600 dark:text-blue-400 underline' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                  >
                    Phone Number
                  </button>
                </div>
              </div>

              {/* Input Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {authMethod === 'email' ? 'Work Email Address' : 'Mobile Phone Number'}
                </label>
                <input
                  type={authMethod === 'email' ? 'email' : 'tel'}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={authMethod === 'email' ? (selectedRole === 'Recruiter' ? 'sarah.jenkins@company.com' : 'alex.chen@company.com') : '+1 (555) 987-6543'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-2 rounded-lg text-center">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Sending Security Code...' : `Continue with ${authMethod === 'email' ? 'Email' : 'Phone'} →`}
              </button>
            </form>
          )}

          {/* STEP 2: Verification PIN / OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter 4-digit code sent to <span className="font-semibold text-slate-900 dark:text-white">{identifier}</span>
                </p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">(Code: 1234)</p>
              </div>

              <div className="flex justify-center gap-3 py-2">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otpCode];
                      newOtp[idx] = e.target.value;
                      setOtpCode(newOtp);
                    }}
                    className="w-12 h-12 text-center text-lg font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/20"
                >
                  {isSubmitting ? 'Verifying...' : `Sign In as ${selectedRole}`}
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Accounts */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500">Or Sign In as Demo Account</span>
            </div>
          </div>

          {/* Demo Profiles List */}
          <div className="space-y-2">
            {defaultDemoUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickDemoLogin(user.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <UserAvatar name={user.name} className="w-8 h-8 text-xs font-bold" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.title}</p>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                  user.role === 'Recruiter' ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                }`}>
                  {user.role}
                </span>
              </button>
            ))}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
        Hiring Suite &copy; 2026
      </footer>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [users, setUsers] = useState([]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [activeTab, setActiveTab] = useState('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [feedbackCandidateTarget, setFeedbackCandidateTarget] = useState(null);

  // Form Inputs
  const [candidateForm, setCandidateForm] = useState({ name: '', email: '', phone: '', role: '', location: '', experience: '', notes: '' });
  const [scheduleForm, setScheduleForm] = useState({ candidateId: '', interviewerId: '', scheduledAt: '', type: 'Technical Interview', meetingLink: '' });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, recommendation: 'Hire', comments: '' });
  const [authForm, setAuthForm] = useState({ name: '', email: '', role: 'Recruiter', isSignup: false });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    initStorage();
    authService.logout();
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    setSession(authService.getCurrentSession());
    setCandidates(candidateService.getAll());
    setInterviews(interviewService.getAll());
    setFeedback(feedbackService.getAll());
    setUsers(userService.getAll());
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
    setSelectedCandidate(null);
  };

  const isRecruiter = session?.user?.role === 'Recruiter';
  const isInterviewer = session?.user?.role === 'Interviewer';
  const currentUserId = session?.user?.id;

  const filteredCandidates = useMemo(() => {
    return candidates.filter(cand => {
      const matchesSearch = cand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cand.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            cand.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = stageFilter === 'All' || cand.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [candidates, searchQuery, stageFilter]);

  const metrics = useMemo(() => {
    return {
      total: candidates.length,
      activeInterviews: interviews.filter(i => i.status === 'Scheduled').length,
      offered: candidates.filter(c => c.stage === 'Offered' || c.stage === 'Hired').length,
      myAssigned: candidates.filter(c => c.interviewerId === currentUserId).length
    };
  }, [candidates, interviews, currentUserId]);

  const handleRoleToggle = () => {
    const nextRole = isRecruiter ? 'Interviewer' : 'Recruiter';
    const updatedSession = authService.switchRole(nextRole);
    setSession(updatedSession);
  };

  const handleStageChange = (candidateId, newStage) => {
    if (!isRecruiter) {
      alert('Only recruiters can update candidate stages.');
      return;
    }
    candidateService.updateStage(candidateId, newStage);
    refreshAllData();
    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate(prev => ({ ...prev, stage: newStage }));
    }
  };

  const handleAddCandidateSubmit = (e) => {
    e.preventDefault();
    if (!candidateForm.name || !candidateForm.email || !candidateForm.role) {
      alert('Please fill in candidate name, email, and position.');
      return;
    }
    
    candidateService.add(candidateForm);
    
    setCandidateForm({ name: '', email: '', phone: '', role: '', location: '', experience: '', notes: '' });
    setShowAddCandidateModal(false);
    refreshAllData();
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleForm.candidateId || !scheduleForm.interviewerId || !scheduleForm.scheduledAt) {
      alert('Please complete candidate, interviewer, and schedule time.');
      return;
    }
    interviewService.schedule(scheduleForm);
    setScheduleForm({ candidateId: '', interviewerId: '', scheduledAt: '', type: 'Technical Interview', meetingLink: '' });
    setShowScheduleModal(false);
    refreshAllData();
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackCandidateTarget) return;

    feedbackService.submit({
      candidateId: feedbackCandidateTarget.id,
      interviewerId: currentUserId || 'usr_interviewer_1',
      rating: feedbackForm.rating,
      recommendation: feedbackForm.recommendation,
      comments: feedbackForm.comments
    });

    setFeedbackForm({ rating: 5, recommendation: 'Hire', comments: '' });
    setShowFeedbackModal(false);
    refreshAllData();
    
    if (selectedCandidate && selectedCandidate.id === feedbackCandidateTarget.id) {
      setSelectedCandidate(candidateService.getById(feedbackCandidateTarget.id));
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    try {
      if (authForm.isSignup) {
        authService.signup(authForm.name, authForm.email, authForm.role);
      } else {
        authService.login(authForm.email, authForm.role);
      }
      setShowAuthModal(false);
      refreshAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // IF NOT AUTHENTICATED, RENDER FULL-SCREEN LOGIN PAGE
  if (!session) {
    return (
      <LoginPage
        onLoginSuccess={(newSession) => { setSession(newSession); refreshAllData(); }}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          {/* Header & Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-md">
              HS
            </div>
            <div>
              <h1 className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">Hiring Suite</h1>
              <p className="text-[11px] text-slate-400">Enterprise Talent Pipeline</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icons.Kanban />
              Pipeline
            </button>

            <button
              onClick={() => setActiveTab('candidates')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'candidates'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icons.Directory />
                Candidates
              </div>
              <span className="text-[11px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                {candidates.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('interviews')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === 'interviews'
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icons.Calendar />
                Interviews
              </div>
              <span className="text-[11px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                {metrics.activeInterviews}
              </span>
            </button>
          </nav>
        </div>

        {/* User Account & Role Switcher */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar name={session?.user?.name || 'User Account'} className="w-8 h-8 text-xs font-bold" />
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {session?.user?.name || 'User Account'}
              </p>
              <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 rounded">
                {session?.user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={handleRoleToggle}
              className="w-full flex items-center justify-center gap-2 text-xs font-medium py-1.5 px-3 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition"
            >
              <Icons.SwitchRole />
              Switch Role ({isRecruiter ? 'Interviewer' : 'Recruiter'})
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-center text-xs font-semibold py-1.5 px-3 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER BAR */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between flex-shrink-0 z-10">
          
          {/* Global Search */}
          <div className="relative w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Search candidate name, role, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle isDarkMode={isDarkMode} onToggle={() => setIsDarkMode(!isDarkMode)} />
            
            {isRecruiter && (
              <>
                <button
                  onClick={() => setShowAddCandidateModal(true)}
                  className="flex items-center gap-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold px-3.5 py-1.5 rounded-md hover:bg-slate-800 dark:hover:bg-white transition shadow-sm"
                >
                  <Icons.Plus />
                  New Candidate
                </button>

                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
                >
                  <Icons.Calendar />
                  Schedule Interview
                </button>
              </>
            )}
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6">
          
          {/* DASHBOARD METRIC SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Candidates</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{metrics.total}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Interviews</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{metrics.activeInterviews}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Offers & Hired</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{metrics.offered}</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Evaluations Logged</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{feedback.length}</h3>
            </div>
          </div>

          {activeTab === 'pipeline' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Hiring Pipeline Board</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Filter Stage:</span>
                  <select
                    value={stageFilter}
                    onChange={e => setStageFilter(e.target.value)}
                    className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="All">All Stages (7)</option>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* KANBAN COLUMNS */}
              <div className="kanban-container">
                {STAGES.filter(s => stageFilter === 'All' || s === stageFilter).map(stage => {
                  const stageCandidates = filteredCandidates.filter(c => c.stage === stage);
                  return (
                    <div key={stage} className="kanban-column bg-slate-100/60 dark:bg-slate-900/40 rounded-lg p-3 border border-slate-200/80 dark:border-slate-800/80 flex flex-col max-h-[calc(100vh-15rem)]">
                      
                      {/* Stage Column Header */}
                      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">{stage}</span>
                        <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                          {stageCandidates.length}
                        </span>
                      </div>

                      {/* Candidate Cards List */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                        {stageCandidates.length === 0 ? (
                          <div className="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded text-slate-400 text-xs">
                            Empty stage
                          </div>
                        ) : (
                          stageCandidates.map(candidate => (
                            <div
                              key={candidate.id}
                              onClick={() => setSelectedCandidate(candidate)}
                              className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer shadow-sm group"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {candidate.name}
                                </h4>
                              </div>

                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 truncate">{candidate.role}</p>

                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                <span>{candidate.experience} exp</span>
                                
                                {candidate.rating ? (
                                  <div className="flex items-center gap-0.5">
                                    <Icons.Star filled={true} />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.rating}/5</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">Unrated</span>
                                )}
                              </div>

                              {/* Recruiter Quick Move Stage */}
                              {isRecruiter && (
                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1" onClick={e => e.stopPropagation()}>
                                  <span className="text-[10px] text-slate-400 font-medium">Stage:</span>
                                  <select
                                    value={candidate.stage}
                                    onChange={e => handleStageChange(candidate.id, e.target.value)}
                                    className="text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300"
                                  >
                                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CANDIDATE DIRECTORY */}
          {activeTab === 'candidates' && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-white">All Candidates ({filteredCandidates.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                    <tr>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Position</th>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Applied</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredCandidates.map(candidate => (
                      <tr key={candidate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3">
                          <p className="font-semibold text-slate-900 dark:text-white">{candidate.name}</p>
                          <p className="text-slate-400 text-[11px]">{candidate.email}</p>
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{candidate.role}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getStageBadgeStyle(candidate.stage)}`}>
                            {candidate.stage}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{candidate.appliedDate}</td>
                        <td className="p-3">
                          {candidate.rating ? (
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{candidate.rating}/5</span>
                          ) : (
                            <span className="text-slate-400 italic">Unrated</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="text-slate-900 dark:text-slate-100 hover:underline font-semibold text-xs"
                          >
                            Inspect →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INTERVIEWS */}
          {activeTab === 'interviews' && (
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-900 dark:text-white mb-4">Scheduled Interviews</h3>
              <div className="space-y-3">
                {interviews.length === 0 ? (
                  <p className="text-xs text-slate-400">No scheduled interviews found.</p>
                ) : (
                  interviews.map(int => (
                    <div key={int.id} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{int.candidateName}</h4>
                          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-medium">{int.type}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Role: <span className="text-slate-700 dark:text-slate-300 font-medium">{int.role}</span> | Assigned: <span className="text-slate-700 dark:text-slate-300 font-medium">{int.interviewerName}</span>
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
                          Scheduled: {new Date(int.scheduledAt).toLocaleString()}
                        </p>
                      </div>

                      <a
                        href={int.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-slate-800 transition"
                      >
                        Join Meeting Call
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CANDIDATE INSPECTOR DRAWER */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 overflow-hidden glass-backdrop flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-in">
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{selectedCandidate.name}</h3>
                <p className="text-xs text-slate-400">{selectedCandidate.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <Icons.Close />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
              
              {/* Stage Dropdown */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5">Hiring Pipeline Stage</label>
                {isRecruiter ? (
                  <select
                    value={selectedCandidate.stage}
                    onChange={e => handleStageChange(selectedCandidate.id, e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 font-medium text-slate-800 dark:text-slate-100"
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <span className={`inline-block font-medium px-2.5 py-1 rounded border ${getStageBadgeStyle(selectedCandidate.stage)}`}>
                    {selectedCandidate.stage}
                  </span>
                )}
              </div>

              {/* Overview */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b pb-1 border-slate-200 dark:border-slate-800">Candidate Information</h4>
                <p className="text-slate-600 dark:text-slate-300">Email: <span className="font-medium text-slate-900 dark:text-white">{selectedCandidate.email}</span></p>
                <p className="text-slate-600 dark:text-slate-300">Phone: <span className="font-medium text-slate-900 dark:text-white">{selectedCandidate.phone || 'N/A'}</span></p>
                <p className="text-slate-600 dark:text-slate-300">Location: <span className="font-medium text-slate-900 dark:text-white">{selectedCandidate.location}</span></p>
                <p className="text-slate-600 dark:text-slate-300">Experience: <span className="font-medium text-slate-900 dark:text-white">{selectedCandidate.experience}</span></p>
                {selectedCandidate.notes && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 mt-2">
                    <p className="font-semibold mb-0.5">Recruiter Notes:</p>
                    <p>{selectedCandidate.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Trigger Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFeedbackCandidateTarget(selectedCandidate);
                    setShowFeedbackModal(true);
                  }}
                  className="flex-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold py-2 rounded-md hover:bg-slate-800 transition"
                >
                  + Submit Evaluation
                </button>
                {isRecruiter && (
                  <button
                    onClick={() => {
                      setScheduleForm(prev => ({ ...prev, candidateId: selectedCandidate.id }));
                      setShowScheduleModal(true);
                    }}
                    className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Schedule Interview
                  </button>
                )}
              </div>

              {/* Evaluation History */}
              <div className="space-y-2.5">
                <h4 className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b pb-1 border-slate-200 dark:border-slate-800">Interviewer Evaluations</h4>
                {feedback.filter(f => f.candidateId === selectedCandidate.id).length === 0 ? (
                  <p className="text-slate-400 italic">No evaluations logged yet.</p>
                ) : (
                  feedback.filter(f => f.candidateId === selectedCandidate.id).map(fb => (
                    <div key={fb.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">{fb.interviewerName}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{fb.recommendation} ({fb.rating}/5)</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 italic">"{fb.comments}"</p>
                      <p className="text-[10px] text-slate-400 text-right">{fb.createdAt}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD CANDIDATE */}
      {showAddCandidateModal && (
        <div className="fixed inset-0 z-50 glass-backdrop flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Add New Candidate</h3>
              <button onClick={() => setShowAddCandidateModal(false)} className="text-slate-400 hover:text-slate-600"><Icons.Close /></button>
            </div>
            <form onSubmit={handleAddCandidateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={candidateForm.name}
                  onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  placeholder="e.g. David Miller"
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={candidateForm.email}
                    onChange={e => setCandidateForm({ ...candidateForm, email: e.target.value })}
                    placeholder="david@example.com"
                    className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Position Title</label>
                  <input
                    type="text"
                    required
                    value={candidateForm.role}
                    onChange={e => setCandidateForm({ ...candidateForm, role: e.target.value })}
                    placeholder="Senior Full Stack Engineer"
                    className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Experience</label>
                  <input
                    type="text"
                    value={candidateForm.experience}
                    onChange={e => setCandidateForm({ ...candidateForm, experience: e.target.value })}
                    placeholder="e.g. 5+ years"
                    className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={candidateForm.location}
                    onChange={e => setCandidateForm({ ...candidateForm, location: e.target.value })}
                    placeholder="San Francisco, CA"
                    className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Recruiter Notes</label>
                <textarea
                  rows={2}
                  value={candidateForm.notes}
                  onChange={e => setCandidateForm({ ...candidateForm, notes: e.target.value })}
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold py-2.5 rounded-md transition mt-2">
                Save Candidate Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE INTERVIEW */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 glass-backdrop flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Schedule Interview</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600"><Icons.Close /></button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Candidate</label>
                <select
                  required
                  value={scheduleForm.candidateId}
                  onChange={e => setScheduleForm({ ...scheduleForm, candidateId: e.target.value })}
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="">Select candidate...</option>
                  {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Interviewer</label>
                <select
                  required
                  value={scheduleForm.interviewerId}
                  onChange={e => setScheduleForm({ ...scheduleForm, interviewerId: e.target.value })}
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="">Select interviewer...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleForm.scheduledAt}
                  onChange={e => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Meeting Link</label>
                <input
                  type="text"
                  value={scheduleForm.meetingLink}
                  onChange={e => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <button type="submit" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold py-2.5 rounded-md transition mt-2">
                Confirm Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SUBMIT EVALUATION */}
      {showFeedbackModal && feedbackCandidateTarget && (
        <div className="fixed inset-0 z-50 glass-backdrop flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Submit Candidate Evaluation</h3>
                <p className="text-xs text-slate-400">{feedbackCandidateTarget.name}</p>
              </div>
              <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400 hover:text-slate-600"><Icons.Close /></button>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Rating Score</label>
                <select
                  value={feedbackForm.rating}
                  onChange={e => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })}
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                >
                  <option value={5}>5/5 - Exceptional Candidate</option>
                  <option value={4}>4/5 - Strong Candidate</option>
                  <option value={3}>3/5 - Meets Requirements</option>
                  <option value={2}>2/5 - Below Expectations</option>
                  <option value={1}>1/5 - Unsatisfactory</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Recommendation</label>
                <select
                  value={feedbackForm.recommendation}
                  onChange={e => setFeedbackForm({ ...feedbackForm, recommendation: e.target.value })}
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="Strong Hire">Strong Hire</option>
                  <option value="Hire">Hire</option>
                  <option value="No Hire">No Hire</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Detailed Assessment Notes</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Assess technical knowledge, problem solving, and cultural alignment..."
                  value={feedbackForm.comments}
                  onChange={e => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                ></textarea>
              </div>

              <button type="submit" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold py-2.5 rounded-md transition mt-2">
                Log Evaluation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: AUTHENTICATION */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 glass-backdrop flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{authForm.isSignup ? 'Create Account' : 'Account Credentials'}</h3>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-slate-600"><Icons.Close /></button>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
              {authForm.isSignup && (
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={e => setAuthForm({ ...authForm, name: e.target.value })}
                    className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="sarah.jenkins@company.com"
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">Role Permission</label>
                <select
                  value={authForm.role}
                  onChange={e => setAuthForm({ ...authForm, role: e.target.value })}
                  className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Recruiter">Recruiter (Full Access)</option>
                  <option value="Interviewer">Interviewer (Evaluations & Assigned)</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold py-2.5 rounded-md transition mt-2">
                {authForm.isSignup ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
