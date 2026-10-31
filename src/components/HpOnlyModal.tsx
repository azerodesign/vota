import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  Wifi,
  ShieldCheck,
  Download,
  ExternalLink,
  AlertTriangle,
  Laptop,
  ArrowRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface HpOnlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isBridgeConnected: boolean;
  serverUrl: string;
  initialTab?: 'switch' | 'termux' | 'wireless' | 'termius';
}

export const HpOnlyModal: React.FC<HpOnlyModalProps> = ({
  isOpen,
  onClose,
  isBridgeConnected,
  serverUrl,
  initialTab = 'switch',
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'termux' | 'wireless' | 'termius'>(initialTab);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : serverUrl;
  const bridgeCommand = `curl -sL ${currentOrigin}/bridge.sh | sh`;
  const pkgCommand = `pkg update -y && pkg install -y android-tools curl`;
  const tcpipCommand = `powershell -c "irm ${currentOrigin}/tcpip.ps1 | iex"`;
  const adbConnectCommand = `adb connect 127.0.0.1:5555`;
  const wakeLockCommand = `termux-wake-lock`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-overlay">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col text-slate-800 animate-modal-pop">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600 shadow-xs">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl font-extrabold text-slate-900">
                Mode HP-Only (Tanpa Laptop)
              </h3>
              {isBridgeConnected ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Terhubung Langsung
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                  Siap Dipasangkan
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Jalankan telemetri & pembersihan penyimpanan langsung dari ponsel Android Anda menggunakan loopback internal.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 gap-1 mb-4 overflow-x-auto pb-0.5">
          <button
            onClick={() => setActiveTab('switch')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'switch'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="h-3.5 w-3.5" />
            <ArrowRight className="h-3 w-3" />
            <Smartphone className="h-3.5 w-3.5" />
            <span>Tutorial Ubah Laptop ke HP</span>
          </button>
          <button
            onClick={() => setActiveTab('termux')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === 'termux'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Setup Termux
          </button>
          <button
            onClick={() => setActiveTab('wireless')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === 'wireless'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Wireless Pairing (Android 11+)
          </button>
          <button
            onClick={() => setActiveTab('termius')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === 'termius'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Alternatif Termius
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-600">
          {/* TAB 0: TUTORIAL CARA PINDAH DARI LAPTOP KE HP */}
          {activeTab === 'switch' && (
            <div className="space-y-4 animate-fade-in text-[11px] leading-relaxed">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                <div className="font-bold text-blue-900 text-xs flex items-center gap-1.5 mb-1">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span>Tutorial: Cara Mengubah ADB Laptop Menjadi ADB Mobile (HP Termux)</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Dengan cara ini, port ADB nirkabel dibuka 1x lewat laptop, lalu kabel USB dicabut dan <strong>laptop bisa langsung dimatikan</strong>. HP akan melanjutkan koneksi mandiri secara lokal!
                </p>
              </div>

              {/* Langkah 1 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">1</span>
                    Di Laptop: Aktifkan Port 5555 (Cukup 1x)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    Windows PowerShell
                  </span>
                </div>
                <p className="text-slate-600">
                  Colok HP ke laptop dengan kabel USB (pastikan USB Debugging di HP aktif). Buka <strong>PowerShell</strong> di laptop dan jalankan:
                </p>
                <div className="relative flex items-center bg-white border border-slate-200 rounded-xl p-2 font-mono text-[11px]">
                  <span className="text-slate-800 flex-1 break-all select-all pr-20">{tcpipCommand}</span>
                  <button
                    onClick={() => copyToClipboard(tcpipCommand, 'tcpip')}
                    className="absolute right-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {copiedKey === 'tcpip' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'tcpip' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[10px] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Setelah muncul <strong>"TCP/IP 5555 AKTIF"</strong>, <strong>cabut kabel USB dari HP</strong>. Laptop boleh dimatikan!</span>
                </div>
              </div>

              {/* Langkah 2 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
                    Di HP (Termux): Sambungkan ADB Internal
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    Aplikasi Termux di HP
                  </span>
                </div>
                <p className="text-slate-600">
                  Buka aplikasi <strong>Termux</strong> di ponsel Anda, lalu ketik perintah koneksi lokal:
                </p>
                <div className="relative flex items-center bg-white border border-slate-200 rounded-xl p-2 font-mono text-[11px]">
                  <span className="text-blue-700 flex-1 break-all select-all pr-20 font-bold">{adbConnectCommand}</span>
                  <button
                    onClick={() => copyToClipboard(adbConnectCommand, 'adbconnect')}
                    className="absolute right-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'adbconnect' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'adbconnect' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[10px] space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>POP-UP IZIN PENTING DI LAYAR HP:</span>
                  </div>
                  <p>
                    Lihat layar HP atau tarik panel notifikasi dari atas. Akan muncul jendela <strong>"Izinkan Debugging USB?"</strong>.
                    Centang kotak <strong>"Selalu izinkan dari komputer ini"</strong>, lalu ketuk tombol <strong>IZINKAN</strong>.
                  </p>
                </div>
              </div>

              {/* Langkah 3 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">3</span>
                    Di HP (Termux): Jalankan Bridge VOTA 1-Baris
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    Sinkronisasi Realtime
                  </span>
                </div>
                <p className="text-slate-600">
                  Tempel dan jalankan perintah jembatan telemetri VOTA berikut di Termux:
                </p>
                <div className="relative flex items-center bg-white border border-blue-200 rounded-xl p-2 font-mono text-[11px]">
                  <span className="text-blue-700 flex-1 break-all select-all pr-20 font-bold">{bridgeCommand}</span>
                  <button
                    onClick={() => copyToClipboard(bridgeCommand, 'bridge')}
                    className="absolute right-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {copiedKey === 'bridge' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'bridge' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <p className="text-slate-500 text-[10px]">
                  Dashboard web ini akan otomatis mendeteksi ponsel Anda dan menampilkan status <strong>"Mode HP Only"</strong>!
                </p>
              </div>

              {/* Langkah 4 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">4</span>
                    Tips Anti-Putus Saat Layar HP Mati (Background)
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    Wake-Lock
                  </span>
                </div>
                <p className="text-slate-600">
                  Ketik perintah ini di Termux agar proses tidak dihentikan Android saat layar mati:
                </p>
                <div className="relative flex items-center bg-white border border-slate-200 rounded-xl p-2 font-mono text-[11px]">
                  <span className="text-slate-800 flex-1 font-mono pr-20">{wakeLockCommand}</span>
                  <button
                    onClick={() => copyToClipboard(wakeLockCommand, 'wakelock')}
                    className="absolute right-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'wakelock' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'wakelock' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <p className="text-slate-500 text-[10px]">
                  Pastikan juga Setelan Penghemat Baterai untuk Termux diubah ke <strong>"Tidak Ada Pembatasan"</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: SETUP TERMUX DARI AWAL */}
          {activeTab === 'termux' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px]">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>PENTING: Jangan Gunakan Termux dari Google Play Store!</span>
                </div>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  Versi Google Play Store sudah <strong>usang (kedaluwarsa sejak 2020)</strong> dan repositorinya rusak (error 403). Gunakan rilis resmi terbaru dari <strong>GitHub</strong> atau <strong>F-Droid</strong> berikut:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href="https://github.com/termux/termux-app/releases/latest"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-white border border-amber-300 hover:border-blue-500 rounded-xl flex items-center justify-between group transition shadow-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <span>GitHub Releases (Resmi)</span>
                        <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Unduh APK langsung (v0.118.1+)
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-blue-600 group-hover:translate-y-0.5 transition-transform" />
                  </a>

                  <a
                    href="https://f-droid.org/packages/com.termux/"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-white border border-amber-300 hover:border-emerald-500 rounded-xl flex items-center justify-between group transition shadow-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <span>F-Droid Repository</span>
                        <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-emerald-600" />
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Rilis verifikasi open-source
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-emerald-600 group-hover:translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Step 1: Install packages */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="font-semibold text-slate-800 text-[11px]">
                  Pasang paket ADB & Curl di Termux (Hanya 1x saja):
                </p>
                <div className="relative flex items-center bg-white border border-slate-200 rounded-lg p-2 font-mono text-[11px]">
                  <span className="text-slate-700 flex-1 break-all select-all pr-20">{pkgCommand}</span>
                  <button
                    onClick={() => copyToClipboard(pkgCommand, 'pkg')}
                    className="absolute right-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'pkg' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'pkg' ? 'Disalin' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* 1-Baris Bridge */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <p className="font-semibold text-blue-900 text-[11px]">
                  Jalankan Jembatan VOTA di Termux:
                </p>
                <div className="relative flex items-center bg-white border border-blue-200 rounded-lg p-2 font-mono text-[11px]">
                  <span className="text-blue-700 flex-1 break-all select-all pr-20 font-bold">{bridgeCommand}</span>
                  <button
                    onClick={() => copyToClipboard(bridgeCommand, 'bridge2')}
                    className="absolute right-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {copiedKey === 'bridge2' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedKey === 'bridge2' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WIRELESS DEBUGGING */}
          {activeTab === 'wireless' && (
            <div className="space-y-3 animate-fade-in text-[11px] leading-relaxed">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <Wifi className="h-4 w-4 text-blue-600" />
                  <span>Syarat Wireless Debugging (Android 11 - 16+)</span>
                </div>
                <p className="text-slate-600">
                  Android 11 ke atas memiliki fitur resmi Google untuk menghubungkan ADB ke ponsel itu sendiri tanpa kabel USB dan tanpa memerlukan akses root.
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-slate-600">
                <li>
                  <strong>Aktifkan Developer Options:</strong> Buka Pengaturan ➔ Tentang Ponsel ➔ Ketuk <em>Nomor Versi (Build Number)</em> sebanyak 7 kali berturut-turut.
                </li>
                <li>
                  <strong>Aktifkan Debug Nirkabel:</strong> Masuk ke <em>Opsi Pengembang</em>, cari dan nyalakan <strong>Debug Nirkabel (Wireless Debugging)</strong>. Pastikan ponsel terhubung ke Wi-Fi atau hotspot aktif.
                </li>
                <li>
                  <strong>Gunakan Split-Screen:</strong> Buka Pengaturan dan Termux bersamaan dalam mode layar belah.
                </li>
                <li>
                  Ketuk <em>Pasangkan perangkat dengan kode pairing</em>, lalu jalankan di terminal:
                  <div className="mt-1 p-2 bg-slate-100 rounded-lg font-mono text-[11px] text-blue-700">
                    adb pair localhost:&lt;PORT_PAIRING&gt;
                  </div>
                  Masukkan kode angka 6 digit saat diminta.
                </li>
                <li>
                  Setelah pairing sukses, kembali ke menu utama Debug Nirkabel, lihat angka port di bawah alamat IP, lalu jalankan:
                  <div className="mt-1 p-2 bg-slate-100 rounded-lg font-mono text-[11px] text-blue-700">
                    adb connect localhost:&lt;PORT_IP&gt;
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* TAB 3: TERMIUS */}
          {activeTab === 'termius' && (
            <div className="space-y-3 animate-fade-in text-[11px] leading-relaxed">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-800 mb-1">Menjalankan di Termius (Local Terminal):</p>
                <p className="text-slate-500">
                  Jika Anda menggunakan fitur <strong>Local Terminal</strong> di Termius atau menghubungkannya ke shell Android lokal:
                </p>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-slate-500">
                <li>Pastikan binary <code className="bg-slate-100 text-slate-700 px-1 rounded font-mono">adb</code> dan <code className="bg-slate-100 text-slate-700 px-1 rounded font-mono">curl</code> dapat dipanggil di terminal lokal Anda.</li>
                <li>Jalankan perintah koneksi nirkabel: <code className="bg-slate-100 text-blue-600 px-1 rounded font-mono">adb connect localhost:PORT</code>.</li>
                <li>Setelah tersambung, jalankan perintah jembatan 1-baris VOTA:</li>
              </ul>
              <div className="p-2.5 bg-slate-100 rounded-xl font-mono text-[11px] text-blue-700 break-all select-all">
                {bridgeCommand}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Aman & 100% Open Protocol (No-Root)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
