import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, Shield, User, Mail, Sparkles, CheckCircle2, FileText, BrainCircuit } from 'lucide-react';
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
    <div className="min-h-screen bg-canvas-white flex font-sans text-text-primary relative overflow-hidden">
      
      {/* Left Side: Product Experience (Deep Navy) */}
      <div className="hidden lg:flex w-[45%] bg-brand-deep-navy p-12 flex-col justify-between relative overflow-hidden text-canvas-white">
        {/* Ambient Gradients for Product Context */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-ai-purple/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-ai-cyan/15 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-2 group w-max">
          <Link to="/" className="flex items-center gap-2 focus-ring-dark rounded-lg">
            <Logo size={32} className="text-canvas-white" />
            <span className="font-bold text-2xl tracking-tight text-canvas-white">NovaNex</span>
          </Link>
        </div>
        
        {/* Visual Product Illustration */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center perspective-1000 my-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-sm"
          >
            <div className="glass-panel-dark rounded-2xl border border-canvas-white/10 p-6 shadow-2xl relative">
              {/* Product Card Header */}
              <div className="flex items-center justify-between mb-6 border-b border-canvas-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-ai-purple/20 flex items-center justify-center text-brand-ai-purple">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-canvas-white">Editorial Intelligence</h3>
                    <p className="text-xs text-canvas-white/60">Policy Analysis Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-ai-cyan/10 border border-brand-ai-cyan/20 text-[11px] text-brand-ai-cyan font-semibold tracking-wide">
                  <Sparkles className="w-3 h-3" /> AI ANALYSIS
                </div>
              </div>

              {/* Product Content Layers */}
              <div className="space-y-4">
                <div className="bg-canvas-white/5 rounded-xl p-4 border border-canvas-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-4 h-4 text-status-covered" />
                    <span className="text-sm font-semibold text-canvas-white">Coverage Overview</span>
                  </div>
                  <div className="h-1.5 w-full bg-canvas-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-status-covered rounded-full"></div>
                  </div>
                </div>
                
                <div className="bg-canvas-white/5 rounded-xl p-4 border border-canvas-white/5 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-ai-purple"></div>
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-brand-ai-purple mt-0.5" />
                    <div>
                      <span className="text-sm font-semibold text-canvas-white block mb-1">Clause Extracted</span>
                      <p className="text-xs text-canvas-white/60 leading-relaxed">
                        "Pre-existing condition waiting period fully completed as of March 2024."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 max-w-sm">
          <h2 className="text-3xl font-bold text-canvas-white mb-4 leading-tight">
            Understand your policy before it becomes a problem.
          </h2>
          <p className="text-canvas-white/70 text-sm leading-relaxed">
            Join NovaNex to unlock instant clarity on health insurance terms, coverage limits, and claim processes using editorial AI intelligence.
          </p>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative z-10 w-full lg:w-[55%]">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2 focus-ring rounded-lg">
            <Logo size={24} className="text-brand-deep-navy" />
            <span className="font-bold text-lg tracking-tight text-brand-deep-navy">NovaNex</span>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[420px]"
        >
          {/* Header */}
          <div className="mb-8 text-center lg:text-left mt-10 lg:mt-0">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary mb-2">
              {mode === 'signup' ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-text-muted text-sm md:text-base font-medium">
              {mode === 'signup'
                ? 'Join NovaNex for premium insurance intelligence.'
                : 'Sign in to access your policies and AI coverage assistant.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="p-1 mb-8 rounded-xl bg-canvas-secondary border border-border-subtle flex items-center gap-1">
            <button
              type="button"
              id="tab-signin"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all focus-ring ${
                mode === 'signin'
                  ? 'bg-canvas-white text-brand-electric shadow-sm border border-border-subtle'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="tab-signup"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all focus-ring ${
                mode === 'signup'
                  ? 'bg-canvas-white text-brand-electric shadow-sm border border-border-subtle'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-status-oop/10 border border-status-oop/20 rounded-xl flex items-start gap-3 text-status-oop text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{errorMessage}</p>
                </div>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-status-covered/10 border border-status-covered/20 rounded-xl flex items-start gap-3 text-status-covered text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{successMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Form */}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            
            {/* Full Name field (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary block" htmlFor="fullName">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    id="fullName"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-canvas-white border border-border-subtle rounded-xl px-4 py-3.5 pl-11 text-text-primary text-base focus:outline-none focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-all shadow-sm placeholder:text-text-muted/60"
                    placeholder="John Doe"
                    required
                  />
                  <User className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-primary block" htmlFor="email">
                {mode === 'signup' ? 'Email Address' : 'Email Address / Username'}
              </label>
              <div className="relative">
                <input 
                  type="email"
                  id="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-canvas-white border border-border-subtle rounded-xl px-4 py-3.5 pl-11 text-text-primary text-base focus:outline-none focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-all shadow-sm placeholder:text-text-muted/60"
                  placeholder={mode === 'signup' ? 'name@example.com' : 'name@example.com (or blank for demo)'}
                  required={mode === 'signup'}
                />
                <Mail className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            
            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-primary block" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-canvas-white border border-border-subtle rounded-xl px-4 py-3.5 pl-11 pr-12 text-text-primary text-base focus:outline-none focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-all shadow-sm placeholder:text-text-muted/60"
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Password (optional for demo)'}
                  required={mode === 'signup'}
                />
                <Lock className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-primary focus-ring rounded-md transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary block" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-canvas-white border border-border-subtle rounded-xl px-4 py-3.5 pl-11 pr-12 text-text-primary text-base focus:outline-none focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-all shadow-sm placeholder:text-text-muted/60"
                    placeholder="Re-enter your password"
                    required
                  />
                  <Lock className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-primary focus-ring rounded-md transition-colors"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="pt-2">
              <button 
                type="submit" 
                id="submit-auth-btn"
                disabled={loading} 
                className="w-full bg-brand-electric hover:bg-brand-bright text-canvas-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)] focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : mode === 'signup' ? (
                  'Create Account'
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Access Option (in Sign In mode) */}
          {mode === 'signin' && (
            <div className="mt-6">
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-border-subtle"></div>
                <span className="shrink-0 mx-4 text-text-muted text-sm font-medium">or</span>
                <div className="flex-grow border-t border-border-subtle"></div>
              </div>
              
              <button
                type="button"
                id="demo-access-btn"
                onClick={handleDemoSignIn}
                disabled={loading}
                className="w-full bg-canvas-white hover:bg-canvas-secondary border border-border-subtle text-text-primary font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-5 h-5 text-brand-ai-cyan group-hover:rotate-12 transition-transform" />
                <span>Instant Demo Workspace (1-Click)</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}
