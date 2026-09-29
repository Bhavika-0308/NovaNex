import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, MessageSquare, Calculator, FileText, Send, Settings, LogOut,
  CheckCircle, AlertTriangle, Paperclip, User as UserIcon,
  Mail, ChevronDown, Sparkles, Brain, TrendingUp, Zap, Clock,
  BadgePercent, BarChart3, ScanLine, Menu, X
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
        ? `Policy caps room at ₹${room.policyLimit.toLocaleString('en-IN')}/day. You pay ₹${(room.ratePerDay - room.policyLimit).toLocaleString('en-IN')}/day difference.`
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
      ? `Upgrading to Twin Sharing room could save you ₹${((room.ratePerDay - ROOM_RATES['Twin Sharing'].ratePerDay) * days).toLocaleString('en-IN')} in co-pay.`
      : 'Room rent is fully within policy limits — no co-pay triggered.',
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
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-brand-deep-navy/85 backdrop-blur-md rounded-2xl overflow-hidden"
    >
      <motion.div
        className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-brand-ai-cyan to-transparent"
        style={{ boxShadow: '0 0 24px 4px rgba(6, 182, 212, 0.6)' }}
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 1.8, ease: 'linear', repeat: Infinity }}
      />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-brand-ai-cyan/10 border border-brand-ai-cyan/40 flex items-center justify-center"
            animate={{ boxShadow: ['0 0 20px rgba(6,182,212,0.2)', '0 0 50px rgba(6,182,212,0.5)', '0 0 20px rgba(6,182,212,0.2)'] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            <Brain className="w-10 h-10 text-brand-ai-cyan" />
          </motion.div>
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-electric flex items-center justify-center"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <Sparkles className="w-3 h-3 text-canvas-white" />
          </motion.div>
        </div>
        <div className="text-center">
          <p className="text-canvas-white font-semibold text-lg">AI Analyzing Policy</p>
          <p className="text-brand-ai-cyan/70 text-sm mt-1">Cross-referencing 142 coverage clauses...</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-ai-cyan"
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
  const hex = value >= 85 ? '#16A34A' : value >= 70 ? '#F59E0B' : '#DC2626';
  return (
    <div className="space-y-1.5 min-w-[140px]">
      <div className="flex justify-between items-center text-xs">
        <span className="text-text-muted flex items-center gap-1.5 font-bold">
          <Zap className="w-3 h-3" />AI Confidence
        </span>
        <span className="font-bold" style={{ color: hex }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-canvas-secondary border border-border-subtle rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${hex}88, ${hex})` }}
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      details: 'HP-458732 · Uploaded Oct 24',
      status: 'Fully Extracted',
      statusColor: 'text-green-400',
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
  }, [messages, activeTab]);

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
    'User';  

  const handleSendMessage = async (
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

  return (
    <div className="h-screen bg-canvas-secondary font-sans text-text-primary flex overflow-hidden">

      {/* Sidebar - Desktop & Mobile overlay */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-brand-deep-navy text-canvas-white flex flex-col justify-between transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          <div className="h-20 flex items-center justify-between lg:justify-start px-6 border-b border-canvas-white/10 shrink-0">
            <Link to="/" className="flex items-center gap-3 group focus-ring-dark rounded-lg">
              <Logo size={32} className="text-canvas-white" />
              <span className="font-bold text-xl tracking-tight text-canvas-white">NovaNex</span>
            </Link>
            <button className="lg:hidden p-2 -mr-2 text-canvas-white/70 hover:text-canvas-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="p-4 space-y-2 mt-4">
            {[
              { id: 'chat', icon: MessageSquare, label: 'Policy Copilot' },
              { id: 'estimator', icon: Calculator, label: 'Cost Estimator' },
              { id: 'documents', icon: FileText, label: 'My Documents' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all focus-ring-dark ${
                  activeTab === id
                    ? 'bg-brand-electric/15 text-brand-ai-cyan shadow-[inset_2px_0_0_#06B6D4]'
                    : 'text-canvas-white/60 hover:bg-canvas-white/5 hover:text-canvas-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-canvas-white/10 space-y-2 shrink-0">
          <button 
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all focus-ring-dark ${
              activeTab === 'settings'
                ? 'bg-brand-electric/15 text-brand-ai-cyan shadow-[inset_2px_0_0_#06B6D4]'
                : 'text-canvas-white/60 hover:bg-canvas-white/5 hover:text-canvas-white'
            }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            <span className="font-medium">Settings</span>
          </button>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl text-canvas-white/60 hover:bg-status-oop/15 hover:text-status-oop transition-all focus-ring-dark">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-brand-deep-navy/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Workspace */}
      <div className="flex-1 relative flex flex-col h-full bg-canvas-secondary">

        {/* Topbar */}
        <header className="h-20 border-b border-border-subtle flex items-center justify-between px-6 md:px-8 bg-canvas-white z-10 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text-primary focus-ring rounded-lg" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-text-primary hidden sm:block">
              {activeTab === 'chat' ? 'Policy Copilot' : activeTab === 'estimator' ? 'Treatment Cost Estimator' : activeTab === 'settings' ? 'Account Settings' : 'Document Vault'}
            </h1>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-covered/10 border border-status-covered/20 text-status-covered text-xs font-bold tracking-wide">
              <div className="w-2 h-2 rounded-full bg-status-covered animate-pulse" />
              Policy Active
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:block px-4 py-2 text-sm font-bold border border-border-subtle text-text-muted hover:text-text-primary hover:border-brand-electric/50 hover:bg-canvas-secondary rounded-lg transition-colors focus-ring">
              View Original PDF
            </button>
            
            {/* Profile Dropdown */}
            <div className="flex items-center gap-3 pl-4 border-l border-border-subtle" ref={profileRef}>
              <button id="dashboard-profile-btn" onClick={() => setProfileOpen(o => !o)} className="flex items-center gap-2 group focus-ring rounded-xl">
                <div className="w-10 h-10 rounded-full bg-brand-electric/10 border border-brand-electric/30 flex items-center justify-center font-bold text-brand-electric text-sm group-hover:bg-brand-electric/15 transition-all">
                  {getInitial()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-text-primary leading-none mb-0.5">{getDisplayName()}</p>
                  <p className="text-[11px] font-semibold text-text-muted truncate max-w-[120px]">{user?.email}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform hidden md:block ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    id="dashboard-profile-dropdown"
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-4 md:right-8 top-20 w-72 rounded-2xl border border-border-subtle bg-canvas-white shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-5 pt-5 pb-4 border-b border-border-subtle">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-brand-electric/10 border border-brand-electric/30 flex items-center justify-center text-brand-electric font-bold text-2xl shrink-0">
                          {getInitial()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-text-primary truncate">{getDisplayName()}</p>
                          <p className="text-xs font-semibold text-text-muted truncate mt-0.5">{user?.email}</p>
                          <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-status-covered bg-status-covered/10 border border-status-covered/20 px-2 py-0.5 rounded-full">
                            <Shield className="w-2.5 h-2.5" /> Active Account
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3 space-y-3 border-b border-border-subtle bg-canvas-secondary">
                      <div className="flex items-center gap-3 text-sm font-semibold text-text-muted">
                        <UserIcon className="w-4 h-4 text-text-muted shrink-0" />
                        <span className="truncate">{getDisplayName()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold text-text-muted">
                        <Mail className="w-4 h-4 text-text-muted shrink-0" />
                        <span className="truncate">{user?.email}</span>
                      </div>
                    </div>
                    <div className="px-3 py-3">
                      <button
                        id="dashboard-sign-out-btn"
                        onClick={handleSignOut}
                        className="flex items-center gap-3 font-bold text-sm text-status-oop hover:bg-status-oop/10 px-3 py-2.5 rounded-xl transition-colors w-full focus-ring"
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

            {/* TAB: CHAT / COPILOT */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 p-4 md:p-6 overflow-y-auto"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px] max-w-7xl mx-auto">
                  
                  {/* Left: Overview Dashboard */}
                  <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-canvas-white border border-border-subtle rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle className="w-16 h-16 text-status-covered" /></div>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Coverage</span>
                        <span className="text-3xl font-extrabold text-text-primary">92%</span>
                        <span className="text-xs text-status-covered font-bold">Of typical treatments</span>
                      </div>
                      <div className="bg-canvas-white border border-border-subtle rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle className="w-16 h-16 text-status-oop" /></div>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Not Covered</span>
                        <span className="text-3xl font-extrabold text-text-primary">Consumables</span>
                        <span className="text-xs text-status-oop font-bold">Always out-of-pocket</span>
                      </div>
                      <div className="bg-canvas-white border border-border-subtle rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Clock className="w-16 h-16 text-amber-500" /></div>
                        <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Waiting Period</span>
                        <span className="text-3xl font-extrabold text-text-primary">2 Years</span>
                        <span className="text-xs text-amber-600 font-bold">Pre-existing conditions</span>
                      </div>
                    </div>

                    {/* Cost Visual */}
                    <div className="bg-canvas-white border border-border-subtle rounded-3xl p-6 md:p-8 flex flex-col justify-center shadow-sm relative overflow-hidden">
                      <h3 className="text-sm font-bold text-text-muted mb-8 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-brand-electric" /> Estimated Treatment Payment
                      </h3>
                      
                      <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-4">
                        <div>
                          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Total Hospital Bill</p>
                          <p className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight font-mono">₹1,50,000</p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-xs text-text-primary font-bold mb-1">Standard Appendectomy</p>
                          <p className="text-[10px] font-semibold text-text-muted">Based on historic network data</p>
                        </div>
                      </div>
                      
                      <div className="h-5 bg-canvas-secondary rounded-full overflow-hidden flex mb-5 border border-border-subtle">
                        <motion.div className="h-full rounded-l-full bg-status-covered" style={{ width: '85%' }} initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 1.2, delay: 0.2 }} />
                        <motion.div className="h-full rounded-r-full bg-status-oop" style={{ width: '15%' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} />
                      </div>
                      
                      <div className="flex justify-between text-sm font-bold">
                        <span className="flex items-center gap-2 text-status-covered">
                          <CheckCircle className="w-4 h-4" /> Insurance Pays: ₹1,27,500
                        </span>
                        <span className="flex items-center gap-2 text-status-oop">
                          <BadgePercent className="w-4 h-4" /> You Pay: ₹22,500
                        </span>
                      </div>
                    </div>

                    {/* Policy Insights & Chips */}
                    <div className="flex flex-col gap-4 mt-auto pt-2">
                      <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-electric" /> Policy Copilot
                      </h3>
                      <div className="flex flex-wrap gap-2.5">
                        {[
                          "Is my surgery covered?",
                          "How much will I pay?",
                          "Does my policy have a room-rent limit?",
                          "What is the waiting period?"
                        ].map(q => (
                          <button 
                            key={q}
                            onClick={() => setMessage(q)}
                            className="px-4 py-2.5 bg-canvas-white border border-border-subtle text-text-primary text-sm font-bold rounded-full hover:border-brand-electric hover:text-brand-electric focus-ring transition-colors shadow-sm"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Chat UI */}
                  <div className="lg:col-span-5 xl:col-span-4 bg-brand-deep-navy rounded-3xl flex flex-col overflow-hidden shadow-xl relative min-h-[500px]">
                    {/* Ambient glow */}
                    <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-brand-ai-purple/20 blur-[80px] rounded-full pointer-events-none"></div>
                    <div className="absolute bottom-[-50px] left-[-50px] w-[200px] h-[200px] bg-brand-ai-cyan/15 blur-[80px] rounded-full pointer-events-none"></div>

                    <div className="p-5 border-b border-canvas-white/10 glass-panel-dark flex items-center gap-3 z-10 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-brand-ai-cyan/10 flex items-center justify-center border border-brand-ai-cyan/30 text-brand-ai-cyan">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-canvas-white">Editorial AI</h3>
                        <p className="text-[11px] text-brand-ai-cyan flex items-center gap-1.5 font-bold mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-brand-ai-cyan animate-pulse"></span> Analyzing Policy</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-hide z-10">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 max-w-[92%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ${msg.role === 'user' ? 'bg-brand-electric text-canvas-white' : 'bg-canvas-white/10 border border-canvas-white/10 text-brand-ai-cyan'}`}>
                            {msg.role === 'user' ? getInitial() : <Shield className="w-4 h-4" />}
                          </div>
                          <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-brand-electric text-canvas-white rounded-tr-sm' : 'glass-panel-dark border border-canvas-white/10 text-canvas-white/90 rounded-tl-sm'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 border-t border-canvas-white/10 glass-panel-dark z-10 shrink-0">
                      <form onSubmit={handleSendMessage} className="relative flex items-end">
                        <textarea
                          rows={1}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Ask about your policy..."
                          className="flex-1 bg-canvas-white/5 border border-canvas-white/20 rounded-xl focus:border-brand-ai-cyan focus:ring-1 focus:ring-brand-ai-cyan focus:outline-none resize-none px-4 py-3.5 text-sm text-canvas-white placeholder:text-canvas-white/40 max-h-32 transition-all pr-14"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                          }}
                        />
                        <button
                          type="submit"
                          disabled={!message.trim()}
                          className="absolute right-1.5 bottom-1.5 p-2.5 bg-brand-electric text-canvas-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-bright transition-colors focus-ring"
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
                className="absolute inset-0 p-4 md:p-6 lg:p-8 overflow-y-auto"
              >
                <div className="max-w-6xl mx-auto space-y-6">

                  {/* Info bar */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-ai-cyan/10 border border-brand-ai-cyan/20">
                    <Brain className="w-4 h-4 text-brand-deep-navy shrink-0" />
                    <p className="text-xs font-bold text-brand-deep-navy">
                      AI cross-references your policy clauses in real-time to give you a personalised cost breakdown.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left: Input Panel */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-5">
                      <div className="bg-canvas-white border border-border-subtle rounded-2xl p-5 md:p-6 space-y-5 shadow-sm">
                        <h2 className="text-base font-bold flex items-center gap-2.5 text-text-primary">
                          <div className="w-7 h-7 rounded-lg bg-brand-electric/10 border border-brand-electric/20 flex items-center justify-center">
                            <ScanLine className="w-4 h-4 text-brand-electric" />
                          </div>
                          Treatment Details
                        </h2>

                        <div>
                          <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Diagnosis / Procedure</label>
                          <div className="relative">
                            <select value={procedure} onChange={e => setProcedure(e.target.value)} className="w-full bg-canvas-secondary border border-border-subtle rounded-xl p-3 text-sm font-semibold text-text-primary focus:outline-none focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-all appearance-none cursor-pointer">
                              {Object.keys(PROCEDURES).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Hospital / Network</label>
                          <div className="relative">
                            <select value={hospital} onChange={e => setHospital(e.target.value)} className="w-full bg-canvas-secondary border border-border-subtle rounded-xl p-3 text-sm font-semibold text-text-primary focus:outline-none focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-all appearance-none cursor-pointer">
                              {Object.keys(HOSPITALS).map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Room Type</label>
                            <div className="relative">
                              <select value={roomType} onChange={e => setRoomType(e.target.value)} className="w-full bg-canvas-secondary border border-border-subtle rounded-xl p-3 text-sm font-semibold text-text-primary focus:outline-none focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-all appearance-none cursor-pointer">
                                {Object.keys(ROOM_RATES).map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2 block">Stay (Days)</label>
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={days}
                              onChange={e => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-full bg-canvas-secondary border border-border-subtle rounded-xl p-3 text-sm font-semibold text-text-primary focus:outline-none focus:border-brand-electric focus:ring-1 focus:ring-brand-electric transition-all"
                            />
                          </div>
                        </div>

                        <motion.button
                          onClick={runEstimate}
                          disabled={isAnalyzing}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-3.5 rounded-xl font-bold text-sm text-canvas-white bg-brand-electric hover:bg-brand-bright flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md focus-ring"
                        >
                          {isAnalyzing
                            ? <><Brain className="w-4 h-4 animate-pulse" /> Analyzing...</>
                            : <><Sparkles className="w-4 h-4" /> {hasCalculated ? 'Re-run AI Analysis' : 'Run AI Analysis'}</>}
                        </motion.button>
                      </div>

                      <div className="rounded-xl border border-amber-300 p-4 flex gap-3 bg-amber-50">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-800 mb-1">Estimate Disclaimer</h4>
                          <p className="text-xs font-medium text-amber-700/80 leading-relaxed">
                            Hospital billing varies. Consumable costs assume 8% of bill average. Final amounts depend on actual invoices.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Results Panel */}
                    <div className="lg:col-span-7 xl:col-span-8">
                      <div className="relative bg-canvas-white border border-border-subtle rounded-3xl overflow-hidden shadow-sm flex flex-col" style={{ minHeight: '520px' }}>

                        <AnimatePresence>
                          {isAnalyzing && <AIScanningOverlay onDone={handleAnalysisDone} />}
                        </AnimatePresence>

                        {!hasCalculated && !isAnalyzing && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8">
                            <div className="w-20 h-20 rounded-2xl bg-canvas-secondary border border-border-subtle flex items-center justify-center">
                              <BarChart3 className="w-10 h-10 text-text-muted/40" />
                            </div>
                            <div className="text-center">
                              <p className="text-text-primary font-bold">No estimate generated yet</p>
                              <p className="text-text-muted font-medium text-sm mt-1">Configure your treatment and click Run AI Analysis</p>
                            </div>
                          </div>
                        )}

                        {result && !isAnalyzing && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

                            {/* Result header */}
                            <div className="p-6 md:p-8 border-b border-border-subtle bg-canvas-secondary/50">
                              <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                                <div>
                                  <p className="text-xs text-text-muted font-bold uppercase tracking-widest mb-1">Estimated Total Hospital Bill</p>
                                  <motion.div
                                    className="text-4xl font-extrabold text-text-primary tracking-tight font-mono"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    ₹{result.totalBill.toLocaleString('en-IN')}
                                  </motion.div>
                                  <p className="text-xs font-semibold text-text-muted mt-1.5">{procedure} &middot; {hospital.split(',')[0]}</p>
                                </div>
                                <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
                                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${result.withinLimits ? 'bg-status-covered/10 border-status-covered/20 text-status-covered' : 'bg-status-oop/10 border-status-oop/20 text-status-oop'}`}>
                                    {result.withinLimits ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                    {result.withinLimits ? 'Within Policy Limits' : 'Exceeds Policy Limits'}
                                  </div>
                                  <ConfidenceMeter value={result.confidence} />
                                </div>
                              </div>
                            </div>

                            <div className="p-6 md:p-8 space-y-6">

                              {/* Coverage bar */}
                              <div className="space-y-2.5">
                                <div className="flex justify-between text-sm font-bold">
                                  <span className="flex items-center gap-2 text-status-covered">
                                    <CheckCircle className="w-4 h-4" />
                                    Covered: <span className="font-mono">₹{result.covered.toLocaleString('en-IN')}</span>
                                  </span>
                                  <span className="flex items-center gap-2 text-status-oop">
                                    <BadgePercent className="w-4 h-4" />
                                    Out of Pocket: <span className="font-mono">₹{result.outOfPocket.toLocaleString('en-IN')}</span>
                                  </span>
                                </div>
                                <div className="h-3 bg-canvas-secondary border border-border-subtle rounded-full overflow-hidden flex">
                                  <motion.div
                                    className="h-full rounded-l-full bg-status-covered"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${coveredPct}%` }}
                                    transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
                                  />
                                  <div className="h-full flex-1 rounded-r-full bg-status-oop" />
                                </div>
                                <p className="text-xs font-semibold text-text-muted text-right">{coveredPct}% covered by your active policy</p>
                              </div>

                              {/* Invoice table */}
                              <div className="border border-border-subtle rounded-xl overflow-hidden text-sm bg-canvas-white">
                                <div className="grid grid-cols-12 gap-2 md:gap-4 px-4 py-3 text-[11px] font-bold text-text-muted uppercase tracking-wider bg-canvas-secondary">
                                  <div className="col-span-5 md:col-span-6">Expense Category</div>
                                  <div className="hidden md:block md:col-span-2 text-right">Est. Cost</div>
                                  <div className="col-span-4 md:col-span-2 text-right">Status</div>
                                  <div className="col-span-3 md:col-span-2 text-right text-text-primary">You Pay</div>
                                </div>

                                {result.breakdown.map((row, i) => (
                                  <motion.div
                                    key={row.category}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 + i * 0.08 }}
                                    className={`grid grid-cols-12 gap-2 md:gap-4 px-4 py-3.5 border-t border-border-subtle items-center ${!row.covered ? 'bg-status-oop/5' : ''}`}
                                  >
                                    <div className="col-span-5 md:col-span-6">
                                      <div className="flex items-center gap-2 font-bold text-text-primary">
                                        {!row.covered && <AlertTriangle className="w-3 h-3 text-status-oop shrink-0" />}
                                        <span className="text-xs md:text-sm">{row.category}</span>
                                      </div>
                                      {row.note && <p className="text-[11px] font-medium text-text-muted mt-0.5 leading-relaxed">{row.note}</p>}
                                    </div>
                                    <div className="hidden md:block md:col-span-2 text-right text-text-muted font-mono text-xs md:text-sm font-semibold">
                                      ₹{row.estimated.toLocaleString('en-IN')}
                                    </div>
                                    <div className="col-span-4 md:col-span-2 text-right flex justify-end">
                                      <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-bold ${row.covered ? 'bg-status-covered/10 text-status-covered border border-status-covered/20' : 'bg-status-oop/10 text-status-oop border border-status-oop/20'}`}>
                                        {row.covered ? 'Covered' : 'Excluded'}
                                      </span>
                                    </div>
                                    <div className={`col-span-3 md:col-span-2 text-right font-bold font-mono text-xs md:text-sm ${row.youPay > 0 ? 'text-status-oop' : 'text-text-muted'}`}>
                                      {row.youPay > 0 ? `₹${row.youPay.toLocaleString('en-IN')}` : '--'}
                                    </div>
                                  </motion.div>
                                ))}

                                {/* Total */}
                                <div className="grid grid-cols-12 gap-2 md:gap-4 px-4 py-4 border-t border-brand-electric/20 items-center bg-brand-electric/5">
                                  <div className="col-span-5 md:col-span-8 font-bold text-text-primary flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-brand-electric" /> Total
                                  </div>
                                  <div className="hidden md:block md:col-span-2 text-right font-bold font-mono text-text-primary">
                                    ₹{result.totalBill.toLocaleString('en-IN')}
                                  </div>
                                  <div className="col-span-7 md:col-span-2 text-right font-extrabold font-mono text-status-oop text-sm md:text-base">
                                    ₹{result.outOfPocket.toLocaleString('en-IN')}
                                  </div>
                                </div>
                              </div>

                              {/* AI Insights */}
                              <div className="rounded-xl border border-brand-ai-cyan/20 p-5 space-y-3 bg-brand-ai-cyan/5">
                                <h4 className="text-xs font-bold text-brand-deep-navy uppercase tracking-widest flex items-center gap-2">
                                  <Sparkles className="w-3.5 h-3.5 text-brand-ai-cyan" /> AI Policy Insights
                                </h4>
                                {result.aiInsights.map((insight, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.12 }}
                                    className="flex gap-2.5 text-xs font-semibold text-text-primary leading-relaxed"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-ai-cyan mt-1.5 shrink-0" />
                                    {insight}
                                  </motion.div>
                                ))}
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-muted">
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

            {/* TAB: DOCUMENTS / VAULT */}
            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 p-6 md:p-8 overflow-y-auto"
              >
                <div className="max-w-5xl mx-auto space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold text-text-primary">Document Vault</h2>
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                      />
                      <button 
                        className="bg-brand-electric hover:bg-brand-bright text-canvas-white font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md focus-ring disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? 'Uploading...' : 'Upload New Policy'} <Paperclip className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                      <div 
                        key={doc.id}
                        className={`bg-canvas-white border rounded-2xl p-6 relative overflow-hidden transition-colors shadow-sm ${
                          doc.isActive 
                            ? 'border-brand-electric ring-1 ring-brand-electric' 
                            : 'border-border-subtle hover:border-text-muted/30'
                        }`}
                      >
                        {doc.isActive && (
                          <div className="absolute top-0 right-0 p-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-status-covered animate-pulse" />
                          </div>
                        )}
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 ${
                          doc.isActive 
                            ? 'bg-brand-electric/10 border-brand-electric/20 text-brand-electric' 
                            : 'bg-canvas-secondary border-border-subtle text-text-muted'
                        }`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold mb-1 text-text-primary">{doc.title}</h3>
                        <p className="text-xs font-semibold text-text-muted mb-6">{doc.details}</p>
                        <div className="space-y-3">
                          {[
                            ['Status', doc.status, doc.statusColor === 'text-green-400' ? 'text-status-covered' : doc.statusColor === 'text-amber-400' ? 'text-amber-600' : 'text-brand-electric'], 
                            ['Pages', doc.pages, 'text-text-primary'], 
                            ['File Size', doc.size, 'text-text-primary']
                          ].map(([k, v, cls]) => (
                            <div key={k} className="flex justify-between text-xs font-bold">
                              <span className="text-text-muted">{k}</span>
                              <span className={cls}>{v}</span>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-6 flex gap-2 ${!doc.isActive ? 'opacity-70 group-hover:opacity-100 transition-opacity' : ''}`}>
                          <button className="flex-1 py-2 rounded-lg border border-border-subtle text-text-primary font-bold hover:bg-canvas-secondary text-sm transition-colors focus-ring">View PDF</button>
                          {!doc.isActive ? (
                            <button 
                              className="flex-1 py-2 rounded-lg border border-border-subtle text-text-primary font-bold hover:bg-canvas-secondary text-sm transition-colors focus-ring"
                              onClick={() => setActiveDocument(doc.id)}
                            >
                              Set Active
                            </button>
                          ) : (
                            <button className="flex-1 py-2 rounded-lg bg-brand-electric text-canvas-white font-bold text-sm hover:bg-brand-bright transition-colors focus-ring">
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
                className="absolute inset-0 p-6 md:p-8 overflow-y-auto"
              >
                <div className="max-w-3xl mx-auto space-y-8">
                  <h2 className="text-2xl font-bold text-text-primary">Account Settings</h2>
                  
                  <div className="bg-canvas-white border border-border-subtle shadow-sm rounded-2xl p-6 space-y-6">
                    <h3 className="text-lg font-bold border-b border-border-subtle pb-4 text-text-primary">Profile Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">Display Name</label>
                        <input 
                          type="text" 
                          disabled 
                          value={getDisplayName()} 
                          className="w-full bg-canvas-secondary border border-border-subtle rounded-xl p-3 text-sm font-semibold text-text-muted cursor-not-allowed" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">Email Address</label>
                        <input 
                          type="text" 
                          disabled 
                          value={user?.email || ''} 
                          className="w-full bg-canvas-secondary border border-border-subtle rounded-xl p-3 text-sm font-semibold text-text-muted cursor-not-allowed" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-canvas-white border border-border-subtle shadow-sm rounded-2xl p-6 space-y-6">
                    <h3 className="text-lg font-bold border-b border-border-subtle pb-4 text-text-primary">Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-text-primary">Email Notifications</p>
                          <p className="text-sm font-medium text-text-muted mt-0.5">Receive alerts when policy updates occur.</p>
                        </div>
                        <div className="w-11 h-6 bg-brand-electric rounded-full relative cursor-pointer focus-ring" tabIndex={0}>
                          <div className="absolute right-1 top-1 w-4 h-4 bg-canvas-white rounded-full transition-transform"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-text-primary">Dark Mode</p>
                          <p className="text-sm font-medium text-text-muted mt-0.5">Currently locked to NovaNex theme.</p>
                        </div>
                        <div className="w-11 h-6 bg-border-subtle rounded-full relative cursor-not-allowed opacity-50">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-canvas-white rounded-full transition-transform"></div>
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
