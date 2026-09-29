import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, LayoutDashboard, Shield } from 'lucide-react';
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
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center pointer-events-none px-4">
      <nav 
        className="pointer-events-auto flex items-center justify-between gap-6 max-w-[1200px] w-full rounded-[20px] px-6 py-3.5"
        style={{
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(37,99,235,0.15)',
          boxShadow: '0 8px 32px rgba(37,99,235,0.06)'
        }}
      >

        {/* Brand Anchor */}
        <Link to="/" className="font-sans font-extrabold text-[22px] text-[#0B1020] flex items-center gap-2.5 group focus:outline-none shrink-0 tracking-tight">
          <Logo size={30} className="group-hover:opacity-90 transition-opacity" />
          <span className="group-hover:text-[#2563EB] transition-colors">NovaNex</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1.5">
          <Link
            to="/features"
            className="text-[14px] font-semibold text-[#64748B] hover:text-[#2563EB] hover:bg-[#EEF4FF] px-4 py-2.5 rounded-[12px] transition-all duration-150"
          >
            Features
          </Link>
          <Link
            to="/features"
            className="text-[14px] font-semibold text-[#64748B] hover:text-[#2563EB] hover:bg-[#EEF4FF] px-4 py-2.5 rounded-[12px] transition-all duration-150"
          >
            How It Works
          </Link>
          <Link
            to="/dashboard"
            className="text-[14px] font-semibold text-[#64748B] hover:text-[#2563EB] hover:bg-[#EEF4FF] px-4 py-2.5 rounded-[12px] transition-all duration-150"
          >
            Dashboard
          </Link>
        </div>

        {/* Right side — Auth aware */}
        <div className="flex items-center gap-4 shrink-0">
          {user ? (
            /* ── LOGGED IN: Avatar + Dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                id="profile-avatar-btn"
                onClick={() => setDropdownOpen((o) => !o)}
                className="w-11 h-11 rounded-[14px] bg-[#EEF4FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] font-bold text-[15px] hover:bg-[#E0E7FF] hover:scale-[1.02] transition-all focus:outline-none shadow-sm"
                aria-label="Profile menu"
              >
                {getInitial()}
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    id="profile-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-72 rounded-[20px] border border-[#D7E0F0] bg-white shadow-[0_20px_60px_rgba(11,16,32,0.12)] overflow-hidden z-50"
                  >
                    <div className="px-5 pt-5 pb-4 border-b border-[#D7E0F0]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-[14px] bg-[#EEF4FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] font-bold text-xl shrink-0">
                          {getInitial()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[14px] text-[#0B1020] truncate">{getDisplayName()}</p>
                          <p className="text-[12px] text-[#64748B] truncate">{user.email}</p>
                          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] border border-[#BBF7D0] px-2 py-0.5 rounded-md uppercase tracking-wider">
                            <Shield className="w-2.5 h-2.5" /> Active Account
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 text-[13px] font-semibold text-[#0B1020] hover:bg-[#F5F7FF] px-3 py-2.5 rounded-[12px] transition-colors w-full"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#2563EB]" />
                        Go to Dashboard
                      </Link>
                      <button
                        id="sign-out-btn"
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 text-[13px] font-semibold text-[#EF4444] hover:bg-[#FEF2F2] px-3 py-2.5 rounded-[12px] transition-colors w-full text-left"
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
              <Link
                to="/login"
                className="text-[14px] font-semibold text-[#64748B] hover:text-[#0B1020] px-2 py-2 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="text-[14px] font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] px-6 py-3 rounded-[14px] transition-all duration-150 active:scale-[0.98] shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] flex items-center gap-1.5"
              >
                Get Started <span aria-hidden="true">&rarr;</span>
              </Link>
            </>
          )}
        </div>

      </nav>
    </div>
  );
}
