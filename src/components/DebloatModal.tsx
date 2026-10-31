import React, { useState } from 'react';
import { X, ShieldAlert, RotateCcw, Trash2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-overlay">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-800 animate-modal-pop">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200 shadow-xs">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Manajer Debloater &amp; Penghapus Iklan</h3>
              <p className="text-xs text-slate-500 font-medium">Nonaktifkan aplikasi bawaan tanpa root lewat <code>pm uninstall -k --user 0</code></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold mr-1">Filter Merek:</span>
          {['all', 'xiaomi', 'samsung', 'general'].map((b) => (
            <button
              key={b}
              onClick={() => setFilterBrand(b)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                filterBrand === b
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {b === 'all' ? 'Semua' : b}
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 divide-y divide-slate-100">
          {filtered.map((item) => (
            <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
              <div className="flex-1 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-600">
                    ~{item.memoryUsageMb} MB RAM
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{item.packageName}</p>
                <p className="text-xs text-slate-500 mt-1">{item.description}</p>
              </div>

              <div>
                {item.isInstalled ? (
                  <button
                    onClick={() => onTogglePackage(item)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onTogglePackage(item)}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Pulihkan</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Operasi hanya berdampak pada User 0 (dapat dipulihkan kapan saja)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
