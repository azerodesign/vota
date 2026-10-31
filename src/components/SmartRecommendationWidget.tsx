import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HardDrive } from 'lucide-react';
import { SmartRecommendation } from '../types';
import { formatBytes } from '../lib/storageEngine';

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
    <div className="bg-gradient-to-r from-blue-50/80 via-sky-50/60 to-indigo-50/80 border border-blue-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/3 h-full bg-blue-400/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Terminal Spec Style Card */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-xs animate-float">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-xs font-mono font-extrabold tracking-widest text-blue-700 uppercase">
              VOTA SMART ANALYSIS
            </span>
          </div>

          <div className="p-4 bg-white border border-blue-200/80 rounded-xl font-mono text-xs text-slate-700 space-y-2 select-all shadow-xs">
            <div className="flex justify-between items-center text-slate-900 font-black border-b border-slate-100 pb-2">
              <span>Potentially Recoverable:</span>
              <span className={`text-sm font-black ${recommendation.isScanned ? 'text-blue-600' : 'text-slate-400'}`}>
                {recommendation.isScanned ? recommendation.estimatedRecoveryFormatted : 'UNAVAILABLE (Belum Dipindai)'}
              </span>
            </div>

            <div className="space-y-1 text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Temporary Files:</span>
                <span className="text-slate-900 font-semibold">
                  {recommendation.isScanned ? formatBytes(recommendation.breakdown.tempFilesBytes, 2) : 'UNAVAILABLE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duplicate Media:</span>
                <span className="text-slate-900 font-semibold">
                  {recommendation.isScanned ? formatBytes(recommendation.breakdown.duplicateMediaBytes, 2) : 'UNAVAILABLE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Old Downloads:</span>
                <span className="text-slate-900 font-semibold">
                  {recommendation.isScanned ? formatBytes(recommendation.breakdown.oldDownloadsBytes, 2) : 'UNAVAILABLE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Installers / APK:</span>
                <span className="text-slate-900 font-semibold">
                  {recommendation.isScanned ? formatBytes(recommendation.breakdown.installersBytes, 2) : 'UNAVAILABLE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Application Cache:</span>
                <span className="text-slate-900 font-semibold">
                  {recommendation.isScanned ? formatBytes(recommendation.breakdown.appCacheBytes, 2) : 'UNAVAILABLE'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">Recommendation:</span>{' '}
              <strong className="text-blue-700 font-bold">{recommendation.priorityRecommendation}</strong>
            </div>

            <div className="flex justify-between items-center pt-1 text-[11px]">
              <span className="text-slate-500">Estimated Recovery:</span>
              <span className={`font-bold ${recommendation.isScanned ? 'text-emerald-600' : 'text-slate-400'}`}>
                {recommendation.isScanned ? recommendation.estimatedRecoveryFormatted : 'UNAVAILABLE'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Action Callout */}
        <div className="flex flex-col gap-2.5 w-full lg:w-72">
          <button
            onClick={onNavigateToDuplicates}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-blue-500/20 flex items-center justify-between transition-all cursor-pointer group btn-bounce"
          >
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              <span>Review Duplicate Media</span>
            </div>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-200" />
          </button>

          <button
            onClick={onOpenSafetyCenter}
            className="w-full px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs flex items-center justify-between transition-colors cursor-pointer btn-bounce"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Open Safety Center</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
