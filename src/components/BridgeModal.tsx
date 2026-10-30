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
  const [activeScriptTab, setActiveScriptTab] = useState<'powershell' | 'python'>('powershell');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : serverUrl;

  const psCommand = `powershell -ExecutionPolicy Bypass -c "irm ${currentOrigin}/bridge.ps1 | iex"`;
  const pyCommand = `python -c "import urllib.request; exec(urllib.request.urlopen('${currentOrigin}/bridge.py').read())"`;

  const commandToCopy = activeScriptTab === 'powershell' ? psCommand : pyCommand;

  const handleCopy = () => {
    navigator.clipboard.writeText(commandToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <div className="p-3 bg-cyan-950/60 border border-cyan-800/40 rounded-xl text-cyan-400">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-bold text-slate-100">
                Setup Koneksi ADB Real-Time
              </h3>
              {isBridgeConnected ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Terhubung
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                  Menunggu Bridge
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Hubungkan ponsel Android kamu ke dashboard web secara langsung tanpa aplikasi pihak ketiga.
            </p>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl mb-5">
          <button
            onClick={() => setActiveMainTab('quick')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeMainTab === 'quick'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>1. Perintah Cepat</span>
          </button>
          <button
            onClick={() => setActiveMainTab('download')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeMainTab === 'download'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>2. Download ADB</span>
          </button>
          <button
            onClick={() => setActiveMainTab('usb')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeMainTab === 'usb'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>3. USB Debugging</span>
          </button>
          <button
            onClick={() => setActiveMainTab('troubleshoot')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeMainTab === 'troubleshoot'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>4. Bantuan/Error</span>
          </button>
        </div>

        {/* Tab Contents (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* TAB 1: QUICK START */}
          {activeMainTab === 'quick' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs space-y-1">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>Fitur Otomatis (Auto-Installer)</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Jika kamu belum punya <code>platform-tools</code> di laptop, script di bawah ini akan <strong>secara otomatis mengunduh & mengekstrak platform-tools resmi dari Google</strong> ke folder kamu. Kamu tidak perlu instalasi rumit!
                </p>
              </div>

              {/* Sub-tab for Shell type */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <span className="text-[11px] text-slate-400 font-medium">Pilih Terminal Laptop:</span>
                <button
                  onClick={() => setActiveScriptTab('powershell')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    activeScriptTab === 'powershell'
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Windows PowerShell (Bawaan Windows)
                </button>
                <button
                  onClick={() => setActiveScriptTab('python')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    activeScriptTab === 'python'
                      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Python 3 (Mac / Linux)
                </button>
              </div>

              {/* Steps */}
              <div className="text-xs text-slate-300 space-y-2">
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
                  <li>
                    Colokkan ponsel Android ke laptop dengan kabel data USB.
                  </li>
                  <li>
                    Buka terminal PowerShell di laptop (tekan <code>Win + X</code> lalu pilih <strong>Terminal</strong> atau <strong>PowerShell</strong>).
                  </li>
                  <li>
                    Copy dan paste perintah di bawah ini, lalu tekan <strong>Enter</strong>:
                  </li>
                </ol>
              </div>

              {/* Code Box */}
              <div className="relative group">
                <pre className="p-3.5 bg-black/70 border border-slate-800 rounded-xl text-xs font-mono text-cyan-300 whitespace-pre-wrap break-all select-all leading-5">
                  {commandToCopy}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
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

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-medium text-[11px]">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Aman, Terisolasi & Open-Source</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Script bridge hanya membaca telemetri standar Android (baterai, RAM bebas, kapasitas storage). Tidak mengakses foto, chat, maupun berkas pribadi.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DOWNLOAD PLATFORM-TOOLS */}
          {activeMainTab === 'download' && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-xs text-slate-300">
                <p className="font-semibold text-slate-200 mb-1">
                  Download Resmi Android SDK Platform-Tools (Google):
                </p>
                <p className="text-slate-400 text-[11px]">
                  Jika kamu ingin mengunduh dan menyimpan paket resmi <code>adb.exe</code> secara manual:
                </p>
              </div>

              {/* Direct Download Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Windows */}
                <a
                  href="https://dl.google.com/android/repository/platform-tools-latest-windows.zip"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 rounded-xl flex flex-col justify-between group transition-all hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-cyan-300">Windows (.zip)</span>
                      <Download className="h-4 w-4 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Ukuran: ~12.8 MB • Termasuk <code>adb.exe</code> & <code>fastboot.exe</code>
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-400 font-semibold">
                    <span>Download Windows</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </a>

                {/* macOS */}
                <a
                  href="https://dl.google.com/android/repository/platform-tools-latest-darwin.zip"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200">macOS (.zip)</span>
                      <Download className="h-4 w-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Ukuran: ~11.5 MB • Intel & Apple Silicon (M1/M2/M3/M4)
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-slate-300 font-semibold">
                    <span>Download macOS</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </a>

                {/* Linux */}
                <a
                  href="https://dl.google.com/android/repository/platform-tools-latest-linux.zip"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col justify-between group transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200">Linux (.zip)</span>
                      <Download className="h-4 w-4 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Ukuran: ~12.2 MB • x86_64 binaries (Ubuntu, Debian, Fedora)
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-slate-300 font-semibold">
                    <span>Download Linux</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </a>
              </div>

              {/* Detailed Step by Step */}
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <FolderArchive className="h-4 w-4 text-cyan-400" />
                  <span>Panduan Langkah Ekstrak & Jalankan di Windows:</span>
                </h4>
                <div className="space-y-2.5 text-[11px] text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                      1
                    </span>
                    <div>
                      <strong>Download file zip</strong> di atas (misal disimpan di folder <code>Downloads</code>).
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                      2
                    </span>
                    <div>
                      Klik kanan pada file <code>platform-tools-latest-windows.zip</code> lalu pilih <strong>"Extract All..." (Ekstrak Semua)</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                      3
                    </span>
                    <div>
                      Buka folder hasil ekstrak sampai kamu melihat file <code>adb.exe</code> di dalamnya.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                      4
                    </span>
                    <div>
                      Di folder tersebut, tahan tombol <strong>Shift</strong> pada keyboard + klik kanan di ruang kosong, lalu klik <strong>"Open PowerShell window here"</strong> (atau ketik <code>cmd</code> pada address bar folder lalu tekan Enter).
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
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
              <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl text-xs space-y-1">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span>Wajib: Opsi Pengembang & USB Debugging</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Agar laptop diizinkan membaca storage dan baterai HP, fitur USB Debugging harus diaktifkan sekali di setelan ponsel.
                </p>
              </div>

              {/* Xiaomi / HyperOS / MIUI Guide */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-orange-400" />
                    <span>Langkah untuk Xiaomi / Redmi / POCO (MIUI & HyperOS):</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-950/60 text-orange-300 border border-orange-800/40">
                    Ponsel Kamu
                  </span>
                </div>
                <ol className="space-y-2 text-[11px] text-slate-300 list-decimal list-inside leading-relaxed">
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
                    Aktifkan 3 opsi berikut:
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-400">
                      <li>
                        <strong className="text-emerald-400">Debugging USB</strong>: Geser toggle ke posisi Aktif.
                      </li>
                      <li>
                        <strong className="text-emerald-400">Instal via USB</strong>: Geser toggle ke posisi Aktif.
                      </li>
                      <li>
                        <strong className="text-emerald-400">Debugging USB (Setelan Keamanan)</strong>: Geser toggle ke posisi Aktif (wajib agar fitur Debloat bisa bekerja).
                      </li>
                    </ul>
                  </li>
                  <li>
                    Colokkan kabel data USB ke laptop. Saat muncul pop-up di layar ponsel bertuliskan <em>"Izinkan Debugging USB dari komputer ini?"</em>:
                    <div className="mt-1 p-2 bg-black/60 rounded-lg text-emerald-300 font-mono text-[10px]">
                      &check; Centang: "Selalu izinkan dari komputer ini" lalu tekan tombol [OK].
                    </div>
                  </li>
                </ol>
              </div>

              {/* Samsung / Umum Guide */}
              <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-blue-400" />
                  <span>Untuk Ponsel Samsung (One UI) & Merek Lain:</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Buka <strong>Pengaturan</strong> &rarr; <strong>Tentang Ponsel</strong> &rarr; <strong>Informasi Perangkat Lunak</strong> &rarr; Ketuk <strong>Nomor Versi (Build Number)</strong> 7 kali. Kembali ke Pengaturan &rarr; <strong>Pilihan Pengembang</strong> &rarr; Aktifkan <strong>Debugging USB</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TROUBLESHOOTING */}
          {activeMainTab === 'troubleshoot' && (
            <div className="space-y-3 animate-fade-in text-xs">
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span>Masalah: Status "Unauthorized" di Terminal</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Penyebab: Kamu belum menekan tombol "OK" pada dialog otorisasi di layar HP.
                </p>
                <div className="text-[11px] text-slate-400 bg-black/50 p-2.5 rounded-lg space-y-1 font-mono">
                  <div>1. Nyalakan layar ponsel kamu.</div>
                  <div>2. Cabut kabel USB lalu colokkan kembali.</div>
                  <div>3. Centang "Selalu izinkan dari komputer ini" &rarr; klik "OK".</div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span>Masalah: Perangkat Tidak Terdeteksi (Device not found)</span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-1 leading-relaxed">
                  <div>&bull; <strong>Gunakan kabel data asli</strong>: Beberapa kabel hanya kabel charge (tidak memiliki jalur pin transfer data).</div>
                  <div>&bull; <strong>Ubah Mode USB</strong>: Geser bilah notifikasi di HP dari "Hanya Mengisi Daya" ke "Transfer Berkas (MTP)".</div>
                  <div>&bull; <strong>Restart ADB Service</strong>: Di terminal laptop, jalankan perintah:</div>
                  <pre className="p-1.5 bg-black/60 rounded text-cyan-300 font-mono text-[10px]">
                    adb kill-server && adb devices
                  </pre>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  <span>Khusus Xiaomi: Muncul "SecurityException: Cannot disable system packages"</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Xiaomi membatasi perintah uninstall via ADB jika <strong>Debugging USB (Setelan Keamanan)</strong> belum diaktifkan. Buka Pengaturan &rarr; Opsi Pengembang &rarr; aktifkan toggle tersebut (memerlukan akun Mi / verifikasi kartu SIM).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-5 flex justify-between items-center pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className={`h-3.5 w-3.5 ${isBridgeConnected ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
            <span>
              {isBridgeConnected ? 'Tersinkronisasi setiap 2 detik' : 'Menunggu script dijalankan di laptop...'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
