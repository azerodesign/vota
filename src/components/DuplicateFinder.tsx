import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  ShieldCheck,
  FileVideo,
  FileImage,
  FileText,
  Lock,
} from 'lucide-react';
import { DuplicateGroup } from '../types';
import { formatBytes } from '../lib/storageEngine';

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
  const [duplicateList, setDuplicateList] = useState<DuplicateGroup[]>(groups);
  const [hashAlgorithm, setHashAlgorithm] = useState<'sha256' | 'partial_plus_sha256'>('sha256');

  // Handle individual toggle
  const handleToggleFile = (groupIndex: number, fileId: string) => {
    setDuplicateList((prev) => {
      return prev.map((grp, gIdx) => {
        if (gIdx !== groupIndex) return grp;

        const updatedFiles = grp.files.map((file) => {
          if (file.id === fileId) {
            // Check invariant: Never delete all copies
            if (!file.selected) {
              // User wants to mark for deletion
              const willBeSelectedCount = grp.files.filter((f) => f.selected || f.id === fileId).length;
              if (willBeSelectedCount >= grp.files.length) {
                alert('Peringatan Keamanan VOTA: Anda tidak boleh menghapus semua salinan berkas. Setidaknya 1 berkas asli wajib disimpan!');
                return file;
              }
            }
            return { ...file, selected: !file.selected };
          }
          return file;
        });

        return { ...grp, files: updatedFiles };
      });
    });
  };

  // Safe Select All: Selects only non-original copies
  const handleAutoSelectSafely = () => {
    setDuplicateList((prev) => {
      return prev.map((grp) => ({
        ...grp,
        files: grp.files.map((f, idx) => ({
          ...f,
          // First item is preserved as original, subsequent items selected
          selected: idx > 0,
        })),
      }));
    });
  };

  const handleDeselectAll = () => {
    setDuplicateList((prev) =>
      prev.map((grp) => ({
        ...grp,
        files: grp.files.map((f) => ({ ...f, selected: false })),
      }))
    );
  };

  // Compute selected files
  const allSelectedFiles = duplicateList.flatMap((grp) =>
    grp.files.filter((f) => f.selected).map((f) => f.path)
  );

  const totalBytesSelected = duplicateList.reduce((acc, grp) => {
    const selectedCount = grp.files.filter((f) => f.selected).length;
    return acc + selectedCount * grp.sizeBytes;
  }, 0);

  const getFileIcon = (name: string) => {
    if (name.endsWith('.mp4') || name.endsWith('.mkv') || name.endsWith('.mov')) {
      return <FileVideo className="h-5 w-5 text-indigo-400" />;
    }
    if (name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.jpeg')) {
      return <FileImage className="h-5 w-5 text-emerald-400" />;
    }
    return <FileText className="h-5 w-5 text-cyan-400" />;
  };

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Advanced Duplicate Finder (SHA-256 Cryptographic Matcher)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Mendeteksi duplikat identik menggunakan pra-filter ukuran berkas dan hash verifikasi SHA-256.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={hashAlgorithm}
            onChange={(e) => setHashAlgorithm(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="sha256">Full SHA-256 Hash</option>
            <option value="partial_plus_sha256">Partial + Full SHA-256 (Faster for &gt;1GB)</option>
          </select>
        </div>
      </div>

      {/* Safety Invariant Notice Banner */}
      <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs space-y-1">
        <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>VOTA Core Safety Guarantee: Never Automatically Delete All Copies</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Sistem VOTA secara ketat mengunci 1 salinan asli (Original File). Anda tidak akan pernah bisa menghapus seluruh salinan berkas secara tidak sengaja.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoSelectSafely}
            className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 rounded-lg transition"
          >
            Pilih Duplikat Aman (Kecuali Asli)
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-lg transition"
          >
            Batalkan Pilihan
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-300">
            Terpilih: <strong className="text-cyan-400">{allSelectedFiles.length} file</strong> (
            {formatBytes(totalBytesSelected, 2)})
          </span>
          <button
            onClick={() => onDeleteSelected(allSelectedFiles)}
            disabled={allSelectedFiles.length === 0 || isProcessing}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus Duplikat Terpilih</span>
          </button>
        </div>
      </div>

      {/* Duplicate Groups List */}
      <div className="space-y-4">
        {duplicateList.map((group, groupIdx) => (
          <div
            key={group.hash}
            className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 space-y-3"
          >
            {/* Group Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-slate-900 border border-slate-800 text-indigo-400 rounded-lg">
                  <Copy className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <span>Grup Duplikat #{groupIdx + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
                      Ukuran Per Berkas: {formatBytes(group.sizeBytes, 2)}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate max-w-md">
                    SHA-256: {group.hash}
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono text-emerald-400">
                Potensi Hemat: {formatBytes(group.sizeBytes * (group.files.length - 1), 2)}
              </div>
            </div>

            {/* Files in this group */}
            <div className="divide-y divide-slate-800/50">
              {group.files.map((file) => (
                <div
                  key={file.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono hover:bg-slate-900/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={file.selected}
                      onChange={() => handleToggleFile(groupIdx, file.id)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/20 h-4 w-4 bg-slate-900 cursor-pointer"
                    />

                    <div className="p-1.5 bg-slate-900/80 rounded-lg">
                      {getFileIcon(file.name)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-200 truncate">{file.name}</span>
                        {file.isOriginal ? (
                          <span className="px-2 py-0.5 text-[9px] rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-sans font-bold">
                            <Lock className="h-2.5 w-2.5" />
                            Berkas Asli (Dilindungi)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20 font-sans">
                            Salinan Duplikat
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xl" title={file.path}>
                        {file.path}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 text-[11px] text-slate-400">
                    <div>{file.modifiedTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
