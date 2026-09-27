import Nav from '../components/Nav';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSearch, MessageSquare, Calculator, PieChart, ShieldAlert, SlidersHorizontal, ArrowRight } from 'lucide-react';

const features = [
  {
    title: "Policy extraction",
    description: "Upload any standard health insurance policy PDF. PolicyLedger automatically reads and categorizes your coverage rules, eligibility criteria, waiting periods, deductibles, sub-limits, and named exclusions.",
    icon: FileSearch,
    align: "left"
  },
  {
    title: "Cited, conversational answers",
    description: "Ask plain-language questions like 'Are maternity expenses covered?' Every response is strictly tethered to your document. PolicyLedger provides the answer along with a distinct, clickable citation.",
    icon: MessageSquare,
    align: "right"
  },
  {
    title: "Treatment cost estimation",
    description: "Go beyond abstract rules. Input a diagnosis or treatment name, and PolicyLedger combines your policy's terms with a structured dataset of typical localized medical costs to project your likely hospital bill.",
    icon: Calculator,
    align: "left"
  },
  {
    title: "Covered vs. out-of-pocket",
    description: "The estimated cost is split into exactly what the policy is likely to pay and your remaining financial liability. We clearly explain the driving factors, such as 'room choice exceeded the daily limit' or 'co-pay applied'.",
    icon: PieChart,
    align: "right"
  },
  {
    title: "Confidence flags",
    description: "We never guess. If crucial information like your policy inception date or specific room type is missing, the system states its confidence level and names the missing inputs required for a precise calculation.",
    icon: ShieldAlert,
    align: "left"
  },
  {
    title: "Live refinement",
    description: "Update the scenario on the fly. Change your room category from 'Suite' to 'Single Private' and watch the estimate and confidence level update instantly, allowing you to make informed decisions before admission.",
    icon: SlidersHorizontal,
    align: "right"
  }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-ink font-sans text-text overflow-hidden relative">
      {/* Background ambient light */}
      <div className="fixed top-[20%] left-[-10%] w-[800px] h-[800px] bg-neon-blue/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      <Nav />
      
      <main className="relative z-10">
        {/* Header */}
        <section className="max-w-4xl mx-auto px-6 pt-32 pb-20 text-center space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-neon-blue tracking-[0.2em] text-xs font-bold uppercase mb-4">Capabilities</div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">Every rule and limit, <span className="text-neon-blue">calculated.</span></h1>
            <p className="text-xl text-muted leading-relaxed mt-6 max-w-2xl mx-auto font-light">
              From parsing dense legal clauses to projecting actual hospital bills, discover how PolicyLedger brings transparency to your health insurance.
            </p>
          </motion.div>
        </section>

        {/* Feature Sections with connecting line */}
        <section className="max-w-6xl mx-auto px-6 py-12 relative mb-32">
          
          {/* The glowing vertical line down the middle (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-neon-blue/50 to-transparent -translate-x-1/2"></div>

          <div className="space-y-32">
            {features.map((feat, idx) => {
              const isRight = feat.align === 'right';
              return (
                <div key={idx} className={`flex flex-col lg:flex-row items-center gap-16 relative ${isRight ? 'lg:flex-row-reverse' : ''}`}>
                  
                  {/* Timeline dot */}
                  <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ink border-2 border-neon-blue items-center justify-center z-10 shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                    <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
                  </div>

                  {/* Text Block */}
                  <motion.div 
                    initial={{ opacity: 0, x: isRight ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
                    className={`flex-1 space-y-6 ${isRight ? 'lg:pl-16' : 'lg:pr-16 text-left'}`}
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neon-blue/10 border border-neon-blue/30 text-neon-blue mb-2 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">{feat.title}</h2>
                    <p className="text-lg text-muted leading-relaxed font-light">
                      {feat.description}
                    </p>
                  </motion.div>

                  {/* Animated Mockup Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30, rotateY: isRight ? -15 : 15, rotateX: 10 }}
                    whileInView={{ opacity: 1, y: 0, rotateY: 0, rotateX: 0 }}
                    whileHover={{ scale: 1.02, rotateY: isRight ? 5 : -5 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 w-full perspective-1000"
                  >
                    <div className="aspect-[4/3] rounded-2xl p-8 flex flex-col relative overflow-hidden group shadow-[0_0_40px_rgba(56,189,248,0.05)] border border-white/5 bg-white/5 backdrop-blur-md">
                      
                      {/* Decorative ambient glow inside card */}
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-blue/20 blur-[60px] rounded-full pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
                      
                      <div className="absolute top-0 left-0 w-full h-12 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-white/20"></div>
                        <div className="w-3 h-3 rounded-full bg-white/20"></div>
                        <div className="w-3 h-3 rounded-full bg-white/20"></div>
                      </div>
                      
                      <div className="mt-8 flex-1 flex flex-col items-center justify-center border border-dashed border-neon-blue/30 rounded-xl bg-neon-blue/5 text-neon-blue relative overflow-hidden group-hover:bg-neon-blue/10 transition-colors">
                        <feat.icon className="w-12 h-12 mb-4 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                        <span className="font-medium tracking-wide">Interactive Component</span>
                        <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                      </div>
                    </div>
                  </motion.div>
                  
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Band */}
        <section className="max-w-5xl mx-auto px-6 pb-32 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-16 border border-neon-blue/30 bg-gradient-to-br from-neon-blue/10 to-transparent shadow-[0_0_50px_rgba(56,189,248,0.1)] relative overflow-hidden"
          >
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-neon-blue/20 blur-[80px] rounded-full pointer-events-none"></div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 relative z-10 text-white tracking-tight">Stop guessing your medical bills.</h2>
            <p className="text-xl text-muted max-w-xl mx-auto font-light mb-10 relative z-10">
              Get clarity on your coverage in minutes, not days.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
              <Link to="/login" className="neon-button justify-center">
                Upload your policy <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/dashboard" className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/5 hover:border-white/40 transition-all font-medium flex items-center justify-center gap-2">
                Try sample policy
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-ink/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-neon-blue"></div>
            <span className="font-bold text-text">PolicyLedger</span>
            <span className="opacity-50">— Insurance Intelligence</span>
          </div>
          <div className="text-xs text-muted/60">
            Estimates are illustrative and not a claim decision.
          </div>
        </div>
      </footer>
    </div>
  );
}
