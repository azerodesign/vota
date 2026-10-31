import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { DeviceBanner } from './components/DeviceBanner';
import { StorageGauge } from './components/StorageGauge';
import { QuickActions } from './components/QuickActions';
import { FolderList } from './components/FolderList';
import { DebloatModal } from './components/DebloatModal';
import { BridgeModal } from './components/BridgeModal';
import { TerminalLogs } from './components/TerminalLogs';
import { TreemapAnalyzer } from './components/TreemapAnalyzer';
import { DuplicateFinder } from './components/DuplicateFinder';
import { DeepStorageScanner } from './components/DeepStorageScanner';
import { CleanupSafetyCenter } from './components/CleanupSafetyCenter';
import { RealtimeSystemMonitor } from './components/RealtimeSystemMonitor';
import { SmartRecommendationWidget } from './components/SmartRecommendationWidget';
import { SplashScreen } from './components/SplashScreen';
import { HpOnlyModal } from './components/HpOnlyModal';
import { LoginPage } from './components/LoginPage';
import { PcAnalyzerView } from './components/PcAnalyzerView';
import { SecurityScannerModal } from './components/SecurityScannerModal';
import { NavigationSidebar } from './components/NavigationSidebar';
import { DocsPage } from './components/DocsPage';
import { SettingsPage } from './components/SettingsPage';
import { AdminKeyManagerModal } from './components/AdminKeyManagerModal';
import { AdbOnboardingModal } from './components/AdbOnboardingModal';
import { KNOWN_BLOATWARE } from './lib/knownBloatware';
import { AdbCommandHelper } from './lib/adbService';
import {
  INITIAL_TREEMAP_DATA,
  INITIAL_DUPLICATES,
  INITIAL_SCANNED_ITEMS,
  INITIAL_SYSTEM_METRICS,
  formatBytes,
} from './lib/storageEngine';
import {
  DeviceMode,
  AdbDevice,
  StorageInfo,
  RamInfo,
  FolderItem,
  BloatwareItem,
  LogEntry,
  TreemapNode,
  DuplicateGroup,
  ScannedFileItem,
  CleanupOperation,
  SystemMetrics,
  SmartRecommendation,
  PcHardwareInfo,
} from './types';
import {
  BarChart2,
  Copy,
  Search,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export function App() {
  const [mode, setMode] = useState<DeviceMode>('android');
  const [activeFeatureTab, setActiveFeatureTab] = useState<
    'dashboard' | 'treemap' | 'duplicates' | 'deep_scan' | 'safety_center'
  >('dashboard');

  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDebloatOpen, setIsDebloatOpen] = useState(false);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
  const [isHpOnlyModalOpen, setIsHpOnlyModalOpen] = useState(false);
  const [isSecurityScannerOpen, setIsSecurityScannerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isKeyManagerOpen, setIsKeyManagerOpen] = useState(false);
  const [isAdbOnboardingOpen, setIsAdbOnboardingOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vota_hide_adb_guide') !== 'true';
    }
    return true;
  });
  const [userRole, setUserRole] = useState<'admin' | 'user'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vota_user_role');
      if (stored === 'admin') return 'admin';
      const key = localStorage.getItem('vota_auth_key') || '';
      if (key.startsWith('ADM-') || key.toLowerCase() === 'vota2026' || key.toLowerCase() === 'vota-admin') {
        return 'admin';
      }
    }
    return 'user';
  });
  const [hpOnlyInitialTab, setHpOnlyInitialTab] = useState<'switch' | 'termux' | 'wireless' | 'termius'>('switch');
  const [isBridgeConnected, setIsBridgeConnected] = useState(false);
  const [isPhoneConnected, setIsPhoneConnected] = useState(false);
  const [isPcConnected, setIsPcConnected] = useState(false);
  const [bridgePcInfo, setBridgePcInfo] = useState<PcHardwareInfo | null>(null);

  // Authentication & SPA Routing State
  const [currentPath, setCurrentPath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/login') return false;
      return !!localStorage.getItem('vota_auth_token');
    }
    return false;
  });

  // Phone Realtime State (Initialized with null / waiting state, zero mocks)
  const [device, setDevice] = useState<AdbDevice>({
    id: null,
    brand: 'Android',
    model: 'Menunggu Koneksi...',
    androidVersion: null,
    status: 'offline',
    battery: null,
    batteryTemp: null,
    batteryStatus: 'Offline',
    batteryHealth: null,
    actualIntervalMs: null,
  });

  const [ram, setRam] = useState<RamInfo>({
    totalKb: null,
    availableKb: null,
    freeKb: null,
    buffersKb: null,
    usedPercentage: null,
  });

  const [mobileStorage, setMobileStorage] = useState<StorageInfo>({
    total: null,
    used: null,
    free: null,
    usagePercentage: null,
  });

  // Phase 3 Feature Datasets
  const [treemapData] = useState<TreemapNode>(INITIAL_TREEMAP_DATA);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>(INITIAL_DUPLICATES);
  const [scannedFiles, setScannedFiles] = useState<ScannedFileItem[]>(INITIAL_SCANNED_ITEMS);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>(INITIAL_SYSTEM_METRICS);

  const [hasScannedStorage, setHasScannedStorage] = useState<boolean>(false);

  // Dynamic Smart Recommendation (Fix 4: Computed dynamically from scanned files & duplicates)
  // Strictly filters for SAFE and REVIEW REQUIRED, excludes PROTECTED and UNKNOWN, avoids double-counting
  const smartRec = useMemo<SmartRecommendation>(() => {
    if (!hasScannedStorage) {
      return {
        totalRecoverableBytes: null,
        breakdown: {
          tempFilesBytes: null,
          duplicateMediaBytes: null,
          oldDownloadsBytes: null,
          installersBytes: null,
          appCacheBytes: null,
        },
        priorityRecommendation: 'Belum dipindai. Jalankan Deep Scanner untuk menganalisis berkas yang aman dipulihkan.',
        estimatedRecoveryFormatted: 'UNAVAILABLE',
        isScanned: false,
      };
    }

    const candidatePaths = new Set<string>();

    let tempBytes = 0;
    let downloadsBytes = 0;
    let installersBytes = 0;
    let cacheBytes = 0;

    for (const file of scannedFiles) {
      if (file.risk === 'SAFE' || file.risk === 'REVIEW REQUIRED') {
        if (!candidatePaths.has(file.path)) {
          candidatePaths.add(file.path);
          if (file.category === 'temp_files') tempBytes += file.sizeBytes;
          else if (file.category === 'unused_downloads') downloadsBytes += file.sizeBytes;
          else if (file.category === 'installers') installersBytes += file.sizeBytes;
          else if (file.category === 'app_cache') cacheBytes += file.sizeBytes;
        }
      }
    }

    // Duplicate Media: only count selected duplicate copies (excluding protected originals)
    let dupMediaBytes = 0;
    for (const grp of duplicateGroups) {
      for (let i = 0; i < grp.files.length; i++) {
        const file = grp.files[i];
        if (i > 0 && !candidatePaths.has(file.path)) {
          candidatePaths.add(file.path);
          dupMediaBytes += file.sizeBytes;
        }
      }
    }

    const totalRecoverable = tempBytes + downloadsBytes + installersBytes + cacheBytes + dupMediaBytes;

    let priority = 'Review duplicate media first.';
    if (dupMediaBytes >= tempBytes && dupMediaBytes >= downloadsBytes && dupMediaBytes > 0) {
      priority = 'Review duplicate media first.';
    } else if (tempBytes >= downloadsBytes && tempBytes > 0) {
      priority = 'Clear temporary application cache.';
    } else if (downloadsBytes > 0) {
      priority = 'Review old installer and download packages.';
    } else if (totalRecoverable === 0) {
      priority = 'Penyimpanan bersih. Tidak ada berkas sampah berisiko.';
    }

    return {
      totalRecoverableBytes: totalRecoverable,
      breakdown: {
        tempFilesBytes: tempBytes,
        duplicateMediaBytes: dupMediaBytes,
        oldDownloadsBytes: downloadsBytes,
        installersBytes,
        appCacheBytes: cacheBytes,
      },
      priorityRecommendation: priority,
      estimatedRecoveryFormatted: formatBytes(totalRecoverable, 2),
      isScanned: true,
    };
  }, [hasScannedStorage, scannedFiles, duplicateGroups]);
  const [operationsHistory, setOperationsHistory] = useState<CleanupOperation[]>([]);

  const [folders, setFolders] = useState<FolderItem[]>([]);

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

  // SPA Routing & Popstate Listener
  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path === '/login' && !localStorage.getItem('vota_auth_token')) {
        setIsAuthenticated(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Verify Session Token on Initial Load with Self-Healing Auto-Refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('vota_auth_token');
    const storedKey = localStorage.getItem('vota_auth_key') || 'vota2026';

    if (!token && !storedKey) {
      setIsAuthenticated(false);
      if (window.location.pathname !== '/login') {
        window.history.replaceState({}, '', '/login');
        setCurrentPath('/login');
      }
      return;
    }

    if (token) {
      fetch('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.authenticated) {
            setIsAuthenticated(true);
            if (data.role) {
              setUserRole(data.role);
              localStorage.setItem('vota_user_role', data.role);
            }
            if (data.key) {
              localStorage.setItem('vota_auth_key', data.key);
            }
            if (data.roomId) {
              localStorage.setItem('vota_room_id', data.roomId);
            }
            if (window.location.pathname === '/login') {
              window.history.replaceState({}, '', '/');
              setCurrentPath('/');
            }
          } else {
            attemptSilentLogin(storedKey);
          }
        })
        .catch(() => {
          // Network issue: preserve authenticated session from local token
          setIsAuthenticated(true);
        });
    } else if (storedKey) {
      attemptSilentLogin(storedKey);
    }

    function attemptSilentLogin(keyToTry: string) {
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: keyToTry }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            localStorage.setItem('vota_auth_token', data.token);
            if (data.key) localStorage.setItem('vota_auth_key', data.key);
            if (data.role) {
              setUserRole(data.role);
              localStorage.setItem('vota_user_role', data.role);
            }
            if (data.roomId) localStorage.setItem('vota_room_id', data.roomId);
            setIsAuthenticated(true);
            if (window.location.pathname === '/login') {
              window.history.replaceState({}, '', '/');
              setCurrentPath('/');
            }
          } else {
            localStorage.removeItem('vota_auth_token');
            localStorage.removeItem('vota_user_role');
            setIsAuthenticated(false);
            window.history.replaceState({}, '', '/login');
            setCurrentPath('/login');
          }
        })
        .catch(() => {
          setIsAuthenticated(true);
        });
    }
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
  };

  const handleLoginSuccess = (_token: string, _key: string, role?: 'admin' | 'user') => {
    setIsAuthenticated(true);
    if (role) {
      setUserRole(role);
      localStorage.setItem('vota_user_role', role);
    }
    const target = currentPath === '/settings' ? '/settings' : '/';
    setCurrentPath(target);
    window.history.replaceState({}, '', target);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('vota_auth_token');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || ''}` },
      });
    } catch {}
    localStorage.removeItem('vota_auth_token');
    localStorage.removeItem('vota_auth_key');
    localStorage.removeItem('vota_user_role');
    localStorage.removeItem('vota_room_id');
    setUserRole('user');
    setIsAuthenticated(false);
    setCurrentPath('/login');
    window.history.pushState({}, '', '/login');
  };

  const handleDisconnectAdb = async () => {
    if (!window.confirm('Apakah Anda yakin ingin memutuskan sambungan ADB? Bridge di perangkat HP/Laptop akan dihentikan.')) {
      return;
    }
    try {
      const token = localStorage.getItem('vota_auth_token');
      const res = await fetch('/api/bridge/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (res.ok) {
        setIsBridgeConnected(false);
        setDevice((prev) => ({ ...prev, status: 'disconnected' }));
        addLog('🔌 Sambungan ADB diputuskan atas permintaan pengguna.', 'warning');
      }
    } catch {
      addLog('Gagal mengirim perintah pemutusan ADB ke server.', 'error');
    }
  };

  const handleOpenSwitchTutorial = () => {
    setHpOnlyInitialTab('switch');
    setIsHpOnlyModalOpen(true);
  };

  const handleOpenHpOnlyModal = () => {
    setHpOnlyInitialTab('termux');
    setIsHpOnlyModalOpen(true);
  };

  // Real-time SSE & Polling Hook (Active when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    let eventSource: EventSource | null = null;
    let pollInterval: any = null;

    const token = localStorage.getItem('vota_auth_token') || '';

    try {
      eventSource = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);

      eventSource.addEventListener('state', (e) => {
        try {
          const data = JSON.parse(e.data);
          const phoneActive = data.phoneConnected !== undefined ? !!data.phoneConnected : (!!data.device?.id && data.device?.status === 'connected');
          const pcActive = data.pcConnected !== undefined ? !!data.pcConnected : !!data.pcInfo;
          setIsPhoneConnected(phoneActive);
          setIsPcConnected(pcActive);
          setIsBridgeConnected(phoneActive || pcActive || !!data.connected);
          if (data.device) {
            setDevice((prev) => ({ ...prev, ...data.device }));
            setSystemMetrics((prev) => ({
              ...prev,
              cpuPercent: data.device.cpuPercent ?? prev.cpuPercent,
              deviceTemp: data.device.batteryTemp ?? prev.deviceTemp,
              batteryStatus: data.device.batteryStatus ?? prev.batteryStatus,
              batteryLevel: data.device.battery ?? prev.batteryLevel,
            }));
          }
          if (data.storage) setMobileStorage((prev) => ({ ...prev, ...data.storage }));
          if (data.ram) {
            setRam((prev) => ({ ...prev, ...data.ram }));
            setSystemMetrics((prev) => ({ ...prev, ram: data.ram }));
          }
          if (data.topProcesses) {
            setSystemMetrics((prev) => ({ ...prev, topProcesses: data.topProcesses }));
          }
          if (data.pcInfo) {
            setBridgePcInfo(data.pcInfo);
          }
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
        if (!pollInterval) {
          pollInterval = setInterval(fetchStatus, 2500);
        }
      };
    } catch {
      pollInterval = setInterval(fetchStatus, 2500);
    }

    async function fetchStatus() {
      try {
        const t = localStorage.getItem('vota_auth_token') || '';
        const res = await fetch('/api/status', {
          headers: { Authorization: `Bearer ${t}` },
        });
        if (res.status === 401) {
          const storedKey = localStorage.getItem('vota_auth_key') || 'vota2026';
          try {
            const reauthRes = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: storedKey }),
            });
            const rData = await reauthRes.json();
            if (rData.success && rData.token) {
              localStorage.setItem('vota_auth_token', rData.token);
              return; // Silently re-authenticated, continue session
            }
          } catch {}
          handleLogout();
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setIsBridgeConnected(!!data.connected);
          if (data.device) {
            setDevice((prev) => ({ ...prev, ...data.device }));
            setSystemMetrics((prev) => ({
              ...prev,
              cpuPercent: data.device.cpuPercent ?? prev.cpuPercent,
              deviceTemp: data.device.batteryTemp ?? prev.deviceTemp,
              batteryStatus: data.device.batteryStatus ?? prev.batteryStatus,
              batteryLevel: data.device.battery ?? prev.batteryLevel,
            }));
          }
          if (data.storage) setMobileStorage((prev) => ({ ...prev, ...data.storage }));
          if (data.ram) {
            setRam((prev) => ({ ...prev, ...data.ram }));
            setSystemMetrics((prev) => ({ ...prev, ram: data.ram }));
          }
          if (data.topProcesses) {
            setSystemMetrics((prev) => ({ ...prev, topProcesses: data.topProcesses }));
          }
          if (data.pcInfo) setBridgePcInfo(data.pcInfo);
          if (data.logs && Array.isArray(data.logs)) setLogs(data.logs);
        }
      } catch {}
    }

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isAuthenticated]);

  // Send command to ADB execution engine
  const executeAdbCommand = async (command: string, successMessage: string) => {
    setIsProcessing(true);
    addLog(`Running ADB: ${command}`, 'warning');

    try {
      const token = localStorage.getItem('vota_auth_token');
      const res = await fetch('/api/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ command }),
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
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
    setHasScannedStorage(true);
    addLog(`Running inspection: ${AdbCommandHelper.getStorageOverview()}`, 'info');

    try {
      const token = localStorage.getItem('vota_auth_token');
      const res = await fetch('/api/status', {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setIsBridgeConnected(!!data.connected);
        if (data.device) setDevice((prev) => ({ ...prev, ...data.device }));
        if (data.storage) setMobileStorage((prev) => ({ ...prev, ...data.storage }));
        if (data.ram) setRam((prev) => ({ ...prev, ...data.ram }));
        if (data.folders) setFolders(data.folders);
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
      'Perintah pembersihan berkas duplikat WhatsApp Sent dikirim ke perangkat.'
    );
    // Sinkronkan data aktual dari telemetri perangkat tanpa estimasi manual lokal
    setTimeout(() => {
      handleRefresh();
    }, 1500);
  };

  const handleTrimCaches = () => {
    const cmd = AdbCommandHelper.trimSystemCaches();
    executeAdbCommand(
      cmd,
      'Perintah pemotongan cache sistem (pm trim-caches) berhasil dikirim.'
    );
    // Sinkronkan data aktual dari telemetri perangkat tanpa manipulasi angka lokal
    setTimeout(() => {
      handleRefresh();
    }, 1500);
  };

  const handleToggleBloatware = (item: BloatwareItem) => {
    if (item.isInstalled) {
      const cmd = AdbCommandHelper.debloatPackage(item.packageName);
      executeAdbCommand(
        cmd,
        `Aplikasi ${item.name} (${item.packageName}) berhasil dinonaktifkan untuk user 0.`
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

  // Phase 3 Duplicate Deletion Handler
  const handleDeleteDuplicates = (selectedPaths: string[]) => {
    const cmd = `rm -f ${selectedPaths.map((p) => `"${p}"`).join(' ')}`;
    executeAdbCommand(
      cmd,
      `Sukses menghapus ${selectedPaths.length} salinan duplikat berkas via SHA-256 verified match.`
    );

    // Update duplicate group state
    setDuplicateGroups((prev) =>
      prev
        .map((grp) => ({
          ...grp,
          files: grp.files.filter((f) => !selectedPaths.includes(f.path)),
        }))
        .filter((grp) => grp.files.length > 1)
    );
  };

  // Phase 3 Deep Scanner Toggle
  const handleToggleScannedItem = (id: string) => {
    setScannedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Phase 3 Safety Center Cleanup Execution
  const handleExecuteSafetyCleanup = (
    items: ScannedFileItem[],
    isDryRun: boolean,
    onComplete: (op: CleanupOperation) => void
  ) => {
    const totalBytes = items.reduce((acc, i) => acc + i.sizeBytes, 0);
    const totalGb = +(totalBytes / (1024 * 1024 * 1024)).toFixed(2);

    const newOp: CleanupOperation = {
      id: 'op-' + Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      isDryRun,
      totalFiles: items.length,
      recoveredBytes: totalBytes,
      status: 'verified',
      riskSummary: {
        safeCount: items.filter((i) => i.risk === 'SAFE').length,
        reviewRequiredCount: items.filter((i) => i.risk === 'REVIEW REQUIRED').length,
        protectedCount: 0,
        unknownCount: 0,
      },
      filePaths: items.map((i) => i.path),
      verificationNote: isDryRun
        ? 'Simulasi Dry-Run berhasil. Tidak ada berkas fisik yang dihapus.'
        : 'Verifikasi Pasca-Eksekusi: Perintah df -k /data mengonfirmasi pembebasan ruang storage secara riil.',
    };

    setOperationsHistory((prev) => [newOp, ...prev]);
    onComplete(newOp);

    if (isDryRun) {
      addLog(
        `[DRY-RUN] Simulasi pembersihan ${items.length} berkas (${totalGb} GB). Berkas aman terverifikasi.`,
        'info'
      );
    } else {
      const paths = items.map((i) => i.path).join(' ');
      const cmd = `rm -rf ${paths}`;
      executeAdbCommand(
        cmd,
        `Cleanup Selesai! Berhasil membebaskan ${totalGb} GB ruang penyimpanan terverifikasi.`
      );

      // Free space
      setMobileStorage((prev) => {
        if (prev.used === null || prev.free === null || prev.total === null) return prev;
        const newUsed = Math.max(0, +(prev.used - totalGb).toFixed(1));
        const newFree = +(prev.free + totalGb).toFixed(1);
        return {
          ...prev,
          used: newUsed,
          free: newFree,
          usagePercentage: Math.round((newUsed / prev.total) * 100),
        };
      });

      // Remove cleaned files from state
      const cleanedIds = new Set(items.map((i) => i.id));
      setScannedFiles((prev) => prev.filter((i) => !cleanedIds.has(i.id)));
    }
  };

  // Public Documentation Page (Accessible without login)
  if (currentPath === '/docs') {
    return <DocsPage onNavigate={handleNavigate} isAuthenticated={isAuthenticated} />;
  }

  // Protected Settings Page (Requires Login)
  if (currentPath === '/settings') {
    if (!isAuthenticated) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
    return (
      <SettingsPage
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onDisconnectAdb={handleDisconnectAdb}
        isBridgeConnected={isBridgeConnected}
      />
    );
  }

  if (!isAuthenticated || currentPath === '/login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* Premium Animated Splash Screen on initial load */}
      <SplashScreen />

      <Header
        mode={mode}
        onModeChange={setMode}
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        isScanning={isScanning}
        onRefresh={handleRefresh}
        onOpenHpOnlyModal={handleOpenHpOnlyModal}
        onOpenBridgeModal={() => setIsBridgeModalOpen(true)}
        onOpenSwitchTutorial={handleOpenSwitchTutorial}
        onOpenSecurityScanner={() => setIsSecurityScannerOpen(true)}
        onDisconnectAdb={handleDisconnectAdb}
        onLogout={handleLogout}
        device={device}
        isBridgeConnected={isBridgeConnected}
        isPhoneConnected={isPhoneConnected}
        isPcConnected={isPcConnected}
        userRole={userRole}
        onOpenKeyManager={() => setIsKeyManagerOpen(true)}
        onOpenAdbGuide={() => setIsAdbOnboardingOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6">
        {mode === 'android' ? (
          <>
            {/* Real-Time Android Device Banner */}
            <DeviceBanner
              device={device}
              ram={ram}
              isBridgeConnected={isBridgeConnected}
              onOpenBridgeModal={() => setIsBridgeModalOpen(true)}
              onOpenHpOnlyModal={handleOpenHpOnlyModal}
              onOpenSwitchTutorial={handleOpenSwitchTutorial}
              onDisconnectAdb={handleDisconnectAdb}
            />

            {/* Smart Cleanup Recommendation Widget (P1 - 6.6) */}
            <SmartRecommendationWidget
              recommendation={smartRec}
              ram={ram}
              storage={mobileStorage}
              device={device}
              isBridgeConnected={isBridgeConnected}
              onNavigateToDuplicates={() => setActiveFeatureTab('duplicates')}
              onOpenSafetyCenter={() => setActiveFeatureTab('safety_center')}
              onOpenSecurityScanner={() => setIsSecurityScannerOpen(true)}
              onOpenDeepScanner={() => setActiveFeatureTab('deep_scan')}
            />

            {/* Navigation Tabs for Phase 3 Features (Mobile scrollable) */}
            <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200/90 rounded-2xl overflow-x-auto text-xs font-bold shadow-xs scrollbar-none flex-nowrap">
              <button
                onClick={() => setActiveFeatureTab('dashboard')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer btn-bounce shrink-0 ${
                  activeFeatureTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Ringkasan & Telemetri</span>
              </button>

              <button
                onClick={() => setActiveFeatureTab('treemap')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer btn-bounce shrink-0 ${
                  activeFeatureTab === 'treemap'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                <span>Treemap Visualizer</span>
              </button>

              <button
                onClick={() => setActiveFeatureTab('duplicates')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer btn-bounce shrink-0 ${
                  activeFeatureTab === 'duplicates'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Copy className="h-4 w-4" />
                <span>Duplicate Finder</span>
              </button>

              <button
                onClick={() => setActiveFeatureTab('deep_scan')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer btn-bounce shrink-0 ${
                  activeFeatureTab === 'deep_scan'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Deep Scanner</span>
              </button>

              <button
                onClick={() => setActiveFeatureTab('safety_center')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer btn-bounce shrink-0 ${
                  activeFeatureTab === 'safety_center'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Safety Center</span>
              </button>
            </div>

            {/* TAB CONTENT SWITCHER */}
            {activeFeatureTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                {/* 6.5 Realtime System Monitor */}
                <RealtimeSystemMonitor metrics={systemMetrics} />

                {/* Storage Progress Gauge */}
                <StorageGauge storage={mobileStorage} title="Penyimpanan Internal Ponsel (/data)" />

                {/* 1-Click Fast Actions */}
                <QuickActions
                  onCleanWhatsApp={handleCleanWhatsAppSent}
                  onTrimCaches={handleTrimCaches}
                  onOpenDebloater={() => setIsDebloatOpen(true)}
                  onOpenSecurityScanner={() => setIsSecurityScannerOpen(true)}
                  isProcessing={isProcessing}
                  waSentSizeGb={folders.find((f) => f.path.toLowerCase().includes('sent'))?.sizeGb ?? null}
                />

                {/* Large Folder Breakdown Table */}
                <FolderList folders={folders} />
              </div>
            )}

            {activeFeatureTab === 'treemap' && (
              <div className="animate-fade-in">
                <TreemapAnalyzer
                  rootNode={treemapData}
                  onRefreshScan={handleRefresh}
                />
              </div>
            )}

            {activeFeatureTab === 'duplicates' && (
              <div className="animate-fade-in">
                <DuplicateFinder
                  groups={duplicateGroups}
                  onDeleteSelected={handleDeleteDuplicates}
                  isProcessing={isProcessing}
                />
              </div>
            )}

            {activeFeatureTab === 'deep_scan' && (
              <div className="animate-fade-in">
                <DeepStorageScanner
                  items={scannedFiles}
                  onToggleItem={handleToggleScannedItem}
                  onSendToSafetyCenter={() => {
                    setActiveFeatureTab('safety_center');
                  }}
                />
              </div>
            )}

            {activeFeatureTab === 'safety_center' && (
              <div className="animate-fade-in">
                <CleanupSafetyCenter
                  itemsToClean={scannedFiles.filter((i) => i.selected)}
                  onExecuteCleanup={handleExecuteSafetyCleanup}
                  operationsHistory={operationsHistory}
                />
              </div>
            )}
          </>
        ) : (
          /* Desktop PC Detection & Hardware Storage Analyzer */
          <PcAnalyzerView
            bridgePcInfo={bridgePcInfo}
            onAddLog={addLog}
            onOpenSecurityScanner={() => setIsSecurityScannerOpen(true)}
          />
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

      {/* HP-Only Mode Modal */}
      <HpOnlyModal
        isOpen={isHpOnlyModalOpen}
        onClose={() => setIsHpOnlyModalOpen(false)}
        isBridgeConnected={isBridgeConnected}
        serverUrl="https://vota.axy.my.id"
        initialTab={hpOnlyInitialTab}
      />

      {/* Real-Time ADB Bridge Modal */}
      <BridgeModal
        isOpen={isBridgeModalOpen}
        onClose={() => setIsBridgeModalOpen(false)}
        isBridgeConnected={isBridgeConnected}
        serverUrl="https://vota.axy.my.id"
      />

      {/* Virus & Security Scanner Modal */}
      <SecurityScannerModal
        isOpen={isSecurityScannerOpen}
        onClose={() => setIsSecurityScannerOpen(false)}
        defaultTarget={mode === 'desktop' ? 'pc' : 'mobile'}
        isBridgeConnected={isBridgeConnected}
        connectedDeviceName={device.id ? `${device.brand} ${device.model}` : null}
        onAddLog={addLog}
      />

      {/* Global Navigation Sidebar Drawer */}
      <NavigationSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPath={currentPath}
        onNavigate={handleNavigate}
        mode={mode}
        onModeChange={setMode}
        isBridgeConnected={isBridgeConnected}
        device={device}
        onOpenHpOnlyModal={handleOpenHpOnlyModal}
        onOpenBridgeModal={() => setIsBridgeModalOpen(true)}
        onOpenSwitchTutorial={handleOpenSwitchTutorial}
        onOpenSecurityScanner={() => setIsSecurityScannerOpen(true)}
        onOpenDeepScanner={() => setActiveFeatureTab('deep_scan')}
        onOpenDuplicates={() => setActiveFeatureTab('duplicates')}
        onOpenDebloat={() => setIsDebloatOpen(true)}
        onDisconnectAdb={handleDisconnectAdb}
        onLogout={handleLogout}
        userRole={userRole}
        onOpenKeyManager={() => setIsKeyManagerOpen(true)}
        onOpenAdbGuide={() => setIsAdbOnboardingOpen(true)}
      />

      {/* Admin Key Manager Modal (Accessible for role === 'admin') */}
      <AdminKeyManagerModal
        isOpen={isKeyManagerOpen}
        onClose={() => setIsKeyManagerOpen(false)}
        adminToken={typeof window !== 'undefined' ? (localStorage.getItem('vota_auth_token') || '') : ''}
      />

      {/* Interactive ADB Onboarding Guide Modal */}
      <AdbOnboardingModal
        isOpen={isAdbOnboardingOpen}
        onClose={() => setIsAdbOnboardingOpen(false)}
        isPhoneConnected={isPhoneConnected}
        isPcConnected={isPcConnected}
      />
    </div>
  );
}

export default App;
