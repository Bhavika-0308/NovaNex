import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen bg-ink flex font-sans text-text">
      
      {/* Optional decorative sidebar for desktop */}
      <div className="hidden lg:flex w-1/3 bg-panel border-r border-line p-8 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="font-serif font-bold text-xl text-text hover:text-gold transition-colors">
            PolicyLedger
          </Link>
        </div>
        
        {/* Decorative citation motif */}
        <div className="relative z-10 space-y-6 opacity-30 pointer-events-none">
          <div className="bg-paper p-4 rounded border-l-4 border-gold">
            <div className="font-mono text-xs text-paper-ink/60 mb-2">SEC 3.1 — COVERAGE</div>
            <div className="h-2 w-3/4 bg-paper-ink/20 rounded"></div>
            <div className="h-2 w-1/2 bg-paper-ink/20 rounded mt-2"></div>
          </div>
          <div className="bg-paper p-4 rounded border-l-4 border-gold ml-8">
            <div className="font-mono text-xs text-paper-ink/60 mb-2">SEC 4.2 — EXCLUSIONS</div>
            <div className="h-2 w-full bg-paper-ink/20 rounded"></div>
            <div className="h-2 w-5/6 bg-paper-ink/20 rounded mt-2"></div>
            <div className="h-2 w-2/3 bg-paper-ink/20 rounded mt-2"></div>
          </div>
        </div>
        
        {/* Background gradient/texture effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent pointer-events-none z-0"></div>
      </div>

      {/* Main Login Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative">
        {/* Mobile Wordmark */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link to="/" className="font-serif font-bold text-xl text-text">
            PolicyLedger
          </Link>
        </div>

        <div className="w-full max-w-[400px] space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-serif">Sign in to PolicyLedger.</h1>
            <p className="text-muted text-sm">
              Your policy and treatment data are only used to answer your questions.
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text block" htmlFor="email">Email address</label>
              <input 
                type="email" 
                id="email"
                className="w-full bg-panel-2 border border-line rounded px-4 py-2.5 text-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-shadow"
                placeholder="you@example.com"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text block" htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password"
                className="w-full bg-panel-2 border border-line rounded px-4 py-2.5 text-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-shadow"
                placeholder="••••••••"
              />
            </div>

            <button type="button" className="w-full bg-gold text-ink font-medium px-4 py-2.5 rounded hover:bg-gold/90 transition-colors">
              Sign in
            </button>
          </form>

          <div className="flex justify-between items-center text-sm">
            <a href="#" className="text-muted hover:text-text transition-colors">Forgot password?</a>
            <a href="#" className="text-muted hover:text-text transition-colors">Create an account</a>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-ink text-muted font-medium">or</span>
            </div>
          </div>

          <Link to="/dashboard" className="w-full block text-center bg-panel border border-line text-text font-medium px-4 py-2.5 rounded hover:bg-panel-2 transition-colors">
            Continue with sample policy
          </Link>

          <p className="text-xs text-muted text-center pt-8">
            We use industry-standard encryption. Your documents are never used to train global AI models.
          </p>
        </div>
      </div>

    </div>
  );
}
