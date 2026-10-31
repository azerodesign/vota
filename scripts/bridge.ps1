# VOTA Realtime ADB Bridge (PowerShell)
# Target Server: __SERVER_URL__
$ErrorActionPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  VOTA Real-Time ADB Engine v1.0                    " -ForegroundColor Green
Write-Host "  Live Dashboard: __SERVER_URL__                    " -ForegroundColor White
Write-Host "=====================================================" -ForegroundColor Cyan

# Locate ADB
$adb = "adb"
if (Test-Path ".\adb.exe") {
    $adb = ".\adb.exe"
} elseif (Test-Path ".\platform-tools\adb.exe") {
    $adb = ".\platform-tools\adb.exe"
}

$hasAdb = $false
try {
    $checkAdb = & $adb version
    if ($checkAdb) { $hasAdb = $true }
} catch {
    $hasAdb = $false
}

# Auto-download platform-tools if not found
if (-not $hasAdb) {
    Write-Host "`n[!] adb.exe tidak ditemukan di folder ini atau sistem PATH." -ForegroundColor Yellow
    Write-Host "[*] Mengunduh Android SDK Platform-Tools resmi dari Google..." -ForegroundColor Cyan
    $zipUrl = "https://dl.google.com/android/repository/platform-tools-latest-windows.zip"
    $zipPath = "$env:TEMP\platform-tools-latest-windows.zip"
    $currentDir = (Get-Location).Path

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
        Write-Host "[*] Mengekstrak platform-tools ke folder saat ini..." -ForegroundColor Cyan
        Expand-Archive -Path $zipPath -DestinationPath $currentDir -Force
        Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

        if (Test-Path ".\platform-tools\adb.exe") {
            $adb = ".\platform-tools\adb.exe"
            Write-Host "[OK] Platform-Tools Google berhasil dipasang di .\platform-tools!" -ForegroundColor Green
        } elseif (Test-Path ".\adb.exe") {
            $adb = ".\adb.exe"
            Write-Host "[OK] adb.exe siap digunakan!" -ForegroundColor Green
        }
    } catch {
        Write-Host "[ERROR] Gagal download otomatis: $_" -ForegroundColor Red
        Write-Host "Silakan download manual dari: $zipUrl" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "[OK] ADB terdeteksi! Memulai sinkronisasi real-time..." -ForegroundColor Green
Write-Host "Tekan Ctrl+C untuk berhenti.`n" -ForegroundColor Gray

$serverApi = "__SERVER_URL__/api/bridge/report"
$resultApi = "__SERVER_URL__/api/bridge/result"

# Helper: Robust Device Metadata Discovery with Retry & Sanitize
function Get-AdbDeviceMetadata {
    param($adbPath)
    try {
        $devs = & $adbPath devices
        $hasAuthDevice = $false
        foreach ($line in ($devs -split "`r?`n")) {
            if ($line -match "^([a-zA-Z0-9._:-]+)\s+device$") {
                $hasAuthDevice = $true
                break
            }
        }
        if (-not $hasAuthDevice) { return $null }

        $rawSerial = (& $adbPath get-serialno)
        $cleanSerial = ""
        foreach ($line in ($rawSerial -split "`r?`n")) {
            $t = $line.Trim()
            if ($t -and -not ($t.StartsWith("*")) -and ($t -ne "unknown")) {
                $cleanSerial = $t
                break
            }
        }
        if (-not $cleanSerial) { return $null }

        $b = (& $adbPath shell getprop ro.product.brand).Trim()
        $m = (& $adbPath shell getprop ro.product.model).Trim()
        $v = (& $adbPath shell getprop ro.build.version.release).Trim()
        $sdk = (& $adbPath shell getprop ro.build.version.sdk).Trim()

        if (-not $b) { $b = "Android" }
        if (-not $m) { $m = "Phone" }
        if (-not $v) { $v = "Unknown" }

        return @{
            serial = $cleanSerial
            brand = $b
            model = $m
            version = $v
            sdk = $sdk
        }
    } catch {
        return $null
    }
}

$cachedDeviceInfo = $null
$lastIntervalMs = 2000
$prevCpuTotal = $null
$prevCpuIdle = $null

while ($true) {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

    try {
        # 1. Device Discovery & Identity
        $devLines = @(& $adb devices 2>$null)
        $authorizedSerial = $null
        $hasUnauthorized = $false
        foreach ($line in $devLines) {
            if ($line -match "^([a-zA-Z0-9._:-]+)\s+device$") {
                $authorizedSerial = $matches[1]
                break
            } elseif ($line -match "^([a-zA-Z0-9._:-]+)\s+unauthorized$") {
                $hasUnauthorized = $true
            }
        }

        if ($authorizedSerial) {
            if (-not $cachedDeviceInfo -or $cachedDeviceInfo.serial -ne $authorizedSerial) {
                $cachedDeviceInfo = Get-AdbDeviceMetadata -adbPath $adb
                if ($cachedDeviceInfo) {
                    Write-Host "`n[DEVICE CONNECTED] $($cachedDeviceInfo.brand) $($cachedDeviceInfo.model) (Serial: $($cachedDeviceInfo.serial)) Android $($cachedDeviceInfo.version)" -ForegroundColor Green
                }
            }
        } else {
            $cachedDeviceInfo = $null
            if ($hasUnauthorized) {
                Write-Host "[PERINGATAN] Ponsel terdeteksi tetapi BELUM DIIZINKAN! Silakan buka layar HP Anda dan centang 'Selalu Izinkan' lalu klik OK (Allow USB Debugging)." -ForegroundColor Yellow
            } else {
                Write-Host "[WAITING] Menunggu ponsel... Sambungkan kabel USB HP ke laptop (pastikan USB Debugging aktif di HP)." -ForegroundColor DarkYellow
            }
        }

        # 2. Collect Phone Telemetry ONLY IF Device is Connected & Authorized
        $battLevel = $null
        $battTemp = $null
        $battVoltage = $null
        $battStatus = "Discharging"
        $battHealth = "Good"
        $memTotal = $null
        $memAvail = $null
        $memFree = $null
        $buffers = $null
        $cached = $null
        $swapTotal = $null
        $swapFree = $null
        $ramUsedPct = $null
        $storageTotal = $null
        $storageUsed = $null
        $storageFree = $null
        $storagePct = $null
        $cpuPct = $null

        if ($cachedDeviceInfo) {
            # Battery Info (dumpsys battery)
            $battRaw = & $adb shell dumpsys battery 2>$null
            $rawLevel = $null
            $battScale = 100
            foreach ($line in ($battRaw -split "`r?`n")) {
                if ($line -match "^\s*level:\s*(\d+)") { $rawLevel = [int]$matches[1] }
                if ($line -match "^\s*scale:\s*(\d+)") { $battScale = [int]$matches[1] }
                if ($line -match "^\s*temperature:\s*(\d+)") { $battTemp = [math]::Round(([double]$matches[1]) / 10.0, 1) }
                if ($line -match "^\s*voltage:\s*(\d+)") { $battVoltage = [int]$matches[1] }
                if ($line -match "^\s*status:\s*(\d+)") {
                    switch ([int]$matches[1]) {
                        2 { $battStatus = "Charging" }
                        3 { $battStatus = "Discharging" }
                        4 { $battStatus = "Not charging" }
                        5 { $battStatus = "Full" }
                        default { $battStatus = "Discharging" }
                    }
                }
                if ($line -match "^\s*health:\s*(\d+)") {
                    switch ([int]$matches[1]) {
                        2 { $battHealth = "Good" }
                        3 { $battHealth = "Overheat" }
                        4 { $battHealth = "Dead" }
                        5 { $battHealth = "Over voltage" }
                        6 { $battHealth = "Unspecified failure" }
                        7 { $battHealth = "Cold" }
                        default { $battHealth = "Good" }
                    }
                }
            }
            if ($null -ne $rawLevel -and $battScale -gt 0) {
                $battLevel = [math]::Round(($rawLevel / $battScale) * 100)
            }

            # RAM Info (/proc/meminfo)
            $memRaw = & $adb shell "cat /proc/meminfo 2>/dev/null"
            foreach ($line in ($memRaw -split "`r?`n")) {
                if ($line -match "MemTotal:\s*(\d+)") { $memTotal = [int64]$matches[1] }
                if ($line -match "MemAvailable:\s*(\d+)") { $memAvail = [int64]$matches[1] }
                if ($line -match "MemFree:\s*(\d+)") { $memFree = [int64]$matches[1] }
                if ($line -match "Buffers:\s*(\d+)") { $buffers = [int64]$matches[1] }
                if ($line -match "^Cached:\s*(\d+)") { $cached = [int64]$matches[1] }
                if ($line -match "SwapTotal:\s*(\d+)") { $swapTotal = [int64]$matches[1] }
                if ($line -match "SwapFree:\s*(\d+)") { $swapFree = [int64]$matches[1] }
            }
            if ($memTotal -and $memAvail) {
                $ramUsedPct = [math]::Round((($memTotal - $memAvail) / $memTotal) * 100)
            }

            # Storage Info (/data)
            $dfRaw = & $adb shell "df -k /data 2>/dev/null | tail -n 1"
            $dfParts = ($dfRaw -split "\s+") | Where-Object { $_ -ne "" }
            if ($dfParts.Count -ge 5) {
                $storageTotal = [math]::Round([double]$dfParts[1] / 1048576, 2)
                $storageUsed = [math]::Round([double]$dfParts[2] / 1048576, 2)
                $storageFree = [math]::Round([double]$dfParts[3] / 1048576, 2)
                $pctStr = $dfParts[4].Replace("%","")
                $storagePct = [int]$pctStr
            }

            # CPU Usage
            try {
                $statRaw = & $adb shell "cat /proc/stat 2>/dev/null"
                $statLine = ($statRaw -split "`r?`n") | Where-Object { $_ -match "^cpu\s+" } | Select-Object -First 1
                if ($statLine) {
                    $parts = ($statLine -split "\s+") | Where-Object { $_ -ne "" -and $_ -ne "cpu" }
                    $totalTicks = 0
                    foreach ($p in $parts) { $totalTicks += [int64]$p }
                    $idleTicks = [int64]$parts[3]
                    if ($parts.Count -gt 4) { $idleTicks += [int64]$parts[4] }

                    if ($prevCpuTotal -and $prevCpuIdle) {
                        $dTotal = $totalTicks - $prevCpuTotal
                        $dIdle = $idleTicks - $prevCpuIdle
                        if ($dTotal -gt 0) {
                            $rawPct = (($dTotal - $dIdle) / $dTotal) * 100
                            $cpuPct = [math]::Round([math]::Max(0.0, [math]::Min(100.0, $rawPct)), 1)
                        }
                    }
                    $prevCpuTotal = $totalTicks
                    $prevCpuIdle = $idleTicks
                }
            } catch {}

            if ($null -eq $cpuPct) {
                try {
                    $topRaw = & $adb shell "top -n 1 -m 3 -b 2>/dev/null"
                    foreach ($line in ($topRaw -split "`r?`n")) {
                        if ($line -match "(\d+)%\s*cpu") {
                            $rawTop = [double]$matches[1]
                            $cpuPct = if ($rawTop -gt 100) { [math]::Round($rawTop / 8.0, 1) } else { $rawTop }
                        }
                    }
                } catch {}
            }
        }

        # Construct JSON payload
        $devicePayload = @{
            status = if ($cachedDeviceInfo) { "connected" } else { "waiting" }
            id = if ($cachedDeviceInfo) { $cachedDeviceInfo.serial } else { $null }
            brand = if ($cachedDeviceInfo) { $cachedDeviceInfo.brand } else { "Android" }
            model = if ($cachedDeviceInfo) { $cachedDeviceInfo.model } else { "Device" }
            androidVersion = if ($cachedDeviceInfo) { $cachedDeviceInfo.version } else { $null }
            battery = $battLevel
            batteryTemp = $battTemp
            batteryStatus = $battStatus
            batteryHealth = $battHealth
            batteryVoltage = $battVoltage
            cpuPercent = $cpuPct
            actualIntervalMs = $lastIntervalMs
            bridgeType = "laptop"
        }

        $ramPayload = @{
            totalKb = $memTotal
            availableKb = $memAvail
            freeKb = $memFree
            buffersKb = $buffers
            cachedKb = $cached
            swapTotalKb = $swapTotal
            swapFreeKb = $swapFree
            usedPercentage = $ramUsedPct
        }

        $storagePayload = @{
            total = $storageTotal
            used = $storageUsed
            free = $storageFree
            usagePercentage = $storagePct
        }

        # 6. Host Laptop / PC Hardware Specs & Drives (Real Telemetry)
        $pcPayload = $null
        try {
            $osInfo = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
            $csInfo = Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue
            $cpuInfo = Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue | Select-Object -First 1
            $disks = @(Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" -ErrorAction SilentlyContinue | ForEach-Object {
                @{
                    device = $_.DeviceID
                    volumeName = if ($_.VolumeName) { $_.VolumeName } else { "Local Disk ($($_.DeviceID))" }
                    totalGb = [math]::Round([double]$_.Size / 1GB, 2)
                    freeGb = [math]::Round([double]$_.FreeSpace / 1GB, 2)
                    usedGb = [math]::Round(([double]$_.Size - [double]$_.FreeSpace) / 1GB, 2)
                    usedPercentage = if ($_.Size -gt 0) { [math]::Round((([double]$_.Size - [double]$_.FreeSpace) / [double]$_.Size) * 100) } else { 0 }
                    fsType = $_.FileSystem
                }
            })
            if ($osInfo) {
                $ramTotal = [math]::Round([double]$osInfo.TotalVisibleMemorySize / 1MB, 2)
                $ramFree = [math]::Round([double]$osInfo.FreePhysicalMemory / 1MB, 2)
                $ramUsed = [math]::Round($ramTotal - $ramFree, 2)
                $ramPct = if ($ramTotal -gt 0) { [math]::Round(($ramUsed / $ramTotal) * 100) } else { 0 }
                $topProc = @(Get-Process -ErrorAction SilentlyContinue | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 | ForEach-Object {
                    @{
                        name = $_.ProcessName
                        pid = [string]$_.Id
                        rssKb = [math]::Round($_.WorkingSet64 / 1024)
                        cpuPercent = [math]::Round($_.CPU, 1)
                    }
                })

                $pcPayload = @{
                    hostname = $env:COMPUTERNAME
                    osName = $osInfo.Caption
                    osVersion = $osInfo.Version
                    platform = "windows"
                    cpuName = $cpuInfo.Name
                    cpuCores = $cpuInfo.NumberOfCores
                    cpuThreads = $cpuInfo.NumberOfLogicalProcessors
                    ramTotalGb = $ramTotal
                    ramFreeGb = $ramFree
                    ramUsedPercentage = $ramPct
                    drives = $disks
                    topProcesses = $topProc
                    source = "bridge_powershell"
                }
            }
        } catch {}

        $payload = @{
            device = $devicePayload
            ram = $ramPayload
            storage = $storagePayload
            pcInfo = $pcPayload
        } | ConvertTo-Json -Depth 5

        # Send report to server
        $response = Invoke-RestMethod -Uri $serverApi -Method Post -Body $payload -ContentType "application/json; charset=utf-8" -TimeoutSec 5
        
        $now = (Get-Date).ToString("HH:mm:ss")
        if ($cachedDeviceInfo) {
            $ramAvailStr = if ($memAvail) { "$([math]::Round($memAvail / 1048576, 2)) GB" } else { "N/A" }
            $stFreeStr = if ($storageFree) { "$storageFree GB" } else { "N/A" }
            $intervalSecStr = [math]::Round($lastIntervalMs / 1000.0, 1)
            Write-Host "[$now] [LIVE-SYNC HP] $($cachedDeviceInfo.brand) $($cachedDeviceInfo.model) | RAM Bebas: $ramAvailStr | Storage Bebas: $stFreeStr | Baterai: $battLevel% ($battTemp°C) | Interval: ${intervalSecStr}s" -ForegroundColor Green
        } else {
            Write-Host "[$now] [PC-BRIDGE AKTIF] Partisi Windows C:\ D:\ tersinkronisasi | Menunggu HP dihubungkan via kabel USB..." -ForegroundColor DarkYellow
        }

        # Check for pending commands to execute
        if ($response.pendingCommands -and $response.pendingCommands.Count -gt 0) {
            foreach ($cmd in $response.pendingCommands) {
                if ($cmd.command -eq "disconnect" -or $cmd.command -eq "adb disconnect") {
                    Write-Host ""
                    Write-Host "=====================================================" -ForegroundColor Yellow
                    Write-Host "[DISCONNECT] Perintah pemutusan ADB diterima dari Web!" -ForegroundColor Yellow
                    Write-Host "[DISCONNECT] Memutuskan sambungan dan menghentikan bridge..." -ForegroundColor Yellow
                    Write-Host "=====================================================" -ForegroundColor Yellow
                    try { & $adb disconnect } catch {}
                    $resPayload = @{
                        id = $cmd.id
                        command = $cmd.command
                        output = "Disconnected cleanly"
                        success = $true
                    } | ConvertTo-Json
                    try { Invoke-RestMethod -Uri $resultApi -Method Post -Body $resPayload -ContentType "application/json" -TimeoutSec 5 | Out-Null } catch {}
                    exit 0
                }
                Write-Host "[$now] [EXEC-CMD] Menjalankan perintah dari web: $($cmd.command)..." -ForegroundColor Yellow
                $cmdOutput = (& $adb shell $cmd.command 2>&1) | Out-String
                Write-Host "[$now] [RESULT] $($cmdOutput.Trim())" -ForegroundColor Green
                
                $resPayload = @{
                    id = $cmd.id
                    command = $cmd.command
                    output = $cmdOutput.Trim()
                    success = $true
                } | ConvertTo-Json

                Invoke-RestMethod -Uri $resultApi -Method Post -Body $resPayload -ContentType "application/json" -TimeoutSec 5 | Out-Null
            }
        }
    } catch {
        Write-Host "[WARNING] Gagal sinkronisasi ($($_.Exception.Message)). Mencoba kembali..." -ForegroundColor DarkYellow
        $cachedDeviceInfo = $null # Force reconnect on failure
    }

    $stopwatch.Stop()
    $workMs = $stopwatch.ElapsedMilliseconds
    # Target 2.0s loop cycle: dynamically subtract work execution time
    $sleepMs = [math]::Max(500, 2000 - $workMs)
    $lastIntervalMs = [int]($workMs + $sleepMs)

    Start-Sleep -Milliseconds $sleepMs
}
