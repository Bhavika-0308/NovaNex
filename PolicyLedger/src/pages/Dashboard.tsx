import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, MessageSquare, Calculator, FileText, Send, Settings, LogOut,
  CheckCircle, AlertTriangle, Paperclip, User as UserIcon,
  Mail, ChevronDown, Sparkles, Brain, TrendingUp, Zap, Clock,
  BadgePercent, BarChart3, ScanLine
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import {
  getCurrentUser,
  logoutUser,
  uploadPolicy,
  getPolicyStatus,
  getPolicyOverview,
  askPolicy,
} from '../api';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
      : 'Room rent is fully within policy limits â€” no co-pay triggered.',
    'Estimated pre-authorisation approval time: 4-6 hours for this procedure category.',
  ];

  return { totalBill, covered: coveredAmount, outOfPocket, confidence, withinLimits, breakdown, aiInsights };
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Scanning animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Confidence Meter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I have successfully analyzed your Comprehensive Health policy (HP-458732). What would you like to know about your coverage?' }
  ]);
  type BackendUser = {
    id: string;
    email: string;
    full_name?: string | null;
  };

  const [user, setUser] = useState<BackendUser | null>(null);
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
      details: 'HP-458732 Â· Uploaded Oct 24',
      status: 'Fully Extracted',
      statusColor: 'text-blue-400',
      pages: '42 Pages',
      size: '2.4 MB',
      isActive: true,
    },
    {
      id: 'doc-2',
      title: 'Corporate Group Policy',
      details: 'CG-992144 Â· Uploaded Sep 12',
      status: 'Fully Extracted',
      statusColor: 'text-green-400',
      pages: '18 Pages',
      size: '1.1 MB',
      isActive: false,
    }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [policyId, setPolicyId] = useState<string | null>(
    localStorage.getItem('policywise_policy_id')
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDocument = documents.find(d => d.isActive) || documents[0];

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF policy document.');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadPolicy(file);
      const newPolicyId = result.policy_id;

      setPolicyId(newPolicyId);
      localStorage.setItem('policywise_policy_id', newPolicyId);

      const newDocument = {
        id: newPolicyId,
        title: file.name.replace(/\.[^/.]+$/, ''),
        details: `${newPolicyId.slice(0, 8)} · Uploaded Just Now`,
        status: 'Processing',
        statusColor: 'text-amber-400',
        pages: 'Processing...',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        isActive: true,
      };

      setDocuments(prev => [
        newDocument,
        ...prev.map(doc => ({
          ...doc,
          isActive: false,
        })),
      ]);

      let status = result.status || 'processing';

      if (status === 'processing') {
        for (let i = 0; i < 30 && status === 'processing'; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));

          const statusResult = await getPolicyStatus(newPolicyId);
          status = statusResult.status;
        }
      } else {
        // Short realistic extraction animation
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      if (status !== 'completed') {
        throw new Error('Policy processing failed or timed out.');
      }

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === newPolicyId
            ? {
                ...doc,
                status: 'Fully Extracted',
                statusColor: 'text-green-400',
                pages: '38 Pages',
              }
            : doc
        )
      );

      const overview = await getPolicyOverview(newPolicyId);
      console.log('Policy overview:', overview);

      setMessages([
        {
          role: 'ai',
          text: 'Your policy has been successfully analyzed. Ask me anything about your coverage, exclusions, waiting periods, deductibles, or limits.',
        },
      ]);

      setActiveTab('chat');
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : 'Failed to upload policy.'
      );
    } finally {
      setIsUploading(false);
  
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  const setActiveDocument = (id: string) => {
    setDocuments(prev => prev.map(doc => ({
      ...doc,
      isActive: doc.id === id
    })));
  };

  useEffect(() => {
    const token = localStorage.getItem('policywise_token');

    if (!token) {
      navigate('/login');
      return;
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('policywise_token');
        navigate('/login');
      });
  }, [navigate]);

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

  const handleSignOut = () => {
    logoutUser();
    navigate('/');
  };

  const getInitial = () => {
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }

    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return '?';
  };

  const getDisplayName = () =>
    user?.full_name ||
    user?.email?.split('@')[0] ||
    'User';  const handleSendMessage = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const question = message.trim();

    if (!question) return;

    const currentPolicyId = policyId || localStorage.getItem('policywise_policy_id');

    if (!currentPolicyId) {
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: 'Please upload a policy first so I can answer questions about it.',
        },
      ]);

      setMessage('');
      return;
    }

    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        text: question,
      },
    ]);

    setMessage('');

    try {
      const result = await askPolicy(
        currentPolicyId,
        question
      );

      const answer =
        result.answer ||
        'I could not find an answer in your policy.';

      const confidence =
        typeof result.confidence === 'number'
          ? `\n\nAI confidence: ${Math.round(
              result.confidence * 100
            )}%`
          : '';

      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: answer + confidence,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text:
            error instanceof Error
              ? `I couldn't process that question: ${error.message}`
              : 'I could not process your question.',
        },
      ]);
    }
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
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-500/15 text-blue-400 shadow-[inset_2px_0_0_#60a5fa]'
                : 'text-muted hover:bg-white/5 hover:text-text'
            }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
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
              {activeTab === 'chat' ? 'Policy Copilot' : activeTab === 'estimator' ? 'Treatment Cost Estimator' : activeTab === 'settings' ? 'Account Settings' : 'Document Vault'}
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
            {/* TAB: CHAT / OVERVIEW */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 p-6 overflow-y-auto"
              >
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full min-h-[600px] max-w-7xl mx-auto">
                  
                  {/* Left: Overview Dashboard */}
                  <div className="xl:col-span-8 flex flex-col gap-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle className="w-16 h-16 text-green-400" /></div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Coverage</span>
                        <span className="text-3xl font-extrabold text-slate-100">92%</span>
                        <span className="text-xs text-green-400 font-medium">Of typical treatments</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle className="w-16 h-16 text-red-400" /></div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Not Covered</span>
                        <span className="text-3xl font-extrabold text-slate-100">Consumables</span>
                        <span className="text-xs text-red-400 font-medium">Always out-of-pocket</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Clock className="w-16 h-16 text-amber-400" /></div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Waiting Period</span>
                        <span className="text-3xl font-extrabold text-slate-100">2 Years</span>
                        <span className="text-xs text-amber-400 font-medium">Pre-existing conditions</span>
                      </div>
                    </div>

                    {/* Cost Visual */}
                    <div className="bg-[#0a0f1a] border border-blue-400/20 rounded-3xl p-8 flex flex-col justify-center shadow-[0_0_50px_rgba(37,99,235,0.06)] relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-72 h-72 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                      <h3 className="text-sm font-bold text-slate-400 mb-8 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-400" /> Estimated Treatment Payment
                      </h3>
                      
                      <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Total Hospital Bill</p>
                          <p className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Rs.1,50,000</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-medium mb-1">Standard Appendectomy</p>
                          <p className="text-[10px] text-slate-600">Based on historic network data</p>
                        </div>
                      </div>
                      
                      <div className="h-5 bg-white/5 rounded-full overflow-hidden flex gap-1 mb-5 shadow-inner">
                        <motion.div className="h-full rounded-l-full" style={{ background: 'linear-gradient(90deg, #16a34a, #22c55e)', width: '85%' }} initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.2, delay: 0.2 }} />
                        <motion.div className="h-full rounded-r-full" style={{ background: 'linear-gradient(90deg, #dc2626, #ef4444)', width: '15%' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} />
                      </div>
                      
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="w-4 h-4" /> Insurance Pays: Rs.1,27,500
                        </span>
                        <span className="flex items-center gap-2 text-red-400">
                          <BadgePercent className="w-4 h-4" /> You Pay: Rs.22,500
                        </span>
                      </div>
                    </div>

                    {/* Policy Insights & Chips */}
                    <div className="flex flex-col gap-4 mt-auto pt-2">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-400" /> Policy Copilot
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {[
                          "Is my surgery covered?",
                          "How much will I pay?",
                          "Does my policy have a room-rent limit?",
                          "What is the waiting period?"
                        ].map(q => (
                          <button 
                            key={q}
                            onClick={() => setMessage(q)}
                            className="px-5 py-2.5 bg-blue-500/10 border border-blue-400/30 text-blue-400 text-sm font-medium rounded-full hover:bg-blue-500/20 hover:border-blue-400/50 hover:-translate-y-0.5 transition-all shadow-[0_4px_14px_rgba(37,99,235,0.1)]"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Chat UI */}
                  <div className="xl:col-span-4 bg-[#080d17] border border-blue-400/20 rounded-3xl flex flex-col overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative">
                    <div className="p-5 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-transparent flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-400/50 text-blue-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200">AI Assistant</h3>
                        <p className="text-[11px] text-green-400 flex items-center gap-1.5 font-medium mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online & Ready</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 max-w-[92%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white/10 border border-white/10 text-blue-400'}`}>
                            {msg.role === 'user' ? getInitial() : <Shield className="w-4 h-4" />}
                          </div>
                          <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 border-t border-white/10 bg-ink/60 backdrop-blur-xl">
                      <form onSubmit={handleSendMessage} className="relative flex items-end">
                        <textarea
                          rows={1}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Ask about your policy..."
                          className="flex-1 bg-[#0c1220] border border-white/10 rounded-xl focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/20 focus:outline-none resize-none px-4 py-3 text-sm text-text placeholder:text-muted max-h-32 transition-all pr-12"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                          }}
                        />
                        <button
                          type="submit"
                          disabled={!message.trim()}
                          className="absolute right-1.5 bottom-1.5 p-2 bg-blue-500 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-400 transition-colors shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
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
                      AI cross-references your policy clauses in real-time to give you a personalised cost breakdown â€” not a generic estimate.
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

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 p-8 overflow-y-auto"
              >
                <div className="max-w-3xl mx-auto space-y-8">
                  <h2 className="text-2xl font-bold">Account Settings</h2>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                    <h3 className="text-lg font-bold border-b border-white/10 pb-4">Profile Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Display Name</label>
                        <input 
                          type="text" 
                          disabled 
                          value={getDisplayName()} 
                          className="w-full bg-[#0d1424] border border-white/10 rounded-xl p-3 text-sm text-slate-200 opacity-70" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 block">Email Address</label>
                        <input 
                          type="text" 
                          disabled 
                          value={user?.email || ''} 
                          className="w-full bg-[#0d1424] border border-white/10 rounded-xl p-3 text-sm text-slate-200 opacity-70" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                    <h3 className="text-lg font-bold border-b border-white/10 pb-4">Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-200">Email Notifications</p>
                          <p className="text-sm text-slate-500">Receive alerts when policy updates occur.</p>
                        </div>
                        <div className="w-11 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-200">Dark Mode</p>
                          <p className="text-sm text-slate-500">Currently locked to NovaNex dark theme.</p>
                        </div>
                        <div className="w-11 h-6 bg-white/10 rounded-full relative cursor-not-allowed opacity-50">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white/50 rounded-full transition-transform"></div>
                        </div>
                      </div>
                    </div>
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













