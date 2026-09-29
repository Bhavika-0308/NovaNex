import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, Shield, User, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { loginUser, signupUser } from '../api';

interface LoginProps {
  defaultMode?: 'signin' | 'signup';
}

export default function Login({ defaultMode = 'signin' }: LoginProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : defaultMode;

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@') || !email.includes('.')) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        await signupUser(email, password, fullName);
        setSuccessMessage('Account created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create account.';
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    } else {
      // Sign In mode
      setLoading(true);
      try {
        await loginUser(email, password);
        navigate('/dashboard');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid credentials.';
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDemoSignIn = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      await loginUser();
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start demo.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex font-sans text-text relative overflow-hidden">
      
      {/* Background ambient light */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-neon-blue/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-neon-blue/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Decorative Sidebar for Desktop */}
      <div className="hidden lg:flex w-[45%] border-r border-white/10 p-12 flex-col justify-between relative overflow-hidden bg-white/5 backdrop-blur-3xl z-10">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 group w-max">
            <Logo size={32} className="group-hover:opacity-90 transition-opacity" />
            <span className="font-bold text-xl text-text tracking-tight group-hover:text-accent transition-colors">
              InsureSight
            </span>
          </Link>
        </div>
        
        {/* Animated 3D element in sidebar */}
        <div className="relative z-10 flex-1 flex items-center justify-center perspective-1000">
          <motion.div 
            initial={{ rotateY: -15, rotateX: 10 }}
            animate={{ rotateY: [-15, 15, -15], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="w-72 rounded-2xl border border-neon-blue/30 bg-neon-blue/5 p-6 shadow-[0_0_40px_rgba(56,189,248,0.1)] backdrop-blur-md flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-neon-blue/20 flex items-center justify-center text-neon-blue">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-[11px] text-neon-blue font-medium">
                <Sparkles className="w-3 h-3" /> Secure Auth
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="text-sm font-semibold text-text">NovaNex Verified Protection</div>
              <p className="text-xs text-muted leading-relaxed">
                Connect your medical policy documents with instant AI extraction, automated hospital claim checks, and transparent coverage analysis.
              </p>
            </div>

            <div className="space-y-2 border-t border-neon-blue/20 pt-4">
              <div className="flex items-center gap-2 text-xs text-text/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-neon-blue shrink-0" />
                <span>Instant Clause & Deductible Extraction</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-text/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-neon-blue shrink-0" />
                <span>Real-Time Cashless Hospital Network</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Login / Signup Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        {/* Mobile Wordmark */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-bold text-lg tracking-tight">InsureSight</span>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[420px]"
        >
          {/* Header */}
          <div className="space-y-2 mb-6 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === 'signup' ? 'Create an Account' : 'Welcome Back'}
            </h1>
            <p className="text-muted text-sm font-light">
              {mode === 'signup'
                ? 'Join InsureSight to analyze, extract, and track your health policies.'
                : 'Sign in to access your policies and AI coverage assistant.'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="p-1 mb-6 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1 backdrop-blur-md">
            <button
              type="button"
              id="tab-signin"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  : 'text-muted hover:text-text'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="tab-signup"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-neon-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  : 'text-muted hover:text-text'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{errorMessage}</p>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name field (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text/80 block" htmlFor="fullName">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    id="fullName"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-11 text-text focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all backdrop-blur-md"
                    placeholder="John Doe"
                    required
                  />
                  <User className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text/80 block" htmlFor="email">
                {mode === 'signup' ? 'Email Address' : 'Email / Username'}
              </label>
              <div className="relative">
                <input 
                  type={mode === 'signup' ? 'email' : 'text'}
                  id="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-11 text-text focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all backdrop-blur-md"
                  placeholder={mode === 'signup' ? 'name@example.com' : 'name@example.com (or leave blank for demo)'}
                  required={mode === 'signup'}
                />
                <Mail className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text/80 block" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-11 pr-11 text-text focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all backdrop-blur-md"
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Password (optional for demo)'}
                  required={mode === 'signup'}
                />
                <Lock className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors flex items-center justify-center"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text/80 block" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pl-11 pr-11 text-text focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all backdrop-blur-md"
                    placeholder="Re-enter your password"
                    required
                  />
                  <Lock className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors flex items-center justify-center"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button 
              type="submit" 
              id="submit-auth-btn"
              disabled={loading} 
              className="w-full neon-button justify-center mt-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(59,130,246,0.3)]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'signup' ? (
                'Create Account'
              ) : (
                'Sign In with Firebase'
              )}
            </button>
          </form>

          {/* Quick Demo Access Option (in Sign In mode) */}
          {mode === 'signin' && (
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <button
                type="button"
                id="demo-access-btn"
                onClick={handleDemoSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-text/90 font-medium transition-all flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-neon-blue group-hover:rotate-12 transition-transform" />
                <span>Instant Demo Workspace (1-Click)</span>
              </button>
            </div>
          )}

          {/* Bottom Switcher */}
          <div className="mt-6 text-center text-sm text-muted">
            {mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  id="switch-to-signin"
                  onClick={() => setMode('signin')}
                  className="text-neon-blue hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  id="switch-to-signup"
                  onClick={() => setMode('signup')}
                  className="text-neon-blue hover:underline font-medium"
                >
                  Create one now
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}


