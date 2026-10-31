import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Settings,
  Shield,
  Clock,
  RefreshCw,
  Trash2,
  PowerOff,
  LogOut,
  CheckCircle2,
  Server,
  AlertCircle,
  Save,
} from 'lucide-react';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onDisconnectAdb: () => void;
  isBridgeConnected: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onNavigate,
  onLogout,
  onDisconnectAdb,
  isBridgeConnected,
}) => {
  const [syncInterval, setSyncInterval] = useState<string>(() =>
    localStorage.getItem('vota_pref_interval') || '2500'
  );
  const [tempThreshold, setTempThreshold] = useState<string>(() =>
    localStorage.getItem('vota_pref_temp_limit') || '45'
  );
  const [storageThreshold, setStorageThreshold] = useState<string>(() =>
    localStorage.getItem('vota_pref_storage_limit') || '15'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<string>('');

  useEffect(() => {
    const t = localStorage.getItem('vota_auth_token') || '';
    if (t) {
      setTokenInfo(t.substring(0, 24) + '...' + t.substring(t.length - 8));
    }
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem('vota_pref_interval', syncInterval);
    localStorage.setItem('vota_pref_temp_limit', tempThreshold);
    localStorage.setItem('vota_pref_storage_limit', storageThreshold);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRegenerateToken = async () => {
    const key = localStorage.getItem('vota_auth_key') || 'vota2026';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('vota_auth_token', data.token);
        setTokenInfo(data.token.substring(0, 24) + '...' + data.token.substring(data.token.length - 8));
        alert('Token sesi berhasil diperbarui!');
      }
    } catch {
      alert('Gagal memperbarui token sesi.');
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Bersihkan pengaturan lokal browser? Anda akan tetap login.')) {
      localStorage.removeItem('vota_pref_interval');
      localStorage.removeItem('vota_pref_temp_limit');
      localStorage.removeItem('vota_pref_storage_limit');
      setSyncInterval('2500');
      setTempThreshold('45');
      setStorageThreshold('15');
      alert('Pengaturan lokal berhasil di-reset.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <div className="flex items-center gap-2 select-none">
              <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
                <Settings className="h-4 w-4" />
              </div>
              <span className="font-black text-sm tracking-wider text-slate-900">
                PENGATURAN VOTA
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Kunci Sesi</span>
          </button>
        </div>
      </header>

      {/* Main Settings Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-6">
        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Preferensi sistem berhasil disimpan!</span>
          </div>
        )}

        {/* Section 1: Telemetry Preferences */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Preferensi Telemetri &amp; Pemantauan
              </h3>
              <p className="text-xs text-slate-500">
                Sesuaikan interval pengambilan data dan batas peringatan perangkat
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Sync Interval */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">
                Interval Sinkronisasi Telemetri:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: '1.5 Detik (Cepat)', val: '1500' },
                  { label: '2.5 Detik (Normal)', val: '2500' },
                  { label: '5.0 Detik (Hemat)', val: '5000' },
                  { label: '10 Detik (Santai)', val: '10000' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSyncInterval(item.val)}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center cursor-pointer ${
                      syncInterval === item.val
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thermal Alert Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Batas Peringatan Suhu Panas (°C):
                </label>
                <input
                  type="number"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-500"
                />
              </div>

              {/* Storage Low Warning */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Batas Peringatan Storage Rendah (%):
                </label>
                <input
                  type="number"
                  value={storageThreshold}
                  onChange={(e) => setStorageThreshold(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Preferensi</span>
            </button>
          </div>
        </div>

        {/* Section 2: Session & Security Management */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Shield className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Manajemen Keamanan &amp; Sesi Token 30 Hari
              </h3>
              <p className="text-xs text-slate-500">
                Token kriptografis HMAC-SHA256 persisten anti-logout
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Token Sesi Aktif:
              </span>
              <code className="font-mono font-bold text-slate-800 text-xs break-all block">
                {tokenInfo || 'Tidak ada token aktif'}
              </code>
              <span className="text-[10px] text-emerald-700 font-bold block pt-1">
                ✓ Masa Berlaku: 30 Hari (Survives Server Restarts)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRegenerateToken}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Regenerasi Sesi Token</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Server & Bridge Info */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Server className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Konfigurasi Server &amp; ADB Bridge
              </h3>
              <p className="text-xs text-slate-500">
                Informasi endpoint target server dan port telemetri
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Target Server</span>
              <span className="font-bold text-slate-800 text-xs">https://vota.axy.my.id</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Status ADB Bridge</span>
              <span className={`font-bold text-xs ${isBridgeConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isBridgeConnected ? 'Terhubung (Online)' : 'Menunggu Koneksi'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Port Default ADB WiFi</span>
              <span className="font-bold text-slate-800 text-xs">5555 (TCP/IP)</span>
            </div>
          </div>
        </div>

        {/* Section 4: Maintenance & Danger Zone */}
        <div className="bg-white border border-rose-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-rose-100 pb-3">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <div>
              <h3 className="font-extrabold text-sm text-rose-950">
                Pemeliharaan Sesi &amp; Pemutusan Sambungan
              </h3>
              <p className="text-xs text-slate-500">
                Tindakan darurat untuk reset konfigurasi dan pemutusan koneksi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleClearCache}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Reset Cache Preferensi</span>
            </button>

            {isBridgeConnected && (
              <button
                onClick={onDisconnectAdb}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <PowerOff className="h-3.5 w-3.5" />
                <span>Putuskan Sambungan ADB</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Kunci / Logout Sekarang</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
