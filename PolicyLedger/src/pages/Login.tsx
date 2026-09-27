import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
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
            <div className="w-8 h-8 rounded bg-neon-blue flex items-center justify-center text-ink shadow-[0_0_15px_rgba(56,189,248,0.5)] group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-text tracking-tight group-hover:text-neon-blue transition-colors">
              PolicyLedger
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
            <div className="w-6 h-6 rounded bg-neon-blue flex items-center justify-center text-ink shadow-[0_0_10px_rgba(56,189,248,0.5)]">
              <Shield className="w-3 h-3" />
            </div>
            <span className="font-bold text-lg tracking-tight">PolicyLedger</span>
          </Link>
        </div>

        <motion.div 
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[400px]"
        >
          <div className="space-y-2 mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="text-muted text-sm font-light">
              {isLogin 
                ? 'Enter your details to access your intelligence dashboard.'
                : 'Get started with PolicyLedger to decode your coverage.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-sm font-medium text-text/80 block" htmlFor="name">Full name</label>
                <input 
                  type="text" 
                  id="name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all backdrop-blur-md"
                  placeholder="John Doe"
                />
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text/80 block" htmlFor="email">Email address</label>
              <input 
                type="email" 
                id="email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all backdrop-blur-md"
                placeholder="you@example.com"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text/80 block" htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all backdrop-blur-md"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full neon-button justify-center mt-2">
              {isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="flex justify-between items-center text-sm mt-6">
            {isLogin ? (
              <>
                <button type="button" className="text-muted hover:text-neon-blue transition-colors">Forgot password?</button>
                <button type="button" onClick={() => setIsLogin(false)} className="text-muted hover:text-neon-blue transition-colors">Create account</button>
              </>
            ) : (
              <button type="button" onClick={() => setIsLogin(true)} className="text-muted hover:text-neon-blue transition-colors mx-auto">
                Already have an account? Sign in
              </button>
            )}
          </div>

          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-ink text-muted font-medium text-xs uppercase tracking-wider">Or</span>
            </div>
          </div>

          <Link to="/dashboard" className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-text font-medium px-4 py-3 rounded-lg hover:bg-white/10 hover:border-white/20 transition-colors group">
            Continue with sample policy <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-neon-blue transition-colors" />
          </Link>
        </motion.div>
      </div>

    </div>
  );
}
