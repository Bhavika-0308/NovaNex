import Nav from '../components/Nav';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSearch, MessageSquare, Calculator, PieChart, ShieldAlert, SlidersHorizontal, ArrowRight, Upload, CheckCircle, FileText, Zap, AlertTriangle, Shield } from 'lucide-react';
import { useState } from 'react';
import Logo from '../components/Logo';

/* ── Per-feature interactive mockup components ── */

// 1. Policy Extraction — animated PDF upload
function PolicyExtractionMock() {
  const [step, setStep] = useState(0);
  const steps = ['Uploading PDF…', 'Parsing clauses…', 'Extraction complete ✓'];
  const items = ['Coverage: ₹10,00,000', 'Waiting Period: 30 days', 'Deductible: ₹5,000', 'Co-pay: 10%', 'Exclusions: 14 found'];

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={() => setStep((s) => (s + 1) % 3)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon-blue/20 border border-neon-blue/40 text-neon-blue text-xs font-medium hover:bg-neon-blue/30 transition-all"
        >
          <Upload className="w-3.5 h-3.5" /> {step === 0 ? 'Upload PDF' : step === 1 ? 'Processing…' : 'Try again'}
        </button>
        <span className="text-xs text-muted">{steps[step]}</span>
      </div>
      <div className="flex-1 space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -10 }}
            animate={step === 2 ? { opacity: 1, x: 0 } : { opacity: 0.15, x: -10 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-text"
          >
            <CheckCircle className="w-3.5 h-3.5 text-neon-blue shrink-0" />
            {item}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// 2. Cited answers — fake chat Q&A
function CitedAnswersMock() {
  const [asked, setAsked] = useState(false);
  return (
    <div className="flex flex-col gap-3 w-full h-full text-xs">
      <div className="flex gap-2 justify-end">
        <div className="bg-neon-blue text-ink rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%] font-medium">
          Is maternity covered?
        </div>
        <div className="w-7 h-7 rounded-full bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center text-neon-blue font-bold shrink-0">U</div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={asked ? { opacity: 1, y: 0 } : {}}
        className="flex gap-2"
      >
        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neon-blue shrink-0">
          <Shield className="w-4 h-4" />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%] text-text leading-relaxed">
          Yes, maternity is covered after a <span className="text-neon-blue font-medium">9-month waiting period</span>.
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/30 border border-white/10 text-muted text-[10px]">
            <FileText className="w-3 h-3" /> Page 12, Section 5.3
          </div>
        </div>
      </motion.div>
      {!asked && (
        <button
          onClick={() => setAsked(true)}
          className="mt-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs hover:bg-neon-blue/20 transition-all self-start"
        >
          <Zap className="w-3 h-3" /> Ask question
        </button>
      )}
    </div>
  );
}

// 3. Cost Estimation — animated cost bar
function CostEstimationMock() {
  const [diagnosis, setDiagnosis] = useState('');
  const [shown, setShown] = useState(false);
  return (
    <div className="flex flex-col gap-3 w-full h-full text-xs">
      <div className="flex gap-2">
        <input
          type="text"
          value={diagnosis}
          onChange={(e) => { setDiagnosis(e.target.value); setShown(false); }}
          placeholder="Enter diagnosis (e.g. Appendectomy)"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-text placeholder:text-muted/50 focus:outline-none focus:border-neon-blue/50 text-xs"
        />
        <button
          onClick={() => { if (diagnosis.trim()) setShown(true); }}
          className="px-3 py-2 rounded-lg bg-neon-blue/20 border border-neon-blue/40 text-neon-blue hover:bg-neon-blue/30 transition-all"
        >
          <Calculator className="w-3.5 h-3.5" />
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={shown ? { opacity: 1 } : { opacity: 0 }}
        className="flex-1 flex flex-col gap-2"
      >
        <div className="flex justify-between text-muted"><span>Estimated Bill</span><span className="text-text font-semibold">₹1,20,000</span></div>
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={shown ? { width: '72%' } : { width: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-neon-blue to-cyan-400"
          />
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-neon-blue">Covered: ₹86,400 (72%)</span>
          <span className="text-orange-400">You Pay: ₹33,600</span>
        </div>
      </motion.div>
    </div>
  );
}

// 4. Covered vs out-of-pocket — donut chart
function CoveredVsOutMock() {
  const [hovered, setHovered] = useState<null | 'covered' | 'oop'>(null);
  const covered = 72, oop = 28;
  const r = 40, cx = 60, cy = 60;
  const circ = 2 * Math.PI * r;
  const coveredDash = (covered / 100) * circ;
  const oopDash = (oop / 100) * circ;

  return (
    <div className="flex gap-6 items-center w-full h-full">
      <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        {/* OOP segment */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={hovered === 'oop' ? '#fb923c' : '#f97316'}
          strokeWidth={hovered === 'oop' ? 16 : 14}
          strokeDasharray={`${oopDash} ${circ}`}
          strokeDashoffset={-coveredDash}
          strokeLinecap="round"
          style={{ transition: 'all 0.3s', transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
        />
        {/* Covered segment */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={hovered === 'covered' ? '#67e8f9' : '#38bdf8'}
          strokeWidth={hovered === 'covered' ? 16 : 14}
          strokeDasharray={`${coveredDash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'all 0.3s', transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
        />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">72%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="8">covered</text>
      </svg>
      <div className="flex-1 space-y-3 text-xs">
        <div
          onMouseEnter={() => setHovered('covered')}
          onMouseLeave={() => setHovered(null)}
          className="flex items-center gap-2 cursor-default p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-neon-blue shrink-0" />
          <div>
            <div className="text-text font-medium">Policy Pays</div>
            <div className="text-neon-blue">₹86,400</div>
          </div>
        </div>
        <div
          onMouseEnter={() => setHovered('oop')}
          onMouseLeave={() => setHovered(null)}
          className="flex items-center gap-2 cursor-default p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0" />
          <div>
            <div className="text-text font-medium">Out-of-Pocket</div>
            <div className="text-orange-400">₹33,600 · Room limit applied</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Confidence flags — toggle flags
function ConfidenceFlagsMock() {
  const [flags, setFlags] = useState({ policyDate: false, roomType: false });
  const confidence = flags.policyDate && flags.roomType ? 97 : flags.policyDate || flags.roomType ? 74 : 41;
  const color = confidence >= 90 ? 'text-green-400' : confidence >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex flex-col gap-4 w-full h-full text-xs">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.3 }}
          key={confidence}
          className={`text-3xl font-bold ${color}`}
        >{confidence}%</motion.div>
        <div className="text-muted text-[10px] mt-0.5">Confidence Score</div>
      </div>
      <div className="space-y-2">
        {[
          { key: 'policyDate', label: 'Policy Inception Date', flag: flags.policyDate },
          { key: 'roomType', label: 'Room Type Selected', flag: flags.roomType },
        ].map(({ key, label, flag }) => (
          <button
            key={key}
            onClick={() => setFlags(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${flag ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
          >
            {flag ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
            {label}
            <span className="ml-auto text-[10px] opacity-60">{flag ? 'Provided' : 'Missing – click to add'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 6. Live Refinement — slider
function LiveRefinementMock() {
  const rooms = ['General Ward', 'Semi-Private', 'Single Private', 'Suite'];
  const costs = [18000, 26000, 38000, 65000];
  const covered = [18000, 22000, 22000, 22000];
  const [idx, setIdx] = useState(2);

  return (
    <div className="flex flex-col gap-4 w-full h-full text-xs">
      <div className="space-y-1">
        <div className="flex justify-between text-muted"><span>Room Type</span><span className="text-neon-blue font-medium">{rooms[idx]}</span></div>
        <input
          type="range" min={0} max={3} step={1} value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          className="w-full accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-muted/60">
          {rooms.map(r => <span key={r}>{r.split(' ')[0]}</span>)}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted">Total Bill</span>
          <motion.span key={costs[idx]} animate={{ scale: [1.1, 1] }} className="text-text font-semibold">
            ₹{costs[idx].toLocaleString()}
          </motion.span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            animate={{ width: `${(covered[idx] / costs[idx]) * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full rounded-full bg-gradient-to-r from-neon-blue to-cyan-400"
          />
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-neon-blue">Covered: ₹{covered[idx].toLocaleString()}</span>
          <span className={costs[idx] > covered[idx] ? 'text-orange-400' : 'text-green-400'}>
            OOP: ₹{(costs[idx] - covered[idx]).toLocaleString()}
          </span>
        </div>
        {idx >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400"
          >
            <AlertTriangle className="w-3 h-3 shrink-0" />
            Room exceeds daily limit of ₹3,000
          </motion.div>
        )}
      </div>
    </div>
  );
}

const featureMocks = [
  PolicyExtractionMock,
  CitedAnswersMock,
  CostEstimationMock,
  CoveredVsOutMock,
  ConfidenceFlagsMock,
  LiveRefinementMock,
];

const features = [
  {
    title: "Policy extraction",
    description: "Upload any standard health insurance policy PDF. InsureSight automatically reads and categorizes your coverage rules, eligibility criteria, waiting periods, deductibles, sub-limits, and named exclusions.",
    icon: FileSearch,
    align: "left"
  },
  {
    title: "Cited, conversational answers",
    description: "Ask plain-language questions like 'Are maternity expenses covered?' Every response is strictly tethered to your document. InsureSight provides the answer along with a distinct, clickable citation.",
    icon: MessageSquare,
    align: "right"
  },
  {
    title: "Treatment cost estimation",
    description: "Go beyond abstract rules. Input a diagnosis or treatment name, and InsureSight combines your policy's terms with a structured dataset of typical localized medical costs to project your likely hospital bill.",
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
              From parsing dense legal clauses to projecting actual hospital bills, discover how InsureSight brings transparency to your health insurance.
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
              const MockComponent = featureMocks[idx];
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

                  {/* Interactive Mockup Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30, rotateY: isRight ? -15 : 15, rotateX: 10 }}
                    whileInView={{ opacity: 1, y: 0, rotateY: 0, rotateX: 0 }}
                    whileHover={{ scale: 1.02 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 w-full perspective-1000"
                  >
                    <div className="aspect-[4/3] rounded-2xl p-0 flex flex-col relative overflow-hidden group shadow-[0_0_40px_rgba(56,189,248,0.08)] border border-white/10 bg-white/5 backdrop-blur-md">

                      {/* Window chrome bar */}
                      <div className="w-full h-10 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2 shrink-0">
                        <div className="w-3 h-3 rounded-full bg-red-400/60"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400/60"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400/60"></div>
                        <span className="ml-3 text-[10px] text-muted/60 font-mono">insuresight · {feat.title}</span>
                      </div>

                      {/* Ambient glow */}
                      <div className="absolute -top-10 -right-10 w-48 h-48 bg-neon-blue/15 blur-[50px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

                      {/* Interactive content */}
                      <div className="flex-1 p-5 overflow-hidden flex flex-col">
                        <MockComponent />
                      </div>

                      {/* Bottom shimmer line */}
                      <div className="absolute bottom-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-blue/60 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
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
            <Logo size={20} />
            <span className="font-bold text-text">InsureSight</span>
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
