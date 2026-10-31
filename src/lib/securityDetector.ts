import { SecurityThreatItem, SecurityScanState } from '../types';

export const INITIAL_SECURITY_THREATS_MOBILE: SecurityThreatItem[] = [
  {
    id: 'mob_threat_1',
    name: 'Trojan.AndroidOS.FakeDoc.apk',
    target: 'mobile',
    category: 'trojan',
    severity: 'CRITICAL',
    path: '/sdcard/Download/Surat_Undangan_Pernikahan.apk',
    detectedAt: 'Hari ini',
    description: 'Berkas APK berbahaya yang menyamar sebagai dokumen, meminta izin pembacaan SMS dan OTP secara otomatis.',
    recommendation: 'Hapus berkas installer APK ini segera sebelum terpasang di sistem.',
    quarantined: false,
    fixed: false,
  },
  {
    id: 'mob_threat_2',
    name: 'Overlay.Adware.AggressivePush',
    target: 'mobile',
    category: 'adware',
    severity: 'SUSPICIOUS',
    path: '/data/app/~~com.fastcleaner.booster/base.apk',
    detectedAt: 'Kemarin',
    description: 'Aplikasi pembersih palsu yang meminta izin SYSTEM_ALERT_WINDOW untuk memunculkan iklan di atas layar.',
    recommendation: 'Copot pemasangan aplikasi dan nonaktifkan izin tampilan di atas aplikasi lain.',
    quarantined: false,
    fixed: false,
  },
  {
    id: 'mob_threat_3',
    name: 'Xiaomi Analytics & Ad Daemon',
    target: 'mobile',
    category: 'bloatware_tracker',
    severity: 'LOW_RISK',
    path: 'com.miui.analytics',
    detectedAt: 'Bawaan Pabrik',
    description: 'Layanan analitik sistem bawaan yang mengirimkan log diagnostik dan rekomendasi iklan ke server Xiaomi.',
    recommendation: 'Aman untuk dinonaktifkan (Debloat) melalui ADB tanpa risiko bootloop.',
    quarantined: false,
    fixed: false,
  },
];

export const INITIAL_SECURITY_THREATS_PC: SecurityThreatItem[] = [
  {
    id: 'pc_threat_1',
    name: 'Trojan.Win32.HiddenDrop.exe',
    target: 'pc',
    category: 'trojan',
    severity: 'CRITICAL',
    path: 'C:\\Users\\x280\\AppData\\Local\\Temp\\patcher_update_982.exe',
    detectedAt: 'Hari ini',
    description: 'Berkas eksekusi mencurigakan tanpa tanda tangan digital valid yang mencoba berjalan otomatis dari folder Temp.',
    recommendation: 'Karantina dan hapus berkas ini dari folder %TEMP%.',
    quarantined: false,
    fixed: false,
  },
  {
    id: 'pc_threat_2',
    name: 'StartupPersistence.Script.vbs',
    target: 'pc',
    category: 'suspicious_startup',
    severity: 'SUSPICIOUS',
    path: 'C:\\Users\\x280\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\helper_sync.vbs',
    detectedAt: '2 hari lalu',
    description: 'Skrip VBScript tersembunyi yang dijalankan secara otomatis setiap kali Windows dinyalakan.',
    recommendation: 'Hapus entri startup ini untuk mempercepat booting dan mencegah eksekusi latar belakang.',
    quarantined: false,
    fixed: false,
  },
  {
    id: 'pc_threat_3',
    name: 'BrowserAdware.ShoppingHelper',
    target: 'pc',
    category: 'adware',
    severity: 'LOW_RISK',
    path: 'C:\\Users\\x280\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\mchd...adware',
    detectedAt: 'Minggu lalu',
    description: 'Ekstensi peramban pihak ketiga yang menyisipkan tautan afiliasi dan iklan pop-up pada tab browser.',
    recommendation: 'Hapus ekstensi ini dari setelan Google Chrome / Microsoft Edge.',
    quarantined: false,
    fixed: false,
  },
];

export function getInitialSecurityState(target: 'mobile' | 'pc'): SecurityScanState {
  const threats = target === 'mobile' ? INITIAL_SECURITY_THREATS_MOBILE : INITIAL_SECURITY_THREATS_PC;
  return {
    isScanning: false,
    scanProgress: 100,
    scannedFilesCount: target === 'mobile' ? 2450 : 8420,
    lastScanDate: 'Hari ini, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    threats,
    overallStatus: threats.some((t) => t.severity === 'CRITICAL' && !t.fixed) ? 'danger' : 'warning',
  };
}
