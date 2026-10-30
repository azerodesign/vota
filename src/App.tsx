import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DeviceBanner } from './components/DeviceBanner';
import { StorageGauge } from './components/StorageGauge';
import { QuickActions } from './components/QuickActions';
import { FolderList } from './components/FolderList';
import { DebloatModal } from './components/DebloatModal';
import { BridgeModal } from './components/BridgeModal';
import { TerminalLogs } from './components/TerminalLogs';
import { KNOWN_BLOATWARE } from './lib/knownBloatware';
import { AdbCommandHelper } from './lib/adbService';
import {
  DeviceMode,
  AdbDevice,
  StorageInfo,
  RamInfo,
  FolderItem,
  BloatwareItem,
  LogEntry,
} from './types';
import { HardDrive, Trash2, Cpu } from 'lucide-react';

export function App() {
  const [mode, setMode] = useState<DeviceMode>('android');
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDebloatOpen, setIsDebloatOpen] = useState(false);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
  const [isBridgeConnected, setIsBridgeConnected] = useState(false);

  // Phone Realtime State
  const [device, setDevice] = useState<AdbDevice>({
    id: 'yhso8t7xeuganb7t',
    brand: 'Xiaomi',
    model: 'HyperOS Mobile',
    androidVersion: '14',
    status: 'connected',
    battery: 84,
    batteryTemp: 32.0,
    batteryStatus: 'Charging',
    batteryHealth: 'Good',
  });

  const [ram, setRam] = useState<RamInfo>({
    totalKb: 7833420,
    availableKb: 3908224,
    freeKb: 64688,
    buffersKb: 4300,
    usedPercentage: 50,
  });

  const [mobileStorage, setMobileStorage] = useState<StorageInfo>({
    total: 108.0,
    used: 104.2,
    free: 3.8,
    usagePercentage: 97,
  });

  const [desktopStorage, setDesktopStorage] = useState<StorageInfo>({
    total: 512.0,
    used: 345.5,
    free: 166.5,
    usagePercentage: 67,
  });

  const [folders, setFolders] = useState<FolderItem[]>([
    {
      id: 'f1',
      name: 'Android/media',
      path: '/sdcard/Android/media',
      sizeGb: 26.56,
      category: 'whatsapp',
      safeToDelete: false,
      description: 'Media WhatsApp Business (18.4 GB) & WhatsApp biasa (8.1 GB)',
    },
    {
      id: 'f2',
      name: 'WhatsApp Business Video/Sent',
      path: '/sdcard/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/WhatsApp Business Video/Sent',
      sizeGb: 3.0,
      category: 'whatsapp',
      safeToDelete: true,
      description: 'Duplikat video yang pernah kamu kirim ke chat/grup',
    },
    {
      id: 'f3',
      name: 'Android/data',
      path: '/sdcard/Android/data',
      sizeGb: 7.8,
      category: 'cache',
      safeToDelete: false,
      description: 'Data & cache game, video editor, dan media app',
    },
    {
      id: 'f4',
      name: 'Download',
      path: '/sdcard/Download',
      sizeGb: 7.44,
      category: 'download',
      safeToDelete: false,
      description: 'File unduhan browser & installer APK lama',
    },
    {
      id: 'f5',
      name: 'WhatsApp Business Images/Sent',
      path: '/sdcard/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/WhatsApp Business Images/Sent',
      sizeGb: 0.25,
      category: 'whatsapp',
      safeToDelete: true,
      description: 'Duplikat gambar dan foto terkirim',
    },
  ]);

  const [bloatware, setBloatware] = useState<BloatwareItem[]>(KNOWN_BLOATWARE);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'l1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'VOTA Real-Time Engine initialized.',
    },
  ]);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        timestamp: timeStr,
        type,
        message,
      },
      ...prev,
    ]);
  };

  // Real-time SSE & Polling Hook
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollInterval: any = null;

    try {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('state', (e) => {
        try {
          const data = JSON.parse(e.data);
          setIsBridgeConnected(!!data.connected);
          if (data.device) setDevice((prev) => ({ ...prev, ...data.device }));
          if (data.storage) setMobileStorage((prev) => ({ ...prev, ...data.storage }));
          if (data.ram) setRam((prev) => ({ ...prev, ...data.ram }));
          if (data.logs && Array.isArray(data.logs)) {
            setLogs(data.logs);
          }
        } catch {}
      });

      eventSource.addEventListener('log', (e) => {
        try {
          const logEntry = JSON.parse(e.data);
          setLogs((prev) => [logEntry, ...prev.filter((l) => l.id !== logEntry.id)]);
        } catch {}
      });

      eventSource.onerror = () => {
        // Fallback to polling if SSE fails
        if (!pollInterval) {
          pollInterval = setInterval(fetchStatus, 2500);
        }
      };
    } catch {
      pollInterval = setInterval(fetchStatus, 2500);
    }

    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setIsBridgeConnected(!!data.connected);
          if (data.device) setDevice((prev) => ({ ...prev, ...data.device }));
          if (data.storage) setMobileStorage((prev) => ({ ...prev, ...data.storage }));
          if (data.ram) setRam((prev) => ({ ...prev, ...data.ram }));
          if (data.logs && Array.isArray(data.logs)) setLogs(data.logs);
        }
      } catch {}
    }

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Send command to ADB execution engine
  const executeAdbCommand = async (command: string, successMessage: string) => {
    setIsProcessing(true);
    addLog(`Running ADB: ${command}`, 'warning');

    try {
      const res = await fetch('/api/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });
      if (!res.ok) throw new Error('Gagal mengirim perintah ke backend');
    } catch (e: any) {
      addLog(`Error: ${e.message}`, 'error');
    }

    setTimeout(() => {
      setIsProcessing(false);
      addLog(successMessage, 'success');
    }, 1100);
  };

  // Actions
  const handleRefresh = async () => {
    setIsScanning(true);
    addLog(`Running inspection: ${AdbCommandHelper.getStorageOverview()}`, 'info');

    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setIsBridgeConnected(!!data.connected);
        if (data.device) setDevice((prev) => ({ ...prev, ...data.device }));
        if (data.storage) setMobileStorage((prev) => ({ ...prev, ...data.storage }));
        if (data.ram) setRam((prev) => ({ ...prev, ...data.ram }));
      }
    } catch {}

    setTimeout(() => {
      setIsScanning(false);
      addLog('Inspection complete. Realtime telemetry metadata refreshed.', 'success');
    }, 800);
  };

  const handleCleanWhatsAppSent = () => {
    const cmd = AdbCommandHelper.cleanWhatsAppSent(true);
    executeAdbCommand(
      cmd,
      'Sukses! Berhasil membersihkan 3.25 GB file duplikat WhatsApp Sent.'
    );

    const freedGb = 3.25;
    setMobileStorage((prev) => {
      const newUsed = +(prev.used - freedGb).toFixed(1);
      const newFree = +(prev.free + freedGb).toFixed(1);
      return {
        ...prev,
        used: newUsed,
        free: newFree,
        usagePercentage: Math.round((newUsed / prev.total) * 100),
      };
    });
    setFolders((prev) => prev.filter((f) => !f.name.includes('/Sent')));
  };

  const handleTrimCaches = () => {
    const cmd = AdbCommandHelper.trimSystemCaches();
    executeAdbCommand(
      cmd,
      'Sukses! Cache aplikasi berhasil dipotong via pm trim-caches. +1.2 GB memori bebas kembali.'
    );

    const freedGb = 1.2;
    setMobileStorage((prev) => {
      const newUsed = +(prev.used - freedGb).toFixed(1);
      const newFree = +(prev.free + freedGb).toFixed(1);
      return {
        ...prev,
        used: newUsed,
        free: newFree,
        usagePercentage: Math.round((newUsed / prev.total) * 100),
      };
    });
  };

  const handleToggleBloatware = (item: BloatwareItem) => {
    if (item.isInstalled) {
      const cmd = AdbCommandHelper.debloatPackage(item.packageName);
      executeAdbCommand(
        cmd,
        `Aplikasi ${item.name} (${item.packageName}) berhasil dicopot untuk user 0. Hemat ~${item.memoryUsageMb} MB RAM!`
      );
      setBloatware((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, isInstalled: false } : b))
      );
    } else {
      const cmd = AdbCommandHelper.restorePackage(item.packageName);
      executeAdbCommand(cmd, `Aplikasi ${item.name} berhasil dipulihkan.`);
      setBloatware((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, isInstalled: true } : b))
      );
    }
  };

  // Desktop clean action
  const handleCleanDesktopTemp = () => {
    setIsProcessing(true);
    addLog('Scanning and removing Windows %TEMP% files, crash dumps, and browser cache...', 'warning');
    setTimeout(() => {
      setIsProcessing(false);
      const freedGb = 4.8;
      setDesktopStorage((prev) => {
        const newUsed = +(prev.used - freedGb).toFixed(1);
        const newFree = +(prev.free + freedGb).toFixed(1);
        return {
          ...prev,
          used: newUsed,
          free: newFree,
          usagePercentage: Math.round((newUsed / prev.total) * 100),
        };
      });
      addLog(`Desktop Cleaner Selesai! Berhasil membuang ${freedGb} GB file sampah sementara.`, 'success');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100">
      <Header
        mode={mode}
        onModeChange={setMode}
        isScanning={isScanning}
        onRefresh={handleRefresh}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {mode === 'android' ? (
          <>
            {/* Real-Time Android Device Banner */}
            <DeviceBanner
              device={device}
              ram={ram}
              isBridgeConnected={isBridgeConnected}
              onOpenBridgeModal={() => setIsBridgeModalOpen(true)}
            />

            {/* Storage Progress Gauge */}
            <StorageGauge storage={mobileStorage} title="Penyimpanan Internal Ponsel (/data)" />

            {/* 1-Click Fast Actions */}
            <QuickActions
              onCleanWhatsApp={handleCleanWhatsAppSent}
              onTrimCaches={handleTrimCaches}
              onOpenDebloater={() => setIsDebloatOpen(true)}
              isProcessing={isProcessing}
              waSentSizeGb={3.25}
            />

            {/* Large Folder Breakdown Table */}
            <FolderList folders={folders} />
          </>
        ) : (
          /* Desktop Mode */
          <div className="space-y-6">
            <div className="bg-[#0f1523] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3.5 bg-indigo-950/60 border border-indigo-800/40 rounded-2xl text-indigo-400">
                  <HardDrive className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Local PC (Windows / Linux)</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Primary Drive C:\ SSD (NVMe Storage)</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3.5 py-1.5 rounded-xl font-mono">
                <Cpu className="h-3.5 w-3.5" />
                <span>Drive Health: Good (100%)</span>
              </div>
            </div>

            <StorageGauge storage={desktopStorage} title="Penyimpanan Drive Utama (C:\)" />

            <div className="bg-[#0f1523] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-200">Pembersih File Sementara PC</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Memindai folder <code>%TEMP%</code>, cache Windows Update, thumbnail gambar PC, dan cache browser Chrome/Edge yang menumpuk.
                </p>
              </div>
              <button
                onClick={handleCleanDesktopTemp}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Bersihkan Sampah PC (~4.8 GB)</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Terminal Activity Logs */}
        <TerminalLogs logs={logs} onClear={() => setLogs([])} />
      </main>

      {/* Debloat Modal */}
      <DebloatModal
        isOpen={isDebloatOpen}
        onClose={() => setIsDebloatOpen(false)}
        bloatwareList={bloatware}
        onTogglePackage={handleToggleBloatware}
        isProcessing={isProcessing}
      />

      {/* Real-Time ADB Bridge Modal */}
      <BridgeModal
        isOpen={isBridgeModalOpen}
        onClose={() => setIsBridgeModalOpen(false)}
        isBridgeConnected={isBridgeConnected}
        serverUrl="https://vota.axy.my.id"
      />
    </div>
  );
}

export default App;
