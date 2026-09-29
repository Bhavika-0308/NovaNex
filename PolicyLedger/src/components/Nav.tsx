import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard, User as UserIcon, Mail, Shield } from 'lucide-react';
import Logo from './Logo';
import { getCurrentUser, logoutUser } from '../api';

interface SessionUser {
  email: string;
  full_name: string | null;
}

export default function Nav() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('policywise_token')) return;

    let mounted = true;
    getCurrentUser()
      .then((currentUser) => {
        if (mounted) setUser(currentUser);
      })
      .catch(() => {
        logoutUser();
        if (mounted) setUser(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setDropdownOpen(false);
    logoutUser();
    setUser(null);
    navigate('/');
  };

  const getInitial = () => {
    if (user?.full_name) return user.full_name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  const getDisplayName = () => user?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto glass-pill px-2 py-2 flex items-center justify-between gap-8 max-w-4xl shadow-xl shadow-black/50">

        {/* Logo */}
        <Link to="/" className="font-sans font-semibold text-lg text-text pl-4 flex items-center gap-2 group">
          <Logo size={26} className="group-hover:opacity-90 transition-opacity" />
          InsureSight
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 bg-ink/50 rounded-full px-2 py-1 border border-line/50">
          <Link to="/features" className="text-sm font-medium text-muted hover:text-text px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors">
            Features
          </Link>
          <Link to="/dashboard" className="text-sm font-medium text-muted hover:text-text px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors">
            Dashboard
          </Link>
        </div>

        {/* Right side — auth aware */}
        <div className="flex items-center gap-2 pr-2">
          {user ? (
            /* ── LOGGED IN: Avatar + Dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                id="profile-avatar-btn"
                onClick={() => setDropdownOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-neon-blue/20 border-2 border-neon-blue/60 flex items-center justify-center text-neon-blue font-bold text-sm hover:bg-neon-blue/30 hover:border-neon-blue hover:scale-105 transition-all shadow-[0_0_12px_rgba(56,189,248,0.3)] focus:outline-none"
                aria-label="Profile menu"
              >
                {getInitial()}
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    id="profile-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/10 bg-ink/90 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
                  >
                    {/* Profile Header */}
                    <div className="px-5 pt-5 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-4">
                        {/* Big avatar */}
                        <div className="w-14 h-14 rounded-full bg-neon-blue/20 border-2 border-neon-blue/50 flex items-center justify-center text-neon-blue font-bold text-2xl shadow-[0_0_20px_rgba(56,189,248,0.25)] shrink-0">
                          {getInitial()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text truncate">{getDisplayName()}</p>
                          <p className="text-xs text-muted truncate">{user.email}</p>
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-neon-blue bg-neon-blue/10 border border-neon-blue/20 px-2 py-0.5 rounded-full">
                            <Shield className="w-2.5 h-2.5" /> Active Account
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Info rows */}
                    <div className="px-5 py-3 space-y-2 border-b border-white/10">
                      <div className="flex items-center gap-3 text-sm text-muted">
                        <UserIcon className="w-4 h-4 text-neon-blue/60 shrink-0" />
                        <span className="truncate">{getDisplayName()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted">
                        <Mail className="w-4 h-4 text-neon-blue/60 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-3 py-3 space-y-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 text-sm text-muted hover:text-text hover:bg-white/5 px-3 py-2.5 rounded-xl transition-colors w-full"
                      >
                        <LayoutDashboard className="w-4 h-4 text-neon-blue/60" />
                        Go to Dashboard
                      </Link>
                      <button
                        id="sign-out-btn"
                        onClick={handleSignOut}
                        className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2.5 rounded-xl transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── LOGGED OUT: Log in + Get Started ── */
            <>
              <Link to="/login" className="text-sm font-medium text-muted hover:text-text px-3 py-2 transition-colors">
                Log in
              </Link>
              <Link
                to="/login"
                className="text-sm bg-text text-ink font-semibold px-4 py-2 rounded-full hover:scale-105 transition-transform"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

      </nav>
    </div>
  );
}
