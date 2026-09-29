import Nav from '../components/Nav';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSearch, MessageSquare, Calculator, PieChart, ShieldAlert, SlidersHorizontal, ArrowRight, Upload, FileText, Zap, AlertTriangle, Shield, CheckCircle2, Brain, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Logo from '../components/Logo';

/* ── Per-feature interactive mockup components ── */

// 1. Policy Extraction — animated PDF upload
function PolicyExtractionMock() {
  const [step, setStep] = useState(0);
  const steps = ['Uploading PDF…', 'Parsing clauses…', 'Extraction complete ✓'];
  const items = ['Coverage: ₹10,00,000', 'Waiting Period: 30 days', 'Deductible: ₹5,000', 'Co-pay: 10%', 'Exclusions: 14 found'];

  return (
    <div className="flex flex-col gap-4 w-full h-full font-sans">
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={() => setStep((s) => (s + 1) % 3)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-electric text-white text-sm font-semibold hover:bg-brand-bright transition-all shadow-sm focus-ring"
        >
          <Upload className="w-4 h-4" /> {step === 0 ? 'Upload PDF' : step === 1 ? 'Processing…' : 'Try again'}
        </button>
        <span className="text-sm text-text-muted font-medium">{steps[step]}</span>
      </div>
      <div className="flex-1 space-y-2.5">
        {items.map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -10 }}
            animate={step === 2 ? { opacity: 1, x: 0 } : { opacity: 0.15, x: -10 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl glass-panel border border-border-subtle text-sm text-text-primary shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
          >
            <CheckCircle2 className="w-4 h-4 text-brand-ai-cyan shrink-0" />
            <span className="font-medium">{item}</span>
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
    <div className="flex flex-col gap-4 w-full h-full text-sm font-sans">
      <div className="flex gap-3 justify-end">
        <div className="bg-canvas-white text-text-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] font-medium shadow-sm border border-border-subtle/50">
          Is maternity covered?
        </div>
        <div className="w-8 h-8 rounded-full bg-brand-electric/10 border border-brand-electric/20 flex items-center justify-center text-brand-electric font-bold shrink-0">U</div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={asked ? { opacity: 1, y: 0 } : {}}
        className="flex gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-brand-ai-purple/10 border border-brand-ai-purple/20 flex items-center justify-center text-brand-ai-purple shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.15)]">
          <Shield className="w-4 h-4" />
        </div>
        <div className="glass-panel-dark border border-canvas-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-text-inverse leading-relaxed shadow-sm">
          Yes, maternity is covered after a <span className="text-brand-ai-cyan font-semibold">9-month waiting period</span>.
          <div tabIndex={0} className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-deep-navy border border-brand-ai-cyan/20 text-brand-ai-cyan text-xs font-medium cursor-pointer hover:bg-brand-ai-cyan/10 transition-colors focus-ring-dark">
            <FileText className="w-3.5 h-3.5" /> Page 12, Section 5.3
          </div>
        </div>
      </motion.div>
      {!asked && (
        <button
          onClick={() => setAsked(true)}
          className="mt-auto flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-ai-cyan/10 border border-brand-ai-cyan/30 text-brand-ai-cyan text-sm font-semibold hover:bg-brand-ai-cyan/20 transition-all self-start shadow-[0_0_20px_rgba(6,182,212,0.1)] focus-ring-dark"
        >
          <Zap className="w-4 h-4" /> Ask question
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
    <div className="flex flex-col gap-4 w-full h-full text-sm font-sans">
      <div className="flex gap-2">
        <input
          type="text"
          value={diagnosis}
          onChange={(e) => { setDiagnosis(e.target.value); setShown(false); }}
          placeholder="Enter diagnosis (e.g. Appendectomy)"
          className="flex-1 bg-canvas-white border border-border-subtle rounded-xl px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-electric focus:ring-2 focus:ring-brand-electric/20 shadow-sm transition-all"
        />
        <button
          onClick={() => { if (diagnosis.trim()) setShown(true); }}
          className="px-4 py-2.5 rounded-xl bg-brand-electric text-white hover:bg-brand-bright transition-all font-semibold shadow-[0_4px_12px_rgba(37,99,235,0.2)] focus-ring"
        >
          <Calculator className="w-4 h-4" />
        </button>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={shown ? { opacity: 1 } : { opacity: 0 }}
        className="flex-1 flex flex-col gap-3 mt-2"
      >
        <div className="flex justify-between items-center text-text-muted font-medium"><span>Estimated Bill</span><span className="text-text-primary font-bold text-lg font-mono">₹1,20,000</span></div>
        <div className="w-full h-3.5 rounded-full bg-canvas-light overflow-hidden border border-border-subtle/50 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={shown ? { width: '72%' } : { width: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-status-covered shadow-[0_0_10px_rgba(22,163,74,0.5)]"
          />
        </div>
        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
          <span className="text-status-covered">Covered: ₹86,400 (72%)</span>
          <span className="text-status-oop">You Pay: ₹33,600</span>
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
    <div className="flex gap-8 items-center w-full h-full font-sans">
      <svg width="140" height="140" viewBox="0 0 120 120" className="shrink-0 drop-shadow-md">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth="12" />
        {/* OOP segment */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={hovered === 'oop' ? '#DC2626' : '#EF4444'}
          strokeWidth={hovered === 'oop' ? 14 : 12}
          strokeDasharray={`${oopDash} ${circ}`}
          strokeDashoffset={-coveredDash}
          strokeLinecap="round"
          style={{ transition: 'all 0.3s', transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
        />
        {/* Covered segment */}
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={hovered === 'covered' ? '#15803d' : '#16A34A'}
          strokeWidth={hovered === 'covered' ? 14 : 12}
          strokeDasharray={`${coveredDash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'all 0.3s', transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
        />
        <text x={cx} y={cy - 2} textAnchor="middle" fill="#0B1020" fontSize="16" fontWeight="800">72%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600" className="uppercase tracking-widest">covered</text>
      </svg>
      <div className="flex-1 space-y-4 text-sm">
        <div
          onMouseEnter={() => setHovered('covered')}
          onMouseLeave={() => setHovered(null)}
          className="flex items-center gap-3 cursor-default p-3 rounded-xl hover:bg-canvas-white transition-colors border border-transparent hover:border-border-subtle"
        >
          <div className="w-3 h-3 rounded-full bg-status-covered shrink-0 shadow-[0_0_8px_rgba(22,163,74,0.5)]" />
          <div>
            <div className="text-text-primary font-bold">Policy Pays</div>
            <div className="text-status-covered font-mono font-medium mt-0.5">₹86,400</div>
          </div>
        </div>
        <div
          onMouseEnter={() => setHovered('oop')}
          onMouseLeave={() => setHovered(null)}
          className="flex items-center gap-3 cursor-default p-3 rounded-xl hover:bg-canvas-white transition-colors border border-transparent hover:border-border-subtle"
        >
          <div className="w-3 h-3 rounded-full bg-status-oop shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
          <div>
            <div className="text-text-primary font-bold">Out-of-Pocket</div>
            <div className="text-status-oop font-mono font-medium mt-0.5">₹33,600 <span className="text-text-muted text-xs font-sans ml-1">· Room limit</span></div>
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
  const color = confidence >= 90 ? 'text-status-covered' : confidence >= 60 ? 'text-status-warning' : 'text-status-oop';
  const label = confidence >= 90 ? 'High Confidence' : confidence >= 60 ? 'Moderate Confidence' : 'Needs Review';

  return (
    <div className="flex flex-col gap-6 w-full h-full text-sm font-sans">
      <div className="text-center bg-canvas-white p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.3 }}
          key={confidence}
          className={`text-4xl font-extrabold font-mono ${color}`}
        >{confidence}%</motion.div>
        <div className={`font-bold mt-1 ${color}`}>{label}</div>
        <div className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Confidence Score</div>
      </div>
      <div className="space-y-3">
        {[
          { key: 'policyDate', label: 'Policy Inception Date', flag: flags.policyDate },
          { key: 'roomType', label: 'Room Type Selected', flag: flags.roomType },
        ].map(({ key, label, flag }) => (
          <button
            key={key}
            onClick={() => setFlags(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all shadow-sm font-medium focus-ring ${flag ? 'bg-status-covered/10 border-status-covered/30 text-status-covered' : 'bg-status-oop/10 border-status-oop/30 text-status-oop'}`}
          >
            {flag ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            {label}
            <span className="ml-auto text-[10px] uppercase tracking-wider opacity-70 font-bold">{flag ? 'Provided' : 'Missing'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 6. Live Refinement — slider
function LiveRefinementMock() {
  const rooms = ['General', 'Semi', 'Single', 'Suite'];
  const costs = [18000, 26000, 38000, 65000];
  const covered = [18000, 22000, 22000, 22000];
  const [idx, setIdx] = useState(2);

  return (
    <div className="flex flex-col gap-6 w-full h-full text-sm font-sans">
      <div className="space-y-3 bg-canvas-white p-4 rounded-2xl border border-border-subtle shadow-sm">
        <div className="flex justify-between items-center text-text-muted font-semibold"><span>Room Category</span><span className="text-brand-electric font-bold px-2.5 py-1 bg-brand-electric/10 rounded-lg">{rooms[idx]}</span></div>
        <input
          type="range" min={0} max={3} step={1} value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          className="w-full accent-brand-electric cursor-pointer h-2 bg-canvas-light rounded-lg appearance-none outline-none focus-ring"
        />
        <div className="flex justify-between text-xs text-text-muted/70 font-medium">
          {rooms.map(r => <span key={r}>{r}</span>)}
        </div>
      </div>
      <div className="space-y-3 px-2">
        <div className="flex justify-between items-center">
          <span className="text-text-muted font-medium">Total Bill</span>
          <motion.span key={costs[idx]} animate={{ scale: [1.1, 1] }} className="text-text-primary font-bold font-mono text-lg">
            ₹{costs[idx].toLocaleString()}
          </motion.span>
        </div>
        <div className="w-full h-3 rounded-full bg-canvas-light overflow-hidden border border-border-subtle/50 shadow-inner">
          <motion.div
            animate={{ width: `${(covered[idx] / costs[idx]) * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full rounded-full bg-status-covered shadow-[0_0_8px_rgba(22,163,74,0.5)]"
          />
        </div>
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-status-covered">Covered: ₹{covered[idx].toLocaleString()}</span>
          <span className={costs[idx] > covered[idx] ? 'text-status-oop' : 'text-status-covered'}>
            OOP: ₹{(costs[idx] - covered[idx]).toLocaleString()}
          </span>
        </div>
        {idx >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2.5 mt-2 rounded-xl bg-status-oop/10 border border-status-oop/20 text-status-oop font-medium text-xs shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Room exceeds daily limit of ₹3,000
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <div className="min-h-screen bg-canvas-light font-sans text-text-primary overflow-hidden relative">
      <Nav />
      <main className="relative z-10">
        
        {/* 1. CAPABILITY LAB HERO */}
        <section className="max-w-[1300px] mx-auto px-6 pt-32 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-electric/10 border border-brand-electric/20 text-brand-electric text-xs font-bold uppercase tracking-widest">
                <Sparkles className="w-4 h-4" /> Capability Lab
              </div>
              <h1 className="text-5xl lg:text-[4rem] font-extrabold tracking-tight leading-[1.1]">
                Every rule and limit, <span className="text-brand-electric">calculated.</span>
              </h1>
              <p className="text-lg lg:text-xl text-text-secondary leading-relaxed font-medium max-w-xl">
                NovaNex takes complex insurance information and turns it into clear, grounded, actionable understanding. Discover how we bring transparency to healthcare.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/login" className="px-8 py-3.5 rounded-xl bg-brand-electric text-canvas-white font-bold hover:bg-brand-bright transition-all shadow-[0_4px_14px_rgba(37,99,235,0.3)] flex items-center gap-2 focus-ring">
                  Upload your policy <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
            
            {/* Hero Interactive Visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative perspective-1000"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-electric/20 via-brand-ai-cyan/20 to-brand-ai-purple/20 blur-[100px] -z-10 rounded-full" />
              <div className="w-full aspect-[4/3] rounded-[28px] border border-canvas-white glass-panel shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-6 flex flex-col relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-ai-cyan/10 flex items-center justify-center text-brand-ai-cyan">
                    <FileSearch className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-text-primary">NovaNex Analysis</div>
                    <div className="text-xs font-medium text-text-muted">Policy Document Processing</div>
                  </div>
                </div>
                <div className="flex-1 bg-canvas-white rounded-xl border border-border-subtle/50 shadow-sm p-4 relative">
                  <div className="w-3/4 h-3 bg-canvas-light rounded mb-3" />
                  <div className="w-full h-3 bg-canvas-light rounded mb-3" />
                  <div className="w-5/6 h-3 bg-canvas-light rounded mb-3" />
                  <div className="mt-6 p-3 rounded-lg bg-brand-electric/5 border border-brand-electric/20 relative">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-brand-electric text-canvas-white flex items-center justify-center shadow-md">
                      <Zap className="w-3 h-3" />
                    </div>
                    <div className="ml-4">
                      <div className="text-xs font-bold text-brand-electric uppercase tracking-wider mb-1">Extracted Clause</div>
                      <div className="text-sm font-medium text-text-primary">Room Rent Limit: 1% of Sum Insured</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. FROM POLICY TO CLARITY / WORKFLOW */}
        <section className="bg-canvas-white py-24 border-y border-border-subtle">
          <div className="max-w-[1300px] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">From Policy to Clarity</h2>
              <p className="text-text-secondary font-medium">The NovaNex Document Understanding Workflow</p>
            </div>
            
            <div className="flex flex-col lg:flex-row justify-between items-start relative">
              {/* Connector Line */}
              <div className="hidden lg:block absolute top-[28px] left-[40px] right-[40px] h-0.5 bg-canvas-light" />
              
              {[
                { step: '01', title: 'Document', icon: FileText },
                { step: '02', title: 'Extraction', icon: FileSearch },
                { step: '03', title: 'Understanding', icon: Brain },
                { step: '04', title: 'Estimation', icon: Calculator },
                { step: '05', title: 'Clarity', icon: CheckCircle2 }
              ].map((item) => (
                <div key={item.step} className="relative flex lg:flex-col items-center gap-6 lg:gap-4 w-full lg:w-auto mb-8 lg:mb-0 z-10 group">
                  <div className="w-14 h-14 rounded-2xl bg-canvas-white border-2 border-border-subtle flex items-center justify-center text-text-secondary group-hover:border-brand-electric group-hover:text-brand-electric transition-colors shadow-sm">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="lg:text-center flex-1">
                    <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Step {item.step}</div>
                    <div className="font-bold text-text-primary">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. POLICY EXTRACTION SHOWCASE */}
        <section className="max-w-[1300px] mx-auto px-6 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
               <div className="aspect-[4/3] rounded-[24px] border border-border-subtle bg-canvas-white p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
                 <PolicyExtractionMock />
               </div>
            </motion.div>
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-electric/10 text-brand-electric">
                <FileSearch className="w-6 h-6" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Policy Extraction</h2>
              <p className="text-lg text-text-secondary font-medium leading-relaxed">
                Upload any standard health insurance policy PDF. NovaNex automatically reads and categorizes your coverage rules, eligibility criteria, waiting periods, deductibles, sub-limits, and named exclusions.
              </p>
            </div>
          </div>
        </section>

        {/* 4. CITED ANSWERS / POLICY COPILOT SHOWCASE (DARK NAVY) */}
        <section className="bg-brand-deep-navy py-32 relative overflow-hidden text-canvas-light">
          <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-brand-ai-cyan/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-brand-ai-purple/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
          
          <div className="max-w-[1300px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-ai-cyan/10 border border-brand-ai-cyan/20 text-brand-ai-cyan shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-canvas-white">Cited, conversational answers</h2>
              <p className="text-lg text-text-muted font-medium leading-relaxed">
                Ask plain-language questions like "Are maternity expenses covered?" Every response is strictly tethered to your document. NovaNex provides the answer along with a distinct, clickable citation.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="aspect-[4/3] rounded-[24px] border border-canvas-white/10 glass-panel-dark p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
                 <CitedAnswersMock />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 5 & 6. COST ESTIMATION & COVERAGE BREAKDOWN */}
        <section className="max-w-[1300px] mx-auto px-6 py-32 space-y-32">
          
          {/* Estimation */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
               <div className="aspect-[4/3] rounded-[24px] border border-border-subtle bg-canvas-white p-6 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
                 <CostEstimationMock />
               </div>
            </motion.div>
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-electric/10 text-brand-electric">
                <Calculator className="w-6 h-6" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Treatment cost estimation</h2>
              <p className="text-lg text-text-secondary font-medium leading-relaxed">
                Go beyond abstract rules. Input a diagnosis or treatment name, and NovaNex combines your policy's terms with a structured dataset of typical localized medical costs to project your likely hospital bill.
              </p>
            </div>
          </div>

          {/* Coverage Breakdown */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-status-covered/10 text-status-covered">
                <PieChart className="w-6 h-6" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Covered vs. out-of-pocket</h2>
              <p className="text-lg text-text-secondary font-medium leading-relaxed">
                The estimated cost is split into exactly what the policy is likely to pay and your remaining financial liability. We clearly explain the driving factors, such as "room choice exceeded the daily limit".
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
               <div className="aspect-[4/3] rounded-[24px] border border-border-subtle bg-canvas-white p-8 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-center">
                 <CoveredVsOutMock />
               </div>
            </motion.div>
          </div>

        </section>

        {/* 7. CONFIDENCE + REFINEMENT */}
        <section className="bg-canvas-secondary py-32 border-y border-border-subtle">
          <div className="max-w-[1300px] mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Confidence & Refinement</h2>
              <p className="text-lg text-text-secondary font-medium">
                We never guess. Control the variables and watch the analysis update instantly.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-canvas-white rounded-[24px] p-8 border border-border-subtle shadow-sm flex flex-col"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-status-warning/10 flex items-center justify-center text-status-warning">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Confidence Flags</h3>
                </div>
                <div className="flex-1 flex items-center">
                  <ConfidenceFlagsMock />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-canvas-white rounded-[24px] p-8 border border-border-subtle shadow-sm flex flex-col"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-brand-electric/10 flex items-center justify-center text-brand-electric">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Live Refinement</h3>
                </div>
                <div className="flex-1 flex items-center">
                  <LiveRefinementMock />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 8. CAPABILITY SUMMARY (Compact Grid) */}
        <section className="max-w-[1300px] mx-auto px-6 py-32">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileSearch, title: 'Policy Extraction', desc: 'Automatic categorization of rules.' },
              { icon: MessageSquare, title: 'Cited Answers', desc: 'Direct references to your document.' },
              { icon: Calculator, title: 'Cost Estimation', desc: 'Real-world hospital bill projections.' },
              { icon: PieChart, title: 'Coverage Breakdown', desc: 'Clear out-of-pocket splits.' },
              { icon: ShieldAlert, title: 'Confidence', desc: 'Missing variable detection.' },
              { icon: SlidersHorizontal, title: 'Refinement', desc: 'Live scenario adjustments.' },
            ].map((cap, i) => (
              <div key={i} className="p-6 rounded-2xl bg-canvas-white border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
                <cap.icon className="w-6 h-6 text-brand-electric mb-4" />
                <h4 className="font-bold text-text-primary mb-2">{cap.title}</h4>
                <p className="text-sm text-text-secondary font-medium">{cap.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 9. FINAL CTA */}
        <section className="max-w-[1300px] mx-auto px-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[32px] p-12 lg:p-20 bg-brand-deep-navy border border-brand-electric/20 relative overflow-hidden text-center"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-electric/20 blur-[100px] rounded-full pointer-events-none" />
            
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 relative z-10 text-canvas-white tracking-tight">Stop guessing your medical bills.</h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto font-medium mb-12 relative z-10">
              Get clarity on your coverage in minutes, not days. Join NovaNex to analyze, extract, and track your health policies.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link to="/login" className="px-8 py-4 rounded-xl bg-brand-electric text-canvas-white font-bold hover:bg-brand-bright transition-all shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 focus-ring-dark">
                Upload your policy <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/dashboard" className="px-8 py-4 rounded-xl border border-canvas-white/20 text-canvas-white font-bold hover:bg-canvas-white/10 transition-all flex items-center justify-center focus-ring-dark">
                Try sample policy
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8 bg-canvas-white relative z-10">
        <div className="max-w-[1300px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted font-medium">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="font-bold text-text-primary">NovaNex</span>
            <span className="opacity-60">— Editorial Intelligence</span>
          </div>
          <div className="text-xs text-text-muted/70">
            Estimates are illustrative and not a claim decision.
          </div>
        </div>
      </footer>
    </div>
  );
}
