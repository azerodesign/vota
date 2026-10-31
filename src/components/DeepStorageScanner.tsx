import React, { useState } from 'react';
import {
  Sliders,
  AlertCircle,
  ShieldCheck,
  HelpCircle,
  Lock,
} from 'lucide-react';
import { ScannedFileItem, SafetyRiskLevel, DeepScanCategoryType } from '../types';
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
  const [minSizeMb, setMinSizeMb] = useState<number>(0);
  const [extensionFilter, setExtensionFilter] = useState<string>('all');
  const [directorySearch, setDirectorySearch] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Filter logic
  const filteredItems = items.filter((item) => {
    // Category
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

    // Min Size
    const itemMb = item.sizeBytes / (1024 * 1024);
    if (itemMb < minSizeMb) return false;

    // Extension
    if (extensionFilter !== 'all' && item.extension !== extensionFilter) return false;

    // Directory
    if (directorySearch && !item.path.toLowerCase().includes(directorySearch.toLowerCase())) {
      return false;
    }

    return true;
  });

  const selectedItems = filteredItems.filter((i) => i.selected);
  const totalSelectedBytes = selectedItems.reduce((acc, i) => acc + i.sizeBytes, 0);

  const getRiskBadge = (risk: SafetyRiskLevel) => {
    switch (risk) {
      case 'SAFE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            SAFE
          </span>
        );
      case 'REVIEW REQUIRED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            REVIEW REQUIRED
          </span>
        );
      case 'PROTECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
            <Lock className="h-3 w-3" />
            PROTECTED
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
            <HelpCircle className="h-3 w-3" />
            UNKNOWN
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Deep Storage Scanner & Artifact Categorizer
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis menyeluruh berkas berukuran besar, installer lama (.apk), cache aplikasi, dan folder kosong.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-mono font-medium">
            Terpilih: <strong className="text-blue-600">{selectedItems.length}</strong> (
            {formatBytes(totalSelectedBytes, 2)})
          </span>
          <button
            onClick={() => onSendToSafetyCenter(selectedItems)}
            disabled={selectedItems.length === 0}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
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
            className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
          <Sliders className="h-4 w-4 text-blue-600" />
          <span>Filter Parameter Pemindaian Mendalam:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Min Size */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-500 font-medium">Ukuran Minimum File:</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={minSizeMb}
                onChange={(e) => setMinSizeMb(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="font-mono text-blue-600 font-bold min-w-[55px] text-right">
                {minSizeMb} MB
              </span>
            </div>
          </div>

          {/* Extension Filter */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-500 font-medium">Ekstensi Berkas:</label>
            <select
              value={extensionFilter}
              onChange={(e) => setExtensionFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium cursor-pointer shadow-xs"
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
            <label className="text-[11px] text-slate-500 font-medium">Filter Path / Folder:</label>
            <input
              type="text"
              placeholder="e.g. /sdcard/Download"
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 font-mono text-[11px] focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>

          {/* Date Filter */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-500 font-medium">Terakhir Dimodifikasi:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 font-medium cursor-pointer shadow-xs"
            >
              <option value="all">Semua Waktu</option>
              <option value="older_30d">&gt; 30 Hari yang lalu</option>
            </select>
          </div>
        </div>

        {/* User Prompt Policy Note */}
        <div className="pt-2 text-[11px] text-amber-800 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
          <span>
            Kebijakan Integritas: VOTA tidak pernah menandai berkas sebagai "tidak terpakai" semata-mata karena berkas tersebut belum dimodifikasi baru-baru ini.
          </span>
        </div>
      </div>

      {/* Scanned Files Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-mono">
            <tr>
              <th className="py-2.5 px-4 w-10 text-center font-bold">Pilih</th>
              <th className="py-2.5 px-4 font-bold">Nama Berkas & Path</th>
              <th className="py-2.5 px-4 font-bold">Klasifikasi Risiko</th>
              <th className="py-2.5 px-4 font-bold">Alasan Analisis</th>
              <th className="py-2.5 px-4 text-right font-bold">Ukuran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400">
                  Tidak ada berkas yang cocok dengan filter parameter saat ini.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      disabled={item.risk === 'PROTECTED' || item.risk === 'UNKNOWN'}
                      onChange={() => onToggleItem(item.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4 bg-white cursor-pointer disabled:opacity-30"
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
                    <div className="font-bold text-slate-900 truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-md font-sans" title={item.path}>
                      {item.path}
                    </div>
                  </td>
                  <td className="py-3 px-4">{getRiskBadge(item.risk)}</td>
                  <td className="py-3 px-4 text-slate-600 font-sans text-[11px]">
                    {item.reason}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
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
