export type DeviceMode = 'android' | 'desktop';

export interface AdbDevice {
  id: string;
  model: string;
  brand: string;
  androidVersion: string;
  status: 'connected' | 'unauthorized' | 'offline';
  battery?: number;
  batteryTemp?: number;
  batteryStatus?: string;
  batteryHealth?: string;
}

export interface StorageInfo {
  total: number; // in GB
  used: number;  // in GB
  free: number;  // in GB
  usagePercentage: number;
}

export interface RamInfo {
  totalKb: number;
  availableKb: number;
  freeKb?: number;
  buffersKb?: number;
  usedPercentage: number;
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
  safeToDelete: boolean;
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
  isDir: boolean;
  isInaccessible?: boolean;
  children?: TreemapNode[];
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
  batteryStatus?: string;
  batteryLevel?: number;
  topProcesses: ProcessItem[];
}

// 6.6 Smart Cleanup Recommendation
export interface SmartRecommendation {
  totalRecoverableBytes: number;
  breakdown: {
    tempFilesBytes: number;
    duplicateMediaBytes: number;
    oldDownloadsBytes: number;
    installersBytes: number;
    appCacheBytes: number;
  };
  priorityRecommendation: string;
  estimatedRecoveryFormatted: string;
}
