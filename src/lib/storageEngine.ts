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

export const INITIAL_DUPLICATES: DuplicateGroup[] = [
  {
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sizeBytes: 1.45 * 1024 * 1024 * 1024, // 1.45 GB video
    files: [
      {
        id: 'dup-1a',
        name: 'VID_20261015_ProjectReview.mp4',
        path: '/sdcard/Movies/VID_20261015_ProjectReview.mp4',
        sizeBytes: 1.45 * 1024 * 1024 * 1024,
        modifiedTime: '2026-10-15 14:22',
        isOriginal: true,
        selected: false,
      },
      {
        id: 'dup-1b',
        name: 'VID_20261015_ProjectReview.mp4',
        path: '/sdcard/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/WhatsApp Business Video/Sent/VID_20261015_ProjectReview.mp4',
        sizeBytes: 1.45 * 1024 * 1024 * 1024,
        modifiedTime: '2026-10-16 09:10',
        isOriginal: false,
        selected: true,
      },
    ],
  },
  {
    hash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    sizeBytes: 0.9 * 1024 * 1024 * 1024, // 900 MB video
    files: [
      {
        id: 'dup-2a',
        name: 'Workshop_Recording_Part1.mp4',
        path: '/sdcard/Download/Workshop_Recording_Part1.mp4',
        sizeBytes: 0.9 * 1024 * 1024 * 1024,
        modifiedTime: '2026-09-20 18:00',
        isOriginal: true,
        selected: false,
      },
      {
        id: 'dup-2b',
        name: 'Workshop_Recording_Part1.mp4',
        path: '/sdcard/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/WhatsApp Business Video/Sent/Workshop_Recording_Part1.mp4',
        sizeBytes: 0.9 * 1024 * 1024 * 1024,
        modifiedTime: '2026-09-21 11:35',
        isOriginal: false,
        selected: true,
      },
    ],
  },
  {
    hash: '5d41402abc4b2a76b9719d911017c592b21ee417f7796d4993d03831776bb580',
    sizeBytes: 15.4 * 1024 * 1024, // 15.4 MB image
    files: [
      {
        id: 'dup-3a',
        name: 'IMG_20261020_ProductShoot.jpg',
        path: '/sdcard/DCIM/Camera/IMG_20261020_ProductShoot.jpg',
        sizeBytes: 15.4 * 1024 * 1024,
        modifiedTime: '2026-10-20 10:15',
        isOriginal: true,
        selected: false,
      },
      {
        id: 'dup-3b',
        name: 'IMG_20261020_ProductShoot.jpg',
        path: '/sdcard/Download/Telegram/IMG_20261020_ProductShoot.jpg',
        sizeBytes: 15.4 * 1024 * 1024,
        modifiedTime: '2026-10-20 12:40',
        isOriginal: false,
        selected: true,
      },
    ],
  },
];

export const INITIAL_SCANNED_ITEMS: ScannedFileItem[] = [
  {
    id: 'sc-1',
    name: 'WhatsApp Video Sent Folder',
    path: '/sdcard/Android/media/com.whatsapp.w4b/WhatsApp Business/Media/WhatsApp Business Video/Sent',
    sizeBytes: 3.0 * 1024 * 1024 * 1024,
    extension: '.mp4',
    category: 'duplicate_media',
    lastModified: '2026-10-29',
    risk: 'SAFE',
    reason: 'Duplikat file video terkirim ke chat WhatsApp. Berkas asli masih ada di Galeri.',
    selected: true,
  },
  {
    id: 'sc-2',
    name: 'System App Caches (Instagram, TikTok, Browser)',
    path: '/data/data/*/cache',
    sizeBytes: 1.2 * 1024 * 1024 * 1024,
    extension: '.cache',
    category: 'app_cache',
    lastModified: '2026-10-30',
    risk: 'SAFE',
    reason: 'Cache data sementara yang dapat dipotong via perintah resmi pm trim-caches.',
    selected: true,
  },
  {
    id: 'sc-3',
    name: 'CapCut_v12.4.0_installer.apk',
    path: '/sdcard/Download/CapCut_v12.4.0_installer.apk',
    sizeBytes: 185 * 1024 * 1024,
    extension: '.apk',
    category: 'installers',
    lastModified: '2026-08-14',
    risk: 'SAFE',
    reason: 'File paket installer APK lama di folder Download. Aplikasi sudah terpasang di sistem.',
    selected: true,
  },
  {
    id: 'sc-4',
    name: 'MobileLegends_OBB_Backup.zip',
    path: '/sdcard/Download/MobileLegends_OBB_Backup.zip',
    sizeBytes: 1.27 * 1024 * 1024 * 1024,
    extension: '.zip',
    category: 'unused_downloads',
    lastModified: '2026-07-20',
    risk: 'REVIEW REQUIRED',
    reason: 'Arsip besar di folder Download. Periksa apakah arsip ini masih kamu perlukan sebelum dihapus.',
    selected: false,
  },
  {
    id: 'sc-5',
    name: 'System Firmware OTA Staging',
    path: '/data/ota_package/update.zip',
    sizeBytes: 2.4 * 1024 * 1024 * 1024,
    extension: '.zip',
    category: 'large_files',
    lastModified: '2026-10-25',
    risk: 'PROTECTED',
    reason: 'Paket sistem pembaruan OS HyperOS. Dilindungi oleh proteksi integritas Android.',
    selected: false,
  },
  {
    id: 'sc-6',
    name: 'custom_config_bin.dat',
    path: '/sdcard/.config_blob/unknown.dat',
    sizeBytes: 45 * 1024 * 1024,
    extension: '.dat',
    category: 'temp_files',
    lastModified: '2026-09-02',
    risk: 'UNKNOWN',
    reason: 'Format biner tak dikenal dari aplikasi pihak ketiga. Dilarang dihapus otomatis demi keamanan data.',
    selected: false,
  },
  {
    id: 'sc-7',
    name: 'Empty Thumbnails Dir',
    path: '/sdcard/DCIM/.thumbnails_empty',
    sizeBytes: 0,
    extension: '',
    category: 'empty_dirs',
    lastModified: '2026-10-10',
    risk: 'SAFE',
    reason: 'Direktori kosong tanpa berkas.',
    selected: true,
  },
];

export const INITIAL_SMART_RECOMMENDATION: SmartRecommendation = {
  totalRecoverableBytes: 4.82 * 1024 * 1024 * 1024,
  breakdown: {
    tempFilesBytes: 1.2 * 1024 * 1024 * 1024,
    duplicateMediaBytes: 2.35 * 1024 * 1024 * 1024,
    oldDownloadsBytes: 1.27 * 1024 * 1024 * 1024,
    installersBytes: 0.185 * 1024 * 1024 * 1024,
    appCacheBytes: 1.2 * 1024 * 1024 * 1024,
  },
  priorityRecommendation: 'Review duplicate media first.',
  estimatedRecoveryFormatted: '4.82 GB',
};

export const INITIAL_SYSTEM_METRICS: SystemMetrics = {
  cpuPercent: 14.8, // Active measurements
  ram: {
    totalKb: 7833420,
    availableKb: 3908224,
    freeKb: 64688,
    buffersKb: 4300,
    usedPercentage: 50,
  },
  storageActivity: {
    readKbps: 1840,
    writeKbps: 420,
  },
  deviceTemp: 32.0,
  batteryStatus: 'Charging',
  batteryLevel: 84,
  topProcesses: [
    { name: 'system_server', pid: '1679', rssKb: 659120, cpuPercent: 4.2 },
    { name: 'com.whatsapp', pid: '15227', rssKb: 496923, cpuPercent: 3.1 },
    { name: 'com.android.systemui', pid: '28738', rssKb: 388897, cpuPercent: 2.4 },
    { name: 'com.google.android.gms', pid: '24926', rssKb: 334700, cpuPercent: 1.8 },
    { name: 'com.miui.home', pid: '24239', rssKb: 240404, cpuPercent: 1.1 },
  ],
};

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
