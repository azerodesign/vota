import React, { useState } from 'react';
import { X, ShieldAlert, RefreshCw, Trash2 } from 'lucide-react';
import { BloatwareItem } from '../types';

interface DebloatModalProps {
  isOpen: boolean;
  onClose: () => void;
  bloatwareList: BloatwareItem[];
  onTogglePackage: (item: BloatwareItem) => void;
  isProcessing: boolean;
}

export const DebloatModal: React.FC<DebloatModalProps> = ({
  isOpen,
  onClose,
  bloatwareList,
  onTogglePackage,
  isProcessing,
}) => {
  const [filterBrand, setFilterBrand] = useState<string>('all');

  if (!isOpen) return null;

  const filtered = bloatwareList.filter(
    (item) => filterBrand === 'all' || item.brand === filterBrand || item.brand === 'general'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f1523] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Manajer Debloater &amp; Penghapus Iklan</h3>
              <p className="text-xs text-slate-400">Nonaktifkan aplikasi bawaan tanpa root lewat <code>pm uninstall -k --user 0</code></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2">
          <span className="text-xs text-slate-400 mr-2">Filter Merk:</span>
          {['all', 'xiaomi', 'samsung', 'general'].map((b) => (
            <button
              key={b}
              onClick={() => setFilterBrand(b)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                filterBrand === b
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {b === 'all' ? 'Semua' : b}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 divide-y divide-slate-800/40">
          {filtered.map((item) => (
            <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-200">{item.name}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    ~{item.memoryUsageMb} MB RAM
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{item.packageName}</p>
                <p className="text-xs text-slate-400 mt-1">{item.description}</p>
              </div>

              <div>
                {item.isInstalled ? (
                  <button
                    onClick={() => onTogglePackage(item)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onTogglePackage(item)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Pulihkan</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Aplikasi yang dihapus bisa dipulihkan kapan saja tanpa install ulang OS.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
