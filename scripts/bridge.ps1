# StoragePulse Realtime ADB Bridge (PowerShell)
# Target Server: __SERVER_URL__
$ErrorActionPreference = "SilentlyContinue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  StoragePulse Real-Time ADB Bridge v1.0            " -ForegroundColor Green
Write-Host "  Live Dashboard: __SERVER_URL__                    " -ForegroundColor White
Write-Host "=====================================================" -ForegroundColor Cyan

# Locate ADB
$adb = "adb"
if (Test-Path ".\adb.exe") {
    $adb = ".\adb.exe"
}

try {
    $checkAdb = & $adb version
    if (-not $checkAdb) {
        Write-Host "[ERROR] adb tidak ditemukan! Jalankan script ini di dalam folder platform-tools." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Gagal menjalankan adb: $_" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] ADB terdeteksi! Memulai sinkronisasi real-time..." -ForegroundColor Green

# Fetch Static Device Info
$serial = (& $adb get-serialno).Trim()
$brand = (& $adb shell getprop ro.product.brand).Trim()
$model = (& $adb shell getprop ro.product.model).Trim()
$version = (& $adb shell getprop ro.build.version.release).Trim()
if (-not $brand) { $brand = "Android" }
if (-not $model) { $model = "Device" }

Write-Host "Device Terhubung: $brand $model ($serial) Android $version" -ForegroundColor Cyan
Write-Host "Tekan Ctrl+C untuk berhenti." -ForegroundColor Gray
Write-Host ""

$serverApi = "__SERVER_URL__/api/bridge/report"
$resultApi = "__SERVER_URL__/api/bridge/result"

while ($true) {
    try {
        # 1. Battery Info
        $battRaw = & $adb shell dumpsys battery
        $battLevel = 80
        $battTemp = 30.0
        $battStatus = "Discharging"
        $battHealth = "Good"
        
        foreach ($line in ($battRaw -split "`r?`n")) {
            if ($line -match "level:\s*(\d+)") { $battLevel = [int]$matches[1] }
            if ($line -match "temperature:\s*(\d+)") { $battTemp = [math]::Round(([double]$matches[1]) / 10.0, 1) }
            if ($line -match "status:\s*2") { $battStatus = "Charging" }
            if ($line -match "health:\s*2") { $battHealth = "Good" }
        }

        # 2. RAM Info
        $memRaw = & $adb shell "cat /proc/meminfo"
        $memTotal = 8000000
        $memAvail = 4000000
        $memFree = 100000
        $buffers = 5000
        foreach ($line in ($memRaw -split "`r?`n")) {
            if ($line -match "MemTotal:\s*(\d+)") { $memTotal = [int64]$matches[1] }
            if ($line -match "MemAvailable:\s*(\d+)") { $memAvail = [int64]$matches[1] }
            if ($line -match "MemFree:\s*(\d+)") { $memFree = [int64]$matches[1] }
            if ($line -match "Buffers:\s*(\d+)") { $buffers = [int64]$matches[1] }
        }
        $ramUsedPct = [math]::Round((($memTotal - $memAvail) / $memTotal) * 100)

        # 3. Storage Info (/data)
        $dfRaw = & $adb shell "df -k /data | tail -n 1"
        $dfParts = ($dfRaw -split "\s+") | Where-Object { $_ -ne "" }
        $storageTotal = 108.0
        $storageUsed = 104.0
        $storageFree = 4.0
        $storagePct = 96
        if ($dfParts.Count -ge 5) {
            $storageTotal = [math]::Round([double]$dfParts[1] / 1048576, 1)
            $storageUsed = [math]::Round([double]$dfParts[2] / 1048576, 1)
            $storageFree = [math]::Round([double]$dfParts[3] / 1048576, 1)
            $pctStr = $dfParts[4].Replace("%","")
            $storagePct = [int]$pctStr
        }

        # Construct JSON payload
        $payload = @{
            device = @{
                id = $serial
                brand = $brand
                model = $model
                androidVersion = $version
                battery = $battLevel
                batteryTemp = $battTemp
                batteryStatus = $battStatus
                batteryHealth = $battHealth
            }
            ram = @{
                totalKb = $memTotal
                availableKb = $memAvail
                freeKb = $memFree
                buffersKb = $buffers
                usedPercentage = $ramUsedPct
            }
            storage = @{
                total = $storageTotal
                used = $storageUsed
                free = $storageFree
                usagePercentage = $storagePct
            }
        } | ConvertTo-Json -Depth 5

        # Send report to server
        $response = Invoke-RestMethod -Uri $serverApi -Method Post -Body $payload -ContentType "application/json; charset=utf-8" -TimeoutSec 5
        
        $now = (Get-Date).ToString("HH:mm:ss")
        Write-Host "[$now] [LIVE-SYNC] Baterai: $battLevel% ($battTemp°C) | RAM Tersedia: $([math]::Round($memAvail / 1048576, 1)) GB | Free Storage: $storageFree GB" -ForegroundColor DarkCyan

        # Check for pending commands to execute
        if ($response.pendingCommands -and $response.pendingCommands.Count -gt 0) {
            foreach ($cmd in $response.pendingCommands) {
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
        Write-Host "[WARNING] Gagal sinkronisasi ($($_.Exception.Message)). Mencoba kembali dalam 2 detik..." -ForegroundColor DarkYellow
    }

    Start-Sleep -Seconds 2
}
