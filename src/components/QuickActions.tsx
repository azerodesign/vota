import React from 'react';
import { Trash2, Zap, ShieldAlert, Sparkles, MessageSquare, Bug } from 'lucide-react';

interface QuickActionsProps {
  onCleanWhatsApp: () => void;
  onTrimCaches: () => void;
  onOpenDebloater: () => void;
  onOpenSecurityScanner?: () => void;
  isProcessing: boolean;
  waSentSizeGb?: number | null;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCleanWhatsApp,
  onTrimCaches,
  onOpenDebloater,
  onOpenSecurityScanner,
  isProcessing,
  waSentSizeGb = null,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-slate-800">Aksi Pembersihan Kilat (1-Click)</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium">Semua aksi aman & terverifikasi</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Action 1: WhatsApp Sent Cleaner */}
        <div className="bg-slate-50/80 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 flex flex-col justify-between card-interactive group shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200">
                <MessageSquare className="h-5 w-5" />
              </div>
              {waSentSizeGb !== null && waSentSizeGb !== undefined && waSentSizeGb > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Terdeteksi ~{waSentSizeGb} GB
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  Perlu Scan Aktual
                </span>
              )}
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Bersihkan Duplikat WA Sent</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Menghapus video &amp; gambar duplikat di folder Sent tanpa menghapus riwayat chat atau galeri utama HP.
            </p>
          </div>

          <button
            onClick={onCleanWhatsApp}
            disabled={isProcessing}
            className="mt-4 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer btn-bounce"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Bersihkan Duplikat Sekarang</span>
          </button>
        </div>

        {/* Action 2: System Cache Trim */}
        <div className="bg-slate-50/80 border border-slate-200 hover:border-blue-300 rounded-2xl p-4 flex flex-col justify-between card-interactive group shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-200">
                <Zap className="h-5 w-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Instan Boost
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Potong Cache Sistem</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Memaksa Android membuang cache sampah aplikasi lama lewat perintah sistem <code>pm trim-caches</code>.
            </p>
          </div>

          <button
            onClick={onTrimCaches}
            disabled={isProcessing}
            className="mt-4 w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer btn-bounce"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Eksekusi Trim Cache</span>
          </button>
        </div>

        {/* Action 3: Safe Debloater */}
        <div className="bg-slate-50/80 border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 flex flex-col justify-between card-interactive group shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-200">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Nonaktifkan Bloatware
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Kelola Bloatware &amp; Iklan</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Copot GetApps, iklan sistem MSA, dan pelacak bawaan pabrikan tanpa risiko bootloop ponsel.
            </p>
          </div>

          <button
            onClick={onOpenDebloater}
            disabled={isProcessing}
            className="mt-4 w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer btn-bounce"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Buka Manajer Bloatware</span>
          </button>
        </div>

        {/* Action 4: Virus & Threat Scanner */}
        <div className="bg-slate-50/80 border border-slate-200 hover:border-rose-300 rounded-2xl p-4 flex flex-col justify-between card-interactive group shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-600 border border-rose-200">
                <Bug className="h-5 w-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                Heuristic Scanner
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Pindai Virus &amp; Trojan</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Deteksi malware APK penyadap OTP, spyware overlay, dan permission abuse secara realtime.
            </p>
          </div>

          <button
            onClick={onOpenSecurityScanner}
            disabled={isProcessing}
            className="mt-4 w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer btn-bounce"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Mulai Scan Virus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
