import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Smartphone, CheckCircle } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Menginisialisasi VOTA Engine...');
  const [isFading, setIsFading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Step 1
    const t1 = setTimeout(() => {
      setProgress(35);
      setStatusText('Memeriksa Driver ADB & Kernel Procfs...');
    }, 300);

    // Step 2
    const t2 = setTimeout(() => {
      setProgress(75);
      setStatusText('Menghubungkan Cloud Telemetry Relay...');
    }, 700);

    // Step 3
    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText('Sistem Siap Digunakan');
    }, 1100);

    // Fade out
    const t4 = setTimeout(() => {
      setIsFading(true);
    }, 1400);

    // Complete
    const t5 = setTimeout(() => {
      setIsDone(true);
      if (onFinish) onFinish();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onFinish]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-white via-slate-50 to-blue-50/40 transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Decorative background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center animate-fade-in">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-400 to-indigo-600 opacity-30 blur-lg animate-pulse" />
          <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 border border-blue-400/30">
            <Sparkles className="h-10 w-10 text-white animate-spin-slow" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm">
            <CheckCircle className="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-3xl font-black tracking-wider bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
          VOTA
        </h1>
        <p className="text-xs font-semibold text-blue-600 tracking-wide uppercase mt-1">
          Next-Gen Android & Storage Telemetry
        </p>
        <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
          Engine pembersih penyimpanan presisi tinggi & monitoring real-time berbasis ADB.
        </p>

        {/* Progress Bar Container */}
        <div className="w-full mt-8 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 px-0.5">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
              {statusText}
            </span>
            <span className="font-mono text-blue-600 font-bold">{progress}%</span>
          </div>

          <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-sky-500 rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Badge Footer */}
        <div className="mt-8 flex items-center gap-2 text-[11px] text-slate-600 bg-white/80 border border-slate-200/90 rounded-full px-3 py-1 shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>No-Root Safe Mode</span>
          <span className="text-slate-300">•</span>
          <Smartphone className="h-3.5 w-3.5 text-blue-600" />
          <span>HP-Only Supported</span>
        </div>
      </div>
    </div>
  );
};
