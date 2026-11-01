import React, { useState, useEffect } from 'react';
import {
  Copy,
  Trash2,
  ShieldCheck,
  Film,
  Image,
  FileText,
  Lock,
} from 'lucide-react';
import { DuplicateGroup } from '../types';
import { formatBytes } from '../lib/storageEngine';
import { sfx } from '../lib/soundEffects';
import { useToast } from './ToastNotification';

interface DuplicateFinderProps {
  groups: DuplicateGroup[];
  onDeleteSelected: (selectedPaths: string[]) => void;
  isProcessing: boolean;
}

export const DuplicateFinder: React.FC<DuplicateFinderProps> = ({
  groups,
  onDeleteSelected,
  isProcessing,
}) => {
  const { showError, showInfo } = useToast();
  const [duplicateList, setDuplicateList] = useState<DuplicateGroup[]>(groups);
  const [hashAlgorithm, setHashAlgorithm] = useState<'sha256' | 'partial_plus_sha256'>('sha256');

  useEffect(() => {
    setDuplicateList(groups);
  }, [groups]);

  // Toggle selection with keep-one invariant
  const handleToggleFile = (groupIdx: number, fileId: string) => {
    setDuplicateList((prev) => {
      const next = [...prev];
      const grp = { ...next[groupIdx] };
      const target = grp.files.find((f) => f.id === fileId);

      if (!target) return prev;

      // Invariant check: Never automatically or manually select all copies
      const willBeSelectedCount = grp.files.filter((f) => (f.id === fileId ? !f.selected : f.selected)).length;
      if (willBeSelectedCount >= grp.files.length) {
        showError('Kebijakan Keamanan VOTA', 'Setidaknya 1 salinan berkas asli wajib disimpan dan tidak boleh dihapus.');
        return prev;
      }

      sfx.playClick();
      grp.files = grp.files.map((f) => (f.id === fileId ? { ...f, selected: !f.selected } : f));
      next[groupIdx] = grp;
      return next;
    });
  };

  // Auto-select duplicates safely (keeps original)
  const handleAutoSelectSafely = () => {
    sfx.playClick();
    setDuplicateList((prev) =>
      prev.map((grp) => ({
        ...grp,
        files: grp.files.map((f, idx) => ({
          ...f,
          selected: idx > 0, // idx 0 is preserved original
        })),
      }))
    );
    showInfo('Seleksi Otomatis Aman', 'Seluruh salinan duplikat dipilih, 1 berkas asli tetap dilindungi.');
  };

  const handleDeselectAll = () => {
    sfx.playClick();
    setDuplicateList((prev) =>
      prev.map((grp) => ({
        ...grp,
        files: grp.files.map((f) => ({ ...f, selected: false })),
      }))
    );
  };

  // Calculate stats
  const allSelectedFiles = duplicateList.flatMap((g) => g.files.filter((f) => f.selected).map((f) => f.path));
  const totalBytesSelected = duplicateList.flatMap((g) => g.files.filter((f) => f.selected)).reduce((acc, f) => acc + f.sizeBytes, 0);

  const getFileIcon = (name: string) => {
    if (name.endsWith('.mp4') || name.endsWith('.mkv')) return <Film className="h-5 w-5 text-blue-600" />;
    if (name.endsWith('.jpg') || name.endsWith('.png')) return <Image className="h-5 w-5 text-emerald-600" />;
    return <FileText className="h-5 w-5 text-indigo-600" />;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Advanced Duplicate Finder (SHA-256 Cryptographic Matcher)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mendeteksi duplikat identik menggunakan pra-filter ukuran berkas dan hash verifikasi SHA-256.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={hashAlgorithm}
            onChange={(e) => setHashAlgorithm(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 font-mono font-medium shadow-xs"
          >
            <option value="sha256">Full SHA-256 Hash</option>
            <option value="partial_plus_sha256">Partial + Full SHA-256 (&gt;1GB)</option>
          </select>
        </div>
      </div>

      {/* Safety Invariant Notice Banner */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs space-y-1">
        <div className="font-bold text-blue-900 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span>VOTA Core Safety Guarantee: Never Automatically Delete All Copies</span>
        </div>
        <p className="text-slate-600 text-[11px] leading-relaxed">
          Sistem VOTA secara ketat mengunci 1 salinan asli (Original File). Anda tidak akan pernah bisa menghapus seluruh salinan berkas secara tidak sengaja.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoSelectSafely}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
          >
            Pilih Duplikat Aman
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl font-semibold transition cursor-pointer"
          >
            Batalkan Pilihan
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-700 font-medium">
            Terpilih: <strong className="text-blue-600">{allSelectedFiles.length} file</strong> (
            {formatBytes(totalBytesSelected, 2)})
          </span>
          <button
            onClick={() => onDeleteSelected(allSelectedFiles)}
            disabled={allSelectedFiles.length === 0 || isProcessing}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus Duplikat Terpilih</span>
          </button>
        </div>
      </div>

      {/* Duplicate Groups List */}
      <div className="space-y-4">
        {duplicateList.length === 0 ? (
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <Copy className="h-8 w-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-700">Tidak ada duplikat terdeteksi</div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Belum ada berkas duplikat yang dipindai dari perangkat Android. Gunakan fitur pemindaian penyimpanan untuk memeriksa berkas ganda.
            </p>
          </div>
        ) : (
          duplicateList.map((group, groupIdx) => (
          <div
            key={group.hash}
            className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs"
          >
            {/* Group Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-white border border-slate-200 text-blue-600 rounded-xl shadow-xs">
                  <Copy className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Grup Duplikat #{groupIdx + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold">
                      Ukuran Per Berkas: {formatBytes(group.sizeBytes, 2)}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate max-w-md">
                    SHA-256: {group.hash}
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono font-bold text-emerald-600">
                Potensi Hemat: {formatBytes(group.sizeBytes * (group.files.length - 1), 2)}
              </div>
            </div>

            {/* Files in this group */}
            <div className="divide-y divide-slate-100">
              {group.files.map((file) => (
                <div
                  key={file.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono hover:bg-white px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={file.selected}
                      onChange={() => handleToggleFile(groupIdx, file.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4 bg-white cursor-pointer"
                    />

                    <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                      {getFileIcon(file.name)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 truncate">{file.name}</span>
                        {file.isOriginal ? (
                          <span className="px-2 py-0.5 text-[9px] rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 font-sans font-bold">
                            <Lock className="h-2.5 w-2.5" />
                            Berkas Asli (Dilindungi)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-sans font-bold">
                            Salinan Duplikat
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xl font-sans" title={file.path}>
                        {file.path}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 text-[11px] text-slate-400 font-medium">
                    <div>{file.modifiedTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
};
