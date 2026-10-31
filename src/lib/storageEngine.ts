import {
  TreemapNode,
  DuplicateGroup,
  ScannedFileItem,
  SmartRecommendation,
  SystemMetrics,
} from '../types';

export const INITIAL_TREEMAP_DATA: TreemapNode = {
  id: 'root',
  name: '/sdcard (Internal Storage)',
  path: '/sdcard',
  sizeBytes: 104.2 * 1024 * 1024 * 1024,
  fileCount: 42150,
  isDir: true,
  children: [
    {
      id: 'c1',
      name: 'Android',
      path: '/sdcard/Android',
      sizeBytes: 34.36 * 1024 * 1024 * 1024,
      fileCount: 22100,
      isDir: true,
      children: [
        {
          id: 'c1-1',
          name: 'media',
          path: '/sdcard/Android/media',
          sizeBytes: 26.56 * 1024 * 1024 * 1024,
          fileCount: 14200,
          isDir: true,
          children: [
            {
              id: 'c1-1-1',
              name: 'com.whatsapp.w4b (WA Business)',
              path: '/sdcard/Android/media/com.whatsapp.w4b',
              sizeBytes: 18.4 * 1024 * 1024 * 1024,
              fileCount: 9800,
              isDir: true,
              children: [
                {
                  id: 'c1-1-1-1',
                  name: 'WhatsApp Business Video/Sent',
                  path: '/sdcard/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/WhatsApp Business Video/Sent',
                  sizeBytes: 3.0 * 1024 * 1024 * 1024,
                  fileCount: 142,
                  isDir: true,
                  extension: '.mp4',
                },
                {
                  id: 'c1-1-1-2',
                  name: 'WhatsApp Business Images/Sent',
                  path: '/sdcard/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/WhatsApp Business Images/Sent',
                  sizeBytes: 0.25 * 1024 * 1024 * 1024,
                  fileCount: 410,
                  isDir: true,
                  extension: '.jpg',
                },
                {
                  id: 'c1-1-1-3',
                  name: 'Active Media & Documents',
                  path: '/sdcard/Android/media/com.whatsapp.w4b/WhatsApp Business/Media',
                  sizeBytes: 15.15 * 1024 * 1024 * 1024,
                  fileCount: 9248,
                  isDir: true,
                },
              ],
            },
            {
              id: 'c1-1-2',
              name: 'com.whatsapp (Personal)',
              path: '/sdcard/Android/media/com.whatsapp',
              sizeBytes: 8.16 * 1024 * 1024 * 1024,
              fileCount: 4400,
              isDir: true,
            },
          ],
        },
        {
          id: 'c1-2',
          name: 'data',
          path: '/sdcard/Android/data',
          sizeBytes: 7.8 * 1024 * 1024 * 1024,
          fileCount: 7900,
          isDir: true,
          isInaccessible: true, // Android 11+ Scoped Storage restriction
        },
      ],
    },
    {
      id: 'c2',
      name: 'DCIM',
      path: '/sdcard/DCIM',
      sizeBytes: 21.4 * 1024 * 1024 * 1024,
      fileCount: 3820,
      isDir: true,
      children: [
        {
          id: 'c2-1',
          name: 'Camera',
          path: '/sdcard/DCIM/Camera',
          sizeBytes: 19.8 * 1024 * 1024 * 1024,
          fileCount: 3200,
          isDir: true,
          extension: '.jpg',
        },
        {
          id: 'c2-2',
          name: 'Screenshots',
          path: '/sdcard/DCIM/Screenshots',
          sizeBytes: 1.6 * 1024 * 1024 * 1024,
          fileCount: 620,
          isDir: true,
          extension: '.png',
        },
      ],
    },
    {
      id: 'c3',
      name: 'Download',
      path: '/sdcard/Download',
      sizeBytes: 7.44 * 1024 * 1024 * 1024,
      fileCount: 410,
      isDir: true,
      children: [
        {
          id: 'c3-1',
          name: 'Old APK Installers',
          path: '/sdcard/Download/Apks',
          sizeBytes: 2.1 * 1024 * 1024 * 1024,
          fileCount: 14,
          isDir: true,
          extension: '.apk',
        },
        {
          id: 'c3-2',
          name: 'Zip Archives & Documents',
          path: '/sdcard/Download/Documents',
          sizeBytes: 5.34 * 1024 * 1024 * 1024,
          fileCount: 396,
          isDir: true,
          extension: '.zip',
        },
      ],
    },
    {
      id: 'c4',
      name: 'Movies & Video Projects',
      path: '/sdcard/Movies',
      sizeBytes: 8.5 * 1024 * 1024 * 1024,
      fileCount: 85,
      isDir: true,
      extension: '.mp4',
    },
    {
      id: 'c5',
      name: 'Other System & App Files',
      path: '/sdcard/.misc',
      sizeBytes: 32.5 * 1024 * 1024 * 1024,
      fileCount: 11535,
      isDir: true,
    },
  ],
};

export const INITIAL_DUPLICATES: DuplicateGroup[] = [];

export const INITIAL_SCANNED_ITEMS: ScannedFileItem[] = [];

export const INITIAL_SMART_RECOMMENDATION: SmartRecommendation = {
  totalRecoverableBytes: 0,
  breakdown: {
    tempFilesBytes: 0,
    duplicateMediaBytes: 0,
    oldDownloadsBytes: 0,
    installersBytes: 0,
    appCacheBytes: 0,
  },
  priorityRecommendation: 'Menunggu scan penyimpanan aktual via ADB...',
  estimatedRecoveryFormatted: '0 B',
  isScanned: false,
};

export const INITIAL_SYSTEM_METRICS: SystemMetrics = {
  cpuPercent: null,
  ram: {
    totalKb: null,
    availableKb: null,
    freeKb: null,
    buffersKb: null,
    usedPercentage: null,
  },
  storageActivity: {
    readKbps: null,
    writeKbps: null,
  },
  deviceTemp: null,
  batteryStatus: 'Offline',
  batteryLevel: null,
  topProcesses: [],
};

export function formatBytes(bytes: number | null | undefined, decimals = 2): string {
  if (bytes === null || bytes === undefined) return 'UNAVAILABLE';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
