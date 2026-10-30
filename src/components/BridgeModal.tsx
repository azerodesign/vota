import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Radio, Shield, RefreshCw } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'powershell' | 'python'>('powershell');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : serverUrl;

  const psCommand = `powershell -ExecutionPolicy Bypass -c "irm ${currentOrigin}/bridge.ps1 | iex"`;
  const pyCommand = `python -c "import urllib.request; exec(urllib.request.urlopen('${currentOrigin}/bridge.py').read())"`;

  const commandToCopy = activeTab === 'powershell' ? psCommand : pyCommand;

  const handleCopy = () => {
    navigator.clipboard.writeText(commandToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-cyan-950/60 border border-cyan-800/40 rounded-xl text-cyan-400">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              Hubungkan ADB Real-Time
              {isBridgeConnected ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Terhubung
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Menunggu Bridge
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sambungkan terminal laptop kamu langsung ke antarmuka web secara realtime tanpa install aplikasi tambahan.
            </p>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-800 mb-4">
          <button
            onClick={() => setActiveTab('powershell')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'powershell'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            Windows PowerShell (Rekomendasi)
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'python'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Python 3 / Mac / Linux
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <div className="text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-slate-200">Cara Menjalankan (Cukup 1 Langkah):</p>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
              <li>
                Pastikan ponsel sudah tercolok ke laptop dan mode <strong className="text-slate-200">USB Debugging</strong> aktif.
              </li>
              <li>
                Buka terminal/CMD di folder <strong className="text-cyan-400">platform-tools</strong> laptop kamu (tempat <code className="text-slate-300">adb.exe</code> berada).
              </li>
              <li>Copy dan paste perintah di bawah ini, lalu tekan <strong>Enter</strong>:</li>
            </ol>
          </div>

          {/* Code block */}
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
              <span>Aman & Open-Source</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Script bridge hanya membaca status baterai, sisa RAM, dan storage via perintah standar ADB bawaan Android. Tidak ada data pribadi atau pesan chat yang diunggah.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RefreshCw className={`h-3.5 w-3.5 ${isBridgeConnected ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
            <span>
              {isBridgeConnected ? 'Tersinkronisasi setiap 2 detik' : 'Menunggu script dijalankan di laptop...'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
