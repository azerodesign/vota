import React, { useState } from 'react';
import {
  AlertCircle,
  Sliders,
} from 'lucide-react';
import { ScannedFileItem, DeepScanCategoryType, SafetyRiskLevel } from '../types';
import { formatBytes } from '../lib/storageEngine';

interface DeepStorageScannerProps {
  items: ScannedFileItem[];
  onToggleItem: (id: string) => void;
  onSendToSafetyCenter: (selectedItems: ScannedFileItem[]) => void;
}

export const DeepStorageScanner: React.FC<DeepStorageScannerProps> = ({
  items,
  onToggleItem,
  onSendToSafetyCenter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DeepScanCategoryType | 'all'>('all');
  const [minSizeMb, setMinSizeMb] = useState<number>(10);
  const [extensionFilter, setExtensionFilter] = useState<string>('all');
  const [directorySearch, setDirectorySearch] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Filter items
  const filteredItems = items.filter((item) => {
    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

    // Min size filter (in MB)
    const itemMb = item.sizeBytes / (1024 * 1024);
    if (item.category !== 'empty_dirs' && itemMb < minSizeMb) return false;

    // Extension filter
    if (extensionFilter !== 'all' && item.extension !== extensionFilter) return false;

    // Directory path filter
    if (
      directorySearch.trim() &&
      !item.path.toLowerCase().includes(directorySearch.toLowerCase())
    )
      return false;

    // Date filter
    if (dateFilter === 'older_30d') {
      const itemDate = new Date(item.lastModified);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (itemDate > thirtyDaysAgo) return false;
    }

    return true;
  });

  const selectedItems = items.filter((i) => i.selected);
  const totalSelectedBytes = selectedItems.reduce((acc, i) => acc + i.sizeBytes, 0);

  const getRiskBadge = (risk: SafetyRiskLevel) => {
    switch (risk) {
      case 'SAFE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            SAFE
          </span>
        );
      case 'REVIEW REQUIRED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            REVIEW REQUIRED
          </span>
        );
      case 'PROTECTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            PROTECTED
          </span>
        );
      case 'UNKNOWN':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 border border-slate-600">
            UNKNOWN
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Deep Storage Scanner & Artifact Categorizer
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis menyeluruh berkas berukuran besar, installer lama (.apk), cache aplikasi, dan folder kosong.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-mono">
            Terpilih: <strong className="text-cyan-400">{selectedItems.length}</strong> (
            {formatBytes(totalSelectedBytes, 2)})
          </span>
          <button
            onClick={() => onSendToSafetyCenter(selectedItems)}
            disabled={selectedItems.length === 0}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
          >
            Lanjut ke Safety Center &rarr;
          </button>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { id: 'all', label: 'Semua Kategori' },
          { id: 'large_files', label: 'Berkas Besar (>100MB)' },
          { id: 'temp_files', label: 'Berkas Sementara (.tmp)' },
          { id: 'installers', label: 'Installer Lama (.apk)' },
          { id: 'app_cache', label: 'Cache Aplikasi' },
          { id: 'unused_downloads', label: 'Unduhan Arsip' },
          { id: 'empty_dirs', label: 'Folder Kosong' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as any)}
            className={`p-2.5 rounded-xl border text-[11px] font-semibold text-center transition-all ${
              selectedCategory === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Sliders className="h-4 w-4 text-cyan-400" />
          <span>Filter Parameter Pemindaian Mendalam:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Min Size */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Ukuran Minimum File:</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={minSizeMb}
                onChange={(e) => setMinSizeMb(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
              <span className="font-mono text-cyan-400 font-bold min-w-[55px] text-right">
                {minSizeMb} MB
              </span>
            </div>
          </div>

          {/* Extension Filter */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Ekstensi Berkas:</label>
            <select
              value={extensionFilter}
              onChange={(e) => setExtensionFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Semua Ekstensi</option>
              <option value=".apk">.apk (Android Package)</option>
              <option value=".zip">.zip (Compressed Archive)</option>
              <option value=".mp4">.mp4 (Video Media)</option>
              <option value=".cache">.cache (Application Cache)</option>
            </select>
          </div>

          {/* Directory Search */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Filter Path / Folder:</label>
            <input
              type="text"
              placeholder="e.g. /sdcard/Download"
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Date Filter */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400">Terakhir Dimodifikasi:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Semua Waktu</option>
              <option value="older_30d">&gt; 30 Hari yang lalu</option>
            </select>
          </div>
        </div>

        {/* User Prompt Policy Note */}
        <div className="pt-2 text-[11px] text-amber-400/90 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Kebijakan Integritas: VOTA tidak pernah menandai berkas sebagai "tidak terpakai" semata-mata karena berkas tersebut belum dimodifikasi baru-baru ini.
          </span>
        </div>
      </div>

      {/* Scanned Files Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
            <tr>
              <th className="py-2.5 px-4 w-10 text-center">Pilih</th>
              <th className="py-2.5 px-4">Nama Berkas & Path</th>
              <th className="py-2.5 px-4">Klasifikasi Risiko</th>
              <th className="py-2.5 px-4">Alasan Analisis</th>
              <th className="py-2.5 px-4 text-right">Ukuran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  Tidak ada berkas yang cocok dengan filter parameter saat ini.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      disabled={item.risk === 'PROTECTED' || item.risk === 'UNKNOWN'}
                      onChange={() => onToggleItem(item.id)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 h-4 w-4 bg-slate-900 cursor-pointer disabled:opacity-30"
                      title={
                        item.risk === 'PROTECTED'
                          ? 'Berkas sistem dilindungi'
                          : item.risk === 'UNKNOWN'
                          ? 'Berkas unknown dilarang dihapus otomatis'
                          : ''
                      }
                    />
                  </td>
                  <td className="py-3 px-4 min-w-0">
                    <div className="font-semibold text-slate-200 truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-md" title={item.path}>
                      {item.path}
                    </div>
                  </td>
                  <td className="py-3 px-4">{getRiskBadge(item.risk)}</td>
                  <td className="py-3 px-4 text-slate-300 font-sans text-[11px]">
                    {item.reason}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-100">
                    {item.sizeBytes === 0 ? 'Folder Kosong' : formatBytes(item.sizeBytes, 2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
