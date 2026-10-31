import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Terminal,
  Radio,
  Shield,
  RefreshCw,
  Download,
  Smartphone,
  HelpCircle,
  FolderArchive,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBridgeConnected: boolean;
  serverUrl: string;
}

export const BridgeModal: React.FC<BridgeModalProps> = ({
  isOpen,
  onClose,
  isBridgeConnected,
  serverUrl,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'quick' | 'download' | 'usb' | 'troubleshoot'>('quick');
  const [activeScriptTab, setActiveScriptTab] = useState<'shell' | 'powershell' | 'npx' | 'python'>('shell');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : serverUrl;

  const shCommand = `curl -sL ${currentOrigin}/vota.sh | bash`;
  const psCommand = `powershell -ExecutionPolicy Bypass -c "irm ${currentOrigin}/vota.ps1 | iex"`;
  const npxCommand = `npx vota.sh`;
  const pyCommand = `python -c "import urllib.request; exec(urllib.request.urlopen('${currentOrigin}/bridge.py').read())"`;

  const commandToCopy =
    activeScriptTab === 'shell'
      ? shCommand
      : activeScriptTab === 'powershell'
      ? psCommand
      : activeScriptTab === 'npx'
      ? npxCommand
      : pyCommand;

  const handleCopy = () => {
    navigator.clipboard.writeText(commandToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-overlay">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col text-slate-800 animate-modal-pop">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600 shadow-xs">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-slate-900">
                Setup Koneksi ADB Real-Time
              </h3>
              {isBridgeConnected ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Terhubung
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  Menunggu Bridge
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Hubungkan ponsel Android kamu ke dashboard web secara langsung tanpa aplikasi pihak ketiga.
            </p>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-2xl mb-5">
          <button
            onClick={() => setActiveMainTab('quick')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === 'quick'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>1. Perintah Cepat</span>
          </button>
          <button
            onClick={() => setActiveMainTab('download')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === 'download'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>2. Download ADB</span>
          </button>
          <button
            onClick={() => setActiveMainTab('usb')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === 'usb'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>3. USB Debugging</span>
          </button>
          <button
            onClick={() => setActiveMainTab('troubleshoot')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMainTab === 'troubleshoot'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>4. Bantuan/Error</span>
          </button>
        </div>

        {/* Tab Contents (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-slate-700 text-xs">
          {/* TAB 1: QUICK START */}
          {activeMainTab === 'quick' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-blue-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>Fitur Otomatis (Auto-Installer)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Jika kamu belum punya <code>platform-tools</code> di laptop, script di bawah ini akan <strong>secara otomatis mengunduh & mengekstrak platform-tools resmi dari Google</strong>. Tidak perlu instalasi manual yang rumit!
                </p>
              </div>

              {/* Sub-tab for Shell type */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 flex-wrap">
                <span className="text-[11px] text-slate-500 font-bold">Pilih Lingkungan Terminal:</span>
                <button
                  onClick={() => setActiveScriptTab('shell')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    activeScriptTab === 'shell'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Zap className="h-3 w-3" />
                  <span>📱 HP Only (Termux / Termius)</span>
                </button>
                <button
                  onClick={() => setActiveScriptTab('powershell')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    activeScriptTab === 'powershell'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>💻 Windows PowerShell</span>
                </button>
                <button
                  onClick={() => setActiveScriptTab('npx')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    activeScriptTab === 'npx'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>⚡ Node.js (NPX)</span>
                </button>
                <button
                  onClick={() => setActiveScriptTab('python')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    activeScriptTab === 'python'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>🐍 Python 3 (Mac/Linux)</span>
                </button>
              </div>

              {/* Steps */}
              <div className="text-xs text-slate-600 space-y-2">
                {activeScriptTab === 'shell' ? (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li>
                      Buka <strong>Termux</strong> atau terminal lokal ponsel Anda (Android 11+).
                    </li>
                    <li>
                      Aktifkan <strong>Wireless Debugging (Debug Nirkabel)</strong> di Developer Options HP Anda, lalu sambungkan:
                      <code className="ml-1 bg-slate-100 text-blue-600 px-1 py-0.5 rounded font-mono font-bold">adb connect localhost:PORT</code>
                    </li>
                    <li>
                      Copy dan paste perintah 1 baris di bawah ini lalu tekan <strong>Enter</strong>:
                    </li>
                  </ol>
                ) : activeScriptTab === 'powershell' ? (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li>
                      Colokkan ponsel Android ke laptop dengan kabel data USB (atau biarkan mode PC Only).
                    </li>
                    <li>
                      Buka terminal PowerShell di laptop (tekan <code>Win + X</code> lalu pilih <strong>Terminal</strong> atau <strong>PowerShell</strong>).
                    </li>
                    <li>
                      Copy dan paste perintah di bawah ini, lalu tekan <strong>Enter</strong>:
                    </li>
                  </ol>
                ) : activeScriptTab === 'npx' ? (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li>
                      Pastikan komputer atau laptop kamu sudah terinstall <strong>Node.js</strong>.
                    </li>
                    <li>
                      Buka terminal apapun (CMD, PowerShell, Git Bash, atau Terminal macOS/Linux).
                    </li>
                    <li>
                      Jalankan perintah langsung tanpa perlu instalasi rumit:
                    </li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                    <li>
                      Colokkan ponsel Android ke laptop Mac / Linux dengan kabel data USB.
                    </li>
                    <li>
                      Buka terminal dan pastikan izin USB Debugging sudah disetujui di ponsel.
                    </li>
                    <li>
                      Copy dan paste perintah di bawah ini, lalu tekan <strong>Enter</strong>:
                    </li>
                  </ol>
                )}
              </div>

              {/* Code Box */}
              <div className="relative group">
                <pre className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-blue-300 whitespace-pre-wrap break-all select-all leading-5 shadow-xs">
                  {commandToCopy}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Perintah</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-[11px]">
                  <Shield className="h-3.5 w-3.5 text-blue-600" />
                  <span>Aman, Terisolasi & Open-Source</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Script bridge hanya membaca telemetri standar Android (baterai, RAM bebas, kapasitas storage). Tidak mengakses foto, chat, maupun berkas pribadi.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DOWNLOAD PLATFORM-TOOLS */}
          {activeMainTab === 'download' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-800 mb-1">
                  Download Resmi Android SDK Platform-Tools (Google):
                </p>
                <p className="text-slate-500 text-[11px]">
                  Jika kamu ingin mengunduh dan menyimpan paket resmi <code>adb.exe</code> secara manual:
                </p>
              </div>

              {/* Direct Download Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Android Termux */}
                <a
                  href="https://github.com/termux/termux-app/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 bg-blue-50/70 border border-blue-200 hover:border-blue-400 rounded-2xl flex flex-col justify-between group transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-900">📱 Android (Termux)</span>
                      <Download className="h-4 w-4 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Rilis Resmi GitHub APK (Bukan Play Store yang usang).
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 font-bold">
                    <span>Unduh APK Termux</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </a>

                {/* Windows */}
                <a
                  href="https://dl.google.com/android/repository/platform-tools-latest-windows.zip"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-2xl flex flex-col justify-between group transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">💻 Windows (.zip)</span>
                      <Download className="h-4 w-4 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Ukuran: ~12.8 MB • Termasuk <code>adb.exe</code>
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-blue-600 font-bold">
                    <span>Download Windows</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </a>

                {/* macOS */}
                <a
                  href="https://dl.google.com/android/repository/platform-tools-latest-darwin.zip"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col justify-between group transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">🍎 macOS (.zip)</span>
                      <Download className="h-4 w-4 text-slate-500 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Ukuran: ~11.5 MB • Intel & Apple Silicon
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-slate-700 font-bold">
                    <span>Download macOS</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </a>

                {/* Linux */}
                <a
                  href="https://dl.google.com/android/repository/platform-tools-latest-linux.zip"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col justify-between group transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">🐧 Linux (.zip)</span>
                      <Download className="h-4 w-4 text-slate-500 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Ukuran: ~12.2 MB • x86_64 platform-tools
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-slate-700 font-bold">
                    <span>Download Linux</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </a>
              </div>

              {/* Detailed Step by Step */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <FolderArchive className="h-4 w-4 text-blue-600" />
                  <span>Panduan Langkah Ekstrak & Jalankan di Windows:</span>
                </h4>
                <div className="space-y-2 text-[11px] text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <div>
                      <strong>Download file zip</strong> di atas (misal disimpan di folder <code>Downloads</code>).
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <div>
                      Klik kanan pada file <code>platform-tools-latest-windows.zip</code> lalu pilih <strong>"Extract All..." (Ekstrak Semua)</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <div>
                      Buka folder hasil ekstrak sampai kamu melihat file <code>adb.exe</code> di dalamnya.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                      4
                    </span>
                    <div>
                      Di folder tersebut, tahan tombol <strong>Shift</strong> pada keyboard + klik kanan di ruang kosong, lalu klik <strong>"Open PowerShell window here"</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                      5
                    </span>
                    <div>
                      Jalankan perintah 1-baris dari <strong>Tab 1 (Perintah Cepat)</strong>. Selesai!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARA AKTIFKAN USB DEBUGGING */}
          {activeMainTab === 'usb' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Wajib: Opsi Pengembang & USB Debugging</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Agar laptop diizinkan membaca storage dan baterai HP, fitur USB Debugging harus diaktifkan sekali di setelan ponsel.
                </p>
              </div>

              {/* Xiaomi / HyperOS / MIUI Guide */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <span>Langkah untuk Xiaomi / Redmi / POCO (MIUI & HyperOS):</span>
                  </h4>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                    Ponsel Kamu
                  </span>
                </div>
                <ol className="space-y-2 text-[11px] text-slate-600 list-decimal list-inside leading-relaxed">
                  <li>
                    Buka <strong>Pengaturan (Settings)</strong> &rarr; <strong>Tentang Ponsel (About Phone)</strong>.
                  </li>
                  <li>
                    Ketuk pada <strong>Versi OS (OS Version)</strong> atau <strong>Versi MIUI</strong> sebanyak <strong>7 kali berturut-turut</strong> hingga muncul notifikasi: <em>"Sekarang Anda adalah seorang pengembang!"</em>.
                  </li>
                  <li>
                    Kembali ke menu utama Pengaturan &rarr; scroll ke bawah &rarr; buka <strong>Setelan Tambahan (Additional Settings)</strong> &rarr; <strong>Opsi Pengembang (Developer Options)</strong>.
                  </li>
                  <li>
                    Aktifkan opsi: <strong>Debugging USB</strong>, <strong>Instal via USB</strong>, dan <strong>Debugging USB (Setelan Keamanan)</strong>.
                  </li>
                  <li>
                    Colokkan kabel data USB ke laptop. Saat muncul pop-up di layar ponsel, centang: <em>"Selalu izinkan dari komputer ini"</em> lalu tekan tombol [OK].
                  </li>
                </ol>
              </div>

              {/* Samsung / Umum Guide */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-indigo-600" />
                  <span>Untuk Ponsel Samsung (One UI) & Merek Lain:</span>
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Buka <strong>Pengaturan</strong> &rarr; <strong>Tentang Ponsel</strong> &rarr; <strong>Informasi Perangkat Lunak</strong> &rarr; Ketuk <strong>Nomor Versi (Build Number)</strong> 7 kali. Kembali ke Pengaturan &rarr; <strong>Pilihan Pengembang</strong> &rarr; Aktifkan <strong>Debugging USB</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TROUBLESHOOTING */}
          {activeMainTab === 'troubleshoot' && (
            <div className="space-y-3 animate-fade-in text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="font-bold text-amber-700 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>Masalah: Status "Unauthorized" di Terminal</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Penyebab: Kamu belum menekan tombol "OK" pada dialog otorisasi di layar HP.
                </p>
                <div className="text-[11px] text-slate-600 bg-white border border-slate-200 p-2.5 rounded-xl space-y-1 font-mono">
                  <div>1. Nyalakan layar ponsel kamu.</div>
                  <div>2. Cabut kabel USB lalu colokkan kembali.</div>
                  <div>3. Centang "Selalu izinkan dari komputer ini" &rarr; klik "OK".</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span>Masalah: Perangkat Tidak Terdeteksi (Device not found)</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
                  <div>&bull; <strong>Gunakan kabel data asli</strong>: Beberapa kabel hanya kabel charge (tidak memiliki jalur pin transfer data).</div>
                  <div>&bull; <strong>Ubah Mode USB</strong>: Geser bilah notifikasi di HP dari "Hanya Mengisi Daya" ke "Transfer Berkas (MTP)".</div>
                  <div>&bull; <strong>Restart ADB Service</strong>: Di terminal laptop, jalankan: <code>adb kill-server && adb devices</code></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 flex justify-between items-center pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <RefreshCw className={`h-3.5 w-3.5 ${isBridgeConnected ? 'text-emerald-600 animate-spin' : 'text-slate-400'}`} />
            <span>
              {isBridgeConnected ? 'Tersinkronisasi setiap siklus' : 'Menunggu script dijalankan...'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
