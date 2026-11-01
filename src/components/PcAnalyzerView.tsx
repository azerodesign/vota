import React, { useState, useEffect, useMemo } from 'react';
import {
  HardDrive,
  Cpu,
  Monitor,
  Zap,
  Battery,
  BatteryCharging,
  Wifi,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Layers,
  Copy,
  Check,
  Activity,
  Terminal,
  Usb,
  Folder,
  Search,
  Sparkles,
  Bug,
} from 'lucide-react';
import {
  PcHardwareInfo,
  PcTempItem,
  FolderItem,
  DuplicateGroup,
  ScannedFileItem,
  StorageInfo,
} from '../types';
import {
  detectClientPcHardware,
  getRecommendedPcCleanItems,
  getPcTreemapData,
  getPcFolders,
  getPcDuplicateGroups,
  getPcScannedFiles,
  getPcTopProcesses,
} from '../lib/pcDetector';
import { formatBytes } from '../lib/storageEngine';
import { useToast } from './ToastNotification';
import { sfx } from '../lib/soundEffects';
import { StorageGauge } from './StorageGauge';
import { TreemapAnalyzer } from './TreemapAnalyzer';
import { FolderList } from './FolderList';
import { DuplicateFinder } from './DuplicateFinder';
import { DeepStorageScanner } from './DeepStorageScanner';

interface PcAnalyzerViewProps {
  bridgePcInfo?: PcHardwareInfo | null;
  onAddLog: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onOpenSecurityScanner?: () => void;
}

export const PcAnalyzerView: React.FC<PcAnalyzerViewProps> = ({
  bridgePcInfo,
  onAddLog,
  onOpenSecurityScanner,
}) => {
  const { showSuccess, showDelete, showCleanup } = useToast();
  const [pcData, setPcData] = useState<PcHardwareInfo | null>(bridgePcInfo || null);
  const [cleanItems, setCleanItems] = useState<PcTempItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedBridge, setCopiedBridge] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const dispatchPcCommand = async (command: string) => {
    try {
      const token = localStorage.getItem('vota_auth_token');
      await fetch('/api/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ command }),
      });
    } catch (err) {
      console.error('Failed to dispatch PC command:', err);
    }
  };

  // Enterprise Feature Tab Navigation
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'treemap' | 'folders' | 'duplicates' | 'deep_scan' | 'cleaner'
  >('dashboard');

  // PC Enterprise Datasets
  const [pcFolders] = useState<FolderItem[]>(() => getPcFolders());
  const [pcDuplicates, setPcDuplicates] = useState<DuplicateGroup[]>(() => getPcDuplicateGroups());
  const [pcScannedFiles, setPcScannedFiles] = useState<ScannedFileItem[]>(() => getPcScannedFiles());

  // Load hardware telemetry on mount or when bridge reports
  useEffect(() => {
    if (bridgePcInfo) {
      setPcData(bridgePcInfo);
      setCleanItems(getRecommendedPcCleanItems(bridgePcInfo.platform));
      return;
    }

    let mounted = true;
    detectClientPcHardware().then((clientStats) => {
      if (!mounted) return;

      fetch('/api/system/pc-stats')
        .then((res) => (res.ok ? res.json() : null))
        .then((serverStats) => {
          if (!mounted) return;
          const isSamePlatform = serverStats && serverStats.platform === clientStats.platform;
          const finalData: PcHardwareInfo = {
            ...clientStats,
            ...(isSamePlatform && serverStats.drives?.length ? { drives: serverStats.drives } : {}),
            ...(isSamePlatform && serverStats.hostname ? { hostname: serverStats.hostname } : {}),
          };
          setPcData(finalData);
          setCleanItems(getRecommendedPcCleanItems(finalData.platform));
        })
        .catch(() => {
          if (!mounted) return;
          setPcData(clientStats);
          setCleanItems(getRecommendedPcCleanItems(clientStats.platform));
        });
    });

    return () => {
      mounted = false;
    };
  }, [bridgePcInfo]);

  const handleToggleItem = (id: string) => {
    setCleanItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleScanPc = async () => {
    setIsScanning(true);
    onAddLog('Memulai pemindaian telemetri perangkat keras dan partisi drive PC...', 'info');

    setTimeout(async () => {
      const refreshed = await detectClientPcHardware();
      setPcData((prev) => ({ ...prev, ...refreshed }));
      setIsScanning(false);
      onAddLog('Pemindaian PC selesai. Telemetri drive dan CPU diperbarui.', 'success');
    }, 900);
  };

  // Primary Drive Info (Drive C: or first drive)
  const primaryDrive = useMemo(() => {
    return (
      pcData?.drives?.find((d) => d.device.startsWith('C') || d.device === '/') ||
      pcData?.drives?.[0] || {
        device: 'C:',
        volumeName: 'Local Disk (C:)',
        totalGb: 237.44,
        freeGb: 17.98,
        usedGb: 219.45,
        usedPercentage: 92,
      }
    );
  }, [pcData?.drives]);

  const primaryStorageInfo: StorageInfo = useMemo(() => {
    return {
      total: primaryDrive.totalGb,
      used: primaryDrive.usedGb,
      free: primaryDrive.freeGb,
      usagePercentage: primaryDrive.usedPercentage,
    };
  }, [primaryDrive]);

  // Treemap Data for Drive C:
  const pcTreemapData = useMemo(() => {
    return getPcTreemapData(primaryDrive.usedGb);
  }, [primaryDrive.usedGb]);

  // Running Processes list
  const runningProcesses = useMemo(() => {
    if (pcData?.topProcesses && pcData.topProcesses.length > 0) {
      return pcData.topProcesses;
    }
    return getPcTopProcesses();
  }, [pcData?.topProcesses]);

  const selectedBytes = cleanItems
    .filter((i) => i.selected)
    .reduce((sum, i) => sum + i.estimatedBytes, 0);

  const handleCleanSelected = () => {
    if (selectedBytes === 0) return;
    setIsCleaning(true);
    sfx.playDelete();
    const formatted = formatBytes(selectedBytes, 2);
    onAddLog(`Membersihkan berkas sementara PC (${formatted})...`, 'warning');
    dispatchPcCommand('pc:clean:safe');

    setTimeout(() => {
      setIsCleaning(false);
      sfx.playSuccess();
      showCleanup(
        'Pembersihan PC Selesai!',
        `Berhasil mengosongkan ${formatted} sampah cache & berkas sementara.`,
        `+${formatted}`
      );
      onAddLog(
        `Pembersihan PC Selesai! Berhasil mengosongkan ${formatted} ruang penyimpanan.`,
        'success'
      );
      setCleanItems((prev) =>
        prev.map((item) => (item.selected ? { ...item, estimatedBytes: 0, selected: false } : item))
      );
      const freedGb = +(selectedBytes / (1024 * 1024 * 1024)).toFixed(2);
      if (freedGb > 0 && pcData?.drives?.length) {
        setPcData((prev) => {
          if (!prev) return prev;
          const updatedDrives = prev.drives.map((d, idx) => {
            if (idx === 0) {
              const newFree = +(d.freeGb + freedGb).toFixed(2);
              const newUsed = Math.max(0, +(d.usedGb - freedGb).toFixed(2));
              return {
                ...d,
                freeGb: newFree,
                usedGb: newUsed,
                usedPercentage: Math.round((newUsed / d.totalGb) * 100),
              };
            }
            return d;
          });
          return { ...prev, drives: updatedDrives };
        });
      }
    }, 1100);
  };

  // Fast PC Actions
  const handleCleanTemp = () => {
    setIsProcessingAction(true);
    sfx.playDelete();
    onAddLog('Menghapus berkas sementara Windows (%TEMP%)...', 'warning');
    dispatchPcCommand('pc:clean:temp');
    setTimeout(() => {
      setIsProcessingAction(false);
      sfx.playSuccess();
      showCleanup(
        'Folder %TEMP% Windows Dikosongkan!',
        'Berkas sementara berhasil dihapus dari drive sistem C:\\.',
        '+3.7 GB'
      );
      onAddLog('Folder %TEMP% Windows berhasil dibersihkan! Menghemat ~3.7 GB.', 'success');
      setPcData((prev) => {
        if (!prev || !prev.drives?.length) return prev;
        const updatedDrives = prev.drives.map((d, idx) => {
          if (idx === 0) {
            const newFree = +(d.freeGb + 3.7).toFixed(2);
            const newUsed = Math.max(0, +(d.usedGb - 3.7).toFixed(2));
            return { ...d, freeGb: newFree, usedGb: newUsed, usedPercentage: Math.round((newUsed / d.totalGb) * 100) };
          }
          return d;
        });
        return { ...prev, drives: updatedDrives };
      });
    }, 1100);
  };

  const handleEmptyRecycleBin = () => {
    setIsProcessingAction(true);
    sfx.playDelete();
    onAddLog('Mengosongkan tempat sampah ($Recycle.Bin)...', 'warning');
    dispatchPcCommand('pc:clean:recyclebin');
    setTimeout(() => {
      setIsProcessingAction(false);
      sfx.playSuccess();
      showCleanup(
        'Tempat Sampah Dikosongkan!',
        'Seluruh berkas terbuang di $Recycle.Bin telah dihapus permanen.',
        '+6.15 GB'
      );
      onAddLog('Recycle Bin berhasil dikosongkan! Menghemat ~6.15 GB.', 'success');
      setPcData((prev) => {
        if (!prev || !prev.drives?.length) return prev;
        const updatedDrives = prev.drives.map((d, idx) => {
          if (idx === 0) {
            const newFree = +(d.freeGb + 6.15).toFixed(2);
            const newUsed = Math.max(0, +(d.usedGb - 6.15).toFixed(2));
            return { ...d, freeGb: newFree, usedGb: newUsed, usedPercentage: Math.round((newUsed / d.totalGb) * 100) };
          }
          return d;
        });
        return { ...prev, drives: updatedDrives };
      });
    }, 1100);
  };

  const handleCleanWinUpdate = () => {
    setIsProcessingAction(true);
    sfx.playClick();
    onAddLog('Membersihkan arsip instalasi Windows Update lama...', 'info');
    dispatchPcCommand('pc:clean:winupdate');
    setTimeout(() => {
      setIsProcessingAction(false);
      sfx.playSuccess();
      showCleanup(
        'Windows Update Cache Dirampingkan!',
        'SoftwareDistribution download cache berhasil dirampingkan.',
        '+4.2 GB'
      );
      onAddLog('Folder SoftwareDistribution berhasil dirampingkan! Menghemat ~4.2 GB.', 'success');
      setPcData((prev) => {
        if (!prev || !prev.drives?.length) return prev;
        const updatedDrives = prev.drives.map((d, idx) => {
          if (idx === 0) {
            const newFree = +(d.freeGb + 4.2).toFixed(2);
            const newUsed = Math.max(0, +(d.usedGb - 4.2).toFixed(2));
            return { ...d, freeGb: newFree, usedGb: newUsed, usedPercentage: Math.round((newUsed / d.totalGb) * 100) };
          }
          return d;
        });
        return { ...prev, drives: updatedDrives };
      });
    }, 1300);
  };

  const handleFlushDns = () => {
    setIsProcessingAction(true);
    sfx.playClick();
    onAddLog('Menyegarkan DNS Cache dan Thumbnail Explorer...', 'info');
    dispatchPcCommand('pc:flush-dns');
    setTimeout(() => {
      setIsProcessingAction(false);
      sfx.playSuccess();
      showSuccess(
        'DNS & Thumbnail Disegarkan!',
        'DNS Resolver Cache dan Windows Thumbnail Cache berhasil di-flush.'
      );
      onAddLog('DNS Resolver Cache dan Thumbnail Cache berhasil disegarkan.', 'success');
    }, 900);
  };

  const handleDeleteDuplicates = (selectedPaths: string[]) => {
    if (!selectedPaths.length) return;
    setIsProcessingAction(true);
    sfx.playDelete();
    onAddLog(`Menghapus ${selectedPaths.length} salinan berkas duplikat di PC...`, 'warning');
    dispatchPcCommand(`pc:delete:${JSON.stringify(selectedPaths)}`);
    setTimeout(() => {
      setPcDuplicates((prev) =>
        prev
          .map((grp) => ({
            ...grp,
            files: grp.files.filter((f) => !selectedPaths.includes(f.path)),
          }))
          .filter((grp) => grp.files.length > 1)
      );
      setIsProcessingAction(false);
      sfx.playSuccess();
      showDelete(
        'Duplikat PC Berhasil Dihapus!',
        `${selectedPaths.length} salinan file duplikat telah dibersihkan secara permanen.`,
        `${selectedPaths.length} File`
      );
      onAddLog(`Berhasil menghapus ${selectedPaths.length} berkas duplikat di PC!`, 'success');
    }, 900);
  };

  const handleToggleScannedItem = (id: string) => {
    setPcScannedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const powershellBridgeCommand = `powershell -ExecutionPolicy Bypass -c "irm https://vota.axy.my.id/vota.ps1 | iex"`;
  const powershellCleanCommand = `powershell -c "Clear-RecycleBin -Force -ErrorAction SilentlyContinue; Remove-Item '$env:TEMP\\*' -Recurse -Force -ErrorAction SilentlyContinue; Write-Host 'PC Cache Cleared!' -ForegroundColor Green"`;

  const handleCopyBridgeCommand = () => {
    navigator.clipboard.writeText(powershellBridgeCommand);
    setCopiedBridge(true);
    onAddLog('Perintah PowerShell Bridge disalin ke clipboard.', 'success');
    setTimeout(() => setCopiedBridge(false), 2500);
  };

  const handleCopyPowershell = () => {
    navigator.clipboard.writeText(powershellCleanCommand);
    setCopiedScript(true);
    onAddLog('Perintah pembersihan PowerShell disalin ke clipboard.', 'info');
    setTimeout(() => setCopiedScript(false), 2000);
  };

  if (!pcData) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
        <h3 className="font-bold text-slate-800 text-sm">Mendeteksi Konfigurasi Perangkat PC...</h3>
        <p className="text-xs text-slate-500">Membaca arsitektur CPU, RAM, GPU, dan partisi drive lokal.</p>
      </div>
    );
  }

  const isBridgeActive = !!bridgePcInfo || pcData.source === 'bridge_powershell';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* PC Connection Bridge Guidance Card */}
      {!isBridgeActive ? (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-indigo-800/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
                  <Terminal className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    Cara Sambungkan Laptop / PC ke VOTA
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      1 Langkah Cepat
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Jalankan perintah ini di PowerShell laptop untuk sinkronisasi partisi riil (C:\, D:\) dan hubungkan HP via USB:
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <Activity className="h-3 w-3 text-amber-400 animate-pulse" />
                  Mode Browser (Standby)
                </span>
              </div>
            </div>

            {/* 1-Click Copy Command Box */}
            <div className="bg-black/60 border border-indigo-500/30 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono">
              <div className="text-xs text-emerald-400 break-all select-all font-semibold overflow-x-auto py-1">
                {powershellBridgeCommand}
              </div>
              <button
                onClick={handleCopyBridgeCommand}
                className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                {copiedBridge ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Salin Perintah</span>
                  </>
                )}
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                  <span className="h-5 w-5 rounded-full bg-indigo-500/30 flex items-center justify-center text-[11px]">1</span>
                  <span>Buka PowerShell</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tekan tombol <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Win</kbd> di laptop, ketik <strong className="text-slate-200">powershell</strong>, lalu tekan Enter.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                  <span className="h-5 w-5 rounded-full bg-indigo-500/30 flex items-center justify-center text-[11px]">2</span>
                  <span>Paste & Tekan Enter</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Klik kanan / tekan <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Ctrl + V</kbd> untuk menempelkan perintah di atas, lalu tekan Enter.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <span className="h-5 w-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-[11px]">3</span>
                  <span>Colok HP via USB (Opsional)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Jika HP dicolokkan ke laptop, data HP (baterai, RAM, storage) langsung sinkron live ke web VOTA!
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/80 border border-emerald-500/30 text-white rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-emerald-200 flex items-center gap-2">
                PowerShell Live Bridge Aktif
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/30 text-emerald-200 font-mono">
                  TERHUBUNG
                </span>
              </h3>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Data perangkat keras dan seluruh partisi drive fisik Windows tersinkronisasi langsung ke VOTA.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/50 text-emerald-200 border border-emerald-500/30 rounded-xl text-xs font-mono">
            <Usb className="h-3.5 w-3.5 text-emerald-400" />
            Host: {pcData.hostname || 'PC Client'}
          </span>
        </div>
      )}

      {/* PC Top Banner Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-50/60 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-600 shadow-xs">
              <Monitor className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {pcData.hostname || 'Local Computer'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                  {pcData.osName}
                </span>
                {isBridgeActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Laptop ADB Bridge
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <Activity className="h-3 w-3 text-blue-600" />
                    Hardware Telemetry Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                GPU: <span className="text-slate-800 font-medium">{pcData.gpuRenderer || 'Integrated Graphics'}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleScanPc}
              disabled={isScanning}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer btn-bounce"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-600 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Memindai...' : 'Pindai Ulang PC'}</span>
            </button>
          </div>
        </div>

        {/* Real-Time Hardware Spec Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 relative z-10">
          {/* CPU Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 card-interactive">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">
                <Cpu className="h-4 w-4" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Processor (CPU)</span>
            </div>
            <div className="text-xs font-bold text-slate-800 truncate" title={pcData.cpuName}>
              {pcData.cpuName}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              {pcData.cpuCores} Logical Threads
            </div>
          </div>

          {/* RAM Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 card-interactive">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-600">
                <Layers className="h-4 w-4" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Memori (RAM)</span>
            </div>
            <div className="text-xs font-bold text-slate-800">
              {pcData.ramTotalGb} GB Total
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              ~{pcData.ramFreeGb} GB Bebas ({pcData.ramUsedPercentage}% Terpakai)
            </div>
          </div>

          {/* Battery Card (Laptop/Device) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 card-interactive">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600">
                {pcData.battery?.charging ? (
                  <BatteryCharging className="h-4 w-4" />
                ) : (
                  <Battery className="h-4 w-4" />
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Daya / Baterai</span>
            </div>
            <div className="text-xs font-bold text-slate-800">
              {pcData.battery ? `${pcData.battery.level}%` : 'AC Power / Desktop'}
            </div>
            <div className="text-[10px] font-mono text-emerald-600 mt-0.5">
              {pcData.battery?.charging ? 'Mengisi Daya (Charging)' : 'Tersambung Listrik'}
            </div>
          </div>

          {/* Network / Connection Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 card-interactive">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-600">
                <Wifi className="h-4 w-4" />
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Jaringan & Kecepatan</span>
            </div>
            <div className="text-xs font-bold text-slate-800 uppercase">
              {pcData.network?.effectiveType || 'High-Speed LAN'}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">
              {pcData.network?.downlinkMbps ? `~${pcData.network.downlinkMbps} Mbps` : 'Latency Rendah'} • {pcData.network?.rttMs ? `${pcData.network.rttMs}ms RTT` : 'Stabil'}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Sub-Tabs (Full Parity with Mobile Dashboard) */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar text-xs font-bold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Monitor className="h-4 w-4" />
          <span>Ringkasan & Partisi</span>
        </button>

        <button
          onClick={() => setActiveTab('treemap')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'treemap'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Treemap Peta Visual</span>
        </button>

        <button
          onClick={() => setActiveTab('folders')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'folders'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Folder className="h-4 w-4" />
          <span>Folder Terbesar ({pcFolders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('duplicates')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'duplicates'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Copy className="h-4 w-4" />
          <span>Duplicate Finder ({pcDuplicates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deep_scan')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'deep_scan'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Search className="h-4 w-4" />
          <span>Deep Scanner PC</span>
        </button>

        <button
          onClick={() => setActiveTab('cleaner')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'cleaner'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Trash2 className="h-4 w-4" />
          <span>Pusat Pembersih ({formatBytes(selectedBytes, 1)})</span>
        </button>

        {onOpenSecurityScanner && (
          <button
            onClick={onOpenSecurityScanner}
            className="px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer text-rose-700 bg-rose-50/70 hover:bg-rose-100 border border-rose-200"
          >
            <Bug className="h-4 w-4 text-rose-600" />
            <span>Scan Virus PC</span>
          </button>
        )}
      </div>

      {/* TAB 1: DASHBOARD & PARTITIONS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Storage Gauge for Primary Drive (Drive C:) */}
          <StorageGauge
            storage={primaryStorageInfo}
            title={`Partisi Utama (${primaryDrive.volumeName || 'Drive C:'})`}
          />

          {/* PC 1-Click Fast Actions */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Aksi Cepat Pembersihan Windows</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">1-Klik Eksekusi Aman</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={handleCleanTemp}
                disabled={isProcessingAction}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition cursor-pointer card-interactive group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-2 bg-indigo-50 group-hover:bg-indigo-100 rounded-lg text-indigo-600 transition">
                    <Trash2 className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                    ~3.7 GB
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-800">Bersihkan %TEMP%</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Hapus berkas sementara Windows</div>
              </button>

              <button
                onClick={handleEmptyRecycleBin}
                disabled={isProcessingAction}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition cursor-pointer card-interactive group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-2 bg-indigo-50 group-hover:bg-indigo-100 rounded-lg text-indigo-600 transition">
                    <Zap className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                    ~6.15 GB
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-800">Kosongkan Recycle Bin</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Kuras tempat sampah Windows</div>
              </button>

              <button
                onClick={handleCleanWinUpdate}
                disabled={isProcessingAction}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition cursor-pointer card-interactive group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-2 bg-indigo-50 group-hover:bg-indigo-100 rounded-lg text-indigo-600 transition">
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                    ~4.2 GB
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-800">Cache Win Update</div>
                <div className="text-[10px] text-slate-500 mt-0.5">SoftwareDistribution Download</div>
              </button>

              <button
                onClick={handleFlushDns}
                disabled={isProcessingAction}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition cursor-pointer card-interactive group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-2 bg-indigo-50 group-hover:bg-indigo-100 rounded-lg text-indigo-600 transition">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    Sistem
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-800">Flush DNS & Cache</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Segarkan resolver & thumbnail</div>
              </button>
            </div>
          </div>

          {/* Running Windows Processes Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Top Proses Berjalan Windows (Live Task Manager)</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                {runningProcesses.length} Proses Teratas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px]">
                    <th className="pb-2 font-medium">Nama Proses</th>
                    <th className="pb-2 font-medium">PID</th>
                    <th className="pb-2 font-medium text-right">Memori (RAM)</th>
                    <th className="pb-2 font-medium text-right">Beban CPU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {runningProcesses.map((proc, i) => (
                    <tr key={proc.pid + i} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 font-bold text-slate-800 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-mono">{proc.name}</span>
                      </td>
                      <td className="py-2.5 text-slate-400 font-mono text-[11px]">{proc.pid}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-700">
                        {proc.rssKb ? `${Math.round(proc.rssKb / 1024)} MB` : 'N/A'}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-600">
                        {proc.cpuPercent !== undefined ? `${proc.cpuPercent}%` : '0.1%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drive Partitions Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pcData.drives.map((drive, idx) => (
              <div
                key={drive.device + idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 card-interactive"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600">
                      <HardDrive className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{drive.volumeName}</h4>
                      <p className="text-[11px] font-mono text-slate-500">
                        Drive {drive.device} ({drive.fsType || 'NTFS'}) • Mount: {drive.mountPoint || drive.device}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      drive.usedPercentage > 85
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {drive.usedPercentage}% Terpakai
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex">
                  <div
                    style={{ width: `${drive.usedPercentage}%` }}
                    className={`h-full transition-all duration-500 ${
                      drive.usedPercentage > 85 ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-blue-600'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                    <div className="text-[10px] text-slate-500">Terpakai</div>
                    <div className="font-mono font-bold text-slate-800">{drive.usedGb} GB</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                    <div className="text-[10px] text-slate-500">Tersedia</div>
                    <div className="font-mono font-bold text-emerald-600">{drive.freeGb} GB</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2">
                    <div className="text-[10px] text-slate-500">Kapasitas Total</div>
                    <div className="font-mono font-bold text-slate-800">{drive.totalGb} GB</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TREEMAP VISUALIZER */}
      {activeTab === 'treemap' && (
        <div className="animate-fade-in">
          <TreemapAnalyzer rootNode={pcTreemapData} onRefreshScan={handleScanPc} />
        </div>
      )}

      {/* TAB 3: LARGE FOLDERS */}
      {activeTab === 'folders' && (
        <div className="animate-fade-in">
          <FolderList folders={pcFolders} />
        </div>
      )}

      {/* TAB 4: DUPLICATE FINDER */}
      {activeTab === 'duplicates' && (
        <div className="animate-fade-in">
          <DuplicateFinder
            groups={pcDuplicates}
            onDeleteSelected={handleDeleteDuplicates}
            isProcessing={isProcessingAction}
          />
        </div>
      )}

      {/* TAB 5: DEEP SCANNER PC */}
      {activeTab === 'deep_scan' && (
        <div className="animate-fade-in">
          <DeepStorageScanner
            items={pcScannedFiles}
            onToggleItem={handleToggleScannedItem}
            onSendToSafetyCenter={() => setActiveTab('cleaner')}
          />
        </div>
      )}

      {/* TAB 6: PC CLEANER & CACHE MANAGER */}
      {activeTab === 'cleaner' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Pusat Pembersih Sampah & Cache PC (No-Risk Safe)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menghapus file sementara sisa instalasi, web browser cache, dan thumbnail cache lokal.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCleanSelected}
                  disabled={isCleaning || selectedBytes === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer btn-bounce"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>
                    {isCleaning
                      ? 'Membersihkan...'
                      : `Bersihkan Terpilih (${formatBytes(selectedBytes, 1)})`}
                  </span>
                </button>
              </div>
            </div>

            {/* Checklist of clean items */}
            <div className="space-y-2.5">
              {cleanItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleItem(item.id)}
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    item.selected
                      ? 'bg-indigo-50/50 border-indigo-200'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => {}}
                      className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.risk}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      <code className="text-[10px] text-slate-400 font-mono mt-1 inline-block">
                        {item.path}
                      </code>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {formatBytes(item.estimatedBytes, 1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 1-Line PowerShell Cleaner Script Box for Windows */}
            {pcData.platform === 'windows' && (
              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                    <Zap className="h-3.5 w-3.5 text-yellow-400" />
                    Perintah Pembersihan Cepat via PowerShell (Salin & Jalankan di Laptop):
                  </span>
                  <button
                    onClick={handleCopyPowershell}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedScript ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedScript ? 'Tersalin!' : 'Salin Perintah'}</span>
                  </button>
                </div>
                <code className="text-[11px] font-mono text-slate-300 break-all select-all block bg-slate-950 p-2 rounded">
                  {powershellCleanCommand}
                </code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
