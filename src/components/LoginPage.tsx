import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (token: string, key: string, role?: 'admin' | 'user') => void;
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigate }) => {
  const [accessKey, setAccessKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) {
      setErrorMessage('Silakan masukkan key akses terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: accessKey.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        const cleanKey = data.key || accessKey.trim().toUpperCase();
        localStorage.setItem('vota_auth_token', data.token);
        localStorage.setItem('vota_auth_key', cleanKey);
        if (data.role) localStorage.setItem('vota_user_role', data.role);
        if (data.roomId) localStorage.setItem('vota_room_id', data.roomId);
        onLoginSuccess(data.token, cleanKey, data.role);
      } else {
        setErrorMessage(data.error || 'Key tidak valid atau telah kadaluwarsa. Akses ditolak.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none font-sans antialiased">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all cursor-pointer backdrop-blur-md shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Halaman Utama</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md bg-[#0d1424]/90 border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-2xl relative z-10 animate-modal-pop">
        {/* Brand Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Exact Header Text Required by User */}
        <div className="text-center mb-7">
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase mb-2 font-display">
            VOTA - ANALISIS DEVICE
          </h1>
          <p className="text-sm text-slate-400 font-medium leading-relaxed font-sans">
            Masukan key jika ingin masuk ke dashboard
          </p>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-950/70 border border-rose-800/90 rounded-2xl flex items-center gap-3 text-rose-300 text-xs animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <KeyRound className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={accessKey}
              onChange={(e) => {
                setAccessKey(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Contoh: VOTA-8K2P-9M4L atau ADM-VOTA-2026"
              autoFocus
              disabled={isLoading}
              className="w-full pl-11 pr-11 py-3.5 bg-[#070b14]/90 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-white placeholder-slate-500 text-xs sm:text-sm font-mono tracking-wider outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-mono">
            Format: <span className="text-blue-400 font-semibold">VOTA-XXXX-XXXX</span> (User) • <span className="text-amber-400 font-semibold">ADM-VOTA-XXXX</span> (Admin)
          </p>

          {/* Submit Button: 'masuk' */}
          <button
            type="submit"
            disabled={isLoading || !accessKey.trim()}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer font-sans"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Exact Footer Text Required by User */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400 font-medium">
            tidak punya key?, maaf tidak bisa masuk.
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500/70" />
            <span>Strict 1-IP Hardware Session Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
};
