import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, Loader2, Shield } from 'lucide-react';
import { useState } from 'react';
import Logo from '../components/Logo';
import { loginUser } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.';

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
            className="w-64 h-80 rounded-2xl border border-neon-blue/30 bg-neon-blue/5 p-6 shadow-[0_0_40px_rgba(56,189,248,0.1)] backdrop-blur-md flex flex-col justify-between"
          >
            <div className="flex justify-between items-center opacity-50">
              <Shield className="w-6 h-6 text-neon-blue" />
              <Lock className="w-4 h-4 text-neon-blue" />
            </div>
            <div className="space-y-4 opacity-50">
              <div className="h-2 w-3/4 bg-neon-blue/40 rounded"></div>
              <div className="h-2 w-full bg-neon-blue/40 rounded"></div>
              <div className="h-2 w-5/6 bg-neon-blue/40 rounded"></div>
            </div>
            <div className="mt-8 border-t border-neon-blue/20 pt-4 opacity-50">
              <div className="h-6 w-1/3 bg-neon-blue/30 rounded"></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Login Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10">
        {/* Mobile Wordmark */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={24} />
            <span className="font-bold text-lg tracking-tight">InsureSight</span>
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[400px]"
        >
          <div className="space-y-2 mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              Continue to InsureSight
            </h1>
            <p className="text-muted text-sm font-light">
              Enter anything to open the shared demo workspace.
            </p>
          </div>

          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text/80 block" htmlFor="email">Username</label>
              <input 
                type="text" 
                id="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all backdrop-blur-md"
                placeholder="Anything works"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text/80 block" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all backdrop-blur-md pr-12"
                  placeholder="Anything works"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full neon-button justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </motion.div>
      </div>

    </div>
  );
}

