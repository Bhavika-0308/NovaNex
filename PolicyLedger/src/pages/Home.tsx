import Nav from '../components/Nav';
import { BlurText } from '../components/BlurText';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Shield, Activity, Clock, AlertTriangle, IndianRupee, FileWarning, Search, Zap, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress within the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Transform values for the 3D card based on scroll
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-15, 180, 360]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 0, 10]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);
  const yOffset = useTransform(scrollYProgress, [0, 0.5, 1], [0, 100, 0]);

  return (
    <div className="min-h-screen bg-ink font-sans text-text relative overflow-hidden" ref={containerRef}>
      
      {/* Background ambient light */}
      <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-neon-blue/20 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-neon-blue/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      
      <div className="fixed bottom-0 left-0 w-full h-[40vh] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.1)_0%,transparent_70%)] pointer-events-none z-0"></div>

      <Nav />
      
      {/* Scrollable Container with Sticky Right Side */}
      <main className="relative z-10 max-w-[1400px] mx-auto px-6 pt-32 lg:pt-40">
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 w-full relative">
          
          {/* Left Content (Scrolls naturally) */}
          <div className="w-full lg:w-1/2 pb-[30vh]">
            
            {/* HERO SECTION (Text) */}
            <div className="space-y-8 min-h-[80vh] flex flex-col justify-center">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-neon-blue tracking-[0.2em] text-xs font-bold uppercase"
              >
                AI-Powered Insurance Intelligence
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.1] tracking-tight">
                Your Insurance. <br />
                <span className="text-neon-blue">Finally Understood.</span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg text-muted max-w-lg leading-relaxed font-light"
              >
                PolicyLedger uses AI to decode your insurance policy, explain your coverage and estimate your treatment costs — so you're never left guessing.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-wrap items-center gap-8 pt-4"
              >
                <Link to="/login" className="neon-button">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
                
                <button className="flex items-center gap-3 text-text hover:text-neon-blue transition-colors font-medium">
                  Learn More <Play className="w-5 h-5" fill="currentColor" />
                </button>
              </motion.div>
            </div>

            {/* HOW IT WORKS SECTION */}
            <div className="min-h-screen py-32 space-y-24">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold">How it works</h2>
                <p className="text-muted text-lg">Three simple steps to financial clarity.</p>
              </div>

              <div className="space-y-16">
                <div className="flex gap-6 items-start group">
                  <div className="w-16 h-16 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neon-blue group-hover:bg-neon-blue/20 group-hover:border-neon-blue/50 transition-all">
                    <Search className="w-7 h-7" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <h3 className="text-2xl font-semibold">1. Upload your policy</h3>
                    <p className="text-muted leading-relaxed max-w-md">Securely drop in your PDF. Our AI instantly extracts the exact coverage terms, sub-limits, deductibles, and hidden exclusions.</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start group">
                  <div className="w-16 h-16 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neon-blue group-hover:bg-neon-blue/20 group-hover:border-neon-blue/50 transition-all">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <h3 className="text-2xl font-semibold">2. Ask any question</h3>
                    <p className="text-muted leading-relaxed max-w-md">Chat with your document. Ask "Is robotic surgery covered?" and get an instant answer backed by a direct citation to the page and clause.</p>
                  </div>
                </div>

                <div className="flex gap-6 items-start group">
                  <div className="w-16 h-16 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neon-blue group-hover:bg-neon-blue/20 group-hover:border-neon-blue/50 transition-all">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <h3 className="text-2xl font-semibold">3. Estimate treatment cost</h3>
                    <p className="text-muted leading-relaxed max-w-md">Input a diagnosis. We combine your policy rules with local hospital pricing to predict exactly what you'll pay out-of-pocket.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CALL TO ACTION */}
            <div className="py-32">
              <div className="glass-card-3d p-12 !shadow-none border-neon-blue/30 bg-neon-blue/5">
                <h2 className="text-4xl font-bold mb-6">Ready to decode your policy?</h2>
                <Link to="/login" className="inline-block neon-button w-max mt-4">
                  Start for free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
          
          {/* Right Content: Sticky 3D Floating Policy Card */}
          <div className="hidden lg:block w-1/2 relative h-[250vh]">
            <div className="sticky top-0 h-screen w-full flex items-center justify-center perspective-1000">
              
              {/* Glowing pedestal base */}
              <div className="absolute bottom-[15%] w-[400px] h-[100px] rounded-[100%] border-[2px] border-neon-blue/30 shadow-[0_0_50px_rgba(56,189,248,0.2)] bg-neon-blue/5 transform rotate-x-[60deg]">
                <div className="absolute inset-4 rounded-[100%] border border-neon-blue/50"></div>
                <div className="absolute inset-8 rounded-[100%] bg-neon-blue/20 blur-md"></div>
              </div>

              {/* The Floating Card (Animated by scroll) */}
              <motion.div 
                style={{ 
                  rotateY, 
                  rotateX, 
                  scale,
                  y: yOffset
                }}
                className="glass-card-3d w-[380px] z-10 transform-gpu"
              >
                {/* Front face content */}
                <div style={{ backfaceVisibility: 'hidden', position: 'relative', zIndex: 2 }} className="w-full h-full text-slate-800">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">INSURANCE <br/>POLICY</h2>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-8">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Policy No.</span>
                      <span className="text-slate-900 font-medium">HP-458732</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Plan</span>
                      <span className="text-slate-900 font-medium">Comprehensive Health</span>
                    </div>
                    <div className="w-full h-px bg-slate-200 mt-2"></div>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { icon: Activity, label: "Coverage" },
                      { icon: Clock, label: "Waiting Period" },
                      { icon: FileWarning, label: "Exclusions" },
                      { icon: AlertTriangle, label: "Deductible" },
                      { icon: IndianRupee, label: "Co-payment" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-slate-100 cursor-pointer transition-colors group border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors text-slate-500">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <div className="font-serif italic text-2xl text-slate-400 opacity-70">
                      Josephine
                    </div>
                  </div>
                </div>

                {/* Back face content (when rotated) */}
                <div className="absolute inset-0 bg-ink/90 rounded-2xl flex items-center justify-center border border-neon-blue/50" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', zIndex: 1 }}>
                  <div className="text-center p-8">
                    <Shield className="w-16 h-16 text-neon-blue mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Secure & Encrypted</h3>
                    <p className="text-muted text-sm">Your medical data is processed locally and never used to train external models.</p>
                  </div>
                </div>

              </motion.div>
              
            </div>
          </div>
          
        </div>
      </main>
      
      {/* Scroll indicator */}
      <div className="fixed bottom-8 left-8 flex items-center gap-4 text-sm text-muted z-50">
        <div className="w-6 h-10 rounded-full border border-white/20 flex justify-center pt-2">
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-neon-blue/80 shadow-[0_0_8px_#38BDF8]"
          ></motion.div>
        </div>
        Scroll to explore
        <div className="w-24 h-px bg-white/10 ml-2"></div>
      </div>
      
    </div>
  );
}
