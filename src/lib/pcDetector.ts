import {
  PcHardwareInfo,
  PcTempItem,
  TreemapNode,
  FolderItem,
  DuplicateGroup,
  ScannedFileItem,
  ProcessItem,
} from '../types';

export async function detectClientPcHardware(): Promise<PcHardwareInfo> {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platformStr = typeof navigator !== 'undefined' ? (navigator as any).userAgentData?.platform || navigator.platform || '' : '';

  // 1. Detect Operating System & Architecture
  let osName = 'Windows PC';
  let platform: PcHardwareInfo['platform'] = 'windows';

  if (/Windows NT 10.0/i.test(userAgent)) {
    // Windows 10 or Windows 11 (Windows 11 also reports NT 10.0 in UA unless Client Hints are used)
    osName = 'Windows 11 / 10 64-Bit';
    platform = 'windows';
  } else if (/Windows/i.test(userAgent) || /Win/i.test(platformStr)) {
    osName = 'Windows PC';
    platform = 'windows';
  } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
    osName = 'macOS (Apple Silicon / Intel)';
    platform = 'macos';
  } else if (/Android/i.test(userAgent)) {
    osName = 'Android System';
    platform = 'other';
  } else if (/Linux/i.test(userAgent) || /Linux/i.test(platformStr)) {
    osName = 'Linux Desktop / Workstation';
    platform = 'linux';
  }

  // 2. Detect CPU Cores (Logical Concurrency)
  const cpuCores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 8 : 8;
  const cpuName = `${cpuCores}-Core Logical Processor (${platform === 'windows' ? 'x86_64 High-Performance' : 'CPU Architecture'})`;

  // 3. Detect RAM Tier (navigator.deviceMemory in GB)
  let ramTotalGb = 8;
  if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
    ramTotalGb = (navigator as any).deviceMemory || 8;
  }
  const ramFreeGb = +(ramTotalGb * 0.38).toFixed(1);
  const ramUsedPercentage = Math.round(((ramTotalGb - ramFreeGb) / ramTotalGb) * 100);

  // 4. Detect GPU Hardware Acceleration via WebGL
  let gpuRenderer = 'Hardware Accelerated Graphics';
  try {
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          if (renderer && typeof renderer === 'string') {
            gpuRenderer = renderer.replace(/ANGLE \((.*)\)/, '$1').trim();
          }
        }
      }
    }
  } catch {}

  // 5. Storage Quota & Drive Analysis via StorageManager API
  let quotaUsageBytes = 0;
  let quotaTotalBytes = 0;
  let quotaPct = 0;

  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      quotaUsageBytes = est.usage || 0;
      quotaTotalBytes = est.quota || 0;
      if (quotaTotalBytes > 0) {
        quotaPct = Math.round((quotaUsageBytes / quotaTotalBytes) * 100);
      }
    }
  } catch {}

  const driveC_TotalGb = quotaTotalBytes > 0 ? +(quotaTotalBytes / (1024 * 1024 * 1024) * 4).toFixed(1) : 256;
  const driveC_FreeGb = +(driveC_TotalGb * 0.42).toFixed(1);
  const driveC_UsedGb = +(driveC_TotalGb - driveC_FreeGb).toFixed(1);

  const drives: PcHardwareInfo['drives'] = [
    {
      device: platform === 'windows' ? 'C:' : '/',
      volumeName: platform === 'windows' ? 'Windows SSD (C:)' : 'System Root (/dev/nvme0n1p2)',
      mountPoint: platform === 'windows' ? 'C:\\' : '/',
      totalGb: driveC_TotalGb,
      freeGb: driveC_FreeGb,
      usedGb: driveC_UsedGb,
      usedPercentage: Math.round((driveC_UsedGb / driveC_TotalGb) * 100),
      fsType: platform === 'windows' ? 'NTFS' : 'ext4',
    },
  ];

  // If storage is large, simulate secondary Data Drive D:\
  if (driveC_TotalGb >= 200) {
    drives.push({
      device: platform === 'windows' ? 'D:' : '/home',
      volumeName: platform === 'windows' ? 'Data Storage (D:)' : 'User Data (/home)',
      mountPoint: platform === 'windows' ? 'D:\\' : '/home',
      totalGb: 512,
      freeGb: 348.5,
      usedGb: 163.5,
      usedPercentage: 32,
      fsType: platform === 'windows' ? 'NTFS' : 'ext4',
    });
  }

  // 6. Battery Telemetry (Laptops & Mobile)
  let battery: PcHardwareInfo['battery'] | undefined = undefined;
  try {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      const b = await (navigator as any).getBattery();
      battery = {
        level: Math.round(b.level * 100),
        charging: b.charging,
        chargingTime: b.chargingTime,
        dischargingTime: b.dischargingTime,
      };
    }
  } catch {}

  // 7. Network Telemetry
  let network: PcHardwareInfo['network'] | undefined = undefined;
  try {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = (navigator as any).connection;
      network = {
        effectiveType: conn.effectiveType || 'wifi',
        downlinkMbps: conn.downlink || 25,
        rttMs: conn.rtt || 28,
      };
    }
  } catch {}

  return {
    hostname: platform === 'windows' ? 'WINDOWS-PC' : 'LOCAL-STATION',
    osName,
    platform,
    cpuName,
    cpuCores,
    ramTotalGb,
    ramFreeGb,
    ramUsedPercentage,
    gpuRenderer,
    browserName: getBrowserCleanName(userAgent),
    drives,
    source: 'browser_client',
    battery,
    network,
    storageQuota: quotaTotalBytes > 0 ? {
      usageBytes: quotaUsageBytes,
      quotaBytes: quotaTotalBytes,
      usagePercentage: quotaPct,
    } : undefined,
  };
}

function getBrowserCleanName(ua: string): string {
  if (/Edg\//i.test(ua)) return 'Microsoft Edge';
  if (/Chrome\//i.test(ua)) return 'Google Chrome';
  if (/Firefox\//i.test(ua)) return 'Mozilla Firefox';
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Apple Safari';
  return 'Web Browser';
}

export function getRecommendedPcCleanItems(platform: string): PcTempItem[] {
  const isWin = platform === 'windows';
  return [
    {
      id: 'p1',
      name: isWin ? 'Windows Temporary Files (%TEMP%)' : 'User Temp Files (/tmp)',
      description: 'Berkas sementara sisa installer software, extract cache, dan log aplikasi lokal.',
      path: isWin ? 'C:\\Users\\AppData\\Local\\Temp' : '/tmp/*',
      estimatedBytes: 1.85 * 1024 * 1024 * 1024,
      risk: 'SAFE',
      selected: true,
    },
    {
      id: 'p2',
      name: 'Browser Web Cache (Chrome / Edge)',
      description: 'Cache gambar web, video player buffer, dan file skrip yang sudah usang.',
      path: isWin ? 'C:\\Users\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache' : '~/.cache/google-chrome/Default',
      estimatedBytes: 1.42 * 1024 * 1024 * 1024,
      risk: 'SAFE',
      selected: true,
    },
    {
      id: 'p3',
      name: isWin ? 'Windows Update Download Cache' : 'Package Manager Cache (apt/pacman)',
      description: 'Berkas instalasi pembaruan OS yang sudah selesai dipasang dan tidak diperlukan lagi.',
      path: isWin ? 'C:\\Windows\\SoftwareDistribution\\Download' : '/var/cache/apt/archives',
      estimatedBytes: 2.1 * 1024 * 1024 * 1024,
      risk: 'SAFE',
      selected: false,
    },
    {
      id: 'p4',
      name: 'Thumbnail Cache & Crash Dumps',
      description: 'Cache pratinjau thumbnail file explorer dan laporan crash aplikasi lama.',
      path: isWin ? 'C:\\Users\\AppData\\Local\\Microsoft\\Windows\\Explorer' : '~/.cache/thumbnails',
      estimatedBytes: 420 * 1024 * 1024,
      risk: 'SAFE',
      selected: true,
    },
  ];
}

export function getPcTreemapData(usedGb: number = 219.45): TreemapNode {
  const scale = usedGb / 219.45;
  const gbToBytes = (gb: number) => Math.round(gb * scale * 1024 * 1024 * 1024);

  return {
    id: 'pc_root',
    name: 'Local Disk (C:)',
    path: 'C:\\',
    sizeBytes: gbToBytes(219.45),
    fileCount: 384520,
    isDir: true,
    category: 'system',
    children: [
      {
        id: 'c_apps',
        name: 'Program Files & Installed Apps',
        path: 'C:\\Program Files',
        sizeBytes: gbToBytes(68.4),
        fileCount: 84200,
        isDir: true,
        category: 'apps',
        children: [
          {
            id: 'c_steam',
            name: 'Steam & Games Library',
            path: 'C:\\Program Files (x86)\\Steam',
            sizeBytes: gbToBytes(32.5),
            fileCount: 24500,
            isDir: true,
            category: 'apps',
          },
          {
            id: 'c_dev',
            name: 'Dev Tools (VSCode, Node, Git)',
            path: 'C:\\Program Files\\Microsoft VS Code',
            sizeBytes: gbToBytes(12.4),
            fileCount: 18200,
            isDir: true,
            category: 'apps',
          },
          {
            id: 'c_office',
            name: 'Microsoft Office & Teams',
            path: 'C:\\Program Files\\Microsoft Office',
            sizeBytes: gbToBytes(8.2),
            fileCount: 9400,
            isDir: true,
            category: 'apps',
          },
          {
            id: 'c_chrome_app',
            name: 'Google Chrome Browser',
            path: 'C:\\Program Files\\Google\\Chrome',
            sizeBytes: gbToBytes(3.8),
            fileCount: 3100,
            isDir: true,
            category: 'apps',
          },
          {
            id: 'c_misc_apps',
            name: 'Other Applications',
            path: 'C:\\Program Files\\Common Files',
            sizeBytes: gbToBytes(11.5),
            fileCount: 29000,
            isDir: true,
            category: 'apps',
          },
        ],
      },
      {
        id: 'c_users',
        name: 'User Data & Downloads (x280)',
        path: 'C:\\Users\\x280',
        sizeBytes: gbToBytes(76.5),
        fileCount: 142000,
        isDir: true,
        category: 'downloads',
        children: [
          {
            id: 'c_downloads',
            name: 'Downloads Folder',
            path: 'C:\\Users\\x280\\Downloads',
            sizeBytes: gbToBytes(38.4),
            fileCount: 420,
            isDir: true,
            category: 'downloads',
            children: [
              {
                id: 'c_dl_installers',
                name: 'Software Installers (.exe, .msi)',
                path: 'C:\\Users\\x280\\Downloads\\Installers',
                sizeBytes: gbToBytes(18.2),
                fileCount: 42,
                isDir: true,
                category: 'downloads',
              },
              {
                id: 'c_dl_archives',
                name: 'Disk Images & Archives (.iso, .zip)',
                path: 'C:\\Users\\x280\\Downloads\\Archives',
                sizeBytes: gbToBytes(12.8),
                fileCount: 28,
                isDir: true,
                category: 'downloads',
              },
              {
                id: 'c_dl_media',
                name: 'Media & Documents',
                path: 'C:\\Users\\x280\\Downloads\\Media',
                sizeBytes: gbToBytes(7.4),
                fileCount: 350,
                isDir: true,
                category: 'media',
              },
            ],
          },
          {
            id: 'c_appdata',
            name: 'AppData (Local & Roaming Cache)',
            path: 'C:\\Users\\x280\\AppData',
            sizeBytes: gbToBytes(24.2),
            fileCount: 98000,
            isDir: true,
            category: 'misc',
            children: [
              {
                id: 'c_chrome_cache',
                name: 'Chrome User Cache & Profiles',
                path: 'C:\\Users\\x280\\AppData\\Local\\Google\\Chrome',
                sizeBytes: gbToBytes(6.8),
                fileCount: 34000,
                isDir: true,
                category: 'misc',
              },
              {
                id: 'c_dev_cache',
                name: 'npm, pip & Gradle Cache',
                path: 'C:\\Users\\x280\\AppData\\Local\\npm-cache',
                sizeBytes: gbToBytes(5.8),
                fileCount: 42000,
                isDir: true,
                category: 'misc',
              },
              {
                id: 'c_discord_cache',
                name: 'Communication Apps Cache',
                path: 'C:\\Users\\x280\\AppData\\Roaming\\Discord',
                sizeBytes: gbToBytes(4.5),
                fileCount: 12000,
                isDir: true,
                category: 'misc',
              },
              {
                id: 'c_temp_user',
                name: 'User Temp Files',
                path: 'C:\\Users\\x280\\AppData\\Local\\Temp',
                sizeBytes: gbToBytes(7.1),
                fileCount: 10000,
                isDir: true,
                category: 'misc',
              },
            ],
          },
          {
            id: 'c_documents',
            name: 'Documents & Desktop Files',
            path: 'C:\\Users\\x280\\Documents',
            sizeBytes: gbToBytes(13.9),
            fileCount: 43580,
            isDir: true,
            category: 'media',
          },
        ],
      },
      {
        id: 'c_windows',
        name: 'Windows System OS',
        path: 'C:\\Windows',
        sizeBytes: gbToBytes(48.6),
        fileCount: 154000,
        isDir: true,
        category: 'system',
        children: [
          {
            id: 'c_system32',
            name: 'System32 Binaries & DLLs',
            path: 'C:\\Windows\\System32',
            sizeBytes: gbToBytes(18.2),
            fileCount: 42000,
            isDir: true,
            category: 'system',
          },
          {
            id: 'c_winsxs',
            name: 'WinSxS (Component Store)',
            path: 'C:\\Windows\\WinSxS',
            sizeBytes: gbToBytes(15.4),
            fileCount: 78000,
            isDir: true,
            category: 'system',
          },
          {
            id: 'c_sys_drivers',
            name: 'Drivers & Repository',
            path: 'C:\\Windows\\System32\\DriverStore',
            sizeBytes: gbToBytes(10.8),
            fileCount: 14000,
            isDir: true,
            category: 'system',
          },
          {
            id: 'c_win_update',
            name: 'SoftwareDistribution (Updates)',
            path: 'C:\\Windows\\SoftwareDistribution',
            sizeBytes: gbToBytes(4.2),
            fileCount: 20000,
            isDir: true,
            category: 'system',
          },
        ],
      },
      {
        id: 'c_virtual_mem',
        name: 'Virtual Memory (pagefile & hiberfil)',
        path: 'C:\\pagefile.sys',
        sizeBytes: gbToBytes(19.8),
        fileCount: 2,
        isDir: true,
        category: 'system',
      },
      {
        id: 'c_recycle_bin',
        name: 'Recycle Bin ($Recycle.Bin)',
        path: 'C:\\$Recycle.Bin',
        sizeBytes: gbToBytes(6.15),
        fileCount: 318,
        isDir: true,
        category: 'misc',
      },
    ],
  };
}

export function getPcFolders(): FolderItem[] {
  return [
    {
      id: 'f1',
      name: 'Windows System OS',
      path: 'C:\\Windows',
      sizeGb: 48.6,
      category: 'system',
      riskLevel: 'PROTECTED',
      safeToDelete: false,
      description: 'Berkas inti sistem operasi Windows 11. Dilindungi secara permanen.',
    },
    {
      id: 'f2',
      name: 'Program Files (64-Bit & 32-Bit)',
      path: 'C:\\Program Files',
      sizeGb: 46.2,
      category: 'system',
      riskLevel: 'PROTECTED',
      safeToDelete: false,
      description: 'Folder instalasi aplikasi desktop, Steam, Office, dan utilitas.',
    },
    {
      id: 'f3',
      name: 'Folder Downloads (x280)',
      path: 'C:\\Users\\x280\\Downloads',
      sizeGb: 38.4,
      category: 'download',
      riskLevel: 'REVIEW REQUIRED',
      safeToDelete: false,
      description: 'Tempat berkas unduhan browser, installer .exe, .iso, dan arsip .zip.',
    },
    {
      id: 'f4',
      name: 'AppData Local & Roaming',
      path: 'C:\\Users\\x280\\AppData\\Local',
      sizeGb: 24.2,
      category: 'cache',
      riskLevel: 'SAFE',
      safeToDelete: true,
      description: 'Cache aplikasi, riwayat sesi browser, dan berkas sementara software.',
    },
    {
      id: 'f5',
      name: 'User Documents & Media',
      path: 'C:\\Users\\x280\\Documents',
      sizeGb: 13.9,
      category: 'media',
      riskLevel: 'REVIEW REQUIRED',
      safeToDelete: false,
      description: 'Dokumen kerja, berkas proyek, dan media lokal pengguna.',
    },
    {
      id: 'f6',
      name: 'Tempat Sampah ($Recycle.Bin)',
      path: 'C:\\$Recycle.Bin',
      sizeGb: 6.15,
      category: 'cache',
      riskLevel: 'SAFE',
      safeToDelete: true,
      description: 'Berkas yang telah dihapus tetapi masih tersimpan di Recycle Bin.',
    },
    {
      id: 'f7',
      name: 'Windows Update Cache',
      path: 'C:\\Windows\\SoftwareDistribution\\Download',
      sizeGb: 4.2,
      category: 'cache',
      riskLevel: 'SAFE',
      safeToDelete: true,
      description: 'Paket pembaruan Windows lama yang aman dihapus untuk menghemat ruang.',
    },
    {
      id: 'f8',
      name: 'Windows Temp Files (%TEMP%)',
      path: 'C:\\Users\\x280\\AppData\\Local\\Temp',
      sizeGb: 3.7,
      category: 'cache',
      riskLevel: 'SAFE',
      safeToDelete: true,
      description: 'File sementara sisa instalasi aplikasi yang 100% aman dihapus.',
    },
  ];
}

export function getPcDuplicateGroups(): DuplicateGroup[] {
  return [
    {
      hash: 'win_hash_1',
      sizeBytes: 104857600, // 100 MB
      files: [
        {
          id: 'dup_1',
          name: 'VSCodeUserSetup-x64-1.92.0.exe',
          path: 'C:\\Users\\x280\\Downloads\\VSCodeUserSetup-x64-1.92.0.exe',
          sizeBytes: 104857600,
          modifiedTime: '2026-09-12 14:22',
          isOriginal: true,
          selected: false,
        },
        {
          id: 'dup_2',
          name: 'VSCodeUserSetup-x64-1.92.0 (1).exe',
          path: 'C:\\Users\\x280\\Downloads\\VSCodeUserSetup-x64-1.92.0 (1).exe',
          sizeBytes: 104857600,
          modifiedTime: '2026-09-24 09:15',
          isOriginal: false,
          selected: true,
        },
      ],
    },
    {
      hash: 'win_hash_2',
      sizeBytes: 650117120, // 620 MB
      files: [
        {
          id: 'dup_3',
          name: 'Docker Desktop Installer.exe',
          path: 'C:\\Users\\x280\\Downloads\\Docker Desktop Installer.exe',
          sizeBytes: 650117120,
          modifiedTime: '2026-08-10 11:05',
          isOriginal: true,
          selected: false,
        },
        {
          id: 'dup_4',
          name: 'Docker Desktop Installer (1).exe',
          path: 'C:\\Users\\x280\\Downloads\\Installers\\Docker Desktop Installer (1).exe',
          sizeBytes: 650117120,
          modifiedTime: '2026-09-02 16:30',
          isOriginal: false,
          selected: true,
        },
      ],
    },
    {
      hash: 'win_hash_3',
      sizeBytes: 81788928, // 78 MB
      files: [
        {
          id: 'dup_5',
          name: 'ZoomInstallerFull.msi',
          path: 'C:\\Users\\x280\\Downloads\\ZoomInstallerFull.msi',
          sizeBytes: 81788928,
          modifiedTime: '2026-07-15 10:11',
          isOriginal: true,
          selected: false,
        },
        {
          id: 'dup_6',
          name: 'ZoomInstallerFull (1).msi',
          path: 'C:\\Users\\x280\\Downloads\\ZoomInstallerFull (1).msi',
          sizeBytes: 81788928,
          modifiedTime: '2026-08-01 13:45',
          isOriginal: false,
          selected: true,
        },
      ],
    },
  ];
}

export function getPcScannedFiles(): ScannedFileItem[] {
  return [
    {
      id: 'sc_1',
      name: 'Win11_23H2_Indonesian_x64.iso',
      path: 'C:\\Users\\x280\\Downloads\\Win11_23H2_Indonesian_x64.iso',
      sizeBytes: 6442450944, // 6.0 GB
      extension: '.iso',
      category: 'unused_downloads',
      lastModified: '2026-06-14',
      risk: 'REVIEW REQUIRED',
      reason: 'File citra ISO sistem operasi lama yang jarang dibuka.',
      selected: false,
    },
    {
      id: 'sc_2',
      name: 'node-v20.18.0-x64.msi',
      path: 'C:\\Users\\x280\\Downloads\\node-v20.18.0-x64.msi',
      sizeBytes: 31457280, // 30 MB
      extension: '.msi',
      category: 'installers',
      lastModified: '2026-08-20',
      risk: 'SAFE',
      reason: 'Paket installer software yang telah terpasang di sistem.',
      selected: true,
    },
    {
      id: 'sc_3',
      name: 'MEMORY.DMP',
      path: 'C:\\Windows\\MEMORY.DMP',
      sizeBytes: 1879048192, // 1.75 GB
      extension: '.dmp',
      category: 'temp_files',
      lastModified: '2026-09-01',
      risk: 'SAFE',
      reason: 'Crash dump kernel Windows yang sudah tidak diperlukan.',
      selected: true,
    },
    {
      id: 'sc_4',
      name: 'Chrome_Cache_Data_blob',
      path: 'C:\\Users\\x280\\AppData\\Local\\Google\\Chrome\\Cache\\data_0',
      sizeBytes: 1572864000, // 1.46 GB
      extension: '',
      category: 'app_cache',
      lastModified: '2026-10-30',
      risk: 'SAFE',
      reason: 'Cache data web browser Chrome yang aman disegarkan.',
      selected: true,
    },
    {
      id: 'sc_5',
      name: 'SoftwareDistribution_Download.cab',
      path: 'C:\\Windows\\SoftwareDistribution\\Download\\update.cab',
      sizeBytes: 2254857830, // 2.1 GB
      extension: '.cab',
      category: 'temp_files',
      lastModified: '2026-09-18',
      risk: 'SAFE',
      reason: 'Arsip pembaruan Windows Update yang sudah berhasil diinstal.',
      selected: true,
    },
  ];
}

export function getPcTopProcesses(): ProcessItem[] {
  return [
    { name: 'chrome.exe', pid: '1428', rssKb: 2450000, cpuPercent: 4.2 },
    { name: 'Code.exe', pid: '6520', rssKb: 860000, cpuPercent: 1.8 },
    { name: 'explorer.exe', pid: '2048', rssKb: 340000, cpuPercent: 0.8 },
    { name: 'node.exe', pid: '8912', rssKb: 280000, cpuPercent: 1.2 },
    { name: 'MsMpEng.exe', pid: '3120', rssKb: 245000, cpuPercent: 2.1 },
    { name: 'System', pid: '4', rssKb: 180000, cpuPercent: 0.5 },
    { name: 'dwm.exe', pid: '1104', rssKb: 165000, cpuPercent: 1.1 },
    { name: 'powershell.exe', pid: '10480', rssKb: 45000, cpuPercent: 0.2 },
  ];
}
