import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Check, 
  ArrowRight, 
  Copy, 
  Lock, 
  CreditCard,
  HelpCircle,
  FileSignature,
  FileSpreadsheet,
  Plus,
  Trash2,
  User,
  Settings,
  LogOut,
  Bell,
  Activity,
  Shield,
  Database,
  Briefcase,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing', 'login', 'register', 'app'
  const [dashboardTab, setDashboardTab] = useState('overview'); // 'overview', 'contract', 'invoice', 'profile', 'billing'
  const [plan, setPlan] = useState('free'); // 'free' or 'premium'
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Mobile navigation
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User profile cabinet settings
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('draft_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Freelancer Alpha',
      email: 'freelancer@example.com',
      supabaseUrl: '',
      supabaseAnonKey: '',
      stripePublishableKey: '',
      stripeSecretKey: '',
      stripePaymentLink: ''
    };
  });

  // Contract parameters
  const [clientName, setClientName] = useState('');
  const [projectScope, setProjectScope] = useState('');
  const [rate, setRate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 15');
  const [generatedContract, setGeneratedContract] = useState('');

  // Invoice parameters
  const [invoiceClient, setInvoiceClient] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([{ desc: '', qty: 1, rate: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoiceOutput, setInvoiceOutput] = useState(null);

  // Digital Signature Canvas
  const canvasRef = useRef(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  const profileSigCanvasRef = useRef(null);
  const [isProfileSigning, setIsProfileSigning] = useState(false);

  // Document history list
  const [docHistory, setDocHistory] = useState(() => {
    const saved = localStorage.getItem('draft_documents');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'Agreement', name: 'Acme Corp Web Build', client: 'Acme LLC', rate: 1500, status: 'SIGNED', date: '2 hours ago' },
      { id: 2, type: 'Invoice', name: 'Logo Design Kit', client: 'John Doe Ltd', rate: 450, status: 'PAID', date: '3 days ago' }
    ];
  });

  const [signerIp, setSignerIp] = useState('');
  const [mockShaHash, setMockShaHash] = useState('');

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        if (data && data.ip) {
          setSignerIp(data.ip);
          const mockHash = 'SHA-256: 8f4c' + Math.random().toString(16).substring(2, 10) + '9b7e8d2c' + Math.random().toString(16).substring(2, 10);
          setMockShaHash(mockHash);
        }
      })
      .catch(() => {
        setSignerIp('192.168.1.75');
        setMockShaHash('SHA-256: 8a4c10ef9b7e8d2c0b49f99e3a6c11d08c873f2a1b9e2c4d');
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('draft_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('draft_documents', JSON.stringify(docHistory));
  }, [docHistory]);

  const exportFeesToInvoice = () => {
    if (!rate || !clientName) {
      alert("⚠️ Please enter a client name and contract rate first before exporting!");
      return;
    }
    setInvoiceClient(clientName);
    setInvoiceItems([{ desc: "Services rendered as per contract agreement", qty: 1, rate: Number(rate) || 0 }]);
    triggerToast("✓ Exported contract fees & client to Invoice Workspace!");
    setDashboardTab('invoice');
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2000);
  };

  const handleProfileUpdate = (field, val) => {
    setUserProfile({ ...userProfile, [field]: val });
  };

  const saveCredentials = (e) => {
    e.preventDefault();
    localStorage.setItem('draft_profile', JSON.stringify(userProfile));
    triggerToast('⚙️ API Credentials saved securely!');
  };

  const handleUpgrade = () => {
    if (userProfile.stripePaymentLink) {
      const link = userProfile.stripePaymentLink.trim();
      if (/^https?:\/\//i.test(link)) {
        window.location.href = link;
        return;
      } else {
        triggerToast('⚠️ Invalid Stripe Payment Link! Must start with http:// or https://');
        return;
      }
    }
    setUpgradeLoading(true);
    setTimeout(() => {
      setPlan('premium');
      setUpgradeLoading(false);
      setShowUpgradeModal(false);
      triggerToast('👑 Premium account activated successfully!');
    }, 1500);
  };

  const startSigning = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsSigning(true);
  };

  const draw = (e) => {
    if (!isSigning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setSigned(true);
  };

  const stopSigning = () => {
    setIsSigning(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  const startProfileSigning = (e) => {
    const canvas = profileSigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsProfileSigning(true);
  };

  const drawProfileSig = (e) => {
    if (!isProfileSigning) return;
    const canvas = profileSigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopProfileSigning = () => {
    setIsProfileSigning(false);
  };

  const clearProfileSig = () => {
    const canvas = profileSigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleProfileUpdate('contractorSignature', '');
  };

  const saveProfileSig = () => {
    const canvas = profileSigCanvasRef.current;
    if (!canvas) return;
    const sigUrl = canvas.toDataURL();
    handleProfileUpdate('contractorSignature', sigUrl);
    triggerToast('✓ Contractor signature stamp saved!');
  };

  const generateContractDraft = () => {
    if (!clientName.trim() || !projectScope.trim() || !rate) {
      alert("⚠️ Please fill in all parameters to generate the contract.");
      return;
    }
    const contractText = `FREELANCE SERVICES AGREEMENT

This Agreement is made active as of ${new Date().toLocaleDateString()}, by and between:
CONTRACTOR: [Your Name / Company]
CLIENT: ${clientName}

1. SERVICES RENDERED
Contractor agrees to perform the following development/design services for Client:
"${projectScope}"

2. PAYMENT & RATE
Client agrees to pay Contractor a fixed/rate sum fee of $${rate} for the completion of services.
Payment shall be made in accordance with the following terms: ${paymentTerms}.

3. INTELLECTUAL PROPERTY
Upon receipt of full final payment, Contractor transfers all copyright and intellectual property rights of the custom work delivered to Client. Contractor retains rights to showcase completed visuals in professional portfolios.

4. INDEMNIFICATION & WARRANTY
Services are rendered as-is. Contractor does not provide ongoing software runtime warranties post-delivery unless explicitly contracted under a separate maintenance arrangement.

IN WITNESS WHEREOF, the parties execute this Agreement.`;
    
    setGeneratedContract(contractText);
    setTimeout(() => {
      clearSignature();
    }, 100);

    setDocHistory(prevHistory => [
      { id: Date.now(), type: 'Agreement', name: `Scope for ${clientName}`, client: clientName, rate: Number(rate) || 0, status: 'SIGNED', date: 'Just now' },
      ...prevHistory
    ]);
    triggerToast('✓ Legal contract compiled successfully!');
  };

  // Invoice handlers
  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { desc: '', qty: 1, rate: 0 }]);
  };

  const removeInvoiceItem = (idx) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== idx));
  };

  const updateInvoiceItem = (idx, field, val) => {
    setInvoiceItems(invoiceItems.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const subtotal = invoiceItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  const compileInvoice = () => {
    if (!invoiceClient.trim() || invoiceItems.some(i => !i.desc.trim() || i.rate <= 0)) {
      alert("⚠️ Please fill in Client name and item details to generate invoice.");
      return;
    }
    setInvoiceOutput({
      id: `INV-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(),
      client: invoiceClient,
      items: invoiceItems,
      subtotal,
      taxAmount,
      grandTotal,
      notes: invoiceNotes
    });

    setDocHistory(prevHistory => [
      { id: Date.now(), type: 'Invoice', name: `Statement to ${invoiceClient}`, client: invoiceClient, rate: Number(grandTotal) || 0, status: 'DRAFT', date: 'Just now' },
      ...prevHistory
    ]);
    triggerToast('✓ Professional statement invoice drafted!');
  };

  return (
    <div className="glow-wrapper min-h-screen bg-[#06080d] text-[#94a3b8] flex flex-col font-sans relative">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .workspace-content, .workspace-content * {
            visibility: visible;
          }
          .workspace-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .workspace-content .card {
            background: white !important;
            border: 1px solid #e2e8f0 !important;
            color: black !important;
            box-shadow: none !important;
          }
          .workspace-content .card * {
            color: black !important;
          }
          .btn, header, footer, aside, .mobile-nav-bar, .flex.gap-2.shrink-0 {
            display: none !important;
          }
        }
      `}</style>
      <div className="glow-circle glow-blue"></div>

      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { setView('landing'); setMobileMenuOpen(false); }}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <FileText className="text-[#06080d] w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg tracking-tight text-white">
              Docu<span className="text-blue-400">Draft</span>
            </span>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-6">
          {view === 'landing' ? (
            <>
              <a href="#features" className="text-xs font-semibold hover:text-white transition">Features</a>
              <a href="#pricing" className="text-xs font-semibold hover:text-white transition">Pricing</a>
              <button onClick={() => setView('login')} className="btn btn-ghost text-xs font-semibold px-4 py-2">
                Sign In
              </button>
              <button onClick={() => setView('app')} className="btn btn-primary text-xs py-2 px-4">
                Console Dashboard
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="badge badge-blue text-[10px]">
                {plan === 'free' ? 'Starter Plan' : '👑 Pro Active'}
              </span>
              <button 
                onClick={() => { setView('landing'); triggerToast('Signed out of personal cabinet.'); }} 
                className="btn btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Mobile controls toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-400 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[69px] z-50 bg-[#06080d] px-6 py-8 flex flex-col gap-6 text-left border-t border-white/5 animate-fade-in md:hidden">
          {view === 'landing' ? (
            <>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-white border-b border-white/5 pb-3">Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-white border-b border-white/5 pb-3">Pricing</a>
              <button 
                onClick={() => { setView('login'); setMobileMenuOpen(false); }} 
                className="btn btn-secondary py-3 w-full font-bold"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setView('app'); setMobileMenuOpen(false); }} 
                className="btn btn-primary py-3 w-full font-bold"
              >
                Console Dashboard
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-400">Account Tier:</span>
                <span className="badge badge-blue">{plan === 'free' ? 'Starter Plan' : '👑 Pro Active'}</span>
              </div>
              <button 
                onClick={() => { setView('landing'); setMobileMenuOpen(false); triggerToast('Signed out.'); }} 
                className="btn btn-secondary py-3 w-full font-bold text-rose-400 border-rose-950/20 bg-rose-950/10 flex justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Panel Frame */}
      <main className="flex-grow z-10">
        
        {/* ================= LANDING PAGE ================= */}
        {view === 'landing' && (
          <LandingView setView={setView} setShowUpgradeModal={setShowUpgradeModal} />
        )}

        {/* ================= LOGIN PORTAL ================= */}
        {(view === 'login' || view === 'register') && (
          <AuthPortal view={view} setView={setView} triggerToast={triggerToast} />
        )}

        {/* ================= PERSONAL CABINET (DASHBOARD) ================= */}
        {view === 'app' && (
          <div className="dashboard-container">
            {/* Sidebar Navigation - Desktop only */}
            <aside className="sidebar">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6 px-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight">{userProfile.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">{userProfile.email}</span>
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                <button 
                  onClick={() => setDashboardTab('overview')}
                  className={`sidebar-btn ${dashboardTab === 'overview' ? 'active' : ''}`}
                >
                  <Activity className="w-4 h-4" /> Overview
                </button>
                <button 
                  onClick={() => setDashboardTab('contract')}
                  className={`sidebar-btn ${dashboardTab === 'contract' ? 'active' : ''}`}
                >
                  <FileSignature className="w-4 h-4" /> Contract Wizard
                </button>
                <button 
                  onClick={() => setDashboardTab('invoice')}
                  className={`sidebar-btn ${dashboardTab === 'invoice' ? 'active' : ''}`}
                >
                  <FileSpreadsheet className="w-4 h-4" /> Invoice Builder
                </button>
                <button 
                  onClick={() => setDashboardTab('profile')}
                  className={`sidebar-btn ${dashboardTab === 'profile' ? 'active' : ''}`}
                >
                  <Settings className="w-4 h-4" /> Personal Cabinet
                </button>
                <button 
                  onClick={() => setDashboardTab('billing')}
                  className={`sidebar-btn ${dashboardTab === 'billing' ? 'active' : ''}`}
                >
                  <CreditCard className="w-4 h-4" /> Billing &stripe;
                </button>
              </nav>

              <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-3">
                <div className="bg-black/30 border border-white/5 rounded-lg p-3 text-[11px] text-left">
                  <span className="font-bold text-white block mb-0.5">Database Link</span>
                  {userProfile.supabaseUrl ? (
                    <span className="text-blue-400 flex items-center gap-1 font-mono text-[9px]"><Database className="w-3 h-3" /> Supabase Connected</span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1 font-mono text-[9px]"><Database className="w-3 h-3" /> SQLite Sim Mode</span>
                  )}
                </div>
              </div>
            </aside>

            {/* Mobile Bottom Navigation Bar - Mobile only */}
            <div className="mobile-nav-bar glass">
              <button 
                onClick={() => setDashboardTab('overview')}
                className={`mobile-nav-btn ${dashboardTab === 'overview' ? 'active' : ''}`}
              >
                <Activity className="w-4 h-4" />
                <span>Overview</span>
              </button>
              <button 
                onClick={() => setDashboardTab('contract')}
                className={`mobile-nav-btn ${dashboardTab === 'contract' ? 'active' : ''}`}
              >
                <FileSignature className="w-4 h-4" />
                <span>Contract</span>
              </button>
              <button 
                onClick={() => setDashboardTab('invoice')}
                className={`mobile-nav-btn ${dashboardTab === 'invoice' ? 'active' : ''}`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Invoice</span>
              </button>
              <button 
                onClick={() => setDashboardTab('profile')}
                className={`mobile-nav-btn ${dashboardTab === 'profile' ? 'active' : ''}`}
              >
                <Settings className="w-4 h-4" />
                <span>Cabinet</span>
              </button>
              <button 
                onClick={() => setDashboardTab('billing')}
                className={`mobile-nav-btn ${dashboardTab === 'billing' ? 'active' : ''}`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Billing</span>
              </button>
            </div>

            {/* Workspace Console */}
            <section className="workspace-content">
              {dashboardTab === 'overview' && (
                <OverviewPanel 
                  userProfile={userProfile} 
                  docHistory={docHistory} 
                  setDashboardTab={setDashboardTab} 
                />
              )}

              {dashboardTab === 'contract' && (
                <ContractPanel 
                  clientName={clientName} 
                  setClientName={setClientName}
                  projectScope={projectScope} 
                  setProjectScope={setProjectScope}
                  rate={rate} 
                  setRate={setRate}
                  paymentTerms={paymentTerms} 
                  setPaymentTerms={setPaymentTerms}
                  generateContractDraft={generateContractDraft}
                  generatedContract={generatedContract}
                  canvasRef={canvasRef}
                  startSigning={startSigning}
                  draw={draw}
                  stopSigning={stopSigning}
                  signed={signed}
                  clearSignature={clearSignature}
                  plan={plan} 
                  triggerToast={triggerToast} 
                  signerIp={signerIp}
                  mockShaHash={mockShaHash}
                  exportFeesToInvoice={exportFeesToInvoice}
                  userProfile={userProfile}
                />
              )}

              {dashboardTab === 'invoice' && (
                <InvoicePanel 
                  invoiceClient={invoiceClient} 
                  setInvoiceClient={setInvoiceClient}
                  invoiceItems={invoiceItems} 
                  addInvoiceItem={addInvoiceItem}
                  removeInvoiceItem={removeInvoiceItem}
                  updateInvoiceItem={updateInvoiceItem}
                  taxRate={taxRate} 
                  setTaxRate={setTaxRate}
                  invoiceNotes={invoiceNotes} 
                  setInvoiceNotes={setInvoiceNotes}
                  compileInvoice={compileInvoice}
                  invoiceOutput={invoiceOutput}
                  plan={plan} 
                  triggerToast={triggerToast} 
                />
              )}

              {dashboardTab === 'profile' && (
                <ProfilePanel 
                  userProfile={userProfile} 
                  handleProfileUpdate={handleProfileUpdate} 
                  saveCredentials={saveCredentials} 
                  profileSigCanvasRef={profileSigCanvasRef}
                  startProfileSigning={startProfileSigning}
                  drawProfileSig={drawProfileSig}
                  stopProfileSigning={stopProfileSigning}
                  clearProfileSig={clearProfileSig}
                  saveProfileSig={saveProfileSig}
                />
              )}

              {dashboardTab === 'billing' && (
                <BillingPanel 
                  plan={plan} 
                  setPlan={setPlan} 
                  setShowUpgradeModal={setShowUpgradeModal} 
                />
              )}
            </section>
          </div>
        )}
      </main>

      {/* Stripe upgrade modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="card glass max-w-sm w-full p-5 relative border-blue-500/25 flex flex-col gap-4 text-left">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <FileText className="text-blue-400 w-5 h-5" />
              <div>
                <h3 className="font-display text-sm font-bold text-white">Stripe Payment Gateway</h3>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block">Secure Simulated Portal</span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex justify-between items-center text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-white">DocuDraft Pro Plan</span>
                <span className="text-[10px] text-slate-500">Billed monthly, cancel anytime</span>
              </div>
              <span className="font-display font-extrabold text-white text-base">$8.00</span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="input-group">
                <label className="input-label text-[10px]">Card Number</label>
                <div className="relative">
                  <input type="text" placeholder="4242  4242  4242  4242" className="input-field py-1.5 text-xs pr-12" required />
                  <span className="absolute right-3 top-2 text-[9px] font-bold text-indigo-400 tracking-wider">STRIPE</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="input-group">
                  <label className="input-label text-[10px]">Expiry</label>
                  <input type="text" placeholder="MM / YY" className="input-field py-1.5 text-xs text-center" required />
                </div>
                <div className="input-group">
                  <label className="input-label text-[10px]">CVC</label>
                  <input type="text" placeholder="123" className="input-field py-1.5 text-xs text-center" maxLength="3" required />
                </div>
              </div>
            </div>

            <button 
              onClick={handleUpgrade}
              disabled={upgradeLoading}
              className="btn btn-primary w-full py-2.5 text-xs font-bold mt-1"
            >
              {upgradeLoading ? 'Securing subscription...' : 'Pay & Upgrade'}
            </button>
            
            <p className="text-[9px] text-center text-slate-600">
              🔒 Safe Checkout. No actual credit card details are recorded or processed.
            </p>
          </div>
        </div>
      )}

      {/* Copy Toast notifications */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#06080d] border border-blue-500/40 text-blue-300 text-xs px-4 py-2.5 rounded-lg shadow-xl shadow-blue-500/5 font-semibold flex items-center gap-1.5 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6 bg-[#06080d] text-center text-xs text-slate-600 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2 relative z-10 pb-20 md:pb-6">
        <span>&copy; {new Date().getFullYear()} DocuDraft. All rights reserved. Zero-dollar secure serverless framework.</span>
        <div className="flex gap-4 justify-center mt-1 md:mt-0">
          <span className="hover:underline cursor-pointer" onClick={() => setView('landing')}>Home</span>
          <span>&middot;</span>
          <span className="hover:underline cursor-pointer" onClick={() => setView('app')}>Console</span>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================================
   LANDING VIEW COMPONENT
   ============================================================================ */
function LandingView({ setView, setShowUpgradeModal }) {
  const [client, setClient] = useState('Acme Corp');
  const [rate, setRate] = useState('1200');
  const [signed, setSigned] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [compiled, setCompiled] = useState(false);
  const [sigUrl, setSigUrl] = useState('');
  const [signerIp, setSignerIp] = useState('');
  const [mockShaHash, setMockShaHash] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        if (data && data.ip) {
          setSignerIp(data.ip);
          setMockShaHash('SHA-256: 8f4c' + Math.random().toString(16).substring(2,10) + '9b7e8d2c');
        }
      })
      .catch(() => {
        setSignerIp('198.162.24.120');
        setMockShaHash('SHA-256: 8a4c10ef9b7e8d2c0b49f99e3a6c11d08c873f2a1b9e2c4d');
      });
  }, []);

  useEffect(() => {
    if (!compiled && canvasRef.current) {
      clearCanvas();
    }
  }, [compiled]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  const handleCompile = () => {
    if (!client.trim() || !rate.trim()) {
      alert("⚠️ Please enter a client name and billing rate to run the demo!");
      return;
    }
    const canvas = canvasRef.current;
    if (canvas && signed) {
      setSigUrl(canvas.toDataURL());
    } else {
      setSigUrl('');
    }
    setCompiled(true);
  };

  const stats = [
    { value: '100%', label: 'Free Starter Tier' },
    { value: '< 10s', label: 'Agreement Drafts' },
    { value: 'Touch', label: 'Scribble Signature' },
    { value: 'Zero', label: 'Upfront Card Input' }
  ];

  const features = [
    {
      step: '1',
      title: 'Input Details',
      description: 'Enter your client name, project scope, payment rate, and due terms. Our wizard guides you through every field.'
    },
    {
      step: '2',
      title: 'Digital Signature',
      description: 'Includes a digital touch or mouse scribble pad so clients can legally sign documents on the spot — works on any device.'
    },
    {
      step: '3',
      title: 'Auto Invoicing',
      description: 'Create clean itemized billing sheets that automatically calculate taxes, subtotals, and custom notes for your clients.'
    }
  ];

  return (
    <div className="landing-page flex flex-col gap-0">

      {/* ── HERO SECTION ── */}
      <section className="py-16 md:py-28 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Headline & CTAs */}
          <div className="flex flex-col gap-6 text-left animate-fade-in">
            <span className="badge badge-blue w-fit text-[10px]">
              <span className="relative flex h-1.5 w-1.5 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              Freelance Agreement Platform
            </span>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1]">
              Freelance contracts
              <br />
              <span className="gradient-text">&amp; invoicing</span> made simple.
            </h1>

            <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-xl">
              Draft legally-compliant freelance agreements with interactive signature pads and invoice your clients in seconds. Beautiful, plain-English documents designed to get you paid on time.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button 
                onClick={() => setView('app')} 
                className="btn btn-primary px-7 py-3.5 text-sm font-bold shadow-lg shadow-blue-500/10"
              >
                Draft Contract Free <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#features" 
                className="btn btn-secondary px-7 py-3.5 text-sm font-bold text-center"
              >
                How It Works
              </a>
            </div>
          </div>

          {/* Right: Interactive Simulator */}
          <div className="w-full animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="card glass p-5 flex flex-col gap-4 border-blue-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              {/* Simulator Header */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Interactive Demo
                </span>
                <span className="text-[9px] text-slate-500 font-mono">HTML5 Canvas</span>
              </div>

              {/* Input Area / Result Area */}
              {!compiled ? (
                <div className="flex flex-col gap-3 relative min-h-[220px]">
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="input-group mb-0">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Client Name</label>
                      <input
                        type="text"
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        placeholder="e.g. Acme Corp..."
                        className="input-field py-2 px-3 text-xs"
                      />
                    </div>
                    <div className="input-group mb-0">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Billing Rate ($)</label>
                      <input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="1200"
                        className="input-field py-2 px-3 text-xs"
                      />
                    </div>
                  </div>

                  <div className="input-group mb-0 text-left">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Scribble Signature</label>
                      {signed && (
                        <button
                          onClick={clearCanvas}
                          className="text-[9px] text-rose-400 hover:underline bg-transparent border-0 cursor-pointer font-semibold"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <canvas
                      ref={canvasRef}
                      width="240"
                      height="80"
                      style={{ touchAction: 'none' }}
                      className="w-full h-[80px] bg-black/40 border border-white/5 rounded-lg cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={(e) => { e.preventDefault(); startDrawing(e); }}
                      onTouchMove={(e) => { e.preventDefault(); draw(e); }}
                      onTouchEnd={stopDrawing}
                    />
                    <span className="text-[8px] text-slate-500 block mt-1.5">
                      Scribble inside the box to sign. Works on mobile &amp; tablet touch screens!
                    </span>
                  </div>

                  <button
                    onClick={handleCompile}
                    className="btn btn-primary w-full py-2.5 text-xs font-bold mt-1"
                  >
                    Compile Agreement
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-fade-in text-left">
                  {/* Mock Legal Document View */}
                  <div className="bg-white text-slate-900 p-5 rounded-xl shadow-2xl relative border border-slate-200 min-h-[220px] flex flex-col justify-between font-serif text-[10px] leading-relaxed">
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none rounded-xl"></div>

                    <div className="border-b border-slate-300 pb-2 mb-3 text-center">
                      <h4 className="font-sans font-bold uppercase tracking-wider text-[9px] text-slate-800">
                        Freelance Services Statement
                      </h4>
                    </div>

                    <div className="space-y-1.5 flex-grow relative text-left">
                      <p><strong>Contractor:</strong> Independent Specialist</p>
                      <p><strong>Client:</strong> {client}</p>
                      <p><strong>Scope:</strong> Complete design and restructuring services as finalized between the parties.</p>
                      <p><strong>Fees:</strong> Client agrees to pay Contractor a sum rate of <strong>${rate} USD</strong> upon completion.</p>
                      <p className="text-[8.5px] italic text-slate-500">All deliverables transfer intellectual copyrights upon final transaction approval.</p>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-200 pt-2 mt-3 gap-4 text-left">
                      <div className="w-1/2">
                        <span className="text-[7.5px] text-slate-400 block border-t border-slate-300 pt-0.5">Contractor Signature</span>
                        <span className="font-sans text-[9px] font-bold text-slate-700 italic">Alpha Freelance</span>
                      </div>
                      <div className="w-1/2 text-right relative flex flex-col items-end">
                        {sigUrl ? (
                          <img src={sigUrl} alt="Client signature" className="h-[25px] w-auto object-contain block mb-0.5" />
                        ) : (
                          <span className="text-[8px] text-rose-500 block italic pb-1">Unsigned</span>
                        )}
                        <span className="text-[7.5px] text-slate-400 block border-t border-slate-300 pt-0.5 w-full text-right">Client Signature</span>
                      </div>
                    </div>

                    {/* Cryptographic E-Signature Audit Certificate Seal */}
                    <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-[7px] text-slate-500 font-mono space-y-1 text-left font-sans">
                      <div className="flex justify-between items-center text-[7.5px] font-bold text-slate-700 uppercase tracking-widest mb-1">
                        <span>🛡️ Sign-off Audit Certificate</span>
                        <span className="text-emerald-600">Securely Signed</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 leading-normal">
                        <div><strong>Signer IP:</strong> {signerIp || '198.162.24.120'}</div>
                        <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                        <div className="col-span-2 truncate"><strong>User Agent:</strong> {navigator.userAgent}</div>
                        <div className="col-span-2 truncate"><strong>Audit Hash:</strong> {mockShaHash || 'SHA-256: 8a4c10ef9b7e8d2c0b...'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2.5 pt-1">
                    <button
                      onClick={() => setCompiled(false)}
                      className="btn btn-secondary px-4 py-1.5 text-[10px] font-bold"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={() => setView('app')}
                      className="btn btn-primary px-4 py-1.5 text-[10px] font-bold shadow-none"
                    >
                      Draft Full Contract
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF / STATS BAR ── */}
      <section className="landing-section-divider py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="landing-stat">
              <span className="block font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-[10px] md:text-[11px] text-slate-500 uppercase tracking-widest font-semibold mt-2 block">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS / FEATURES ── */}
      <section id="features" className="py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <span className="badge badge-blue w-fit mx-auto mb-4 text-[10px]">How It Works</span>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Advanced Document Suite
          </h2>
          <p className="text-sm md:text-base text-slate-400 mt-4 max-w-2xl mx-auto leading-relaxed">
            Three simple steps to professional freelance agreements and prompt billing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <div key={i} className="card glass text-left flex flex-col gap-4 p-6 md:p-8">
              <div className="feature-icon" style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '16px' }}>
                {i === 0 && <FileText className="w-5 h-5 text-blue-400" />}
                {i === 1 && <FileSignature className="w-5 h-5 text-blue-400" />}
                {i === 2 && <FileSpreadsheet className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="flex items-center gap-3">
                <span className="feature-step-number" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--text-blue)' }}>{feature.step}</span>
                <h3 className="font-display text-base md:text-lg text-white font-bold">{feature.title}</h3>
              </div>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-16 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <span className="badge badge-blue w-fit mx-auto mb-4 text-[10px]">Pricing</span>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Transparent Pricing
          </h2>
          <p className="text-sm md:text-base text-slate-400 mt-4 max-w-2xl mx-auto leading-relaxed">
            Start free. Upgrade when you need more power. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="card glass p-6 md:p-8 flex flex-col justify-between gap-6">
            <div>
              <h4 className="font-display text-white font-bold text-lg">Starter Plan</h4>
              <div className="mt-3 mb-6">
                <span className="font-display text-4xl font-extrabold text-white">$0</span>
                <span className="text-sm text-slate-500 ml-1">/ forever</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>1 active agreement per month</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Standard legal template</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Digital scribble signature</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => setView('app')} 
              className="btn btn-secondary py-3 text-sm font-bold w-full"
            >
              Launch Console Free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="card glass pricing-card-pro p-6 md:p-8 flex flex-col justify-between gap-6 relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div>
              <div className="flex justify-between items-center">
                <h4 className="font-display text-white font-bold text-lg">Professional Plan</h4>
                <span className="badge badge-blue text-[9px]">👑 Popular</span>
              </div>
              <div className="mt-3 mb-6">
                <span className="font-display text-4xl font-extrabold text-blue-400">$8</span>
                <span className="text-sm text-slate-500 ml-1">/ month</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span><strong>Unlimited</strong> active documents</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Custom logo &amp; branding</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Multi-invoice calculator</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>PDF print-ready exports</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => { setView('app'); setShowUpgradeModal(true); }} 
              className="btn btn-primary py-3 text-sm font-bold w-full"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================================
   AUTH PORTAL COMPONENT
   ============================================================================ */
function AuthPortal({ view, setView, triggerToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("⚠️ Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      triggerToast('✓ Access granted to Personal Cabinet!');
      setView('app');
    }, 1200);
  };

  return (
    <div className="max-w-md w-full mx-auto px-6 py-12 md:py-20 text-left">
      <div className="card glass p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1 border-b border-white/5 pb-3">
          <h2 className="font-display text-lg text-white font-bold">
            {view === 'login' ? 'Access Personal Cabinet' : 'Register Console Account'}
          </h2>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">DocuDraft Security Gateway</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="input-group">
            <label className="input-label text-[10px]">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="freelancer@example.com" 
              className="input-field py-2.5 text-xs" 
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label text-[10px]">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="input-field py-2.5 text-xs" 
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary py-3 text-xs font-bold mt-2">
            {loading ? 'Authenticating...' : view === 'login' ? 'Sign In & Launch' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-2 text-xs">
          {view === 'login' ? (
            <span className="text-slate-500">
              New freelancer?{' '}
              <span onClick={() => setView('register')} className="text-blue-400 font-semibold cursor-pointer hover:underline">
                Create an account
              </span>
            </span>
          ) : (
            <span className="text-slate-500">
              Already have an account?{' '}
              <span onClick={() => setView('login')} className="text-blue-400 font-semibold cursor-pointer hover:underline">
                Sign in instead
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   OVERVIEW CABINET PANEL
   ============================================================================ */
function OverviewPanel({ userProfile, docHistory, setDashboardTab }) {
  const totalValueCompiled = docHistory.reduce((acc, curr) => acc + (Number(curr.rate) || 0), 0);
  
  const activeReceivables = docHistory
    .filter(d => d.type === 'Invoice' && d.status !== 'PAID')
    .reduce((acc, curr) => acc + (Number(curr.rate) || 0), 0);
     
  const signedAgreements = docHistory.filter(d => d.type === 'Agreement' && d.status === 'SIGNED').length;
  const totalAgreements = docHistory.filter(d => d.type === 'Agreement').length;
  const signatureRate = totalAgreements > 0 
    ? Math.round((signedAgreements / totalAgreements) * 100) 
    : 0;

  return (
    <div className="flex flex-col gap-6 text-left max-w-4xl mx-auto">
      <div>
        <h2 className="font-display text-xl font-extrabold text-white">Dashboard Overview</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Quick summary of your freelance operational documents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <div className="card glass p-5 flex items-center justify-between border-white/5">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Value Compiled</span>
            <span className="font-display text-2xl font-extrabold text-white mt-1">${totalValueCompiled.toLocaleString()}</span>
          </div>
          <FileSignature className="w-8 h-8 text-blue-500/20 shrink-0" />
        </div>

        <div className="card glass p-5 flex items-center justify-between border-white/5">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Invoice Receivables</span>
            <span className="font-display text-2xl font-extrabold text-white mt-1">${activeReceivables.toLocaleString()}</span>
          </div>
          <FileSpreadsheet className="w-8 h-8 text-blue-500/20 shrink-0" />
        </div>

        <div className="card glass p-5 flex items-center justify-between border-white/5">
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client Signature Rate</span>
            <span className="font-display text-2xl font-extrabold text-[#3b82f6] mt-1">{signatureRate}%</span>
          </div>
          <Activity className="w-8 h-8 text-blue-500/20 shrink-0" />
        </div>
      </div>

      {/* Document log */}
      <div className="card glass p-5 flex flex-col gap-4">
        <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">Compiled Document History</h3>
        <div className="flex flex-col gap-2">
          {docHistory.map(l => (
            <div key={l.id} className="flex justify-between items-center bg-black/25 border border-white/5 p-3 rounded-lg text-xs gap-3">
              <div className="flex flex-col text-left min-w-0 flex-grow">
                <span className="font-bold text-white truncate">{l.name}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{l.type} &middot; {l.client} &middot; {l.date} &middot; ${l.rate || 0}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`badge ${l.status === 'PAID' || l.status === 'SIGNED' ? 'badge-success' : 'badge-blue'} font-mono text-[9px]`}>
                  {l.status}
                </span>
                <button onClick={() => setDashboardTab(l.type === 'Agreement' ? 'contract' : 'invoice')} className="btn btn-secondary text-[10px] px-3 py-1 shrink-0">
                  Edit &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   CONTRACT WIZARD PANEL (WORKSPACE)
   ============================================================================ */
function ContractPanel({ 
  clientName, 
  setClientName, 
  projectScope, 
  setProjectScope, 
  rate, 
  setRate, 
  paymentTerms, 
  setPaymentTerms, 
  generateContractDraft, 
  generatedContract, 
  canvasRef, 
  startSigning, 
  draw, 
  stopSigning, 
  signed, 
  clearSignature, 
  plan, 
  triggerToast,
  signerIp,
  mockShaHash,
  exportFeesToInvoice
}) {
  return (
    <div className="flex flex-col gap-6 text-left max-w-5xl mx-auto">
      <div className="border-b border-white/5 pb-4">
        <h2 className="font-display text-xl font-extrabold text-white">Freelance Agreement Wizard</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Draft simple legally-compliant plain-English service contracts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="card glass p-5 flex flex-col gap-4">
            <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider text-blue-400">Contract Parameters</h3>
            
            <div className="input-group">
              <label className="input-label text-xs">Client Entity / Company</label>
              <input 
                type="text" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Corp LLC" 
                className="input-field py-1.5 px-3 text-xs" 
              />
            </div>

            <div className="input-group">
              <label className="input-label text-xs">Scope of Services</label>
              <textarea 
                value={projectScope}
                onChange={(e) => setProjectScope(e.target.value)}
                placeholder="e.g. Build an 8-page website, connect to Stripe checkout..." 
                className="input-field min-h-[90px] text-xs resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="input-group">
                <label className="input-label text-xs">Contract Value ($)</label>
                <input 
                  type="number" 
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="e.g. 2500" 
                  className="input-field py-1.5 px-3 text-xs" 
                />
              </div>
              
              <div className="input-group">
                <label className="input-label text-xs">Payment Due</label>
                <select 
                  value={paymentTerms} 
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="input-field py-1.5 px-3 text-xs bg-black text-white cursor-pointer"
                >
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="50% upfront / 50% end">50/50 Split</option>
                  <option value="Immediate upon receipt">Immediate</option>
                </select>
              </div>
            </div>

            <button onClick={generateContractDraft} className="btn btn-primary py-2 text-xs font-bold mt-1 w-full">
              Compile Contract Template
            </button>
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {generatedContract ? (
            <>
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">Compiled Document Preview</h3>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={exportFeesToInvoice}
                    className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-blue-400 border-blue-500/20 cursor-pointer"
                  >
                    Export to Invoice
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedContract);
                      triggerToast('📋 Custom Contract copied to clipboard!');
                    }}
                    className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Contract
                  </button>
                </div>
              </div>

              <div className="card glass p-6 font-mono text-xs text-slate-300 leading-relaxed bg-[#090b11] border-white/5 flex flex-col gap-6 whitespace-pre-line relative select-all">
                <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[9.5px] font-sans text-slate-500 uppercase font-bold tracking-wide">
                  <span>DOCUMENT SECURITY ID: DS-8890A</span>
                  <span>
                    {plan === 'premium' ? '⚜️ BRANDING: [Your Custom Logo]' : '⚡ BRANDING: DOCUDRAFT STANDARD'}
                  </span>
                </div>

                <p className="select-all">{generatedContract}</p>

                <div className="border-t border-white/5 pt-4 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                  <div className="flex flex-col gap-1 text-[10px] text-slate-500">
                    <span>CONTRACTOR SIGNATURE:</span>
                    {userProfile.contractorSignature ? (
                      <img 
                        src={userProfile.contractorSignature} 
                        alt="Contractor Signature Stamp" 
                        className="h-14 w-auto object-contain bg-black/45 border border-white/10 rounded px-2 py-1 block"
                      />
                    ) : (
                      <div className="h-14 border border-dashed border-white/10 rounded bg-black/45 flex items-center justify-center text-xs text-slate-600 font-sans italic text-center leading-tight">
                        [Sign in Profile Cabinet<br/>to stamp dynamically]
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-[10px] text-slate-500 relative">
                    <div className="flex justify-between">
                      <span>CLIENT DIGITAL SIGNATURE:</span>
                      {signed && (
                        <button onClick={clearSignature} className="text-[9px] text-rose-400 hover:underline">
                          Clear
                        </button>
                      )}
                    </div>
                    
                    <canvas 
                      ref={canvasRef}
                      width={220}
                      height={56}
                      style={{ touchAction: 'none' }}
                      onMouseDown={startSigning}
                      onMouseMove={draw}
                      onMouseUp={stopSigning}
                      onMouseLeave={stopSigning}
                      onTouchStart={(e) => { e.preventDefault(); startSigning(e); }}
                      onTouchMove={(e) => { e.preventDefault(); draw(e); }}
                      onTouchEnd={stopSigning}
                      className="h-14 border border-white/10 bg-black/40 rounded cursor-crosshair max-w-full block"
                    />
                    {!signed && (
                      <span className="absolute bottom-2 left-2 text-[9px] pointer-events-none text-blue-400/70 font-semibold animate-pulse">
                        Draw here to sign...
                      </span>
                    )}
                  </div>
                </div>

                {/* Cryptographic E-Signature Audit Certificate Seal */}
                <div className="border-t border-dashed border-white/10 pt-3 mt-2 text-[7.5px] text-slate-500 font-mono space-y-1 text-left font-sans">
                  <div className="flex justify-between items-center text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    <span>🛡️ Sign-off Audit Certificate</span>
                    <span className="text-emerald-500">Securely Signed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 leading-normal">
                    <div><strong>Signer IP:</strong> {signerIp || '198.162.24.120'}</div>
                    <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                    <div className="col-span-2 truncate"><strong>User Agent:</strong> {navigator.userAgent}</div>
                    <div className="col-span-2 truncate"><strong>Audit Hash:</strong> {mockShaHash || 'SHA-256: 8a4c10ef9b7e8d2c0b...'}</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card glass p-8 flex flex-col items-center justify-center text-center text-slate-500 h-full min-h-[300px]">
              <FileSignature className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
              <h4 className="text-sm font-semibold text-slate-400">Await Contract Compilation</h4>
              <p className="text-xs max-w-xs mt-1">Configure your variables on the left panel, and click compile to preview your legally-binding contract template instantly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   INVOICE PANEL (WORKSPACE)
   ============================================================================ */
function InvoicePanel({ 
  invoiceClient, 
  setInvoiceClient, 
  invoiceItems, 
  addInvoiceItem, 
  removeInvoiceItem, 
  updateInvoiceItem, 
  taxRate, 
  setTaxRate, 
  invoiceNotes, 
  setInvoiceNotes, 
  compileInvoice, 
  invoiceOutput, 
  plan, 
  triggerToast 
}) {
  return (
    <div className="flex flex-col gap-6 text-left max-w-5xl mx-auto">
      <div className="border-b border-white/5 pb-4">
        <h2 className="font-display text-xl font-extrabold text-white">Invoice Spreadsheet Builder</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Generate clean, professional billing statements instantly</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="card glass p-5 flex flex-col gap-4">
            <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider text-blue-400">Invoice Parameters</h3>
            
            <div className="input-group">
              <label className="input-label text-xs">Client Company Name</label>
              <input 
                type="text" 
                value={invoiceClient}
                onChange={(e) => setInvoiceClient(e.target.value)}
                placeholder="e.g. Acme Corp LLC" 
                className="input-field py-1.5 px-3 text-xs" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="input-label text-xs">Line Items</label>
              <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-2 items-center bg-black/20 p-2.5 rounded border border-white/5">
                    <input 
                      type="text" 
                      value={item.desc}
                      onChange={(e) => updateInvoiceItem(idx, 'desc', e.target.value)}
                      placeholder="Service description..." 
                      className="input-field py-1 px-2.5 text-xs w-full sm:w-auto flex-grow"
                    />
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-500 sm:hidden">Qty:</span>
                        <input 
                          type="number" 
                          value={item.qty}
                          onChange={(e) => updateInvoiceItem(idx, 'qty', parseInt(e.target.value) || 0)}
                          placeholder="Qty" 
                          className="input-field py-1 px-2 text-xs w-10 text-center"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-slate-500 sm:hidden">Rate ($):</span>
                        <input 
                          type="number" 
                          value={item.rate}
                          onChange={(e) => updateInvoiceItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                          placeholder="Rate" 
                          className="input-field py-1 px-2 text-xs w-14 text-center"
                        />
                      </div>
                      {invoiceItems.length > 1 && (
                        <button onClick={() => removeInvoiceItem(idx)} className="text-slate-500 hover:text-rose-400 p-1 shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addInvoiceItem} className="btn btn-secondary py-1 text-[9px] font-bold flex items-center justify-center gap-1 border-dashed mt-1">
                <Plus className="w-3 h-3" /> Add Item Line
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="input-group">
                <label className="input-label text-xs">Tax Rate (%)</label>
                <input 
                  type="number" 
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 5" 
                  className="input-field py-1.5 px-3 text-xs text-center" 
                />
              </div>
              <div className="input-group">
                <label className="input-label text-xs">Memo Notes</label>
                <input 
                  type="text" 
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  placeholder="Appreciate your business..." 
                  className="input-field py-1.5 px-3 text-xs" 
                />
              </div>
            </div>

            <button onClick={compileInvoice} className="btn btn-primary py-2.5 text-xs font-bold mt-2 w-full">
              Generate Invoice Preview
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {invoiceOutput ? (
            <>
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">Compiled Document Preview</h3>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => window.print()}
                    className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-emerald-400 border-emerald-500/20 cursor-pointer"
                  >
                    Print Invoice
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(invoiceOutput, null, 2));
                      triggerToast('📋 Invoice details copied!');
                    }}
                    className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Invoice details
                  </button>
                </div>
              </div>

              <div className="card glass p-5 font-mono text-xs text-slate-300 leading-relaxed bg-[#090b11] border-white/5 flex flex-col gap-5 relative select-all overflow-x-auto">
                
                <div className="flex justify-between items-start border-b border-white/5 pb-3 gap-4 min-w-[340px]">
                  <div>
                    <h4 className="font-sans font-bold text-white text-base">INVOICE DOCUMENT</h4>
                    <span className="text-[10px] text-slate-500 font-semibold">{invoiceOutput.id}</span>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 flex flex-col font-sans">
                    <span>DATE: {invoiceOutput.date}</span>
                    <span>DUE: On Receipt</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 font-sans text-[10.5px] border-b border-white/5 pb-3 min-w-[340px]">
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-bold block mb-0.5">FROM:</span>
                    <span className="text-white block font-semibold">[Your Name / Company]</span>
                    <span className="text-slate-400 font-medium">builder@example.com</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase tracking-wider font-bold block mb-0.5">BILL TO:</span>
                    <span className="text-white block font-semibold">{invoiceOutput.client}</span>
                  </div>
                </div>

                <table className="w-full text-left border-collapse text-[10.5px] min-w-[340px]">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500 uppercase tracking-wider font-sans font-bold">
                      <th className="py-1">Line description</th>
                      <th className="py-1 text-center w-12">Qty</th>
                      <th className="py-1 text-right w-16">Rate</th>
                      <th className="py-1 text-right w-16">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceOutput.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-2 text-white font-medium">{item.desc}</td>
                        <td className="py-2 text-center text-slate-400">{item.qty}</td>
                        <td className="py-2 text-right text-slate-400">${item.rate.toFixed(2)}</td>
                        <td className="py-2 text-right text-white font-bold">${(item.qty * item.rate).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex flex-col gap-1.5 items-end border-t border-white/5 pt-3 font-sans min-w-[340px]">
                  <div className="flex justify-between w-40 text-[10.5px] text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-mono text-white">${invoiceOutput.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-40 text-[10.5px] text-slate-500">
                    <span>Tax ({taxRate}%):</span>
                    <span className="font-mono text-white">${invoiceOutput.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-40 text-[11px] font-bold border-t border-white/5 pt-2 text-slate-200">
                    <span>GRAND TOTAL:</span>
                    <span className="font-mono text-blue-400 text-xs">${invoiceOutput.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {invoiceOutput.notes && (
                  <div className="border-t border-white/5 pt-2 mt-1 text-[9.5px] text-slate-500 italic font-sans min-w-[340px]">
                    Memo: {invoiceOutput.notes}
                  </div>
                )}

                {plan !== 'premium' && (
                  <div className="absolute bottom-2 left-2 right-2 text-center text-[8px] font-sans text-slate-600 bg-black/40 py-1 rounded uppercase tracking-wider font-semibold border border-white/5 min-w-[340px]">
                    📄 Invoices processed under DocuDraft standard starter
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card glass p-8 flex flex-col items-center justify-center text-center text-slate-500 h-full min-h-[300px]">
              <FileSpreadsheet className="w-10 h-10 text-slate-600 mb-2 animate-pulse" />
              <h4 className="text-sm font-semibold text-slate-400">Await Invoice Compilation</h4>
              <p className="text-xs max-w-xs mt-1">Configure client and item lines on the left panel, and click compile to construct your sleek billing invoice format instantly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   PROFILE SETTINGS CABINET PANEL
   ============================================================================ */
function ProfilePanel({ 
  userProfile, 
  handleProfileUpdate, 
  saveCredentials, 
  profileSigCanvasRef,
  startProfileSigning,
  drawProfileSig,
  stopProfileSigning,
  clearProfileSig,
  saveProfileSig
}) {
  return (
    <div className="flex flex-col gap-6 text-left max-w-3xl mx-auto">
      <div className="border-b border-white/5 pb-4">
        <h2 className="font-display text-xl font-extrabold text-white">Personal Cabinet</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Manage user credentials and connect live database API integrations</p>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        
        {/* Core settings */}
        <div className="card glass p-5 flex flex-col gap-4">
          <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-400" /> Account Profile
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label text-[10px]">User Full Name</label>
              <input 
                type="text" 
                value={userProfile.name} 
                onChange={(e) => handleProfileUpdate('name', e.target.value)}
                className="input-field py-1.5 text-xs" 
              />
            </div>

            <div className="input-group">
              <label className="input-label text-[10px]">Email Address</label>
              <input 
                type="email" 
                value={userProfile.email} 
                onChange={(e) => handleProfileUpdate('email', e.target.value)}
                className="input-field py-1.5 text-xs" 
              />
            </div>
          </div>
        </div>

        {/* Credentials setting */}
        <form onSubmit={saveCredentials} className="card glass p-5 flex flex-col gap-4 border-emerald-500/10">
          <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-2 gap-2">
            <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-400" /> Live DB Credentials Connection
            </h3>
            <span className="badge badge-blue text-[9px] font-bold">API Sync</span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed -mt-1">
            Connect your own **live Supabase** and **live Stripe account** to take the site off local simulation mode and process real users, real data, and real money transfers!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="input-group">
              <label className="input-label text-[10px] text-blue-400 font-mono">SUPABASE_URL</label>
              <input 
                type="text" 
                value={userProfile.supabaseUrl} 
                onChange={(e) => handleProfileUpdate('supabaseUrl', e.target.value)}
                placeholder="https://your-proj-id.supabase.co" 
                className="input-field py-2 text-xs font-mono" 
              />
            </div>
            
            <div className="input-group">
              <label className="input-label text-[10px] text-blue-400 font-mono">SUPABASE_ANON_KEY</label>
              <input 
                type="password" 
                value={userProfile.supabaseAnonKey} 
                onChange={(e) => handleProfileUpdate('supabaseAnonKey', e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
                className="input-field py-2 text-xs font-mono" 
              />
            </div>

            <div className="input-group">
              <label className="input-label text-[10px] text-indigo-400 font-mono">STRIPE_PUBLISHABLE_KEY</label>
              <input 
                type="text" 
                value={userProfile.stripePublishableKey} 
                onChange={(e) => handleProfileUpdate('stripePublishableKey', e.target.value)}
                placeholder="pk_live_51P..." 
                className="input-field py-2 text-xs font-mono" 
              />
            </div>

            <div className="input-group">
              <label className="input-label text-[10px] text-indigo-400 font-mono">STRIPE_SECRET_KEY</label>
              <input 
                type="password" 
                value={userProfile.stripeSecretKey} 
                onChange={(e) => handleProfileUpdate('stripeSecretKey', e.target.value)}
                placeholder="sk_live_51P..." 
                className="input-field py-2 text-xs font-mono" 
              />
            </div>

            <div className="input-group md:col-span-2">
              <label className="input-label text-[10px] text-indigo-400 font-mono">STRIPE_PAYMENT_LINK</label>
              <input 
                type="text" 
                value={userProfile.stripePaymentLink || ''} 
                onChange={(e) => handleProfileUpdate('stripePaymentLink', e.target.value)}
                placeholder="https://buy.stripe.com/..." 
                className="input-field py-2 text-xs font-mono" 
              />
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button type="submit" className="btn btn-primary px-6 py-2.5 text-xs font-bold w-full sm:w-auto">
              Save Integration Credentials
            </button>
          </div>
        </form>

        {/* E-Signature pad */}
        <div className="card glass p-5 flex flex-col gap-4 border-blue-500/10">
          <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-2 gap-2">
            <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileSignature className="w-4 h-4 text-blue-400" /> Contractor Signature Vault
            </h3>
            <span className="badge badge-blue text-[9px] font-bold">Personal Stamp</span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed -mt-1">
            Draw your signature here to save it inside your profile. It will be dynamically stamped onto all future legal agreements you draft!
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Draw Signature</span>
              <div className="flex gap-2.5">
                <button 
                  type="button"
                  onClick={clearProfileSig} 
                  className="text-[10px] text-rose-400 hover:underline bg-transparent border-0 cursor-pointer font-semibold"
                >
                  Clear Pad
                </button>
                <button 
                  type="button"
                  onClick={saveProfileSig} 
                  className="text-[10px] text-emerald-400 hover:underline bg-transparent border-0 cursor-pointer font-semibold"
                >
                  Save to Cabinet
                </button>
              </div>
            </div>
            
            <canvas 
              ref={profileSigCanvasRef}
              width={320}
              height={80}
              style={{ touchAction: 'none' }}
              onMouseDown={startProfileSigning}
              onMouseMove={drawProfileSig}
              onMouseUp={stopProfileSigning}
              onMouseLeave={stopProfileSigning}
              onTouchStart={(e) => { e.preventDefault(); startProfileSigning(e); }}
              onTouchMove={(e) => { e.preventDefault(); drawProfileSig(e); }}
              onTouchEnd={stopProfileSigning}
              className="w-full h-[80px] bg-black/40 border border-white/5 rounded-lg cursor-crosshair block"
            />
            
            {userProfile.contractorSignature && (
              <div className="mt-2.5 p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">ACTIVE SIGNATURE STAMP</span>
                  <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">Stamping dynamically active</span>
                </div>
                <img src={userProfile.contractorSignature} alt="Contractor Signature Stamp" className="h-10 w-auto object-contain bg-white/5 px-2 py-1 rounded" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   BILLING PANEL CABINET PANEL
   ============================================================================ */
function BillingPanel({ plan, setPlan, setShowUpgradeModal }) {
  return (
    <div className="flex flex-col gap-6 text-left max-w-3xl mx-auto">
      <div className="border-b border-white/5 pb-4">
        <h2 className="font-display text-xl font-extrabold text-white">Billing Settings</h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Manage active subscriptions and monitor Stripe payouts</p>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        
        {/* Active plan card */}
        <div className="card glass p-5 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Active Plan Account</span>
          <div className="flex justify-between items-center border-b border-white/5 pb-3 gap-2">
            <div>
              <h3 className="font-display text-lg font-bold text-white">
                {plan === 'free' ? 'DocuDraft Starter' : '👑 DocuDraft Pro active'}
              </h3>
              <span className="text-[10px] text-slate-500">
                {plan === 'free' ? 'Starter level (1 doc/mo limit)' : 'Unrestricted dashboard features'}
              </span>
            </div>
            <span className="badge badge-blue text-[9.5px] font-bold px-2 py-0.5 shrink-0">
              {plan === 'free' ? 'Active Free' : '👑 Pro Active'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Monthly Payout Provider</span>
            <span className="text-slate-200 font-semibold font-mono">Stripe Gateway</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Billing Sum</span>
            <span className="text-slate-200 font-semibold font-mono">{plan === 'free' ? '$0.00 / month' : '$8.00 / month'}</span>
          </div>

          <div className="flex gap-4 mt-2 pt-3 border-t border-white/5">
            {plan === 'free' ? (
              <button onClick={() => setShowUpgradeModal(true)} className="btn btn-primary text-xs py-2 px-5 font-bold shadow-lg shadow-blue-500/10">
                Upgrade Account ($8/mo)
              </button>
            ) : (
              <button onClick={() => setPlan('free')} className="btn btn-secondary text-xs py-2 px-5 font-bold text-rose-400 hover:text-rose-300 bg-rose-950/10 border-rose-900/20">
                Simulate Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {/* Invoice logs representation */}
        <div className="card glass p-5 flex flex-col gap-4">
          <h3 className="font-display text-xs font-bold text-white uppercase tracking-wider">Invoices Payout Logs</h3>
          
          <div className="flex flex-col gap-2">
            {[
              { id: 'INV-488910', date: new Date().toLocaleDateString(), amount: plan === 'free' ? '$0.00' : '$8.00', status: 'PAID' },
              { id: 'INV-471203', date: '04/25/2026', amount: '$0.00', status: 'PAID' }
            ].map((inv, i) => (
              <div key={i} className="flex justify-between items-center bg-black/25 border border-white/5 p-3 rounded text-xs font-mono">
                <div className="flex flex-col text-left font-sans">
                  <span className="font-bold text-white">{inv.id}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{inv.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">{inv.amount}</span>
                  <span className="badge badge-success text-[9px]">{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}


