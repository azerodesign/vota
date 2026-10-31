import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Laptop,
  Copy,
  Check,
  Wifi,
  HelpCircle,
  Radio,
  ArrowRight,
} from 'lucide-react';

interface AdbOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPhoneConnected?: boolean;
  isPcConnected?: boolean;
}

export const AdbOnboardingModal: React.FC<AdbOnboardingModalProps> = ({
  isOpen,
  onClose,
  isPhoneConnected = false,
  isPcConnected = false,
}) => {
  const [activeTab, setActiveTab] = useState<'wireless' | 'pc' | 'termux'>('wireless');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vota_hide_adb_guide') === 'true';
    }
    return false;
  });

  // Interactive pairing input state
  const [ipAddress, setIpAddress] = useState('192.168.1.');
  const [port, setPort] = useState('37123');
  const [pairingCode, setPairingCode] = useState('');

  if (!isOpen) return null;

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://vota.axy.my.id';
  const activeKey =
    typeof window !== 'undefined'
      ? localStorage.getItem('vota_auth_key') || 'VOTA-USER'
      : 'VOTA-USER';
  const keyParam =
    activeKey && !['vota2026', 'vota-admin'].includes(activeKey.toLowerCase())
      ? `?key=${activeKey}`
      : '';

  const ps1Command = `powershell -ExecutionPolicy Bypass -c "irm '${currentOrigin}/vota.ps1${keyParam}' | iex"`;
  const termuxCommand = `curl -sL ${currentOrigin}/vota.sh${keyParam} | bash`;
  const generatedPairCommand = `adb pair ${ipAddress.trim()}:${port.trim()} ${pairingCode.trim()}`;
  const generatedConnectCommand = `adb connect ${ipAddress.trim()}:${port.trim()}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      if (dontShowAgain) {
        localStorage.setItem('vota_hide_adb_guide', 'true');
      } else {
        localStorage.removeItem('vota_hide_adb_guide');
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-modal-pop max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200/90 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/30 text-white shrink-0">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg tracking-wide text-white">
                  Panduan Sambung ADB Real-Time
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Onboarding
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Pilih metode koneksi untuk streaming telemetri perangkat Android ke web
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            title="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-semibold text-[11px]">Status Saat Ini:</span>
            <span className="inline-flex items-center gap-1.5 font-bold">
              <span
                className={`h-2 w-2 rounded-full ${
                  isPhoneConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className={isPhoneConnected ? 'text-emerald-700' : 'text-slate-600'}>
                HP: {isPhoneConnected ? 'Terhubung (Live)' : 'Menunggu Koneksi'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 font-bold">
              <span
                className={`h-2 w-2 rounded-full ${
                  isPcConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}
              />
              <span className={isPcConnected ? 'text-emerald-700' : 'text-slate-500'}>
                PC: {isPcConnected ? 'Terhubung' : 'Offline'}
              </span>
            </span>
          </div>

          <div className="text-[11px] font-mono font-bold text-slate-500">
            Key: <span className="text-blue-700 font-black">{activeKey}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-6 pt-3 border-b border-slate-200 flex gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('wireless')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'wireless'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wifi className="h-4 w-4" />
            <span>Wireless ADB (HP)</span>
          </button>

          <button
            onClick={() => setActiveTab('pc')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'pc'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Laptop / PC Bridge</span>
          </button>

          <button
            onClick={() => setActiveTab('termux')}
            className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'termux'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Termux 1-Klik (HP Only)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {/* TAB 1: WIRELESS ADB INTERACTIVE */}
          {activeTab === 'wireless' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-black text-blue-950 text-xs sm:text-sm">
                    Cara Sambung Wireless ADB (Android 11+)
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Pastikan HP dan komputer berada di jaringan Wi-Fi yang sama (atau hotspot HP).
                    Buka <b>Pengaturan HP &rarr; Opsi Pengembang &rarr; Debugging Nirkabel</b>.
                  </p>
                </div>
              </div>

              {/* Interactive Input Form */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="font-black text-slate-900 uppercase tracking-wider text-[11px] block">
                  🛠️ Generator Perintah Pairing &amp; Connect Instan
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      Alamat IP Debugging &amp; Port:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        placeholder="192.168.1.50"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="Port (contoh: 37123)"
                        className="w-28 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      Kode Pairing 6-Digit (Opsional):
                    </label>
                    <input
                      type="text"
                      value={pairingCode}
                      onChange={(e) => setPairingCode(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-mono text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Generated Commands Output */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  {pairingCode.trim() && (
                    <div className="p-2.5 bg-slate-900 rounded-xl text-slate-200 font-mono text-[11px] flex items-center justify-between gap-2">
                      <span className="truncate">{generatedPairCommand}</span>
                      <button
                        onClick={() => copyToClipboard(generatedPairCommand, 'pair-cmd')}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === 'pair-cmd' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>Salin Pair</span>
                      </button>
                    </div>
                  )}

                  <div className="p-2.5 bg-slate-900 rounded-xl text-slate-200 font-mono text-[11px] flex items-center justify-between gap-2">
                    <span className="truncate">{generatedConnectCommand}</span>
                    <button
                      onClick={() => copyToClipboard(generatedConnectCommand, 'conn-cmd')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'conn-cmd' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>Salin Connect</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-600">
                <p className="font-bold text-slate-800">Langkah Praktis:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Buka terminal atau Termux di HP / Komputer Anda.</li>
                  <li>Jalankan perintah <code>adb pair</code> (hanya untuk pertama kali sambung).</li>
                  <li>Jalankan perintah <code>adb connect</code>.</li>
                  <li>Setelah terhubung, jalankan skrip jembatan VOTA untuk memulai streaming data ke dashboard!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: LAPTOP / PC BRIDGE */}
          {activeTab === 'pc' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
                <Laptop className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-black text-indigo-950 text-xs sm:text-sm">
                    Mode Jembatan Laptop / PC (Paling Stabil)
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Hubungkan ponsel Android ke Laptop via kabel USB (atau ADB WiFi). 
                    Cukup jalankan satu baris perintah di PowerShell Windows atau Terminal Linux/macOS.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">
                  1. Salin Perintah PowerShell (Windows):
                </span>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] break-all border border-slate-800 flex items-center justify-between gap-3">
                  <span>{ps1Command}</span>
                  <button
                    onClick={() => copyToClipboard(ps1Command, 'ps1-cmd')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedKey === 'ps1-cmd' ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Script</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <span className="font-bold text-slate-800">Kelebihan Mode PC:</span>
                <p className="text-slate-600">
                  Mendukung pembacaan telemetri ganda: telemetri HP Android + spesifikasi perangkat keras Laptop (CPU, RAM, Disk, Suhu) secara bersamaan tanpa saling mengganggu.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TERMUX 1-KLIK (HP ONLY) */}
          {activeTab === 'termux' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-black text-emerald-950 text-xs sm:text-sm">
                    Mode Mandiri HP-Only via Termux (Tanpa Komputer)
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Jalankan telemetri langsung dari HP Anda tanpa membutuhkan PC/Laptop sama sekali.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">
                  1. Salin Perintah Termux (Bash Shell):
                </span>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] break-all border border-slate-800 flex items-center justify-between gap-3">
                  <span>{termuxCommand}</span>
                  <button
                    onClick={() => copyToClipboard(termuxCommand, 'sh-cmd')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {copiedKey === 'sh-cmd' ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Script</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-600">
                <p className="font-bold text-slate-800">Petunjuk Termux:</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Buka aplikasi Termux di HP Anda.</li>
                  <li>Paste perintah di atas dan tekan Enter.</li>
                  <li>Skrip akan otomatis mendeteksi koneksi dan mengirimkan data langsung ke room Anda!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>Jangan tampilkan panduan ini otomatis saat buka aplikasi</span>
          </label>

          <button
            onClick={handleClose}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-blue-500/20"
          >
            <span>Mulai Gunakan Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
