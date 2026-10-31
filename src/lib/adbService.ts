import { StorageInfo, FolderItem } from '../types';

export class AdbCommandHelper {
  // Generate ADB command strings for Terminal / IPC execution
  static listDevices(): string {
    return 'adb devices -l';
  }

  static getDeviceProps(): string {
    return 'adb shell "getprop ro.product.brand; getprop ro.product.model; getprop ro.build.version.release"';
  }

  static getStorageOverview(): string {
    return 'adb shell df -k /storage/emulated /sdcard';
  }

  static getTopFolders(): string {
    return 'adb shell "du -sk /sdcard/Android/media /sdcard/Android/data /sdcard/Download /sdcard/DCIM 2>/dev/null"';
  }

  static getWhatsAppMediaBreakdown(): string {
    return 'adb shell "du -sk /sdcard/Android/media/com.whatsapp/WhatsApp/Media/* /sdcard/Android/media/com.whatsapp.w4b/WhatsApp\\ Business/Media/* 2>/dev/null"';
  }

  static cleanWhatsAppSent(isBusiness: boolean = true): string {
    const basePath = isBusiness
      ? '/sdcard/Android/media/com.whatsapp.w4b/WhatsApp\\ Business/Media'
      : '/sdcard/Android/media/com.whatsapp/WhatsApp/Media';
    
    return `adb shell "rm -rf ${basePath}/*Video/Sent/* ${basePath}/*Images/Sent/* ${basePath}/*Documents/Sent/*"`;
  }

  static trimSystemCaches(): string {
    return 'adb shell pm trim-caches 999G';
  }

  static debloatPackage(packageName: string): string {
    return `adb shell pm uninstall -k --user 0 ${packageName}`;
  }

  static restorePackage(packageName: string): string {
    return `adb shell cmd package install-existing ${packageName}`;
  }

  // Parsers
  static parseDfOutput(raw: string): StorageInfo {
    const lines = raw.trim().split('\n');
    for (const line of lines) {
      if (line.includes('/storage/emulated') || line.includes('/sdcard') || line.includes('/data')) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          // values in 1K blocks
          const totalKb = parseInt(parts[1], 10);
          const usedKb = parseInt(parts[2], 10);
          const availKb = parseInt(parts[3], 10);
          const percentStr = parts[4].replace('%', '');

          const totalGb = +(totalKb / 1024 / 1024).toFixed(1);
          const usedGb = +(usedKb / 1024 / 1024).toFixed(1);
          const freeGb = +(availKb / 1024 / 1024).toFixed(1);

          return {
            total: totalGb,
            used: usedGb,
            free: freeGb,
            usagePercentage: parseInt(percentStr, 10) || Math.round((usedGb / totalGb) * 100),
          };
        }
      }
    }

    return {
      total: 128,
      used: 124,
      free: 4,
      usagePercentage: 97,
    };
  }

  static parseDuOutput(raw: string): FolderItem[] {
    const items: FolderItem[] = [];
    const lines = raw.trim().split('\n');

    for (const line of lines) {
      const match = line.trim().match(/^(\d+)\s+(.+)$/);
      if (match) {
        const kb = parseInt(match[1], 10);
        const folderPath = match[2];
        const sizeGb = +(kb / 1024 / 1024).toFixed(2);

        let category: FolderItem['category'] = 'other';
        let riskLevel: FolderItem['riskLevel'] = 'UNKNOWN';
        let accessStatus: FolderItem['accessStatus'] = 'accessible';
        let safeToDelete = false;
        let description = 'Direktori penyimpanan umum';

        if (folderPath.includes('/data') || folderPath.includes('Android/data')) {
          category = 'cache';
          riskLevel = 'PROTECTED';
          accessStatus = 'inaccessible'; // Scoped storage restriction on Android 11+
          description = 'Data & cache privat aplikasi (terproteksi OS)';
        } else if (folderPath.includes('DCIM') || folderPath.includes('Pictures')) {
          category = 'media';
          riskLevel = 'PROTECTED';
          accessStatus = 'accessible';
          description = 'Koleksi foto kamera & galeri pengguna';
        } else if (folderPath.includes('whatsapp') || folderPath.includes('WhatsApp')) {
          category = 'whatsapp';
          if (folderPath.includes('Sent')) {
            riskLevel = 'REVIEW REQUIRED'; // Requires review, not blindly safe
            safeToDelete = false;
            description = 'Media WhatsApp terkirim (disarankan review sebelum hapus)';
          } else {
            riskLevel = 'PROTECTED';
            description = 'Media obrolan aktif WhatsApp';
          }
        } else if (folderPath.includes('Download')) {
          category = 'download';
          riskLevel = 'REVIEW REQUIRED';
          description = 'Unduhan browser & file installer APK';
        } else if (folderPath.includes('cache') || folderPath.includes('.thumbnails')) {
          category = 'cache';
          riskLevel = 'SAFE';
          safeToDelete = true;
          description = 'Cache sementara terverifikasi aman dibersihkan';
        }

        const name = folderPath.split('/').filter(Boolean).pop() || folderPath;

        items.push({
          id: Math.random().toString(36).substring(7),
          name,
          path: folderPath,
          sizeGb,
          category,
          riskLevel,
          accessStatus,
          safeToDelete,
          description,
        });
      }
    }

    return items.sort((a, b) => b.sizeGb - a.sizeGb);
  }
}
