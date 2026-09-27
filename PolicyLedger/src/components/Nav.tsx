import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <div className="fixed top-6 left-0 w-full z-50 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto glass-pill px-2 py-2 flex items-center justify-between gap-8 max-w-4xl shadow-xl shadow-black/50">
        <Link to="/" className="font-sans font-semibold text-lg text-text pl-4 flex items-center gap-2 group">
          <div className="w-5 h-5 rounded bg-gold group-hover:shadow-[0_0_12px_rgba(212,175,55,0.6)] transition-shadow"></div>
          PolicyLedger
        </Link>
        <div className="flex items-center gap-1 bg-ink/50 rounded-full px-2 py-1 border border-line/50">
          <Link to="/features" className="text-sm font-medium text-muted hover:text-text px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors">
            Features
          </Link>
          <Link to="/#how-it-works" className="text-sm font-medium text-muted hover:text-text px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors">
            How it works
          </Link>
          <Link to="/dashboard" className="text-sm font-medium text-muted hover:text-text px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors">
            Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-2 pr-2">
          <Link to="/login" className="text-sm font-medium text-muted hover:text-text px-3 py-2 transition-colors">
            Log in
          </Link>
          <Link 
            to="/login"
            className="text-sm bg-text text-ink font-semibold px-4 py-2 rounded-full hover:scale-105 transition-transform"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </div>
  );
}
