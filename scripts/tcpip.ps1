# =====================================================
# VOTA — Automatic ADB TCP/IP 5555 Activator
# Pancing port 5555 agar HP bisa jalan mandiri (HP-Only)
# =====================================================

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  VOTA ADB TCP/IP Port Activator (Port 5555)         " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Cari binary adb.exe
$adb = "adb"
$found = $false
try {
    $null = & adb version 2>&1
    if ($LASTEXITCODE -eq 0) { $found = $true }
} catch {}

if (-not $found) {
    $candidates = @(
        ".\platform-tools\adb.exe",
        ".\adb.exe",
        "$env:TEMP\platform-tools\adb.exe",
        "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
        "$env:USERPROFILE\platform-tools\adb.exe",
        "$env:USERPROFILE\Downloads\platform-tools\adb.exe"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) {
            $adb = (Resolve-Path $c).Path
            $found = $true
            break
        }
    }
}

if (-not $found) {
    Write-Host "[*] Mencari adb.exe di folder lokal..." -ForegroundColor Yellow
    $search = Get-ChildItem -Path @(".", "$env:TEMP", "$env:USERPROFILE\Downloads") -Filter "adb.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($search) {
        $adb = $search.FullName
        $found = $true
    }
}

if (-not $found) {
    Write-Host "[*] Mengunduh platform-tools Google resmi ke folder sementara..." -ForegroundColor Cyan
    $zipUrl = "https://dl.google.com/android/repository/platform-tools-latest-windows.zip"
    $zipPath = "$env:TEMP\platform-tools-latest-windows.zip"
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
        Expand-Archive -Path $zipPath -DestinationPath "$env:TEMP\vota-adb" -Force
        Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
        $adb = "$env:TEMP\vota-adb\platform-tools\adb.exe"
        $found = $true
    } catch {
        Write-Host "[ERROR] Gagal download otomatis adb: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[*] Menjalankan perintah: adb tcpip 5555..." -ForegroundColor Cyan
$out = (& $adb tcpip 5555 2>&1) | Out-String
Write-Host $out.Trim() -ForegroundColor White

if ($out -match "restarting in TCP mode" -or $out -match "5555") {
    Write-Host "`n=====================================================" -ForegroundColor Green
    Write-Host "  [SUKSES] PORT 5555 BERHASIL DIAKTIFKAN DI HP!       " -ForegroundColor Green
    Write-Host "=====================================================" -ForegroundColor Green
    Write-Host "1. SEKARANG CABUT KABEL USB DARI LAPTOP." -ForegroundColor Yellow
    Write-Host "2. LAPTOP BISA DIMATIKAN / DITUTUP LAYARNYA." -ForegroundColor Yellow
    Write-Host "`n3. Buka aplikasi TERMUX di HP Redmi kamu, lalu ketik:" -ForegroundColor Cyan
    Write-Host "   adb connect 127.0.0.1:5555" -ForegroundColor White
    Write-Host "   (Jika muncul pop-up izin debugging di HP, centang 'Selalu izinkan' lalu klik OK)" -ForegroundColor Gray
    Write-Host "`n4. Jalankan VOTA langsung di HP:" -ForegroundColor Cyan
    Write-Host "   curl -sL __SERVER_URL__/bridge.sh | sh" -ForegroundColor White
    Write-Host "=====================================================`n" -ForegroundColor Green
} else {
    Write-Host "`n[!] Perangkat belum terdeteksi via kabel USB." -ForegroundColor Red
    Write-Host "    Pastikan kabel USB masih tertancap ke laptop dan USB Debugging aktif di HP." -ForegroundColor Yellow
}
