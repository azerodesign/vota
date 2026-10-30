import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HardDrive } from 'lucide-react';
import { SmartRecommendation } from '../types';

interface SmartRecommendationWidgetProps {
  recommendation: SmartRecommendation;
  onNavigateToDuplicates: () => void;
  onOpenSafetyCenter: () => void;
}

export const SmartRecommendationWidget: React.FC<SmartRecommendationWidgetProps> = ({
  recommendation,
  onNavigateToDuplicates,
  onOpenSafetyCenter,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#0d1627] to-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/3 h-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Terminal Spec Style Card */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              VOTA SMART ANALYSIS
            </span>
          </div>

          <div className="p-4 bg-black/60 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 space-y-2 select-all">
            <div className="flex justify-between items-center text-slate-100 font-bold border-b border-slate-800/80 pb-1.5">
              <span>Potentially Recoverable:</span>
              <span className="text-emerald-400 text-sm">{recommendation.estimatedRecoveryFormatted}</span>
            </div>

            <div className="space-y-1 text-slate-400 pt-1">
              <div className="flex justify-between">
                <span>Temporary Files:</span>
                <span className="text-slate-200">1.20 GB</span>
              </div>
              <div className="flex justify-between">
                <span>Duplicate Media:</span>
                <span className="text-slate-200">2.35 GB</span>
              </div>
              <div className="flex justify-between">
                <span>Old Downloads:</span>
                <span className="text-slate-200">1.27 GB</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-400">Recommendation:</span>{' '}
              <strong className="text-cyan-300">{recommendation.priorityRecommendation}</strong>
            </div>

            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-slate-400">Estimated Recovery:</span>
              <span className="text-emerald-400 font-bold">{recommendation.estimatedRecoveryFormatted}</span>
            </div>
          </div>
        </div>

        {/* Right: Action Callout */}
        <div className="flex flex-col gap-3 w-full lg:w-72">
          <button
            onClick={onNavigateToDuplicates}
            className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span>Review Duplicate Media</span>
            </div>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenSafetyCenter}
            className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Buka Cleanup Safety Center</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              Dry-Run
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
