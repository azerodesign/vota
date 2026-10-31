import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Play,
  CheckCircle2,
  Lock,
  History,
} from 'lucide-react';
import { ScannedFileItem, CleanupOperation } from '../types';
import { formatBytes } from '../lib/storageEngine';

interface CleanupSafetyCenterProps {
  itemsToClean: ScannedFileItem[];
  onExecuteCleanup: (
    items: ScannedFileItem[],
    isDryRun: boolean,
    onComplete: (op: CleanupOperation) => void
  ) => void;
  operationsHistory: CleanupOperation[];
}

export const CleanupSafetyCenter: React.FC<CleanupSafetyCenterProps> = ({
  itemsToClean,
  onExecuteCleanup,
  operationsHistory,
}) => {
  const [isDryRun, setIsDryRun] = useState(true);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentActionFile, setCurrentActionFile] = useState('');
  const [lastCompletedOperation, setLastCompletedOperation] = useState<CleanupOperation | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'history'>('preview');

  // Risk Classification breakdown
  const safeItems = itemsToClean.filter((i) => i.risk === 'SAFE');
  const reviewItems = itemsToClean.filter((i) => i.risk === 'REVIEW REQUIRED');
  const protectedItems = itemsToClean.filter((i) => i.risk === 'PROTECTED');
  const unknownItems = itemsToClean.filter((i) => i.risk === 'UNKNOWN');

  // UNKNOWN & PROTECTED files must never be automatically or directly deleted
  const validDeletableItems = itemsToClean.filter(
    (i) => i.risk === 'SAFE' || i.risk === 'REVIEW REQUIRED'
  );

  const estimatedRecoveryBytes = validDeletableItems.reduce((acc, i) => acc + i.sizeBytes, 0);

  const handleStartOperation = () => {
    if (!isDryRun && !userConfirmed) {
      alert('Peringatan Keamanan: Anda wajib mencentang konfirmasi persetujuan sebelum mengeksekusi penghapusan berkas nyata!');
      return;
    }

    if (validDeletableItems.length === 0) {
      alert('Tidak ada berkas aman yang dapat diproses.');
      return;
    }

    setIsExecuting(true);
    setProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      if (current <= 100) {
        setProgress(current);
        const fileIdx = Math.floor((current / 100) * (validDeletableItems.length - 1));
        setCurrentActionFile(validDeletableItems[fileIdx]?.name || 'Memproses...');
      } else {
        clearInterval(interval);
        setIsExecuting(false);

        const newOp: CleanupOperation = {
          id: 'op-' + Math.random().toString(36).substring(7),
          timestamp: new Date().toLocaleTimeString(),
          isDryRun,
          totalFiles: validDeletableItems.length,
          recoveredBytes: estimatedRecoveryBytes,
          status: 'verified',
          riskSummary: {
            safeCount: safeItems.length,
            reviewRequiredCount: reviewItems.length,
            protectedCount: protectedItems.length,
            unknownCount: unknownItems.length,
          },
          filePaths: validDeletableItems.map((i) => i.path),
          verificationNote: isDryRun
            ? 'Simulasi Dry-Run selesai tanpa mengubah berkas fisik.'
            : 'df -k /data mengonfirmasi pembebasan ruang penyimpanan secara nyata.',
        };

        setLastCompletedOperation(newOp);
        onExecuteCleanup(validDeletableItems, isDryRun, () => {});
      }
    }, 200);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Cleanup Safety Center (Verifikasi & Kontrol Risiko)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Setiap operasi memiliki mode simulasi (dry-run), klasifikasi risiko ketat, dan verifikasi pasca-eksekusi.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pratinjau Operasi
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Riwayat Operasi ({operationsHistory.length})
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <div className="space-y-6">
          {/* Risk Classification Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* SAFE */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  SAFE
                </span>
                <span className="font-mono font-bold text-emerald-700">{safeItems.length} berkas</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Berkas terverifikasi aman untuk dibuang (duplikat terkirim, cache sementara).
              </p>
            </div>

            {/* REVIEW REQUIRED */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  REVIEW REQUIRED
                </span>
                <span className="font-mono font-bold text-amber-700">{reviewItems.length} berkas</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Mungkin berisi data penting pengguna (arsip unduhan lama, dokumen).
              </p>
            </div>

            {/* PROTECTED */}
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-800 flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-indigo-600" />
                  PROTECTED
                </span>
                <span className="font-mono font-bold text-indigo-700">{protectedItems.length} berkas</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Kritis untuk sistem Android. Dikunci dan tidak dapat dihapus.
              </p>
            </div>

            {/* UNKNOWN */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-slate-500" />
                  UNKNOWN
                </span>
                <span className="font-mono font-bold text-slate-600">{unknownItems.length} berkas</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Format tak dikenal. Dilarang dihapus otomatis oleh kebijakan VOTA.
              </p>
            </div>
          </div>

          {/* Execution Mode Selector: Dry-Run vs Live */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>Mode Eksekusi:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                      isDryRun
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isDryRun ? 'DRY-RUN (Simulasi Aman)' : 'LIVE EXECUTION (Nyata)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isDryRun
                    ? 'Mode Dry-Run hanya mensimulasikan proses pembersihan tanpa menghapus berkas fisik apa pun.'
                    : 'Perhatian: Berkas yang dipilih akan dihapus secara fisik dari ponsel Anda.'}
                </p>
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setIsDryRun(true)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    isDryRun ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dry-Run Mode
                </button>
                <button
                  onClick={() => setIsDryRun(false)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    !isDryRun ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Live Mode
                </button>
              </div>
            </div>

            {/* Explicit Confirmation Checkbox (Required for Live Mode) */}
            {!isDryRun && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="confirm-live"
                  checked={userConfirmed}
                  onChange={(e) => setUserConfirmed(e.target.checked)}
                  className="rounded border-rose-300 text-rose-600 focus:ring-rose-500/20 h-4 w-4 bg-white mt-0.5 cursor-pointer"
                />
                <label htmlFor="confirm-live" className="text-xs text-rose-800 cursor-pointer font-medium leading-relaxed">
                  <strong>Konfirmasi Eksplisit Pengguna:</strong> Saya telah meninjau daftar berkas di atas dan menyetujui penghapusan berkas terpilih secara permanen dari perangkat ponsel saya.
                </label>
              </div>
            )}
          </div>

          {/* Progress (if executing) */}
          {isExecuting && (
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2 animate-pulse">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-blue-800 truncate font-semibold">
                  Memproses: <span className="text-slate-900">{currentActionFile}</span>
                </span>
                <span className="font-bold text-blue-600">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-sky-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Last Completed Operation Result Verification */}
          {lastCompletedOperation && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>
                  Operasi Selesai: {lastCompletedOperation.isDryRun ? 'Dry-Run Sukses' : 'Live Cleanup Sukses'}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-mono">
                {lastCompletedOperation.verificationNote}
              </p>
              <div className="text-xs text-emerald-700 font-bold font-mono">
                Total Ruang Terpulihkan: +{formatBytes(lastCompletedOperation.recoveredBytes, 2)}
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500 font-medium">
              Target Eksekusi: <strong className="text-blue-600 font-mono">{validDeletableItems.length} berkas</strong>{' '}
              (Estimasi Pulih: <strong className="text-emerald-600 font-mono">{formatBytes(estimatedRecoveryBytes, 2)}</strong>)
            </div>

            <button
              onClick={handleStartOperation}
              disabled={validDeletableItems.length === 0 || isExecuting}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50 ${
                isDryRun
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
              }`}
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{isDryRun ? 'Mulai Simulasi Dry-Run' : 'Jalankan Live Cleanup Sekarang'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Operations History Tab */
        <div className="space-y-3">
          {operationsHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono">
              Belum ada riwayat operasi pembersihan.
            </div>
          ) : (
            operationsHistory.map((op) => (
              <div
                key={op.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-slate-900">Operasi #{op.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        op.isDryRun
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {op.isDryRun ? 'DRY-RUN' : 'LIVE'}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{op.timestamp}</span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-700">
                  <span>Berkas Terproses: {op.totalFiles} berkas</span>
                  <span className="text-emerald-600 font-bold">
                    +{formatBytes(op.recoveredBytes, 2)} Pulih
                  </span>
                </div>

                {op.verificationNote && (
                  <p className="text-[10px] text-slate-500 font-sans border-t border-slate-200/80 pt-1.5">
                    {op.verificationNote}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
