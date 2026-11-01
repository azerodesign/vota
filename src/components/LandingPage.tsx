import React, { useState } from 'react';
import {
  Zap,
  Terminal,
  FolderTree,
  Trash2,
  ShieldAlert,
  FileSearch,
  ShieldCheck,
  Check,
  Copy,
  Wifi,
  Sparkles,
  ExternalLink,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  HardDrive,
  Cpu,
  Smartphone,
  Gauge
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  isAuthenticated: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, isAuthenticated }) => {
  // Terminal Tab State
  const [activeCliTab, setActiveCliTab] = useState<'powershell' | 'termux' | 'bash'>('powershell');
  const [copiedCli, setCopiedCli] = useState(false);

  // Feature Playground State
  const [activePlaygroundTab, setActivePlaygroundTab] = useState<'treemap' | 'bloatware' | 'scanner'>('treemap');
  const [selectedTreemapNode, setSelectedTreemapNode] = useState<string>('dcim');

  // Interactive Bloatware Demo State
  const [demoBloatware, setDemoBloatware] = useState([
    { id: 1, name: 'Facebook Services', pkg: 'com.facebook.katana', size: '480 MB', uninstalled: false },
    { id: 2, name: 'Analytics Telemetry', pkg: 'com.miui.analytics', size: '120 MB', uninstalled: true },
    { id: 3, name: 'Google Meet Companion', pkg: 'com.google.android.apps.tachyon', size: '240 MB', uninstalled: false },
    { id: 4, name: 'Device Care Ad Agent', pkg: 'com.samsung.android.bixby.agent', size: '185 MB', uninstalled: true },
  ]);

  const handleCliCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2200);
  };

  const toggleDemoBloatware = (id: number) => {
    setDemoBloatware((prev) =>
      prev.map((item) => (item.id === id ? { ...item, uninstalled: !item.uninstalled } : item))
    );
  };

  const currentOrigin =
    typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
      ? 'https://vota.axy.my.id'
      : (typeof window !== 'undefined' ? window.location.origin : 'https://vota.axy.my.id');

  const cliCommands = {
    powershell: `powershell -ExecutionPolicy Bypass -c "irm '${currentOrigin}/vota.ps1' | iex"`,
    termux: `curl -sL ${currentOrigin}/vota.sh | bash`,
    bash: `curl -sL ${currentOrigin}/vota.sh | bash`,
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased relative overflow-x-hidden">
      {/* Background Gradients & Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-blue-600/15 via-indigo-600/8 to-transparent blur-[140px]" />
        <div className="absolute top-[800px] left-10 w-[500px] h-[500px] bg-sky-500/5 blur-[160px]" />
        <div className="absolute top-[1400px] right-10 w-[600px] h-[600px] bg-indigo-600/5 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* =========================================================================
          1. STICKY MODERN NAVBAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/85 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Version Badge */}
          <div className="flex items-center gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-white font-display">VOTA</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  v1.0.2
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Android ADB & Storage Intelligence Engine
              </p>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#fitur" className="hover:text-blue-400 transition-colors">
              Fitur Utama
            </a>
            <a href="#treemap" className="hover:text-blue-400 transition-colors">
              Live Treemap
            </a>
            <a href="#bridge" className="hover:text-blue-400 transition-colors">
              Terminal Bridge
            </a>
            <a href="#cara-sambung" className="hover:text-blue-400 transition-colors">
              Cara Sambung
            </a>
            <button
              onClick={() => onNavigate('/docs')}
              className="hover:text-blue-400 transition-colors cursor-pointer text-slate-300 text-xs font-semibold"
            >
              Dokumentasi
            </button>
            <a
              href="https://github.com/azerodesign/vota"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          {/* Right Action: Server Status & Navigation CTA */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>vota.axy.my.id (Online)</span>
            </div>
            
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('/dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <Gauge className="h-3.5 w-3.5" />
                <span>Buka Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Masuk (Login)</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. HERO SECTION (NO LOGIN FORM - PURE SHOWCASE & DIRECT CTA)
          ========================================================================= */}
      <section className="relative z-10 pt-12 pb-20 lg:pt-20 lg:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Headline, Pitch & 1-Liner Script */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>Real-Time Android ADB Bridge & Deep Storage Auditor</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15] font-display">
              Kendalikan & Audit HP Android{' '}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                Langsung dari Browser
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              Tanpa perlu menginstal APK asing di HP atau software 500MB di PC. Cukup sambungkan via{' '}
              <strong className="text-white font-semibold">Wireless ADB</strong>, nikmati visualisasi storage treemap
              instan, bersihkan bloatware sistem secara aman, dan karantina file mencurigakan dalam hitungan detik.
            </p>

            {/* Interactive Terminal 1-Liner */}
            <div id="bridge" className="pt-2">
              <div className="bg-[#0b1120] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                {/* CLI Header Tabs */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-slate-400 text-xs font-mono font-medium ml-2 flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-blue-400" />
                      1-Line Instant Bridge
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActiveCliTab('powershell')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                        activeCliTab === 'powershell'
                          ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      PowerShell
                    </button>
                    <button
                      onClick={() => setActiveCliTab('termux')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                        activeCliTab === 'termux'
                          ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Termux (HP)
                    </button>
                    <button
                      onClick={() => setActiveCliTab('bash')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                        activeCliTab === 'bash'
                          ? 'bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Linux/Mac
                    </button>
                  </div>
                </div>

                {/* Code Bar */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <code className="text-xs sm:text-sm font-mono text-blue-300 break-all select-all">
                    {cliCommands[activeCliTab]}
                  </code>
                  <button
                    onClick={() => handleCliCopy(cliCommands[activeCliTab])}
                    className="shrink-0 p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 border border-slate-700/80 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                    title="Salin Perintah"
                  >
                    {copiedCli ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400 hidden sm:inline">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="hidden sm:inline">Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                Otomatis mengunduh platform-tools adb sementara di memori tanpa merusak konfigurasi sistem Anda.
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                <div className="text-xl font-black text-white font-mono">0 MB</div>
                <div className="text-[11px] text-slate-400 font-medium">Instalasi APK</div>
              </div>
              <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                <div className="text-xl font-black text-blue-400 font-mono">&lt; 1 Detik</div>
                <div className="text-[11px] text-slate-400 font-medium">Live Telemetry</div>
              </div>
              <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                <div className="text-xl font-black text-emerald-400 font-mono">User 0</div>
                <div className="text-[11px] text-slate-400 font-medium">Safe Debloater</div>
              </div>
              <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-2xl">
                <div className="text-xl font-black text-indigo-400 font-mono">SHA-256</div>
                <div className="text-[11px] text-slate-400 font-medium">Audit Keamanan</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Device Preview Card (Pure Showcase & Nav Action) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-[#0d1424]/90 border border-slate-800/90 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-2xl relative z-10 animate-fade-in space-y-6">
              
              {/* Device Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">Android Device Monitor</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Pixel 8 Pro • Android 14</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>5555 TCP/IP</span>
                </div>
              </div>

              {/* Storage Telemetry Gauge Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <HardDrive className="h-3.5 w-3.5 text-blue-400" />
                    Internal Storage
                  </span>
                  <span className="text-white font-bold">98.2 GB / 128 GB</span>
                </div>
                {/* Progress bar */}
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500 rounded-full shimmer-bar"
                    style={{ width: '76.7%' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Terpakai: <strong className="text-blue-400">76.7%</strong></span>
                  <span>Sisa: <strong className="text-emerald-400">29.8 GB</strong></span>
                </div>
              </div>

              {/* Quick Telemetry Indicators */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
                    <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                    <span>RAM Telemetry</span>
                  </div>
                  <div className="text-base font-black text-white font-mono">7.2 GB / 12 GB</div>
                  <div className="text-[10px] text-emerald-400 font-mono">4.8 GB Tersedia</div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>Baterai & Suhu</span>
                  </div>
                  <div className="text-base font-black text-white font-mono">88% • 31.4°C</div>
                  <div className="text-[10px] text-blue-400 font-mono">Optimal Normal</div>
                </div>
              </div>

              {/* Action Buttons: Direct Path to Login or Dashboard */}
              <div className="space-y-2.5 pt-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => onNavigate('/dashboard')}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
                  >
                    <Gauge className="h-4 w-4" />
                    <span>Buka Dashboard Live</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('/login')}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>Masuk ke Dashboard (Login Key)</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => onNavigate('/docs')}
                  className="w-full py-2.5 px-4 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Lihat Panduan & Dokumentasi</span>
                </button>
              </div>

              {/* Security Badge Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500/80" />
                <span>Strict 1-IP Hardware Session Protection</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          3. INTERACTIVE FEATURE PLAYGROUND (SHOW, DON'T JUST TELL)
          ========================================================================= */}
      <section id="fitur" className="relative z-10 py-16 bg-[#090e1b]/70 border-y border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 mb-2 font-heading">
              Bukan Sekadar Screenshot Statis
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              Eksplorasi Fitur Engine Secara Interaktif
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              Klik tab di bawah untuk melihat bagaimana VOTA membedah penyimpanan, bloatware, dan audit virus HP Anda.
            </p>
          </div>

          {/* Playground Selector Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActivePlaygroundTab('treemap')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activePlaygroundTab === 'treemap'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderTree className="h-4 w-4" />
                <span>Storage Treemap</span>
              </button>
              <button
                onClick={() => setActivePlaygroundTab('bloatware')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activePlaygroundTab === 'bloatware'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                <span>Safe Debloater</span>
              </button>
              <button
                onClick={() => setActivePlaygroundTab('scanner')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activePlaygroundTab === 'scanner'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Virus Quarantine</span>
              </button>
            </div>
          </div>

          {/* Interactive Playground Content */}
          <div className="bg-[#0b1222] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {activePlaygroundTab === 'treemap' && (
              <div id="treemap" className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2 font-display">
                      <FolderTree className="h-4 w-4 text-blue-400" />
                      Visualisasi Hirarki Penyimpanan HP (Kapasitas: 128 GB)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Klik salah satu blok direktori untuk memeriksa detail penggunaan berkas secara mendalam.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-400">Terpakai: </span>
                    <span className="text-xs font-mono font-bold text-blue-400">98.2 GB / 128 GB (76.7%)</span>
                  </div>
                </div>

                {/* Simulated Treemap Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 h-auto md:h-64 font-mono text-xs">
                  {/* DCIM Node */}
                  <div
                    onClick={() => setSelectedTreemapNode('dcim')}
                    className={`md:col-span-5 rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer border ${
                      selectedTreemapNode === 'dcim'
                        ? 'bg-blue-600/25 border-blue-400 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-blue-950/40 border-blue-900/60 text-blue-200 hover:bg-blue-900/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-bold">
                        <span>/DCIM & Kamera</span>
                        <span className="text-blue-400">42.4 GB</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-1">
                        Foto RAW, Video 4K 60fps & screenshot galeri kamera
                      </p>
                    </div>
                    <div className="text-[10px] text-blue-300 font-sans mt-4">
                      {selectedTreemapNode === 'dcim' ? '● Sedang dipilih (2,840 Berkas)' : 'Klik untuk inspeksi'}
                    </div>
                  </div>

                  {/* Android/data Node */}
                  <div
                    onClick={() => setSelectedTreemapNode('data')}
                    className={`md:col-span-4 rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer border ${
                      selectedTreemapNode === 'data'
                        ? 'bg-indigo-600/25 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-indigo-950/40 border-indigo-900/60 text-indigo-200 hover:bg-indigo-900/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-bold">
                        <span>/Android/data & obb</span>
                        <span className="text-indigo-400">26.8 GB</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-1">
                        Asset data game (Genshin, MLBB) & cache tersembunyi
                      </p>
                    </div>
                    <div className="text-[10px] text-indigo-300 font-sans mt-4">
                      {selectedTreemapNode === 'data' ? '● Sedang dipilih (14 Aplikasi)' : 'Klik untuk inspeksi'}
                    </div>
                  </div>

                  {/* Right Column Smaller Nodes */}
                  <div className="md:col-span-3 flex flex-col gap-3">
                    <div
                      onClick={() => setSelectedTreemapNode('wa')}
                      className={`flex-1 rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer border ${
                        selectedTreemapNode === 'wa'
                          ? 'bg-emerald-600/25 border-emerald-400 text-white'
                          : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200 hover:bg-emerald-900/30'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>/WhatsApp Media</span>
                        <span className="text-emerald-400">18.5 GB</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans">Voice Notes & Video Grup</span>
                    </div>

                    <div
                      onClick={() => setSelectedTreemapNode('downloads')}
                      className={`flex-1 rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer border ${
                        selectedTreemapNode === 'downloads'
                          ? 'bg-amber-600/25 border-amber-400 text-white'
                          : 'bg-amber-950/40 border-amber-900/60 text-amber-200 hover:bg-amber-900/30'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>/Download & APK</span>
                        <span className="text-amber-400">10.5 GB</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans">File installer & arsip lama</span>
                    </div>
                  </div>
                </div>

                {/* Node Detail Box */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Analisis Node: </span>
                    <span className="text-white font-bold">
                      {selectedTreemapNode === 'dcim' && '/storage/emulated/0/DCIM (Galeri & Tangkapan Layar)'}
                      {selectedTreemapNode === 'data' && '/storage/emulated/0/Android/data (Package Sandboxes)'}
                      {selectedTreemapNode === 'wa' && '/storage/emulated/0/Android/media/com.whatsapp'}
                      {selectedTreemapNode === 'downloads' && '/storage/emulated/0/Download (Installer & Zip)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Deep Recursion Verified
                    </span>
                    <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Bisa Dibersihkan
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activePlaygroundTab === 'bloatware' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2 font-display">
                      <Trash2 className="h-4 w-4 text-rose-400" />
                      Debloater Sistem: Copot Aplikasi Bawaan (User 0)
                    </h4>
                    <p className="text-xs text-slate-400">
                      VOTA menggunakan perintah resmi <code>pm uninstall -k --user 0</code>. Aman, tanpa resiko bootloop, dan dapat dipulihkan kapan saja.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 self-start sm:self-auto">
                    Tanpa Perlu Root HP
                  </span>
                </div>

                {/* Interactive Demo List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {demoBloatware.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{item.name}</div>
                        <div className="text-xs font-mono text-slate-400">{item.pkg}</div>
                        <div className="text-[11px] font-mono text-blue-400 mt-1">Ukuran: {item.size}</div>
                      </div>
                      <button
                        onClick={() => toggleDemoBloatware(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          item.uninstalled
                            ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
                        }`}
                      >
                        {item.uninstalled ? 'Pulihkan (+)' : 'Copot (x)'}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Perintah ADB Terksekusi:</span>
                  <code className="text-emerald-400">adb shell pm uninstall -k --user 0 [package]</code>
                </div>
              </div>
            )}

            {activePlaygroundTab === 'scanner' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2 font-display">
                      <ShieldAlert className="h-4 w-4 text-emerald-400" />
                      Heuristic Virus & Malware Isolation Sandbox
                    </h4>
                    <p className="text-xs text-slate-400">
                      Memindai skrip berbahaya, ekstensi executable terselubung (.exe, .vbs, .scr, .apk fake), dan memindahkannya ke direktori karantina aman.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                    Karantina Terisolasi
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
                    <FileSearch className="h-6 w-6 text-blue-400 mb-2" />
                    <h5 className="font-bold text-white text-sm mb-1 font-display">Audit Signature SHA-256</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Membandingkan hash berkas dengan database ancaman untuk mendeteksi virus trojan yang menyamar sebagai file gambar atau dokumen.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
                    <ShieldCheck className="h-6 w-6 text-emerald-400 mb-2" />
                    <h5 className="font-bold text-white text-sm mb-1 font-display">Zero-Breakage Sandbox</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      File berbahaya tidak langsung dihapus permanen, melainkan dinetralkan izin eksekusinya dan diisolasi di folder karantina.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
                    <Zap className="h-6 w-6 text-amber-400 mb-2" />
                    <h5 className="font-bold text-white text-sm mb-1 font-display">1-Click Neutralize</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Cukup 1 klik dari web dashboard untuk membersihkan seluruh ancaman yang terdeteksi tanpa perlu mengetik perintah terminal manual.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. HOW IT WORKS (3 SIMPLE STEPS)
          ========================================================================= */}
      <section id="cara-sambung" className="relative z-10 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 mb-2 font-heading">
            Setup Cepat Tanpa Ribet
          </h2>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
            3 Langkah Menyambungkan HP ke VOTA
          </h3>
          <p className="text-slate-400 text-sm mt-2">
            Mendukung koneksi Wireless ADB via WiFi lokal maupun kabel data USB.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 bg-[#0b1222] border border-slate-800 rounded-3xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 font-mono font-black flex items-center justify-center mb-4 border border-blue-500/30">
              01
            </div>
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-display">
              <Wifi className="h-4 w-4 text-blue-400" />
              Aktifkan Wireless ADB
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Buka <strong className="text-white">Pengaturan HP</strong> &rarr; <strong className="text-white">Opsi Pengembang</strong>. Aktifkan <em>Debugging Nirkabel (Wireless Debugging)</em> dan dapatkan IP & Port (contoh: <code>192.168.1.15:5555</code>).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 bg-[#0b1222] border border-slate-800 rounded-3xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 font-mono font-black flex items-center justify-center mb-4 border border-indigo-500/30">
              02
            </div>
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-display">
              <KeyRound className="h-4 w-4 text-indigo-400" />
              Dapatkan Key & Login
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Buka halaman login untuk memasukkan key akses Anda dan mengunci sesi aman (1 Key terikat 1 IP Address).
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 bg-[#0b1222] border border-slate-800 rounded-3xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/20 text-emerald-400 font-mono font-black flex items-center justify-center mb-4 border border-emerald-500/30">
              03
            </div>
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2 font-display">
              <Zap className="h-4 w-4 text-emerald-400" />
              Jalankan Script 1-Baris
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Salin dan tempel perintah PowerShell di PC atau Termux di HP. Dashboard VOTA otomatis terhubung dan menampilkan data HP secara real-time.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. COMPARISON TABLE (WHY VOTA WINS OVER GENERIC CLEANERS)
          ========================================================================= */}
      <section className="relative z-10 py-16 bg-[#080d1a] border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400 mb-2 font-heading">
              Bukan Aplikasi Biasa
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              Kenapa VOTA Jauh Lebih Unggul?
            </h3>
          </div>

          <div className="bg-[#0b1222] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 font-mono text-slate-400">
                    <th className="p-4 sm:p-5">Parameter Perbandingan</th>
                    <th className="p-4 sm:p-5 text-blue-400 font-bold">VOTA Engine v1.0.2</th>
                    <th className="p-4 sm:p-5 text-slate-500">Aplikasi Cleaner PlayStore</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Instalasi di Perangkat</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="h-4 w-4 shrink-0" />
                      0 MB (Tanpa instal APK sama sekali)
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Harus install APK 80MB+ di HP</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Iklan & Notifikasi Mengganggu</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="h-4 w-4 shrink-0" />
                      100% Bebas Iklan (Open Source)
                    </td>
                    <td className="p-4 sm:p-5 text-rose-400">Penuh iklan pop-up & banner</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Copot Aplikasi Bawaan (Bloatware)</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="h-4 w-4 shrink-0" />
                      Bisa (Akses Package Manager User 0)
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Tidak bisa (Gagal tanpa root)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Visualisasi Storage Treemap</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="h-4 w-4 shrink-0" />
                      Interaktif hingga direktori terdalam
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Hanya diagram lingkaran sederhana</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-semibold text-white">Keamanan Sesi</td>
                    <td className="p-4 sm:p-5 text-emerald-400 font-bold flex items-center gap-1.5">
                      <Check className="h-4 w-4 shrink-0" />
                      Strict 1-IP Hardware Session Lock
                    </td>
                    <td className="p-4 sm:p-5 text-slate-400">Koleksi data analitik pengguna</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. BOTTOM CALL TO ACTION
          ========================================================================= */}
      <section className="relative z-10 py-16 max-w-4xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-b from-blue-900/30 via-slate-900/90 to-[#070b14] border border-blue-800/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3 font-display">
            Siap Memeriksa & Mengoptimalkan HP Anda?
          </h3>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed mb-6 font-normal">
            Buka dashboard sekarang dan mulailah menganalisis penyimpanan HP tanpa batasan.
          </p>
          {isAuthenticated ? (
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-600/30 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer font-sans"
            >
              <Gauge className="h-4 w-4" />
              <span>Buka Dashboard Live</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('/login')}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-blue-600/30 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer font-sans"
            >
              <KeyRound className="h-4 w-4" />
              <span>Masuk ke Dashboard (Login)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {/* =========================================================================
          7. FOOTER
          ========================================================================= */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#05080f] py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white tracking-wider font-display">VOTA ENGINE</span>
            <span className="text-slate-500">•</span>
            <span>Real-Time Android ADB Telemetry</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-blue-400">v1.0.2</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate(isAuthenticated ? '/dashboard' : '/login')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {isAuthenticated ? 'Dashboard' : 'Login'}
            </button>
            <button
              onClick={() => onNavigate('/docs')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dokumentasi
            </button>
            <a
              href="https://github.com/azerodesign/vota"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <span className="text-slate-400">Server: <strong className="text-slate-300 font-mono">vota.axy.my.id</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
};
