import React from 'react';
import { Trash2, Zap, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

interface QuickActionsProps {
  onCleanWhatsApp: () => void;
  onTrimCaches: () => void;
  onOpenDebloater: () => void;
  isProcessing: boolean;
  waSentSizeGb: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onCleanWhatsApp,
  onTrimCaches,
  onOpenDebloater,
  isProcessing,
  waSentSizeGb,
}) => {
  return (
    <div className="bg-[#0f1523] border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <h3 className="font-semibold text-slate-200">Aksi Pembersihan Kilat (1-Click)</h3>
        </div>
        <span className="text-xs text-slate-400">Semua aksi aman & teruji</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action 1: WhatsApp Sent Cleaner */}
        <div className="bg-slate-900/80 border border-emerald-900/30 hover:border-emerald-700/50 rounded-xl p-4 flex flex-col justify-between transition group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                Hemat ~{waSentSizeGb > 0 ? waSentSizeGb : '3.25'} GB
              </span>
            </div>
            <h4 className="font-semibold text-slate-200 text-sm">Bersihkan Duplikat WA Sent</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Menghapus video &amp; gambar duplikat di folder Sent tanpa menghapus chat atau galeri HP.
            </p>
          </div>

          <button
            onClick={onCleanWhatsApp}
            disabled={isProcessing}
            className="mt-4 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Bersihkan Duplikat Sekarang</span>
          </button>
        </div>

        {/* Action 2: System Cache Trim */}
        <div className="bg-slate-900/80 border border-sky-900/30 hover:border-sky-700/50 rounded-xl p-4 flex flex-col justify-between transition group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                <Zap className="h-5 w-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300">
                Instan Boost
              </span>
            </div>
            <h4 className="font-semibold text-slate-200 text-sm">Potong Cache Sistem</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Memaksa Android membuang cache sampah aplikasi lama lewat <code>pm trim-caches</code>.
            </p>
          </div>

          <button
            onClick={onTrimCaches}
            disabled={isProcessing}
            className="mt-4 w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Eksekusi Trim Cache</span>
          </button>
        </div>

        {/* Action 3: Safe Debloater */}
        <div className="bg-slate-900/80 border border-indigo-900/30 hover:border-indigo-700/50 rounded-xl p-4 flex flex-col justify-between transition group">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300">
                Hemat ~500 MB RAM
              </span>
            </div>
            <h4 className="font-semibold text-slate-200 text-sm">Kelola Bloatware &amp; Iklan</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Copot GetApps, iklan sistem MSA, dan pelacak bawaan Xiaomi tanpa risiko bootloop.
            </p>
          </div>

          <button
            onClick={onOpenDebloater}
            disabled={isProcessing}
            className="mt-4 w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Buka Manajer Bloatware</span>
          </button>
        </div>
      </div>
    </div>
  );
};
