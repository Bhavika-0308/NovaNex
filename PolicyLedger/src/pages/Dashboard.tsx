import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, MessageSquare, Calculator, FileText, Send, Settings, LogOut,
  FileSearch, CheckCircle, AlertTriangle, Paperclip, User as UserIcon,
  Mail, ChevronDown, Sparkles, Brain, TrendingUp, Zap, Clock,
  BadgePercent, BarChart3, ScanLine
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import Logo from '../components/Logo';

/* ─────────────────────────── Types ─────────────────────────── */
interface EstimateResult {
  totalBill: number;
  covered: number;
  outOfPocket: number;
  confidence: number;
  withinLimits: boolean;
  breakdown: {
    category: string;
    estimated: number;
    youPay: number;
    covered: boolean;
    note?: string;
  }[];
  aiInsights: string[];
}

const PROCEDURES: Record<string, { baseMin: number; baseMax: number; surgeonFee: number; otFee: number }> = {
  'Appendectomy (Laparoscopic)': { baseMin: 80000, baseMax: 130000, surgeonFee: 60000, otFee: 30000 },
  'Knee Replacement (Robotic)': { baseMin: 250000, baseMax: 400000, surgeonFee: 150000, otFee: 80000 },
  'Angioplasty (Coronary)': { baseMin: 180000, baseMax: 280000, surgeonFee: 100000, otFee: 60000 },
  'Cataract Surgery (LASIK)': { baseMin: 40000, baseMax: 70000, surgeonFee: 25000, otFee: 15000 },
  'Caesarean Section': { baseMin: 70000, baseMax: 120000, surgeonFee: 50000, otFee: 25000 },
  'Spine Surgery (PLIF)': { baseMin: 220000, baseMax: 380000, surgeonFee: 130000, otFee: 70000 },
  'Cholecystectomy (Lap.)': { baseMin: 60000, baseMax: 100000, surgeonFee: 45000, otFee: 25000 },
};

const HOSPITALS: Record<string, { multiplier: number; city: string }> = {
  'Apollo Hospitals, Bangalore': { multiplier: 1.3, city: 'Bangalore' },
  'Fortis Memorial, Gurgaon': { multiplier: 1.25, city: 'Gurgaon' },
  'Narayana Health, Kolkata': { multiplier: 0.9, city: 'Kolkata' },
  'Max Super Speciality, Delhi': { multiplier: 1.2, city: 'Delhi' },
  'Manipal Hospital, Pune': { multiplier: 1.0, city: 'Pune' },
  'Kokilaben Hospital, Mumbai': { multiplier: 1.4, city: 'Mumbai' },
};

const ROOM_RATES: Record<string, { ratePerDay: number; policyLimit: number }> = {
  'Twin Sharing': { ratePerDay: 4000, policyLimit: 5000 },
  'Private Single': { ratePerDay: 8000, policyLimit: 5000 },
  'Suite': { ratePerDay: 15000, policyLimit: 5000 },
};

function computeEstimate(
  procedure: string,
  hospital: string,
  roomType: string,
  days: number
): EstimateResult {
  const proc = PROCEDURES[procedure] ?? PROCEDURES['Appendectomy (Laparoscopic)'];
  const hosp = HOSPITALS[hospital] ?? { multiplier: 1.0, city: 'City' };
  const room = ROOM_RATES[roomType] ?? ROOM_RATES['Private Single'];

  const avgBase = (proc.baseMin + proc.baseMax) / 2;
  const surgeonFee = Math.round(proc.surgeonFee * hosp.multiplier);
  const otFee = Math.round(proc.otFee * hosp.multiplier);
  const totalRoomCost = room.ratePerDay * days;
  const policyRoomLimit = room.policyLimit * days;
  const roomOutOfPocket = Math.max(0, totalRoomCost - policyRoomLimit);
  const consumables = Math.round(avgBase * 0.08 * hosp.multiplier);
  const miscFees = Math.round(avgBase * 0.04 * hosp.multiplier);
  const totalBill = Math.round(totalRoomCost + surgeonFee + otFee + consumables + miscFees);
  const coveredAmount = totalBill - roomOutOfPocket - consumables;
  const outOfPocket = totalBill - coveredAmount;
  const withinLimits = totalBill < 500000;
  const confidence = Math.round(72 + Math.random() * 18);

  const breakdown = [
    {
      category: `Room Rent (${days} Day${days > 1 ? 's' : ''})`,
      estimated: totalRoomCost,
      youPay: roomOutOfPocket,
      covered: roomOutOfPocket === 0,
      note: roomOutOfPocket > 0
        ? `Policy caps room at Rs.${room.policyLimit.toLocaleString('en-IN')}/day. You pay Rs.${(room.ratePerDay - room.policyLimit).toLocaleString('en-IN')}/day difference.`
        : undefined,
    },
    { category: 'Surgeon & Anesthetist Fees', estimated: surgeonFee, youPay: 0, covered: true },
    { category: 'OT & Equipment Charges', estimated: otFee, youPay: 0, covered: true },
    {
      category: 'Consumables & Disposables',
      estimated: consumables,
      youPay: consumables,
      covered: false,
      note: 'Excluded under Section 4.2 (Non-Medical Expenses). Universally out-of-pocket.',
    },
    { category: 'Diagnostic & Misc Fees', estimated: miscFees, youPay: 0, covered: true },
  ];

  const aiInsights = [
    `${hosp.city} hospitals show ${hosp.multiplier > 1.1 ? 'above-average' : 'competitive'} billing rates for this procedure.`,
    roomOutOfPocket > 0
      ? `Upgrading to Twin Sharing room could save you Rs.${((room.ratePerDay - ROOM_RATES['Twin Sharing'].ratePerDay) * days).toLocaleString('en-IN')} in co-pay.`
      : 'Room rent is fully within policy limits — no co-pay triggered.',
    'Estimated pre-authorisation approval time: 4-6 hours for this procedure category.',
  ];

  return { totalBill, covered: coveredAmount, outOfPocket, confidence, withinLimits, breakdown, aiInsights };
}

/* ─────────────────────────── Scanning animation ─────────────────────────── */
function AIScanningOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink/85 backdrop-blur-md rounded-2xl overflow-hidden"
    >
      <motion.div
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent"
        style={{ boxShadow: '0 0 24px 4px rgba(56,189,248,0.6)' }}
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 1.8, ease: 'linear', repeat: Infinity }}
      />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-400/40 flex items-center justify-center"
            animate={{ boxShadow: ['0 0 20px rgba(56,189,248,0.2)', '0 0 50px rgba(56,189,248,0.5)', '0 0 20px rgba(56,189,248,0.2)'] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            <Brain className="w-10 h-10 text-blue-400" />
          </motion.div>
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-white" />
          </motion.div>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg">AI Analyzing Policy</p>
          <p className="text-blue-400/70 text-sm mt-1">Cross-referencing 142 coverage clauses...</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── Confidence Meter ─────────────────────────── */
function ConfidenceMeter({ value }: { value: number }) {
  const color = value >= 85 ? '#22c55e' : value >= 70 ? '#f59e0b' : '#ef4444';
  return (
    <div className="space-y-1.5 min-w-[140px]">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3 h-3" />AI Confidence
        </span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I have successfully analyzed your Comprehensive Health policy (HP-458732). What would you like to know about your coverage?' }
  ]);
  const [user, setUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Estimator state
  const [procedure, setProcedure] = useState('Appendectomy (Laparoscopic)');
  const [hospital, setHospital] = useState('Apollo Hospitals, Bangalore');
  const [roomType, setRoomType] = useState('Private Single');
  const [days, setDays] = useState(3);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState([
    {
      id: 'doc-1',
      title: 'Comprehensive Health',
      details: 'HP-458732 · Uploaded Oct 24',
      status: 'Fully Extracted',
      statusColor: 'text-blue-400',
      pages: '42 Pages',
      size: '2.4 MB',
      isActive: true,
    },
    {
      id: 'doc-2',
      title: 'Corporate Group Policy',
      details: 'CG-992144 · Uploaded Sep 12',
      status: 'Fully Extracted',
      statusColor: 'text-green-400',
      pages: '18 Pages',
      size: '1.1 MB',
      isActive: false,
    }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDocument = documents.find(d => d.isActive) || documents[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setTimeout(() => {
      setDocuments(prev => [
        {
          id: `doc-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          details: `NEW-${Math.floor(Math.random() * 10000)} · Uploaded Just Now`,
          status: 'Fully Extracted',
          statusColor: 'text-blue-400',
          pages: `${Math.floor(Math.random() * 20) + 5} Pages`,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          isActive: false,
        },
        ...prev
      ]);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1500);
  };

  const setActiveDocument = (id: string) => {
    setDocuments(prev => prev.map(doc => ({
      ...doc,
      isActive: doc.id === id
    })));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const getInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return '?';
  };

  const getDisplayName = () => user?.displayName || user?.email?.split('@')[0] || 'User';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages([...messages, { role: 'user', text: message }]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Based on Section 3.1 (Coverage), robotic knee replacement surgery is covered, but subject to a sub-limit of 50% of the sum insured or Rs.3,000,000, whichever is lower. Note: Consumables are strictly excluded (Section 4.2).'
      }]);
    }, 1000);
  };

  const runEstimate = () => {
    setIsAnalyzing(true);
    setHasCalculated(true);
    setResult(null);
  };

  const handleAnalysisDone = () => {
    setIsAnalyzing(false);
    setResult(computeEstimate(procedure, hospital, roomType, days));
  };

  const coveredPct = result ? Math.round((result.covered / result.totalBill) * 100) : 0;

  const selectClass = "w-full bg-[#0d1424] border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/20 transition-all appearance-none cursor-pointer";
  const labelClass = "text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-2 block";

  return (
    <div className="h-screen bg-ink font-sans text-text flex overflow-hidden">

      {/* Sidebar */}
      <div className="w-20 lg:w-64 border-r border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-between z-20">
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo size={36} className="group-hover:opacity-90 transition-opacity" />
              <span className="font-bold text-xl tracking-tight hidden lg:block group-hover:text-accent transition-colors">InsureSight</span>
            </Link>
          </div>

          <nav className="p-4 space-y-2 mt-4">
            {[
              { id: 'chat', icon: MessageSquare, label: 'Policy Copilot' },
              { id: 'estimator', icon: Calculator, label: 'Cost Estimator' },
              { id: 'documents', icon: FileText, label: 'My Documents' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  activeTab === id
                    ? 'bg-blue-500/15 text-blue-400 shadow-[inset_2px_0_0_#60a5fa]'
                    : 'text-muted hover:bg-white/5 hover:text-text'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium hidden lg:block">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-muted hover:bg-white/5 hover:text-text transition-all">
            <Settings className="w-5 h-5" />
            <span className="font-medium hidden lg:block">Settings</span>
          </button>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl text-muted hover:bg-red-500/20 hover:text-red-400 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium hidden lg:block">Log out</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 relative flex flex-col h-full bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.04)_0%,transparent_55%)]">

        {/* Header */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-ink/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">
              {activeTab === 'chat' ? 'Policy Copilot' : activeTab === 'estimator' ? 'Treatment Cost Estimator' : 'Document Vault'}
            </h1>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium tracking-wide">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Policy Extracted
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:block px-4 py-2 text-sm font-medium border border-blue-400/30 text-blue-400 rounded-lg hover:bg-blue-400/10 transition-colors">
              View Original PDF
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10" ref={profileRef}>
              <button id="dashboard-profile-btn" onClick={() => setProfileOpen(o => !o)} className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border-2 border-blue-400/60 flex items-center justify-center font-bold text-blue-400 text-sm shadow-[0_0_12px_rgba(56,189,248,0.3)] group-hover:scale-105 transition-all">
                  {getInitial()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-text leading-none">{getDisplayName()}</p>
                  <p className="text-xs text-muted truncate max-w-[120px]">{user?.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform hidden md:block ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    id="dashboard-profile-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-4 top-20 w-72 rounded-2xl border border-white/10 bg-ink/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden z-50"
                  >
                    <div className="px-5 pt-5 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center text-blue-400 font-bold text-2xl shadow-[0_0_20px_rgba(56,189,248,0.25)] shrink-0">
                          {getInitial()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text truncate">{getDisplayName()}</p>
                          <p className="text-xs text-muted truncate">{user?.email}</p>
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full">
                            <Shield className="w-2.5 h-2.5" /> Active Account
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3 space-y-2 border-b border-white/10">
                      <div className="flex items-center gap-3 text-sm text-muted">
                        <UserIcon className="w-4 h-4 text-blue-400/60 shrink-0" />
                        <span className="truncate">{getDisplayName()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted">
                        <Mail className="w-4 h-4 text-blue-400/60 shrink-0" />
                        <span className="truncate">{user?.email}</span>
                      </div>
                    </div>
                    <div className="px-3 py-3">
                      <button
                        id="dashboard-sign-out-btn"
                        onClick={handleSignOut}
                        className="flex items-center gap-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2.5 rounded-xl transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">

            {/* TAB: CHAT */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex flex-col p-8"
              >
                <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-4 scrollbar-hide">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-lg font-bold text-sm ${msg.role === 'user' ? 'bg-blue-500/20 border-2 border-blue-400/60 text-blue-400' : 'bg-white/5 border border-white/10 text-blue-400'}`}>
                        {msg.role === 'user' ? getInitial() : <Shield className="w-5 h-5" />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-text rounded-tl-sm'}`}>
                        {msg.text}
                        {msg.role === 'ai' && i > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/10">
                            <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-black/30 border border-white/5 text-xs text-muted hover:text-blue-400 hover:border-blue-400/50 cursor-pointer transition-colors">
                              <FileSearch className="w-3 h-3" /> Page 14, Section 3.1 & 4.2
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="relative mt-auto">
                  <div className="absolute inset-0 bg-blue-400/10 blur-xl rounded-full opacity-50 z-0 pointer-events-none" />
                  <div className="relative z-10 bg-ink border border-white/10 rounded-xl shadow-2xl flex items-end p-2 focus-within:border-blue-400/50 transition-colors">
                    <button type="button" className="p-3 text-muted hover:text-blue-400 transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <textarea
                      rows={1}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask a question about your policy..."
                      className="flex-1 bg-transparent border-none focus:outline-none resize-none p-3 text-text placeholder:text-muted/50 max-h-32"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="p-3 bg-blue-500 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-400 transition-colors shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB: ESTIMATOR */}
            {activeTab === 'estimator' && (
              <motion.div
                key="estimator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 p-6 overflow-y-auto"
              >
                <div className="max-w-6xl mx-auto space-y-6">

                  {/* Info bar */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ background: 'rgba(37,99,235,0.06)', borderColor: 'rgba(96,165,250,0.2)' }}>
                    <Brain className="w-4 h-4 text-blue-400 shrink-0" />
                    <p className="text-xs text-blue-300/80">
                      AI cross-references your policy clauses in real-time to give you a personalised cost breakdown — not a generic estimate.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                    {/* Left: Input Panel */}
                    <div className="xl:col-span-4 space-y-5">
                      <div className="bg-[#0c1220] border border-white/10 rounded-2xl p-6 space-y-5">
                        <h2 className="text-base font-bold flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                            <ScanLine className="w-4 h-4 text-blue-400" />
                          </div>
                          Treatment Details
                        </h2>

                        <div>
                          <label className={labelClass}>Diagnosis / Procedure</label>
                          <div className="relative">
                            <select value={procedure} onChange={e => setProcedure(e.target.value)} className={selectClass}>
                              {Object.keys(PROCEDURES).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className={labelClass}>Hospital / Network</label>
                          <div className="relative">
                            <select value={hospital} onChange={e => setHospital(e.target.value)} className={selectClass}>
                              {Object.keys(HOSPITALS).map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={labelClass}>Room Type</label>
                            <div className="relative">
                              <select value={roomType} onChange={e => setRoomType(e.target.value)} className={selectClass}>
                                {Object.keys(ROOM_RATES).map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <label className={labelClass}>Stay (Days)</label>
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={days}
                              onChange={e => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full bg-[#0d1424] border border-white/10 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/20 transition-all"
                            />
                          </div>
                        </div>

                        <motion.button
                          onClick={runEstimate}
                          disabled={isAnalyzing}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', boxShadow: '0 4px 24px rgba(37,99,235,0.35)' }}
                        >
                          {isAnalyzing
                            ? <><Brain className="w-4 h-4 animate-pulse" /> Analyzing...</>
                            : <><Sparkles className="w-4 h-4" /> {hasCalculated ? 'Re-run AI Analysis' : 'Run AI Analysis'}</>}
                        </motion.button>
                      </div>

                      <div className="rounded-xl border border-amber-400/25 p-4 flex gap-3" style={{ background: 'rgba(245,158,11,0.06)' }}>
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-400 mb-1">Estimate Disclaimer</h4>
                          <p className="text-xs text-amber-300/70 leading-relaxed">
                            Hospital billing varies. Consumable costs assume 8% of bill average. Final amounts depend on actual invoices.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Results Panel */}
                    <div className="xl:col-span-8">
                      <div className="relative bg-[#080e1c] border border-blue-400/20 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(37,99,235,0.08)]" style={{ minHeight: '520px' }}>

                        <AnimatePresence>
                          {isAnalyzing && <AIScanningOverlay onDone={handleAnalysisDone} />}
                        </AnimatePresence>

                        {!hasCalculated && !isAnalyzing && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8">
                            <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                              <BarChart3 className="w-10 h-10 text-blue-400/40" />
                            </div>
                            <div className="text-center">
                              <p className="text-slate-400 font-medium">No estimate generated yet</p>
                              <p className="text-slate-600 text-sm mt-1">Configure your treatment and click Run AI Analysis</p>
                            </div>
                          </div>
                        )}

                        {result && !isAnalyzing && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

                            {/* Result header */}
                            <div className="p-6 border-b border-white/8" style={{ background: 'linear-gradient(to right, rgba(37,99,235,0.06), transparent)' }}>
                              <div className="flex flex-wrap gap-6 justify-between items-start">
                                <div>
                                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">Estimated Total Hospital Bill</p>
                                  <motion.div
                                    className="text-4xl font-extrabold text-white tracking-tight"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    Rs.{result.totalBill.toLocaleString('en-IN')}
                                  </motion.div>
                                  <p className="text-xs text-slate-500 mt-1.5">{procedure} &middot; {hospital.split(',')[0]}</p>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${result.withinLimits ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                    {result.withinLimits ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                    {result.withinLimits ? 'Within Policy Limits' : 'Exceeds Policy Limits'}
                                  </div>
                                  <ConfidenceMeter value={result.confidence} />
                                </div>
                              </div>
                            </div>

                            <div className="p-6 space-y-6">

                              {/* Coverage bar */}
                              <div className="space-y-2.5">
                                <div className="flex justify-between text-sm font-medium">
                                  <span className="flex items-center gap-2 text-green-400">
                                    <CheckCircle className="w-4 h-4" />
                                    Covered: <strong>Rs.{result.covered.toLocaleString('en-IN')}</strong>
                                  </span>
                                  <span className="flex items-center gap-2 text-red-400">
                                    <BadgePercent className="w-4 h-4" />
                                    Out of Pocket: <strong>Rs.{result.outOfPocket.toLocaleString('en-IN')}</strong>
                                  </span>
                                </div>
                                <div className="h-3 bg-white/5 rounded-full overflow-hidden flex">
                                  <motion.div
                                    className="h-full rounded-l-full"
                                    style={{ background: 'linear-gradient(90deg, #16a34a, #22c55e)' }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${coveredPct}%` }}
                                    transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
                                  />
                                  <div className="h-full flex-1 rounded-r-full" style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)' }} />
                                </div>
                                <p className="text-xs text-slate-600 text-right">{coveredPct}% covered by your active policy</p>
                              </div>

                              {/* Invoice table */}
                              <div className="border border-white/8 rounded-xl overflow-hidden text-sm">
                                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                  <div className="col-span-5">Expense Category</div>
                                  <div className="col-span-3 text-right">Est. Cost</div>
                                  <div className="col-span-2 text-right">Status</div>
                                  <div className="col-span-2 text-right text-blue-400">You Pay</div>
                                </div>

                                {result.breakdown.map((row, i) => (
                                  <motion.div
                                    key={row.category}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 + i * 0.08 }}
                                    className="grid grid-cols-12 gap-4 px-4 py-3.5 border-t border-white/5 hover:bg-white/3 transition-colors items-center"
                                    style={!row.covered ? { background: 'rgba(239,68,68,0.03)' } : {}}
                                  >
                                    <div className="col-span-5">
                                      <div className="flex items-center gap-2 font-medium text-slate-200">
                                        {!row.covered && <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />}
                                        <span className="text-sm">{row.category}</span>
                                      </div>
                                      {row.note && <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{row.note}</p>}
                                    </div>
                                    <div className="col-span-3 text-right text-slate-300 font-mono text-sm">
                                      Rs.{row.estimated.toLocaleString('en-IN')}
                                    </div>
                                    <div className="col-span-2 text-right">
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${row.covered ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                                        {row.covered ? 'Covered' : 'Excluded'}
                                      </span>
                                    </div>
                                    <div className={`col-span-2 text-right font-bold font-mono text-sm ${row.youPay > 0 ? 'text-red-400' : 'text-slate-600'}`}>
                                      {row.youPay > 0 ? `Rs.${row.youPay.toLocaleString('en-IN')}` : '--'}
                                    </div>
                                  </motion.div>
                                ))}

                                {/* Total */}
                                <div className="grid grid-cols-12 gap-4 px-4 py-4 border-t border-blue-400/20 items-center" style={{ background: 'rgba(37,99,235,0.05)' }}>
                                  <div className="col-span-5 font-bold text-slate-200 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-400" /> Total
                                  </div>
                                  <div className="col-span-3 text-right font-bold font-mono text-slate-200">
                                    Rs.{result.totalBill.toLocaleString('en-IN')}
                                  </div>
                                  <div className="col-span-2" />
                                  <div className="col-span-2 text-right font-extrabold font-mono text-red-400">
                                    Rs.{result.outOfPocket.toLocaleString('en-IN')}
                                  </div>
                                </div>
                              </div>

                              {/* AI Insights */}
                              <div className="rounded-xl border border-blue-400/15 p-5 space-y-3" style={{ background: 'rgba(37,99,235,0.05)' }}>
                                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5" /> AI Policy Insights
                                </h4>
                                {result.aiInsights.map((insight, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.12 }}
                                    className="flex gap-2.5 text-xs text-slate-400 leading-relaxed"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mt-1.5 shrink-0" />
                                    {insight}
                                  </motion.div>
                                ))}
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <Clock className="w-3 h-3" />
                                Analysis generated at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} &middot; Based on {activeDocument.title} ({activeDocument.details.split(' ')[0]}) active policy
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: DOCUMENTS */}
            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 p-8 overflow-y-auto"
              >
                <div className="max-w-5xl mx-auto space-y-8">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Document Vault</h2>
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                      />
                      <button 
                        className="neon-button disabled:opacity-50"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? 'Uploading...' : 'Upload New Policy'} <Paperclip className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                      <div 
                        key={doc.id}
                        className={`bg-white/5 border rounded-2xl p-6 relative overflow-hidden transition-colors ${
                          doc.isActive 
                            ? 'border-blue-400/50 shadow-[0_0_30px_rgba(56,189,248,0.08)]' 
                            : 'border-white/10 group hover:border-white/20'
                        }`}
                      >
                        {doc.isActive && (
                          <div className="absolute top-0 right-0 p-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ boxShadow: '0 0 10px #22c55e' }} />
                          </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 ${
                          doc.isActive 
                            ? 'bg-blue-500/20 border-blue-400/30 text-blue-400' 
                            : 'bg-white/5 border-white/10 text-muted'
                        }`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">{doc.title}</h3>
                        <p className="text-xs text-muted mb-6">{doc.details}</p>
                        <div className="space-y-3">
                          {[
                            ['Status', doc.status, doc.statusColor], 
                            ['Pages', doc.pages, 'text-text'], 
                            ['File Size', doc.size, 'text-text']
                          ].map(([k, v, cls]) => (
                            <div key={k} className="flex justify-between text-xs">
                              <span className="text-muted">{k}</span>
                              <span className={cls}>{v}</span>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-6 flex gap-2 ${!doc.isActive ? 'opacity-50 group-hover:opacity-100 transition-opacity' : ''}`}>
                          <button className="flex-1 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm transition-colors">View PDF</button>
                          {!doc.isActive ? (
                            <button 
                              className="flex-1 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm transition-colors"
                              onClick={() => setActiveDocument(doc.id)}
                            >
                              Set Active
                            </button>
                          ) : (
                            <button className="flex-1 py-2 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-400 transition-colors">
                              Active
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
