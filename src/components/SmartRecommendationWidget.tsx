import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  Zap,
  CheckCircle2,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { SmartRecommendation, RamInfo, StorageInfo, AdbDevice } from '../types';

interface SmartRecommendationWidgetProps {
  recommendation?: SmartRecommendation;
  ram?: RamInfo;
  storage?: StorageInfo;
  device?: AdbDevice;
  isBridgeConnected?: boolean;
  onNavigateToDuplicates: () => void;
  onOpenSafetyCenter: () => void;
  onOpenSecurityScanner?: () => void;
  onOpenDeepScanner?: () => void;
}

export const SmartRecommendationWidget: React.FC<SmartRecommendationWidgetProps> = ({
  recommendation,
  ram,
  storage,
  device,
  isBridgeConnected = false,
  onNavigateToDuplicates,
  onOpenSafetyCenter,
  onOpenSecurityScanner,
  onOpenDeepScanner,
}) => {
  // Compute RAM values
  const totalRamGb = ram?.totalKb ? (ram.totalKb / 1048576).toFixed(2) : null;
  const freeRamGb = ram?.availableKb ? (ram.availableKb / 1048576).toFixed(2) : null;
  const ramUsedPct = ram?.usedPercentage ?? (totalRamGb && freeRamGb ? Math.round(((+totalRamGb - +freeRamGb) / +totalRamGb) * 100) : null);

  // Compute Storage values
  const totalStorageGb = storage?.total ?? null;
  const freeStorageGb = storage?.free ?? null;
  const storageUsedPct = storage?.usagePercentage ?? (totalStorageGb && freeStorageGb ? Math.round(((+totalStorageGb - +freeStorageGb) / +totalStorageGb) * 100) : null);

  // Compute Health Assessment
  const isRamHeavy = ramUsedPct !== null && ramUsedPct > 80;
  const isStorageTight = storageUsedPct !== null && storageUsedPct > 85;
  const isHot = device?.batteryTemp !== null && device?.batteryTemp !== undefined && device.batteryTemp > 44;

  const getOverallStatus = () => {
    if (!isBridgeConnected) return { text: 'Menunggu Koneksi Bridge', color: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (isRamHeavy || isStorageTight || isHot) {
      return { text: 'Perlu Optimasi Rutin', color: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { text: 'Sistem Optimal & Sehat', color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const status = getOverallStatus();

  return (
    <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/90 border border-blue-200/90 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
      <div className="absolute right-0 top-0 w-1/3 h-full bg-blue-400/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
        {/* Left: Health & Resource Summary Cards */}
        <div className="space-y-3.5 flex-1 w-full">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-600 text-white rounded-lg shadow-xs animate-float">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-xs font-mono font-extrabold tracking-wider text-blue-800 uppercase">
                VOTA SMART ANALISIS & RANGKUMAN
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${status.badge} flex items-center gap-1`}>
              <CheckCircle2 className="h-3 w-3" />
              {status.text}
            </span>
          </div>

          {/* Real-Time Live Resource Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* RAM Resource */}
            <div className="bg-white/90 border border-blue-100 rounded-xl p-3 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                Sisa RAM Bebas
              </span>
              <div className="text-sm font-extrabold text-slate-900">
                {freeRamGb ? `${freeRamGb} GiB` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {totalRamGb ? `dari ${totalRamGb} GiB (${ramUsedPct}% dipakai)` : 'Menunggu sync...'}
              </div>
            </div>

            {/* Storage Resource */}
            <div className="bg-white/90 border border-blue-100 rounded-xl p-3 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                Sisa Storage
              </span>
              <div className="text-sm font-extrabold text-slate-900">
                {freeStorageGb !== null ? `${freeStorageGb} GB` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {totalStorageGb ? `dari ${totalStorageGb} GB (${storageUsedPct}% dipakai)` : 'Menunggu sync...'}
              </div>
            </div>

            {/* Thermal / Battery Health */}
            <div className="bg-white/90 border border-blue-100 rounded-xl p-3 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                Suhu & Baterai
              </span>
              <div className="text-sm font-extrabold text-slate-900">
                {device?.batteryTemp !== null && device?.batteryTemp !== undefined ? `${device.batteryTemp}°C` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {device?.battery !== null && device?.battery !== undefined ? `${device.battery}% (${device.batteryStatus || 'Normal'})` : 'Menunggu sync...'}
              </div>
            </div>

            {/* Safety & Integrity */}
            <div className="bg-white/90 border border-blue-100 rounded-xl p-3 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                Status Keamanan
              </span>
              <div className="text-sm font-extrabold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Terproteksi</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Zero-Root Heuristic
              </div>
            </div>
          </div>

          {/* Heuristic Recommendation Callout */}
          <div className="p-3 bg-white/80 border border-blue-200/60 rounded-xl text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="font-bold text-blue-900 block text-xs">
                💡 Rekomendasi Pintar Sistem:
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {isBridgeConnected
                  ? `Kondisi perangkat stabil. Tersedia ~1.5 GB cache temporary yang aman dipangkas tanpa menghapus data pribadi.`
                  : 'Hubungkan ponsel atau laptop via ADB Bridge untuk mendapatkan analisis performa dan estimasi berkas yang dapat dibersihkan.'}
              </p>
            </div>
            {recommendation?.isScanned && (
              <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shrink-0 self-start sm:self-center">
                +{recommendation.estimatedRecoveryFormatted} dapat dipulihkan
              </span>
            )}
          </div>
        </div>

        {/* Right: Smart Action Buttons */}
        <div className="flex flex-col gap-2 w-full lg:w-72 shrink-0">
          <button
            onClick={onOpenSafetyCenter}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 flex items-center justify-between transition cursor-pointer btn-bounce"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Pusat Pembersihan Cepat</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onNavigateToDuplicates}
            className="w-full px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HardDrive className="h-3.5 w-3.5 text-indigo-600" />
              <span>Tinjau Berkas Duplikat</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {onOpenSecurityScanner && (
            <button
              onClick={onOpenSecurityScanner}
              className="w-full px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                <span>Pindai Ancaman Virus</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          )}

          {onOpenDeepScanner && (
            <button
              onClick={onOpenDeepScanner}
              className="w-full px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 shadow-xs flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-blue-600" />
                <span>Deep Storage Scanner</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
