import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (token: string, key: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
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
        localStorage.setItem('vota_auth_token', data.token);
        localStorage.setItem('vota_auth_key', accessKey.trim());
        onLoginSuccess(data.token, accessKey.trim());
      } else {
        setErrorMessage(data.error || 'Key tidak valid. Akses ditolak.');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10 animate-modal-pop">
        {/* Brand Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Header Text as Requested */}
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase mb-2">
            VOTA - ANALISIS DEVICE
          </h1>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Masukan key jika ingin masuk ke dashboard
          </p>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-center gap-3 text-rose-300 text-xs animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Box as Requested */}
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
              placeholder="Masukkan key akses..."
              autoFocus
              disabled={isLoading}
              className="w-full pl-11 pr-11 py-3.5 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-white placeholder-slate-500 text-sm font-mono tracking-wider outline-none transition-all"
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

          {/* Submit Button: 'masuk' as Requested */}
          <button
            type="submit"
            disabled={isLoading || !accessKey.trim()}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
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

        {/* Footer Text as Requested */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500 font-medium">
            tidak punya key?, maaf tidak bisa masuk.
          </p>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-600 font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500/70" />
            <span>End-to-End ADB Session Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
