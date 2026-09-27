import Nav from '../components/Nav';
import { BlurText } from '../components/BlurText';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Shield, Activity, Clock, AlertTriangle, IndianRupee, FileWarning, Search, Zap, CheckCircle, Lock } from 'lucide-react';
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
          <div className="w-full lg:w-1/2 pb-12">
            
            {/* HERO SECTION (Text) */}
            <div className="space-y-8 min-h-[80vh] flex flex-col justify-center">

              
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
            <div className="py-12 space-y-24">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <BlurText text="How it works" className="text-4xl font-bold" />
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-muted text-lg"
                >
                  Three simple steps to financial clarity.
                </motion.p>
              </motion.div>

              <div className="space-y-16">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex gap-6 items-start group"
                >
                  <div className="w-16 h-16 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neon-blue group-hover:bg-neon-blue/20 group-hover:border-neon-blue/50 group-hover:scale-110 transition-all duration-300 shadow-[0_0_0_rgba(56,189,248,0)] group-hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                    <Search className="w-7 h-7" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <h3 className="text-2xl font-semibold">1. Upload your policy</h3>
                    <p className="text-muted leading-relaxed max-w-md">Securely drop in your PDF. Our AI instantly extracts the exact coverage terms, sub-limits, deductibles, and hidden exclusions.</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex gap-6 items-start group"
                >
                  <div className="w-16 h-16 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neon-blue group-hover:bg-neon-blue/20 group-hover:border-neon-blue/50 group-hover:scale-110 transition-all duration-300 shadow-[0_0_0_rgba(56,189,248,0)] group-hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <h3 className="text-2xl font-semibold">2. Ask any question</h3>
                    <p className="text-muted leading-relaxed max-w-md">Chat with your document. Ask "Is robotic surgery covered?" and get an instant answer backed by a direct citation to the page and clause.</p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex gap-6 items-start group"
                >
                  <div className="w-16 h-16 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neon-blue group-hover:bg-neon-blue/20 group-hover:border-neon-blue/50 group-hover:scale-110 transition-all duration-300 shadow-[0_0_0_rgba(56,189,248,0)] group-hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-3 pt-2">
                    <h3 className="text-2xl font-semibold">3. Estimate treatment cost</h3>
                    <p className="text-muted leading-relaxed max-w-md">Input a diagnosis. We combine your policy rules with local hospital pricing to predict exactly what you'll pay out-of-pocket.</p>
                  </div>
                </motion.div>
              </div>
            </div>

          </div>

          {/* Right Content: Sticky 3D Floating Policy Card */}
          <div className="hidden lg:block w-1/2 relative h-auto">
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

        {/* FULL WIDTH SECTIONS BELOW SCROLL BLOCK */}
        <div className="max-w-6xl mx-auto pb-32">
          {/* BENTO BOX CAPABILITIES SECTION */}
          <div className="py-24 space-y-12">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-4 text-center"
            >
              <BlurText text="Built for clarity" className="text-4xl font-bold" />
              <p className="text-muted text-lg">Everything you need to navigate your healthcare.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Bento Card 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 blur-[40px] rounded-full group-hover:bg-neon-blue/20 transition-colors"></div>
                <FileWarning className="w-8 h-8 text-neon-blue mb-6" />
                <h3 className="text-xl font-bold mb-3">Exclusion Detection</h3>
                <p className="text-muted text-sm leading-relaxed">Our AI automatically flags named exclusions like cosmetic surgeries or non-medical consumables so you aren't blindsided by rejected claims.</p>
              </motion.div>

              {/* Bento Card 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group relative overflow-hidden"
              >
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-neon-blue/10 blur-[40px] rounded-full group-hover:bg-neon-blue/20 transition-colors"></div>
                <Clock className="w-8 h-8 text-neon-blue mb-6" />
                <h3 className="text-xl font-bold mb-3">Waiting Period Tracking</h3>
                <p className="text-muted text-sm leading-relaxed">Instantly know if your pre-existing conditions or specific treatments (like maternity) have cleared their mandatory waiting periods.</p>
              </motion.div>

              {/* Bento Card 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 blur-[40px] rounded-full group-hover:bg-neon-blue/20 transition-colors"></div>
                <Activity className="w-8 h-8 text-neon-blue mb-6" />
                <h3 className="text-xl font-bold mb-3">Live Scenario Testing</h3>
                <p className="text-muted text-sm leading-relaxed">Change room types or surgical methods on the fly and watch your out-of-pocket estimates adjust in real time.</p>
              </motion.div>

              {/* Bento Card 4 (Full Width) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-8 hover:border-neon-blue/30 transition-colors group relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
              >
                <div className="flex-1 space-y-4 relative z-10">
                  <Shield className="w-8 h-8 text-neon-blue mb-4" />
                  <h3 className="text-xl font-bold">Absolute Data Privacy</h3>
                  <p className="text-muted text-sm leading-relaxed max-w-md">Your health and financial data is strictly confidential. Documents are processed using zero-retention infrastructure and are never used to train external AI models.</p>
                </div>
                <div className="w-full md:w-1/3 h-32 rounded-xl bg-ink/50 border border-white/5 flex items-center justify-center relative z-10 shadow-inner">
                  <div className="flex items-center gap-3 text-neon-blue font-mono text-sm">
                    <Lock className="w-4 h-4" />
                    Encrypted Workspace
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

          {/* CALL TO ACTION */}
          <div className="py-24 max-w-4xl mx-auto text-center">
            <div className="rounded-3xl p-16 border border-neon-blue/30 bg-gradient-to-br from-neon-blue/20 to-transparent shadow-[0_0_50px_rgba(56,189,248,0.15)] relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-neon-blue/30 blur-[80px] rounded-full pointer-events-none"></div>
              
              <h2 className="text-4xl lg:text-5xl font-bold mb-8 relative z-10 text-white tracking-tight">Ready to decode your policy?</h2>
              <Link to="/login" className="inline-flex neon-button relative z-10 text-lg px-8 py-4">
                Start for free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
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
