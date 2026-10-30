import React from 'react';
import { Smartphone, HardDrive, ShieldCheck, Sparkles } from 'lucide-react';
import { DeviceMode } from '../types';

interface HeaderProps {
  mode: DeviceMode;
  onModeChange: (mode: DeviceMode) => void;
  isScanning: boolean;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  isScanning,
  onRefresh,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0d131f]/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              StoragePulse
            </h1>
            <p className="text-xs text-slate-400">Desktop & ADB Mobile Memory Optimizer</p>
          </div>
        </div>

        {/* Device Switcher Tabs */}
        <div className="flex items-center bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => onModeChange('android')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'android'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Android (via ADB)</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>

          <button
            onClick={() => onModeChange('desktop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'desktop'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="h-4 w-4" />
            <span>PC Desktop</span>
          </button>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>No-Root Safe Mode</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isScanning}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition"
          >
            <span className={isScanning ? 'animate-spin inline-block' : ''}>🔄</span>
            <span>{isScanning ? 'Memindai...' : 'Pindai Ulang'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
