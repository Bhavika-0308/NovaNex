import Nav from '../components/Nav';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, CheckCircle2, Sparkles, AlertTriangle, 
  ChevronRight, Activity, MessageSquare, FileCode,
  IndianRupee, Cpu, BookOpen, Check, Zap, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import Logo from '../components/Logo';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-6, 0, 6]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [3, 0, 3]);
  const yOffset = useTransform(scrollYProgress, [0, 0.5, 1], [0, 30, 0]);

  return (
    <div className="min-h-screen font-sans text-[#0B1020] relative overflow-hidden" ref={containerRef}>
      
      <Nav />

      {/* ========================================================= */}
      {/* 1. HERO SECTION (Layered Gradient Orbs)                     */}
      {/* ========================================================= */}
      <section className="relative z-10 w-full min-h-[760px] flex items-center bg-[#F5F7FF] overflow-hidden pt-28 pb-20">
        
        {/* Layered Gradient Background Orbs */}
        {/* TOP RIGHT: Electric blue + soft cyan */}
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-[radial-gradient(circle_at_85%_15%,_rgba(37,99,235,0.16),_transparent_35%)] pointer-events-none z-0"></div>
        
        {/* TOP LEFT: Very subtle purple */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_15%_35%,_rgba(124,58,237,0.10),_transparent_35%)] pointer-events-none z-0"></div>
        
        {/* BOTTOM RIGHT: Soft cyan/blue */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-[radial-gradient(circle_at_80%_85%,_rgba(6,182,212,0.10),_transparent_35%)] pointer-events-none z-0"></div>

        <div className="max-w-[1300px] mx-auto px-6 flex flex-col lg:flex-row w-full relative items-center justify-between gap-12 lg:gap-6">
          
          {/* LEFT: Typography & CTA (~48%) */}
          <div className="w-full lg:w-[48%] z-20 flex flex-col justify-center">
            
            {/* AI Policy Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#EEF4FF] to-[#F3EEFF] border border-[#BFDBFE] w-max shadow-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span className="text-[12px] font-extrabold text-[#2563EB] tracking-widest uppercase">
                NovaNex AI Policy Intelligence
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-[3.5rem] sm:text-[4rem] lg:text-[4.5rem] font-extrabold leading-[1.05] tracking-tight"
            >
              <span className="block text-[#0B1020]">40 pages of</span>
              <span className="block text-[#0B1020]">fine print.</span>
              <span className="block text-[#64748B] text-[2.75rem] sm:text-[3rem] lg:text-[3.5rem] mt-3">Turned into</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#7C3AED] mt-1 pb-1">
                3 clear answers.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-[17px] text-[#334155] max-w-[480px] leading-relaxed pt-5 font-medium"
            >
              Upload your health insurance policy and instantly understand coverage, exclusions, and expected out-of-pocket costs — with every answer backed by the policy itself.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              className="flex flex-wrap items-center gap-4 pt-8"
            >
              <Link
                to="/login"
                className="bg-[#2563EB] text-white font-bold h-[50px] px-8 rounded-[14px] inline-flex items-center justify-center gap-2 hover:bg-[#1D4ED8] transition-all active:scale-[0.98] shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.35)]"
              >
                Analyze Your Policy <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <Link
                to="/features"
                className="bg-white/80 backdrop-blur-sm border border-[#D7E0F0] text-[#0B1020] font-bold h-[50px] px-8 rounded-[14px] inline-flex items-center justify-center gap-2 hover:bg-[#EEF4FF] hover:border-[#BFDBFE] transition-all active:scale-[0.98]"
              >
                See How It Works <ChevronRight className="w-4 h-4 text-[#64748B]" />
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <div className="pt-8 flex flex-wrap items-center gap-5 text-[13px] text-[#64748B] font-bold tracking-wide">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" /> Policy-based answers
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#3B82F6]" /> Clause citations
              </span>
              <span className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-[#7C3AED]" /> Clear cost breakdowns
              </span>
            </div>
          </div>

          {/* RIGHT: Live Dashboard Mockup (~52%) */}
          <div className="w-full lg:w-[52%] relative h-auto flex justify-center lg:justify-end z-20 mt-12 lg:mt-0">
            
            {/* AI Glow Behind Dashboard */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#06B6D4] opacity-20 blur-[80px] rounded-full pointer-events-none -z-10"></div>

            <motion.div 
              style={{ rotateY, rotateX, y: yOffset }}
              className="relative w-full max-w-[560px] transform-gpu perspective-1000"
            >
              
              {/* Floating Element 1: Policy Analyzed */}
              <motion.div 
                initial={{ opacity: 0, x: -20, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.6 }}
                className="absolute -left-12 top-6 bg-white p-4 rounded-2xl shadow-[0_12px_40px_rgba(11,16,32,0.12)] border border-[#E2E8F0] z-30 flex items-center gap-3 backdrop-blur-md"
              >
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#16A34A]">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-[#0B1020] uppercase tracking-wider mb-0.5">✓ POLICY ANALYZED</p>
                  <p className="text-[10px] text-[#16A34A] font-mono font-bold tracking-widest">94% CONFIDENCE</p>
                </div>
              </motion.div>

              {/* Main Product UI Dashboard Preview */}
              <div className="bg-white rounded-[24px] shadow-[0_30px_80px_-15px_rgba(11,16,32,0.15),0_0_0_1px_rgba(215,224,240,1)] overflow-hidden flex flex-col z-20 relative">
                {/* Header */}
                <div className="bg-[#0B1020] text-white px-6 py-4 flex items-center justify-between border-b border-[#1E293B]">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                    <span className="text-[11px] font-bold tracking-widest text-white uppercase">LIVE POLICY INTELLIGENCE</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1E293B]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                    <span className="text-[9px] font-mono font-bold tracking-wider text-[#94A3B8]">CONNECTED</span>
                  </div>
                </div>

                {/* Dashboard Body */}
                <div className="p-7 bg-[#FFFFFF]">
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <h3 className="text-[22px] font-extrabold text-[#0B1020] tracking-tight">Health Shield Pro</h3>
                      <p className="text-[11px] text-[#64748B] font-mono font-bold mt-1.5 tracking-wider">SUM INSURED: ₹10,00,000</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {/* Item 1 */}
                    <div className="bg-white p-4 rounded-2xl border border-[#D7E0F0] flex justify-between items-center shadow-[0_2px_10px_rgba(11,16,32,0.02)]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#2563EB] flex items-center justify-center">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#0B1020]">Room Rent</p>
                          <p className="text-[12px] text-[#64748B] font-medium">₹5,000/day Limit</p>
                        </div>
                      </div>
                      <span className="bg-[#16A34A] text-white text-[10px] font-bold px-3 py-1.5 rounded-[8px] uppercase tracking-wide">Covered</span>
                    </div>

                    {/* Item 2 */}
                    <div className="bg-white p-4 rounded-2xl border border-[#D7E0F0] flex justify-between items-center shadow-[0_2px_10px_rgba(11,16,32,0.02)]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#EEF4FF] text-[#2563EB] flex items-center justify-center">
                          <Eye className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#0B1020]">Cataract</p>
                          <p className="text-[12px] text-[#64748B] font-medium">₹40,000 Limit</p>
                        </div>
                      </div>
                      <span className="bg-[#16A34A] text-white text-[10px] font-bold px-3 py-1.5 rounded-[8px] uppercase tracking-wide">Covered</span>
                    </div>

                    {/* Item 3 */}
                    <div className="bg-white p-4 rounded-2xl border border-[#D7E0F0] flex justify-between items-center shadow-[0_2px_10px_rgba(11,16,32,0.02)]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#0B1020]">Consumables</p>
                          <p className="text-[12px] text-[#64748B] font-medium">Estimated ₹12,000</p>
                        </div>
                      </div>
                      <span className="bg-[#EF4444] text-white text-[10px] font-bold px-3 py-1.5 rounded-[8px] uppercase tracking-wide">You Pay</span>
                    </div>

                    {/* Item 4 */}
                    <div className="bg-[#F3EEFF] p-4 rounded-2xl border border-[#DDD6FE] flex justify-between items-center shadow-[0_2px_10px_rgba(124,58,237,0.05)]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center">
                          <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#0B1020]">Robotic Surgery</p>
                          <p className="text-[12px] text-[#7C3AED] font-bold">AI ANALYSIS</p>
                        </div>
                      </div>
                      <span className="bg-white text-[#7C3AED] border border-[#DDD6FE] text-[10px] font-bold px-3 py-1.5 rounded-[8px] uppercase tracking-wide">Clause 4.4</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Floating Element 2: Clause Extract */}
              <motion.div 
                initial={{ opacity: 0, x: 20, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: 0.8 }}
                className="absolute -right-8 top-1/4 bg-white p-4 rounded-2xl shadow-[0_16px_40px_rgba(11,16,32,0.1)] border border-[#E2E8F0] z-30 w-52"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3B82F6]">CLAUSE 4.2</span>
                </div>
                <p className="text-[13px] font-bold text-[#0B1020] leading-snug">Room rent covered up to ₹5,000 / day.</p>
              </motion.div>

              {/* Floating Element 3: OOP Estimate */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="absolute -left-6 -bottom-6 bg-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(11,16,32,0.12)] border border-[#E2E8F0] z-30"
              >
                <p className="text-[10px] font-extrabold text-[#EF4444] uppercase tracking-widest mb-1.5">Estimated Out-of-Pocket</p>
                <p className="text-3xl font-black text-[#0B1020] font-mono tracking-tight">₹22,500</p>
                <div className="w-full h-1 bg-[#FEF2F2] mt-3 rounded-full overflow-hidden">
                  <div className="h-full bg-[#EF4444] w-[15%]"></div>
                </div>
              </motion.div>

              {/* Floating Element 4: Copilot Query */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                className="absolute -right-12 -bottom-2 bg-[#0B1020] text-white p-4.5 rounded-2xl shadow-[0_20px_60px_rgba(11,16,32,0.25)] border border-[#1E293B] z-30 flex gap-3 max-w-[250px]"
              >
                <MessageSquare className="w-5 h-5 text-[#06B6D4] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-bold text-[#7C3AED] uppercase tracking-widest block mb-1">AI COPILOT</span>
                  <p className="text-[13px] font-medium leading-relaxed text-[#F8FAFC]">"Is robotic knee surgery covered?"</p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Hero -> Next Section Transition (Soft gradient) */}
      <div className="w-full h-32 bg-gradient-to-b from-[#F5F7FF] via-[#F3EEFF] to-[#FFFFFF] border-b border-[#E2E8F0]"></div>

      {/* ========================================================= */}
      {/* 2. HOW IT WORKS (White / Lavender)                          */}
      {/* ========================================================= */}
      <section className="py-24 bg-white relative">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#0B1020] tracking-tight">
              From policy PDF <br/> to clear decision.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-[#F5F7FF] p-8 rounded-[24px] border border-[#D7E0F0] hover:-translate-y-1 transition-transform duration-300">
              <span className="text-5xl font-black text-[#EEF4FF] mb-2 drop-shadow-sm font-mono">01</span>
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#2563EB] mb-5 shadow-sm">
                <FileCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0B1020] mb-2 uppercase tracking-wide">UPLOAD</h3>
              <p className="text-[15px] text-[#64748B] font-medium">Upload your policy PDF.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-[#F3EEFF] p-8 rounded-[24px] border border-[#DDD6FE] hover:-translate-y-1 transition-transform duration-300">
              <span className="text-5xl font-black text-[#FFFFFF] mb-2 drop-shadow-sm font-mono">02</span>
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#7C3AED] mb-5 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0B1020] mb-2 uppercase tracking-wide">UNDERSTAND</h3>
              <p className="text-[15px] text-[#64748B] font-medium">NovaNex extracts coverage, exclusions and limits.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-[#ECFDF5] p-8 rounded-[24px] border border-[#A7F3D0] hover:-translate-y-1 transition-transform duration-300">
              <span className="text-5xl font-black text-[#FFFFFF] mb-2 drop-shadow-sm font-mono">03</span>
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#16A34A] mb-5 shadow-sm">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0B1020] mb-2 uppercase tracking-wide">DECIDE</h3>
              <p className="text-[15px] text-[#64748B] font-medium">See your expected out-of-pocket cost.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. AI COPILOT (Deep Navy + Blue/Purple Glow)                */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#0B1020] relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[radial-gradient(circle_at_50%_50%,_rgba(6,182,212,0.12),_transparent_60%)] pointer-events-none"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_50%_50%,_rgba(124,58,237,0.15),_transparent_60%)] pointer-events-none"></div>
        
        <div className="max-w-[900px] mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold leading-[1.1] text-white tracking-tight">
              Ask your policy <br/> anything.
            </h2>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-[24px] p-6 md:p-10 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
            <div className="space-y-8">
              
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-[#2563EB] text-white px-6 py-4 rounded-[20px] rounded-tr-sm max-w-[85%] text-[15px] md:text-[17px] font-medium shadow-lg">
                  Is robotic knee surgery covered?
                </div>
              </div>

              {/* AI Message */}
              <div className="flex justify-start">
                <div className="bg-[#1E293B] border border-[#334155] px-6 py-6 md:p-8 rounded-[24px] rounded-tl-sm max-w-[95%] text-white shadow-xl space-y-5">
                  <div className="flex items-center gap-2 text-[#06B6D4] text-[11px] font-bold uppercase tracking-widest">
                    <Sparkles className="w-4 h-4" /> AI GROUNDED RESPONSE
                  </div>
                  <p className="leading-relaxed text-[17px] md:text-[19px] font-medium text-[#F8FAFC]">
                    Yes. Your policy covers robotic-assisted surgery under Clause 4.4, subject to the applicable limit.
                  </p>
                  
                  {/* Citations block */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="bg-[#0B1020] border border-[#334155] text-[#06B6D4] text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono font-bold tracking-wider">
                      CLAUSE 4.4
                    </span>
                    <span className="bg-[#0B1020] border border-[#334155] text-[#94A3B8] text-[11px] px-3 py-1.5 rounded-lg font-mono font-bold tracking-wider">
                      PAGE 14
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. COVERAGE / COST SECTION (Light Mint/Blue)                */}
      {/* ========================================================= */}
      <section className="py-28 bg-[#EEF4FF] border-b border-[#D7E0F0]">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl sm:text-[3.5rem] font-extrabold text-[#0B1020] tracking-tight leading-tight">
              Know what is covered. <br/> Know what you pay.
            </h2>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[32px] border border-[#E2E8F0] shadow-[0_12px_40px_rgba(11,16,32,0.04)]">
            
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
              <div className="w-full md:w-1/2">
                <span className="text-[#64748B] font-bold text-xs uppercase tracking-widest mb-3 block">
                  INSURANCE COVERS
                </span>
                <p className="text-5xl lg:text-6xl font-black text-[#16A34A] font-mono tracking-tight">₹1,27,500</p>
              </div>

              <div className="w-full md:w-1/2 md:text-right">
                <span className="text-[#64748B] font-bold text-xs uppercase tracking-widest mb-3 block">
                  YOU PAY
                </span>
                <p className="text-5xl lg:text-6xl font-black text-[#EF4444] font-mono tracking-tight">₹22,500</p>
              </div>
            </div>

            {/* Visual Split Bar */}
            <div className="w-full mb-12">
              <div className="flex justify-between text-xs font-extrabold mb-3 uppercase tracking-widest">
                <span className="text-[#16A34A]">85%</span>
                <span className="text-[#EF4444]">15%</span>
              </div>
              <div className="h-6 w-full rounded-full overflow-hidden flex shadow-inner bg-[#E2E8F0]">
                <div className="h-full bg-[#16A34A]" style={{ width: '85%' }}></div>
                <div className="h-full bg-[#EF4444]" style={{ width: '15%' }}></div>
              </div>
            </div>

            {/* Supporting Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-5 rounded-2xl">
                <h4 className="font-bold text-[#0B1020] mb-1 text-[15px]">Room Rent</h4>
                <p className="text-[#16A34A] font-bold text-[13px] uppercase tracking-wide">Covered</p>
              </div>
              <div className="bg-[#FEF2F2] border border-[#FECACA] p-5 rounded-2xl">
                <h4 className="font-bold text-[#0B1020] mb-1 text-[15px]">Consumables</h4>
                <p className="text-[#EF4444] font-bold text-[13px]">₹12,000 out-of-pocket</p>
              </div>
              <div className="bg-[#F5F7FF] border border-[#D7E0F0] p-5 rounded-2xl">
                <h4 className="font-bold text-[#0B1020] mb-1 text-[15px]">Deductible</h4>
                <p className="text-[#64748B] font-bold text-[13px]">₹0</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. FINAL CTA (Blue/Purple Gradient)                         */}
      {/* ========================================================= */}
      <section className="py-32 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] relative overflow-hidden text-center">
        {/* Glow / Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_rgba(6,182,212,0.3),_transparent_70%)] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            Stop reading insurance <br/>
            like a lawyer.
          </h2>
          <p className="text-[19px] text-[#EEF4FF] max-w-2xl mx-auto font-medium">
            Upload your policy and turn complicated coverage into understandable answers.
          </p>
          <div className="pt-6 flex justify-center">
            <Link
              to="/login"
              className="bg-[#0B1020] text-white font-extrabold h-[60px] px-10 rounded-[16px] inline-flex items-center justify-center gap-3 hover:bg-[#111827] transition-all shadow-[0_12px_40px_rgba(11,16,32,0.4)] hover:-translate-y-1 text-lg"
            >
              Analyze My Policy <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. FOOTER (Deep Navy)                                       */}
      {/* ========================================================= */}
      <footer className="bg-[#0B1020] pt-20 pb-12">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <Logo size={32} />
              <span className="font-extrabold text-2xl tracking-tight text-white">NovaNex</span>
            </Link>
            <p className="text-[#64748B] text-[15px] max-w-xs font-medium">
              AI-powered policy intelligence.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[11px] uppercase tracking-widest text-[#94A3B8] mb-5">Product</h4>
            <ul className="space-y-4 text-[15px] font-medium text-[#F5F7FF]">
              <li><Link to="/features" className="hover:text-[#3B82F6] transition-colors">Features</Link></li>
              <li><Link to="/features" className="hover:text-[#3B82F6] transition-colors">How It Works</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#3B82F6] transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[11px] uppercase tracking-widest text-[#94A3B8] mb-5">Account</h4>
            <ul className="space-y-4 text-[15px] font-medium text-[#F5F7FF]">
              <li><Link to="/login" className="hover:text-[#3B82F6] transition-colors">Log in</Link></li>
              <li><Link to="/signup" className="hover:text-[#3B82F6] transition-colors">Get Started</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 border-t border-[#1E293B] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#64748B] uppercase tracking-widest font-bold">
          <p>© {new Date().getFullYear()} NovaNex.</p>
          <p>Illustrative demonstration only.</p>
        </div>
      </footer>

    </div>
  );
}
