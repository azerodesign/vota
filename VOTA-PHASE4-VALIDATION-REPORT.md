# Laporan Integrasi & Validasi Real-World (PHASE 4) — VOTA Engine
**Tanggal Validasi:** 30 Oktober 2026  
**Target Host:** `https://vota.axy.my.id`  
**Repository:** `/home/ubuntu/repos/storagepulse`  
**Metodologi:** Pengujian otomatis via test runner node, verifikasi filesystem, audit invariant kode, dan audit keamanan telemetri.

---

## 1. Ringkasan Eksekutif Hasil Pengujian

| No | Fokus Pengujian | Status | Komponen Terkait |
| :--- | :--- | :---: | :--- |
| 1 | Validasi Akurasi Storage Treemap & Deep Scanner | **PASS** | `TreemapAnalyzer.tsx`, `DeepStorageScanner.tsx` |
| 2 | Verifikasi Duplicate Finder (SHA-256 Matching) | **PASS** | `DuplicateFinder.tsx`, `storageEngine.ts` |
| 3 | Uji Kebijakan Keep-One & Proteksi File Asli | **PASS** | `DuplicateFinder.tsx` |
| 4 | Uji Cleanup Safety Center (Dry-Run & Dummy File) | **PASS** | `CleanupSafetyCenter.tsx` |
| 5 | Verifikasi Hasil Cleanup via Filesystem | **PARTIAL** | `App.tsx`, `CleanupSafetyCenter.tsx` |
| 6 | Validasi Telemetri (CPU, RAM, I/O, Thermal, Process) | **PASS** | `RealtimeSystemMonitor.tsx`, `bridge.ps1` |
| 7 | Validasi Smart Recommendation Aktual vs Hardcoded | **PARTIAL** | `App.tsx`, `SmartRecommendationWidget.tsx` |
| 8 | Uji Izin ADB, Pembatalan (Cancellation) & Error Handling | **PASS** | `TreemapAnalyzer.tsx`, `adbService.ts` |
| 9 | Uji Regresi Mode Android vs PC Desktop | **PASS** | `App.tsx`, `Header.tsx` |
| 10 | Audit Keamanan Endpoint Server & Script Bridge | **PARTIAL** | `server.mjs`, `bridge.ps1` *(Security Finding)* |

**Total:** 7 PASS, 3 PARTIAL, 0 FAIL.

---

## 2. Rincian Temuan & Bukti Pengujian per Fitur

### 1. Storage Treemap Analyzer & Deep Scanner
* **Status:** `PASS`
* **Bukti Pengujian:**
  - Perhitungan persentase sub-folder (`child.sizeBytes / totalCurrentSize * 100`) proporsional terhadap total kapasitas direktori aktif.
  - Direktori Android Scoped Storage (`/sdcard/Android/data`) yang dibatasi kernel ditandai secara akurat dengan status `isInaccessible: true` dan badge `🔒 Inaccessible (Restricted)` sehingga sistem tidak mengalami freeze/crash saat diakses.
  - Parameter filter pada Deep Scanner (slider ukuran minimum, ekstensi `.apk`/`.zip`/`.mp4`, dan path) menyaring berkas secara deterministik tanpa melabeli berkas sebagai "tidak terpakai" hanya karena faktor waktu modifikasi.
* **Berkas Terkait:**
  - [`src/components/TreemapAnalyzer.tsx`](file:///home/ubuntu/repos/storagepulse/src/components/TreemapAnalyzer.tsx)
  - [`src/components/DeepStorageScanner.tsx`](file:///home/ubuntu/repos/storagepulse/src/components/DeepStorageScanner.tsx)

---

### 2. Duplicate Finder dengan SHA-256
* **Status:** `PASS`
* **Bukti Pengujian:**
  - Mengimplementasikan penyaringan dua tahap: pra-filter ukuran berkas identik terlebih dahulu, diikuti dengan komputasi hash kriptografis SHA-256 (dan opsi *Partial + Full SHA-256* untuk efisiensi berkas video &gt;1GB).
  - Berkas dengan hash yang sama dikelompokkan dalam satu kartu grup yang menampilkan path asli, tipe berkas, dan estimasi pemulihan ruang storage.
* **Berkas Terkait:**
  - [`src/components/DuplicateFinder.tsx`](file:///home/ubuntu/repos/storagepulse/src/components/DuplicateFinder.tsx)
  - [`src/lib/storageEngine.ts`](file:///home/ubuntu/repos/storagepulse/src/lib/storageEngine.ts)

---

### 3. Kebijakan Keep-One Invariant & Proteksi File Asli
* **Status:** `PASS`
* **Bukti Pengujian:**
  - Diterapkan guardrail ketat pada `handleToggleFile()`:
    ```typescript
    if (willBeSelectedCount >= grp.files.length) {
      alert('Peringatan Keamanan VOTA: Anda tidak boleh menghapus semua salinan berkas. Setidaknya 1 berkas asli wajib disimpan!');
      return file;
    }
    ```
  - Tombol seleksi otomatis (`handleAutoSelectSafely()`) hanya menandai `idx > 0`, sementara berkas pertama (`idx === 0`) otomatis dikunci dengan badge `🔒 Berkas Asli (Dilindungi)`.
* **Berkas Terkait:**
  - [`src/components/DuplicateFinder.tsx#L35-L55`](file:///home/ubuntu/repos/storagepulse/src/components/DuplicateFinder.tsx#L35-L55)

---

### 4. Cleanup Safety Center (Dry-Run & Dummy File Test)
* **Status:** `PASS`
* **Bukti Pengujian:**
  - Pengujian simulasi dengan berkas dummy `/tmp/vota_dummy_safety_test.bin` membuktikan mode **Dry-Run (default ON)** tidak mengeksekusi perintah penghapusan fisik.
  - Mode **Live Execution** mewajibkan konfirmasi eksplisit (`userConfirmed`) melalui checkbox persetujuan.
  - Berkas dengan kategori risiko `UNKNOWN` dan `PROTECTED` secara absolut diblokir dari antrean eksekusi.
* **Berkas Terkait:**
  - [`src/components/CleanupSafetyCenter.tsx#L30-L90`](file:///home/ubuntu/repos/storagepulse/src/components/CleanupSafetyCenter.tsx#L30-L90)

---

### 5. Verifikasi Hasil Cleanup via Filesystem
* **Status:** `PARTIAL`
* **Temuan:**
  - Di sisi antarmuka, pembersihan diverifikasi dengan catatan konfirmasi kapasitas `df -k /data`, dan state berkas terhapus difilter dari memori browser.
  - Namun, di sisi script bridge belum ada verifikasi individual per-path menggunakan perintah `test -e <path>` pasca-eksekusi `rm` untuk memastikan berkas benar-benar lenyap dari filesystem sebelum status dilaporkan berhasil.
* **Rekomendasi Tindakan:**
  - Tambahkan loop verifikasi `if (-not (Test-Path $file)) { $verified = $true }` di script bridge.
* **Berkas Terkait:**
  - [`src/App.tsx#L400-L440`](file:///home/ubuntu/repos/storagepulse/src/App.tsx#L400-L440)
  - [`scripts/bridge.ps1#L150-L168`](file:///home/ubuntu/repos/storagepulse/scripts/bridge.ps1#L150-L168)

---

### 6. Validasi Monitoring Sistem Realtime
* **Status:** `PASS`
* **Bukti Pengujian:**
  - Beban CPU diekstrak langsung via ADB `top -n 1 -m 3 -b`.
  - Alokasi RAM dipetakan secara akurat dari `/proc/meminfo` (`MemTotal`, `MemAvailable`, `MemFree`, `Buffers`).
  - Suhu baterai dan status pengisian terbaca dari `dumpsys battery`.
  - Antarmuka membedakan secara transparan antara data aktual yang terukur (`Live dumpsys`) dan data yang dibatasi izin kernel (`N/A Restricted Kernel`).
* **Berkas Terkait:**
  - [`src/components/RealtimeSystemMonitor.tsx`](file:///home/ubuntu/repos/storagepulse/src/components/RealtimeSystemMonitor.tsx)
  - [`scripts/bridge.ps1#L110-L140`](file:///home/ubuntu/repos/storagepulse/scripts/bridge.ps1#L110-L140)

---

### 7. Validasi Smart Recommendation (Aktual vs Hardcoded)
* **Status:** `PARTIAL`
* **Temuan:**
  - Widget rekomendasi di antarmuka menampilkan ringkasan persis sesuai format spesifikasi (Potentially Recoverable, Temporary Files, Duplicate Media, Old Downloads).
  - Namun, nilai tersebut saat ini masih membaca state awal `INITIAL_SMART_RECOMMENDATION` dan belum dikaitkan secara reaktif menggunakan `useMemo` terhadap agregat berkas terpilih di `scannedFiles` dan `duplicateGroups`.
* **Rekomendasi Tindakan:**
  - Hubungkan agregat `smartRec` langsung ke `useMemo(() => computeSmartRec(scannedFiles, duplicateGroups), [scannedFiles, duplicateGroups])`.
* **Berkas Terkait:**
  - [`src/App.tsx#L102`](file:///home/ubuntu/repos/storagepulse/src/App.tsx#L102)
  - [`src/components/SmartRecommendationWidget.tsx`](file:///home/ubuntu/repos/storagepulse/src/components/SmartRecommendationWidget.tsx)

---

### 8. Uji Izin ADB, Pembatalan (Cancellation) & Error Handling
* **Status:** `PASS`
* **Bukti Pengujian:**
  - Pembatalan proses pemindaian berjalan responsif melalui tombol `Batalkan Scan` yang memicu fungsi pembatalan `__votaScanCancel` dan mereset status UI ke kondisi stabil.
  - Direktori yang terkendala izin Android Scoped Storage ditangani dengan graceful fallback tanpa memutus koneksi telemetri.
* **Berkas Terkait:**
  - [`src/components/TreemapAnalyzer.tsx#L50-L80`](file:///home/ubuntu/repos/storagepulse/src/components/TreemapAnalyzer.tsx#L50-L80)

---

### 9. Uji Regresi Mode Android & Desktop PC
* **Status:** `PASS`
* **Bukti Pengujian:**
  - Pengalihan mode antara *Android (ADB)* dan *Desktop PC* berfungsi secara independen:
    - Mode Android menampilkan banner perangkat ADB, gauge storage internal ponsel, telemetri kernel, dan modul Phase 3.
    - Mode PC menampilkan kapasitas drive utama (C:\ SSD), status kesehatan drive, dan pembersih file sementara `%TEMP%`.
  - Tidak terjadi konflik state atau kebocoran data antar-mode.
* **Berkas Terkait:**
  - [`src/App.tsx#L450-L550`](file:///home/ubuntu/repos/storagepulse/src/App.tsx#L450-L550)
  - [`src/components/Header.tsx`](file:///home/ubuntu/repos/storagepulse/src/components/Header.tsx)

---

### 10. Audit Keamanan Endpoint & Script Bridge
* **Status:** `PARTIAL (SECURITY FINDING IDENTIFIED)`
* **Temuan Keamanan Kritis (Security Finding):**
  - Endpoint `POST /api/exec` di `server.mjs` saat ini menerima string perintah bebas `{ command }` dari siapa pun tanpa autentikasi token/secret dan memiliki header CORS terbuka (`Access-Control-Allow-Origin: *`).
  - Script bridge di laptop menjalankan perintah yang ada di antrean server secara langsung via `adb shell $cmd.command`.
  - **Risiko:** Siapa pun yang mengakses URL publik `https://vota.axy.my.id/api/exec` berpotensi menyuntikkan perintah ADB sembarangan ke ponsel pengguna yang sedang tersambung.
* **Rekomendasi Solusi:**
  1. Pasang **Command Whitelist** di `server.mjs`: Hanya izinkan awalan perintah terdaftar (misal: `pm trim-caches`, `pm uninstall -k --user 0`, `rm -f /sdcard/...`).
  2. Tambahkan **Session Pairing Secret / Bearer Token** antara script bridge lokal dan antarmuka web.
* **Catatan Regulasi:**
  - Sesuai instruksi pengujian, tidak ada kode aplikasi yang diubah selama tahap audit. Perbaikan keamanan ini menunggu persetujuan eksplisit dari pengguna.
* **Berkas Terkait:**
  - [`server.mjs#L145-L177`](file:///home/ubuntu/repos/storagepulse/server.mjs#L145-L177)
  - [`scripts/bridge.ps1#L150-L168`](file:///home/ubuntu/repos/storagepulse/scripts/bridge.ps1#L150-L168)
