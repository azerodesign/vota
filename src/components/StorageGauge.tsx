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
  const hasData = storage.total !== null && storage.total !== undefined && storage.used !== null && storage.free !== null;
  
  // Storage components in GiB
  const totalGb = hasData ? storage.total! : 0;
  const usedGb = hasData ? storage.used! : 0;
  const availableGb = hasData ? storage.free! : 0;

  // Reserved / Unavailable difference: Total - (Used + Available)
  const reservedGb = hasData && totalGb > 0
    ? Math.max(0, +(totalGb - (usedGb + availableGb)).toFixed(2))
    : 0;

  // Accurate percentages calculated directly from total
  const usedPctAccurate = hasData && totalGb > 0 ? +((usedGb / totalGb) * 100).toFixed(1) : 0;
  const availablePctAccurate = hasData && totalGb > 0 ? +((availableGb / totalGb) * 100).toFixed(1) : 0;
  const reservedPctAccurate = hasData && totalGb > 0 ? +((reservedGb / totalGb) * 100).toFixed(1) : 0;

  const isCritical = hasData && usedPctAccurate >= 90;
  const isWarning = hasData && usedPctAccurate >= 80 && usedPctAccurate < 90;

  const barColor = isCritical
    ? 'bg-rose-500 shadow-rose-500/20'
    : isWarning
    ? 'bg-amber-500 shadow-amber-500/20'
    : 'bg-gradient-to-r from-blue-600 to-sky-500 shadow-blue-500/20';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
            <HardDrive className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{title}</h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Mount: {title.includes('Disk') || title.includes('C:') || title.includes('Desktop') || title.includes('PC') ? 'C:\\ (NTFS Primary)' : '/data (Userdata)'}
            </span>
          </div>
        </div>

        {isCritical && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Kritis (&gt; 90%)</span>
          </div>
        )}
        {!hasData && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <span>Menunggu Sinkronisasi ADB...</span>
          </div>
        )}
      </div>

      {/* Main Stats Row */}
      <div className="flex items-baseline justify-between mb-2">
        <div>
          {hasData ? (
            <>
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                {usedGb} <span className="text-xl font-normal text-slate-400">GiB</span>
              </span>
              <span className="text-sm text-slate-500 ml-2 font-medium">terpakai dari {totalGb} GiB</span>
            </>
          ) : (
            <span className="text-lg font-medium text-slate-400">
              Menunggu pembacaan partisi /data...
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-blue-600">
            {hasData ? `${usedPctAccurate}%` : 'N/A'}
          </span>
          <p className="text-xs text-slate-500 font-medium">
            {hasData ? `Available: ${availableGb} GiB | Reserved: ${reservedGb} GiB` : 'Kapasitas belum terdeteksi'}
          </p>
        </div>
      </div>

      {/* Progress Bar with Used & Reserved segments */}
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner flex">
        <div
          className={`h-full rounded-l-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xs shimmer-bar ${barColor}`}
          style={{ width: `${Math.min(usedPctAccurate, 100)}%` }}
          title={`Used: ${usedGb} GiB (${usedPctAccurate}%)`}
        />
        {reservedPctAccurate > 0 && (
          <div
            className="h-full bg-slate-400/80 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ width: `${Math.min(reservedPctAccurate, 100 - usedPctAccurate)}%` }}
            title={`Reserved / Unavailable: ${reservedGb} GiB (${reservedPctAccurate}%)`}
          />
        )}
      </div>

      {/* Breakdown Legend Pills: Used, Available, Reserved/Unavailable, Total */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 card-interactive">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block shadow-xs shadow-blue-500/30" />
            <span className="text-xs text-slate-500 font-medium">
              {title.includes('Disk') || title.includes('C:') || title.includes('Desktop') || title.includes('PC') ? 'Used (C:)' : 'Used (/data)'}
            </span>
          </div>
          <span className="text-sm font-bold text-slate-800">
            {hasData ? `${usedGb} GiB (${usedPctAccurate}%)` : 'UNAVAILABLE'}
          </span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 card-interactive">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block shadow-xs shadow-emerald-500/30" />
            <span className="text-xs text-slate-500 font-medium">Available (Bebas)</span>
          </div>
          <span className="text-sm font-bold text-slate-800">
            {hasData ? `${availableGb} GiB (${availablePctAccurate}%)` : 'UNAVAILABLE'}
          </span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 card-interactive">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block shadow-xs" />
            <span className="text-xs text-slate-500 font-medium">Reserved / Unavailable</span>
          </div>
          <span className="text-sm font-bold text-slate-800">
            {hasData ? `${reservedGb} GiB (${reservedPctAccurate}%)` : 'UNAVAILABLE'}
          </span>
        </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 card-interactive">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block shadow-xs shadow-indigo-500/30" />
            <span className="text-xs text-slate-500 font-medium">Total Partisi</span>
          </div>
          <span className="text-sm font-bold text-slate-800">
            {hasData ? `${totalGb} GiB (100%)` : 'UNAVAILABLE'}
          </span>
        </div>
      </div>
    </div>
  );
};
