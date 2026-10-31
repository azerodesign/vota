export type DeviceMode = 'android' | 'desktop';

export interface SyncStats {
  actualIntervalMs: number | null;
  avgIntervalMs: number | null;
  minIntervalMs: number | null;
  maxIntervalMs: number | null;
  lateCount: number;
  missingCount: number;
  sampleCount: number;
}

export interface AdbDevice {
  id: string | null;
  model: string;
  brand: string;
  androidVersion: string | null;
  status: 'connected' | 'unauthorized' | 'offline' | 'disconnected';
  battery?: number | null;
  batteryTemp?: number | null;
  batteryStatus?: string | null;
  batteryHealth?: string | null;
  batteryVoltage?: number | null;
  actualIntervalMs?: number | null;
  bridgeType?: 'hp_only' | 'laptop' | null;
  syncStats?: SyncStats;
}

export interface StorageInfo {
  total: number | null; // in GB
  used: number | null;  // in GB
  free: number | null;  // in GB
  usagePercentage: number | null;
}

export interface RamInfo {
  totalKb: number | null;
  availableKb: number | null;
  freeKb?: number | null;
  buffersKb?: number | null;
  cachedKb?: number | null;
  swapTotalKb?: number | null;
  swapFreeKb?: number | null;
  usedPercentage: number | null;
}

export interface ProcessItem {
  name: string;
  pid: string;
  rssKb: number;
  cpuPercent?: number;
}

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  sizeGb: number;
  category: 'whatsapp' | 'media' | 'download' | 'cache' | 'system' | 'other';
  riskLevel: SafetyRiskLevel;
  accessStatus?: 'accessible' | 'inaccessible' | 'not_found' | 'unverified';
  safeToDelete?: boolean;
  description: string;
}

export interface BloatwareItem {
  id: string;
  packageName: string;
  name: string;
  brand: 'xiaomi' | 'samsung' | 'oppo' | 'vivo' | 'general';
  category: 'ads' | 'bloat' | 'tracking' | 'system-service';
  memoryUsageMb: number;
  risk: 'safe' | 'caution' | 'danger';
  description: string;
  isInstalled: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

/* ========================================================
   PHASE 3: ENTERPRISE FEATURES DATA TYPES
   ======================================================== */

// 6.1 Storage Treemap Analyzer
export interface TreemapNode {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  fileCount: number;
  extension?: string;
  category?: 'media' | 'photos' | 'apps' | 'downloads' | 'system' | 'misc';
  isDir: boolean;
  isInaccessible?: boolean;
  children?: TreemapNode[];
}

// PC Hardware & Storage Analysis Types
export interface DriveInfo {
  device: string;
  volumeName?: string;
  mountPoint?: string;
  totalGb: number;
  freeGb: number;
  usedGb: number;
  usedPercentage: number;
  fsType?: string;
}

export interface PcHardwareInfo {
  hostname?: string;
  osName: string;
  osVersion?: string;
  platform: 'windows' | 'macos' | 'linux' | 'other';
  cpuName: string;
  cpuCores?: number;
  cpuThreads?: number;
  ramTotalGb: number;
  ramFreeGb?: number;
  ramUsedPercentage?: number;
  gpuRenderer?: string;
  browserName?: string;
  drives: DriveInfo[];
  topProcesses?: ProcessItem[];
  source: 'bridge_powershell' | 'browser_client' | 'server_host';
  battery?: {
    level: number;
    charging: boolean;
    chargingTime?: number;
    dischargingTime?: number;
  };
  network?: {
    effectiveType?: string;
    downlinkMbps?: number;
    rttMs?: number;
  };
  storageQuota?: {
    usageBytes: number;
    quotaBytes: number;
    usagePercentage: number;
  };
}

export interface PcTempItem {
  id: string;
  name: string;
  description: string;
  path: string;
  estimatedBytes: number;
  risk: 'SAFE' | 'CAUTION';
  selected: boolean;
}

// 6.2 Advanced Duplicate Finder
export interface DuplicateFile {
  id: string;
  path: string;
  name: string;
  sizeBytes: number;
  modifiedTime: string;
  previewUrl?: string;
  isOriginal: boolean;
  selected: boolean;
}

export interface DuplicateGroup {
  hash: string;
  sizeBytes: number;
  files: DuplicateFile[];
}

// 6.3 Deep Storage Scanner & 6.4 Safety Center
export type DeepScanCategoryType =
  | 'large_files'
  | 'temp_files'
  | 'installers'
  | 'app_cache'
  | 'unused_downloads'
  | 'empty_dirs'
  | 'duplicate_media';

export type SafetyRiskLevel = 'SAFE' | 'REVIEW REQUIRED' | 'PROTECTED' | 'UNKNOWN';

export interface ScannedFileItem {
  id: string;
  name: string;
  path: string;
  sizeBytes: number;
  extension: string;
  category: DeepScanCategoryType;
  lastModified: string;
  risk: SafetyRiskLevel;
  reason: string;
  selected: boolean;
}

export interface CleanupOperation {
  id: string;
  timestamp: string;
  isDryRun: boolean;
  totalFiles: number;
  recoveredBytes: number;
  status: 'preview' | 'executing' | 'completed' | 'failed' | 'verified';
  riskSummary: {
    safeCount: number;
    reviewRequiredCount: number;
    protectedCount: number;
    unknownCount: number;
  };
  filePaths: string[];
  verificationNote?: string;
}

// 6.5 Realtime System Monitor
export interface SystemMetrics {
  cpuPercent: number | null; // null if unavailable on target
  ram: RamInfo;
  storageActivity: {
    readKbps: number | null;
    writeKbps: number | null;
  };
  deviceTemp: number | null;
  batteryStatus?: string | null;
  batteryLevel?: number | null;
  topProcesses: ProcessItem[];
}

// 6.6 Smart Cleanup Recommendation
export interface SmartRecommendation {
  totalRecoverableBytes: number | null;
  breakdown: {
    tempFilesBytes: number | null;
    duplicateMediaBytes: number | null;
    oldDownloadsBytes: number | null;
    installersBytes: number | null;
    appCacheBytes: number | null;
  };
  priorityRecommendation: string;
  estimatedRecoveryFormatted: string;
  isScanned: boolean;
}

// 6.7 Virus & Security Scanner
export type ThreatSeverity = 'CLEAN' | 'LOW_RISK' | 'SUSPICIOUS' | 'CRITICAL';
export type ThreatCategory =
  | 'trojan'
  | 'spyware'
  | 'adware'
  | 'suspicious_startup'
  | 'permission_abuse'
  | 'ransomware_risk'
  | 'bloatware_tracker';

export interface SecurityThreatItem {
  id: string;
  name: string;
  target: 'mobile' | 'pc';
  category: ThreatCategory;
  severity: ThreatSeverity;
  path: string;
  detectedAt: string;
  description: string;
  recommendation: string;
  quarantined?: boolean;
  fixed?: boolean;
}

export interface SecurityScanState {
  isScanning: boolean;
  scanProgress: number;
  scannedFilesCount: number;
  lastScanDate: string | null;
  threats: SecurityThreatItem[];
  overallStatus: 'secure' | 'warning' | 'danger';
}
