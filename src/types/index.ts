export type DeviceMode = 'android' | 'desktop';

export interface AdbDevice {
  id: string;
  model: string;
  brand: string;
  androidVersion: string;
  status: 'connected' | 'unauthorized' | 'offline';
  battery?: number;
}

export interface StorageInfo {
  total: number; // in GB
  used: number;  // in GB
  free: number;  // in GB
  usagePercentage: number;
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

export interface CleanAction {
  id: string;
  title: string;
  description: string;
  estimatedSavingGb: number;
  type: 'wa_sent' | 'trim_cache' | 'downloads_apk' | 'debloat_ads';
  dangerLevel: 'safe' | 'warning';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}
