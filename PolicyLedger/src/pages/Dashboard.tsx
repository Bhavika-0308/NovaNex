import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MessageSquare, Calculator, FileText, Send, Settings, LogOut, FileSearch, Zap, CheckCircle, AlertTriangle, ChevronRight, Activity, Paperclip } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello Josephine. I have successfully analyzed your Comprehensive Health policy (HP-458732). What would you like to know about your coverage?' }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setMessages([...messages, { role: 'user', text: message }]);
    setMessage('');
    
    // Mock AI response after a short delay
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Based on Section 3.1 (Coverage), robotic knee replacement surgery is covered, but subject to a sub-limit of 50% of the sum insured or ₹3,000,000, whichever is lower. Note: Consumables are strictly excluded (Section 4.2).' 
      }]);
    }, 1000);
  };

  return (
    <div className="h-screen bg-ink font-sans text-text flex overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className="w-20 lg:w-64 border-r border-white/10 bg-white/5 backdrop-blur-md flex flex-col justify-between z-20">
        <div>
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded bg-neon-blue flex items-center justify-center text-ink shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden lg:block group-hover:text-neon-blue transition-colors">PolicyLedger</span>
            </Link>
          </div>
          
          <nav className="p-4 space-y-2 mt-4">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${activeTab === 'chat' ? 'bg-neon-blue/20 text-neon-blue shadow-[inset_2px_0_0_#38BDF8]' : 'text-muted hover:bg-white/5 hover:text-text'}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium hidden lg:block">Policy Copilot</span>
            </button>
            <button 
              onClick={() => setActiveTab('estimator')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${activeTab === 'estimator' ? 'bg-neon-blue/20 text-neon-blue shadow-[inset_2px_0_0_#38BDF8]' : 'text-muted hover:bg-white/5 hover:text-text'}`}
            >
              <Calculator className="w-5 h-5" />
              <span className="font-medium hidden lg:block">Cost Estimator</span>
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${activeTab === 'documents' ? 'bg-neon-blue/20 text-neon-blue shadow-[inset_2px_0_0_#38BDF8]' : 'text-muted hover:bg-white/5 hover:text-text'}`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium hidden lg:block">My Documents</span>
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/10 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg text-muted hover:bg-white/5 hover:text-text transition-all">
            <Settings className="w-5 h-5" />
            <span className="font-medium hidden lg:block">Settings</span>
          </button>
          <Link to="/" className="w-full flex items-center gap-3 p-3 rounded-lg text-muted hover:bg-red-500/20 hover:text-red-400 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium hidden lg:block">Log out</span>
          </Link>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 relative flex flex-col h-full bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.05)_0%,transparent_50%)]">
        
        {/* Top Header */}
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-ink/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{activeTab === 'chat' ? 'Policy Copilot' : 'Treatment Cost Estimator'}</h1>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium tracking-wide">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Policy Extracted
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-medium border border-neon-blue/30 text-neon-blue rounded hover:bg-neon-blue/10 transition-colors">
              View Original PDF
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-purple-600 border-2 border-ink flex items-center justify-center font-bold text-white shadow-lg">
              JS
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* TAB 1: CHAT */}
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 flex flex-col p-8"
              >
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-6 pb-6 pr-4 scrollbar-hide">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-gradient-to-br from-neon-blue to-purple-600' : 'bg-white/5 border border-white/10 text-neon-blue'}`}>
                        {msg.role === 'user' ? 'JS' : <Shield className="w-5 h-5" />}
                      </div>
                      
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-neon-blue text-ink rounded-tr-sm' : 'bg-white/5 border border-white/10 text-text rounded-tl-sm shadow-[0_0_20px_rgba(56,189,248,0.05)]'}`}>
                        {msg.text}
                        
                        {/* Mock Citation for AI responses (except the first one) */}
                        {msg.role === 'ai' && i > 0 && (
                          <div className="mt-4 pt-3 border-t border-white/10">
                            <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-black/30 border border-white/5 text-xs text-muted hover:text-neon-blue hover:border-neon-blue/50 cursor-pointer transition-colors">
                              <FileSearch className="w-3 h-3" />
                              Page 14, Section 3.1 & 4.2
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="relative mt-auto">
                  <div className="absolute inset-0 bg-neon-blue/20 blur-xl rounded-full opacity-50 z-0 pointer-events-none"></div>
                  <div className="relative z-10 bg-ink border border-white/10 rounded-xl shadow-2xl flex items-end p-2 focus-within:border-neon-blue/50 transition-colors">
                    <button type="button" className="p-3 text-muted hover:text-neon-blue transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <textarea 
                      rows={1}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask a question about your policy (e.g., 'Is maternity covered?')"
                      className="flex-1 bg-transparent border-none focus:outline-none resize-none p-3 text-text placeholder:text-muted/50 max-h-32"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <button 
                      type="submit" 
                      disabled={!message.trim()}
                      className="p-3 bg-neon-blue text-ink rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neon-blue/90 transition-colors shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB 2: ESTIMATOR */}
            {activeTab === 'estimator' && (
              <motion.div 
                key="estimator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 p-8 overflow-y-auto"
              >
                <div className="max-w-5xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
                  
                  {/* Left Column: Inputs */}
                  <div className="xl:col-span-5 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-neon-blue" />
                        Treatment Details
                      </h2>
                      
                      <div className="space-y-5">
                        <div>
                          <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Diagnosis / Procedure</label>
                          <input type="text" defaultValue="Appendectomy (Laparoscopic)" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-neon-blue" />
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Hospital / Location</label>
                          <input type="text" defaultValue="Apollo Hospitals, Bangalore" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-neon-blue" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Room Type</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-neon-blue appearance-none">
                              <option>Private Single</option>
                              <option>Twin Sharing</option>
                              <option>Suite</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted uppercase tracking-wider mb-2 block">Duration (Days)</label>
                            <input type="number" defaultValue="3" className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-neon-blue" />
                          </div>
                        </div>

                        <button className="w-full neon-button justify-center mt-4">
                          Recalculate Estimate
                        </button>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-4">
                      <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold text-yellow-500 mb-1">Confidence Flag</h4>
                        <p className="text-xs text-yellow-500/80 leading-relaxed">Cost of consumables varies wildly between hospitals. The system assumes an average 8% of total bill for consumables, which is strictly out-of-pocket per Section 4.2.</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Output/Invoice */}
                  <div className="xl:col-span-7">
                    <div className="bg-[#0A101C] border border-neon-blue/30 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.1)] overflow-hidden">
                      <div className="bg-white/5 border-b border-white/10 p-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-sm text-muted font-medium mb-1">Estimated Total Hospital Bill</h3>
                            <div className="text-4xl font-bold text-white tracking-tight">₹1,45,000</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted mb-1">Policy Limit Check</div>
                            <div className="inline-flex items-center gap-1 text-green-400 text-sm font-medium">
                              <CheckCircle className="w-4 h-4" />
                              Within Limits
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Breakdown Bars */}
                        <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden flex">
                          <div className="h-full bg-green-500" style={{ width: '85%' }}></div>
                          <div className="h-full bg-red-500" style={{ width: '15%' }}></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Covered: <strong>₹1,23,250</strong></div>
                          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Out of Pocket: <strong>₹21,750</strong></div>
                        </div>

                        {/* Invoice Table */}
                        <div className="border border-white/10 rounded-lg overflow-hidden text-sm">
                          <div className="grid grid-cols-12 gap-4 bg-white/5 p-3 text-xs font-bold text-muted uppercase tracking-wider">
                            <div className="col-span-6">Expense Category</div>
                            <div className="col-span-3 text-right">Est. Cost</div>
                            <div className="col-span-3 text-right text-neon-blue">You Pay</div>
                          </div>
                          
                          <div className="grid grid-cols-12 gap-4 p-3 border-t border-white/10 hover:bg-white/5 transition-colors items-center">
                            <div className="col-span-6 font-medium">Room Rent (3 Days)</div>
                            <div className="col-span-3 text-right">₹24,000</div>
                            <div className="col-span-3 text-right text-red-400 font-bold">₹9,000*</div>
                          </div>
                          
                          <div className="grid grid-cols-12 gap-4 p-3 border-t border-white/10 hover:bg-white/5 transition-colors items-center">
                            <div className="col-span-6 font-medium">Surgeon & Anesthetist Fees</div>
                            <div className="col-span-3 text-right">₹75,000</div>
                            <div className="col-span-3 text-right text-white">₹0</div>
                          </div>
                          
                          <div className="grid grid-cols-12 gap-4 p-3 border-t border-white/10 hover:bg-white/5 transition-colors items-center">
                            <div className="col-span-6 font-medium">OT & Equipment Charges</div>
                            <div className="col-span-3 text-right">₹35,000</div>
                            <div className="col-span-3 text-right text-white">₹0</div>
                          </div>
                          
                          <div className="grid grid-cols-12 gap-4 p-3 border-t border-white/10 hover:bg-white/5 transition-colors items-center bg-red-500/5">
                            <div className="col-span-6 font-medium flex items-center gap-2">
                              Consumables & Disposables <AlertTriangle className="w-3 h-3 text-red-400" />
                            </div>
                            <div className="col-span-3 text-right">₹11,000</div>
                            <div className="col-span-3 text-right text-red-400 font-bold">₹11,000**</div>
                          </div>
                        </div>

                        {/* Rationale Notes */}
                        <div className="bg-white/5 rounded-lg p-4 space-y-3 text-xs leading-relaxed text-muted">
                          <p><strong className="text-red-400">* Room Rent Co-pay:</strong> Your policy caps room rent at 1% of Sum Insured (₹5,000/day). The Private Single room at Apollo is estimated at ₹8,000/day. You are liable for the ₹3,000/day difference.</p>
                          <p><strong className="text-red-400">** Non-Medical Exclusions:</strong> Surgical gloves, masks, and disposable kits fall under "Non-Medical Expenses" (Section 4.2, Clause C) and are universally excluded from coverage.</p>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                  
                </div>
              </motion.div>
            )}

            {/* TAB 3: DOCUMENTS */}
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
                    <button className="neon-button">
                      Upload New Policy <Paperclip className="w-4 h-4 ml-2" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Active Document Card */}
                    <div className="bg-white/5 border border-neon-blue/50 rounded-2xl p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(56,189,248,0.1)]">
                      <div className="absolute top-0 right-0 p-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse"></div>
                      </div>
                      
                      <div className="w-12 h-12 rounded-xl bg-neon-blue/20 border border-neon-blue/30 text-neon-blue flex items-center justify-center mb-6">
                        <FileText className="w-6 h-6" />
                      </div>
                      
                      <h3 className="text-lg font-bold mb-1">Comprehensive Health</h3>
                      <p className="text-xs text-muted mb-6">HP-458732 • Uploaded Oct 24</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">Status</span>
                          <span className="text-neon-blue font-medium">Fully Extracted</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">Pages</span>
                          <span className="text-text">42 Pages</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">File Size</span>
                          <span className="text-text">2.4 MB</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex gap-2">
                        <button className="flex-1 py-2 rounded border border-white/10 hover:bg-white/5 text-sm transition-colors">View PDF</button>
                        <button className="flex-1 py-2 rounded bg-neon-blue text-ink font-medium text-sm hover:bg-neon-blue/90 transition-colors">Set Active</button>
                      </div>
                    </div>

                    {/* Inactive Document Card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-muted flex items-center justify-center mb-6">
                        <FileText className="w-6 h-6" />
                      </div>
                      
                      <h3 className="text-lg font-bold mb-1">Corporate Group Policy</h3>
                      <p className="text-xs text-muted mb-6">CG-992144 • Uploaded Sep 12</p>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">Status</span>
                          <span className="text-green-400 font-medium">Fully Extracted</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">Pages</span>
                          <span className="text-text">18 Pages</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">File Size</span>
                          <span className="text-text">1.1 MB</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button className="flex-1 py-2 rounded border border-white/10 hover:bg-white/5 text-sm transition-colors">View PDF</button>
                        <button className="flex-1 py-2 rounded border border-white/10 hover:bg-white/5 text-sm transition-colors">Set Active</button>
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
