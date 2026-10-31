import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Smartphone,
  HardDrive,
  Terminal,
  Shield,
  Zap,
  Radio,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Server,
} from 'lucide-react';

interface DocsPageProps {
  onNavigate: (path: string) => void;
  isAuthenticated: boolean;
}

export const DocsPage: React.FC<DocsPageProps> = ({ onNavigate, isAuthenticated }) => {
  const [activeSection, setActiveSection] = useState<'intro' | 'android' | 'pc' | 'cli' | 'api' | 'security'>('intro');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <div className="flex items-center gap-2 select-none">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="font-black text-sm tracking-wider text-slate-900">VOTA DOCS</span>
                <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  v1.0.2
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/azerodesign/vota"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('/')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Ke Dashboard Live
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/login')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Masuk Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Documentation Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 flex flex-col md:flex-row gap-8">
        {/* Left Sticky Sidebar Menu */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block mb-2">
              Daftar Dokumentasi
            </span>

            <button
              onClick={() => setActiveSection('intro')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeSection === 'intro'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>1. Pengenalan VOTA</span>
            </button>

            <button
              onClick={() => setActiveSection('android')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeSection === 'android'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>2. Sambungkan Android</span>
            </button>

            <button
              onClick={() => setActiveSection('pc')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeSection === 'pc'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <HardDrive className="h-4 w-4" />
              <span>3. Sambungkan Windows PC</span>
            </button>

            <button
              onClick={() => setActiveSection('cli')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeSection === 'cli'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Terminal className="h-4 w-4" />
              <span>4. CLI (NPM & NPX)</span>
            </button>

            <button
              onClick={() => setActiveSection('api')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeSection === 'api'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Server className="h-4 w-4" />
              <span>5. REST API & Arsitektur</span>
            </button>

            <button
              onClick={() => setActiveSection('security')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeSection === 'security'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>6. Keamanan & Sesi 30 Hari</span>
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          {/* SECTION 1: INTRODUCTION */}
          {activeSection === 'intro' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Dokumentasi Resmi
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Apa itu VOTA?
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  <strong>VOTA</strong> (Voice of Telemetry & Storage Analytics) adalah engine analitik, pembersih penyimpanan, dan audit telemetri real-time generasi baru untuk <strong>HP Android</strong> dan <strong>Laptop / PC Windows</strong>.
                </p>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs space-y-2">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Prinsip Zero-Mock Policy
                </span>
                <p className="text-slate-600 leading-relaxed">
                  VOTA beroperasi dengan filosofi <strong>Zero-Mock</strong>: setiap angka sisa RAM, suhu baterai, kapasitas hard disk/SSD, dan beban proses yang ditampilkan diambil secara langsung dari API perangkat fisik (ADB shell dan WMI/CIM Windows) tanpa simulasi data tiruan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    Android Engine
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mendukung mode tanpa komputer (Termux nirkabel), pembersihan cache WhatsApp aman, debloat aplikasi bawaan tanpa bootloop, dan live battery stream.
                  </p>
                </div>

                <div className="p-4 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-indigo-600" />
                    Windows PC Engine
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Auditor partisi C: / D:, pembersih %TEMP% dan Recycle Bin, task manager top RAM/CPU proses, dan 2D Squarified Treemap.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: ANDROID */}
          {activeSection === 'android' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Panduan Ponsel
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Cara Menyambungkan HP Android
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Tersedia dua opsi penyambungan: langsung dari HP tanpa PC (via Termux) atau melalui kabel USB laptop.
                </p>
              </div>

              {/* Method A: Termux */}
              <div className="space-y-3 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    Metode 1: Mode HP Only (Termux Tanpa PC)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Sangat Direkomendasikan
                  </span>
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  <li>Install <strong>Termux</strong> di HP Anda dari F-Droid.</li>
                  <li>Buka <strong>Opsi Pengembang</strong> di pengaturan HP, aktifkan <strong>Debug Nirkabel (Wireless Debugging)</strong>.</li>
                  <li>Buka Termux dan tempelkan perintah 1-baris berikut:</li>
                </ol>

                <div className="relative">
                  <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
                    <code>pkg install -y android-tools curl &amp;&amp; curl -sL https://vota.axy.my.id/vota.sh | bash</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard('pkg install -y android-tools curl && curl -sL https://vota.axy.my.id/vota.sh | bash', 'termux')}
                    className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === 'termux' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCode === 'termux' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* Method B: Wireless TCP/IP */}
              <div className="space-y-3 p-5 border border-slate-200 rounded-2xl">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Radio className="h-4 w-4 text-indigo-600" />
                  Metode 2: Mengaktifkan ADB WiFi (Port 5555)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jika Anda ingin melepas kabel USB setelah pairing pertama:
                </p>
                <pre className="p-3 bg-slate-900 text-white font-mono text-xs rounded-xl overflow-x-auto">
                  <code>adb tcpip 5555&#10;adb connect &lt;IP_HP_ANDA&gt;:5555</code>
                </pre>
              </div>
            </div>
          )}

          {/* SECTION 3: PC */}
          {activeSection === 'pc' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Panduan Laptop &amp; Komputer
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Cara Menyambungkan Windows PC
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Sambungkan laptop Anda menggunakan PowerShell bawaan Windows 10 &amp; 11 tanpa perlu instalasi aplikasi tambahan.
                </p>
              </div>

              <div className="space-y-3 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-indigo-600" />
                  Perintah 1-Baris PowerShell
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Buka <strong>PowerShell</strong> (Run as Administrator) di Windows dan jalankan:
                </p>

                <div className="relative">
                  <pre className="p-3 bg-slate-950 text-sky-400 font-mono text-xs rounded-xl overflow-x-auto">
                    <code>powershell -ExecutionPolicy Bypass -c "irm https://vota.axy.my.id/vota.ps1 | iex"</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard('powershell -ExecutionPolicy Bypass -c "irm https://vota.axy.my.id/vota.ps1 | iex"', 'ps1')}
                    className="absolute right-2 top-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === 'ps1' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCode === 'ps1' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  *Skrip ini secara otomatis membaca partisi fisik C: / D:, memantau RAM &amp; proses Windows, serta menjembatani HP Android yang tercolok via USB kabel data.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 4: CLI */}
          {activeSection === 'cli' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Command Line Interface
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  VOTA CLI (NPM &amp; NPX)
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Bagi pengguna yang telah menginstal Node.js di komputer (Windows/Mac/Linux), Anda dapat menjalankan VOTA secara instan tanpa mengunduh berkas fisik.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 block">Jalankan Langsung via NPX (Zero-Install):</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl">
                  <code>npx -y github:azerodesign/vota</code>
                </pre>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-900 block">Install Global di Komputer:</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl">
                  <code>npm install -g github:azerodesign/vota</code>
                </pre>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-900 block">Daftar Sub-Command yang Didukung:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 border border-slate-200 rounded-xl">
                    <code className="font-bold text-blue-600">vota pc</code>
                    <p className="text-slate-500 text-[11px] mt-0.5">Audit spesifikasi CPU, RAM, &amp; disk laptop ini</p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-xl">
                    <code className="font-bold text-blue-600">vota phone</code>
                    <p className="text-slate-500 text-[11px] mt-0.5">Audit info baterai, suhu, RAM &amp; storage HP via ADB</p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-xl">
                    <code className="font-bold text-blue-600">vota scan</code>
                    <p className="text-slate-500 text-[11px] mt-0.5">Pindai malware, dropper %TEMP%, dan berkas APK</p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-xl">
                    <code className="font-bold text-blue-600">vota clean</code>
                    <p className="text-slate-500 text-[11px] mt-0.5">Bersihkan cache sementara %TEMP% dan /tmp</p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-xl">
                    <code className="font-bold text-blue-600">vota tcpip</code>
                    <p className="text-slate-500 text-[11px] mt-0.5">Aktifkan mode ADB WiFi (port 5555)</p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-xl">
                    <code className="font-bold text-blue-600">vota web</code>
                    <p className="text-slate-500 text-[11px] mt-0.5">Jalankan dashboard web lokal di http://localhost:5173</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: REST API */}
          {activeSection === 'api' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Integrasi &amp; Endpoint
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  REST API &amp; Multi-Tenant Room
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  VOTA menyediakan API endpoint yang dapat diintegrasikan dengan sistem monitoring lain atau di-host secara mandiri di VPS / Vercel.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-mono font-bold text-[10px] rounded">GET</span>
                    <code className="font-bold text-xs">/api/status</code>
                  </div>
                  <p className="text-xs text-slate-600">Mengambil snapshot telemetri lengkap HP &amp; PC saat ini (Memerlukan header Authorization: Bearer token).</p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-mono font-bold text-[10px] rounded">POST</span>
                    <code className="font-bold text-xs">/api/bridge/report</code>
                  </div>
                  <p className="text-xs text-slate-600">Endpoint pelaporan interval dari skrip PowerShell / Termux bridge.</p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-mono font-bold text-[10px] rounded">GET</span>
                    <code className="font-bold text-xs">/api/security/scan?target=pc</code>
                  </div>
                  <p className="text-xs text-slate-600">Menjalankan audit heuristic real-time pada direktori temporary dan sistem.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: SECURITY */}
          {activeSection === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                  Standar Keamanan
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  Keamanan &amp; Sesi Token 30 Hari
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  VOTA dirancang dengan standar keamanan enterprise: <strong>Zero-Root Required</strong>, <strong>No Telemetry Leak</strong>, dan <strong>HMAC-SHA256 Signed Sessions</strong>.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-2">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-emerald-600" />
                  Masa Aktif Sesi 30 Hari (Anti-Logout)
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Setiap token yang dihasilkan saat memasukkan key master ditandatangani menggunakan kunci rahasia server permanen. Token bersifat stateless dan valid selama 30 hari penuh, sehingga Anda tidak akan pernah ter-logout secara tiba-tiba meskipun server atau daemon mengalami restart.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <span className="font-bold text-slate-900 block">Kunci Akses Default:</span>
                <p>Master Key akses default untuk dashboard publik adalah: <code className="bg-slate-100 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">vota2026</code> atau <code className="bg-slate-100 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">vota-admin</code>.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
