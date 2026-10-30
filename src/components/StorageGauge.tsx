import React from 'react';
import { HardDrive, AlertTriangle } from 'lucide-react';
import { StorageInfo } from '../types';

interface StorageGaugeProps {
  storage: StorageInfo;
  title?: string;
}

export const StorageGauge: React.FC<StorageGaugeProps> = ({
  storage,
  title = 'Penyimpanan Internal',
}) => {
  const isCritical = storage.usagePercentage >= 90;
  const isWarning = storage.usagePercentage >= 80 && storage.usagePercentage < 90;

  const barColor = isCritical
    ? 'bg-rose-500 shadow-rose-500/30'
    : isWarning
    ? 'bg-amber-500 shadow-amber-500/30'
    : 'bg-cyan-500 shadow-cyan-500/30';

  return (
    <div className="bg-[#0f1523] border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <HardDrive className="h-5 w-5 text-cyan-400" />
          <h3 className="font-semibold text-slate-200">{title}</h3>
        </div>

        {isCritical && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Kritis (&gt; 90%)</span>
          </div>
        )}
      </div>

      {/* Main Stats Row */}
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span className="text-4xl font-extrabold text-white tracking-tight">
            {storage.used} <span className="text-xl font-normal text-slate-400">GB</span>
          </span>
          <span className="text-sm text-slate-400 ml-2">terpakai dari {storage.total} GB</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-slate-200">{storage.usagePercentage}%</span>
          <p className="text-xs text-slate-400">Tersisa {storage.free} GB</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 shadow-lg ${barColor}`}
          style={{ width: `${Math.min(storage.usagePercentage, 100)}%` }}
        />
      </div>

      {/* Breakdown Legend Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" />
            <span className="text-xs text-slate-400">WhatsApp Media</span>
          </div>
          <span className="text-sm font-semibold text-slate-200">~26.5 GB</span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400 inline-block" />
            <span className="text-xs text-slate-400">Data & Cache</span>
          </div>
          <span className="text-sm font-semibold text-slate-200">~7.8 GB</span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-400 inline-block" />
            <span className="text-xs text-slate-400">Downloads</span>
          </div>
          <span className="text-sm font-semibold text-slate-200">~7.4 GB</span>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block" />
            <span className="text-xs text-slate-400">Sistem & Lainnya</span>
          </div>
          <span className="text-sm font-semibold text-slate-200">~62.3 GB</span>
        </div>
      </div>
    </div>
  );
};
