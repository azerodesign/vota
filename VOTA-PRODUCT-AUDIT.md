# VOTA Product Audit Report
**Project:** VOTA (Storage Intelligence & Device Optimization Platform)  
**Production Host:** `https://vota.axy.my.id/`  
**Date:** 2026-10-30  
**Status:** Completed (Stage A & Stage B: Discovery & Audit)

---

## 1. Executive Summary

This comprehensive product audit evaluates the codebase of **VOTA** located at `/home/ubuntu/repos/storagepulse`. The application is designed to operate in dual environments:
1. **Android Management via ADB**
2. **PC Desktop Management (Windows / Linux)**

The audit reveals that while the application possesses a functional real-time telemetry bridge (via Server-Sent Events and PowerShell/Python scripts) and an interactive dark UI, **substantial parts of the storage accounting, cleanup workflows, and PC desktop metrics rely on static mock data, hardcoded HTML strings, or simulated timeouts rather than live filesystem analytics**. 

Crucially, **the PC Desktop mode does not execute real filesystem analysis**, and **the storage category breakdown pills in `StorageGauge.tsx` are hardcoded to Android WhatsApp numbers (~103.7 GB total)**, explaining why a 512 GB PC drive displays identical breakdown statistics to an Android device.

---

## 2. Repository Inventory & Tech Stack

| Component | Technology | Version / Implementation | Location |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React + TypeScript | React 19.0.0, Vite 6.1.0, TailwindCSS 3.4.17 | `src/` |
| **Backend Server** | Node.js ESM Native | Node v22.23.3 (`http`, `fs`, `path`) | `server.mjs` |
| **Reverse Proxy & SSL** | Caddy v2 | Auto-HTTPS via Let's Encrypt | `/etc/caddy/Caddyfile` |
| **Device Bridge** | PowerShell 5.1+ / Python 3 | Polling ADB CLI every 2s, HTTP REST & SSE | `scripts/bridge.ps1`, `scripts/bridge.py` |
| **Icons & Styling** | Lucide React + Tailwind | `lucide-react@0.475.0` | `src/components/` |

---

## 3. In-Depth Functional Audit

### 3.1 Android Management Audit

| Feature | Audit Status | Evidence File & Line | Assessment & Behavior |
| :--- | :--- | :--- | :--- |
| **ADB Device Discovery** | **FULLY IMPLEMENTED** (with Bridge) / **MOCK FALLBACK** (Offline) | `scripts/bridge.ps1:48-55`<br>`server.mjs:14-25` | When `bridge.ps1` runs, it executes `adb get-serialno`, `getprop ro.product.brand`, etc. When offline, `server.mjs` serves hardcoded Xiaomi device state (`yhso8t7xeuganb7t`). |
| **Battery & Temperature** | **FULLY IMPLEMENTED** (with Bridge) / **MOCK FALLBACK** (Offline) | `scripts/bridge.ps1:66-77`<br>`server.mjs:20-24` | `bridge.ps1` parses `dumpsys battery` (`level`, `temperature / 10.0`, status). Offline fallback is static 84%, 32.0°C. |
| **RAM Telemetry** | **FULLY IMPLEMENTED** (with Bridge) / **MOCK FALLBACK** (Offline) | `scripts/bridge.ps1:79-91`<br>`server.mjs:32-38` | `bridge.ps1` parses `cat /proc/meminfo` (`MemTotal`, `MemAvailable`, `MemFree`, `Buffers`). Offline fallback is static 7.8 GB total, 3.9 GB available. |
| **Storage Overview (`/data`)** | **PARTIALLY IMPLEMENTED** | `scripts/bridge.ps1:93-107`<br>`src/App.tsx:38-43` | `bridge.ps1` parses `df -k /data`. However, breakdown into categories (WhatsApp, Cache, Downloads) is **not computed dynamically**; it is hardcoded. |
| **WhatsApp Sent Cleaner** | **PARTIALLY IMPLEMENTED / RISKY** | `src/lib/adbService.ts:25-31`<br>`src/App.tsx:189-211` | Generates `rm -rf /sdcard/Android/media/.../*Video/Sent/*`. The UI hardcodes `freedGb = 3.25` in `src/App.tsx:201` rather than measuring bytes freed. No dry-run or path canonicalization. |
| **System Cache Trim** | **FULLY IMPLEMENTED** | `src/lib/adbService.ts:33-35`<br>`server.mjs:145-177` | Dispatches `pm trim-caches 999G` to `commandQueue`. Bridge executes via `adb shell pm trim-caches 999G`. Output logged to terminal. |
| **Bloatware Manager** | **FULLY IMPLEMENTED** | `src/lib/knownBloatware.ts:3-104`<br>`src/lib/adbService.ts:37-43` | Dispatches `pm uninstall -k --user 0 <pkg>` and `cmd package install-existing <pkg>`. Successfully executed in live session on Xiaomi bloatware. |
| **Storage Treemap & Duplicates**| **NOT IMPLEMENTED** | N/A | No interactive treemap or hash-based duplicate finder exists. |

---

### 3.2 PC Desktop Management Audit

| Feature | Audit Status | Evidence File & Line | Assessment & Behavior |
| :--- | :--- | :--- | :--- |
| **Drive Detection** | **UI ONLY / MOCKED** | `src/App.tsx:44-49`<br>`src/App.tsx:271-274` | Hardcoded: `Primary Drive C:\ SSD (NVMe Storage)`. Does not query Windows `wmic logicaldisk` or Linux `lsblk`/`df`. Multi-drive support (D:\, external) is absent. |
| **Capacity & Free Space** | **MOCK DATA** | `src/App.tsx:44-49` | Hardcoded: `total: 512.0`, `used: 345.5`, `free: 166.5`, `usagePercentage: 67`. No OS syscall or Node `fs.statfs` executed. |
| **Hardware / Drive Health** | **UI ONLY / FAKE METRIC** | `src/App.tsx:275-278` | Renders `<Cpu /> <span>Drive Health: Good (100%)</span>`. No SMART or NVMe telemetry is queried. Violates product principle against fabricated metrics. |
| **Desktop Cleanup** | **MOCK DATA / SIMULATED** | `src/App.tsx:238-256` | `handleCleanDesktopTemp` uses `setTimeout(..., 1000)` and hardcodes `freedGb = 4.8`. No files are examined or deleted in `%TEMP%` or `/tmp`. |

---

## 4. Root Cause Analysis: The 512 GB vs 103.7 GB Category Discrepancy

### Investigation Finding
In the PC Desktop view, the user observes:
- Total: `512.0 GB`, Used: `345.5 GB`, Free: `166.5 GB` (Usage: `67%`)
- Yet the category breakdown displays:
  - WhatsApp Media: `~26.5 GB`
  - Data & Cache: `~7.8 GB`
  - Downloads: `~7.4 GB`
  - Sistem & Lainnya: `~62.3 GB`
  - **Sum: `26.5 + 7.8 + 7.4 + 62.3 = 104.0 GB`** (approx. 103.7 GB).

### Root Cause
Direct inspection of [`src/components/StorageGauge.tsx#L62-L94`](file:///home/ubuntu/repos/storagepulse/src/components/StorageGauge.tsx#L62-L94) reveals that **these category breakdown pills are hardcoded HTML strings inside the shared `StorageGauge` component**:

```tsx
// src/components/StorageGauge.tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
    <div className="flex items-center gap-2 mb-1">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" />
      <span className="text-xs text-slate-400">WhatsApp Media</span>
    </div>
    <span className="text-sm font-semibold text-slate-200">~26.5 GB</span>
  </div>
  ...
```

Furthermore, in [`src/App.tsx#L265`](file:///home/ubuntu/repos/storagepulse/src/App.tsx#L265) and [`src/App.tsx#L281`](file:///home/ubuntu/repos/storagepulse/src/App.tsx#L281), `StorageGauge` is reused for both Android and PC:
```tsx
{/* Android Mode */}
<StorageGauge storage={mobileStorage} title="Penyimpanan Internal Ponsel (/data)" />

{/* Desktop Mode */}
<StorageGauge storage={desktopStorage} title="Penyimpanan Drive Utama (C:\)" />
```
Because the component does not accept category metrics as props, **it displays the same Android WhatsApp and mobile cache figures under the 512 GB PC Drive**.

---

## 5. Architectural Findings Summary

1. **Shared State Leakage**: Mobile categories and folders are statically rendered in PC views.
2. **Missing Backend Abstractions for Desktop**: No Node.js endpoint exists to query host filesystem metrics (`statvfs`, `%TEMP%` scan, SMART data).
3. **Simulated Delays & Reductions**: Cleanup actions decrement state using constant values (`3.25 GB`, `1.2 GB`, `4.8 GB`) without reading post-deletion filesystem state.
4. **Command Execution Unrestricted**: Any string submitted to `/api/exec` is queued to the bridge without whitelisting or sanitization.

---

## 6. Audit Sign-Off
- **Status:** Complete & Verified Against Source Code
- **Recommendation:** Proceed to Architecture Review & Security Audit before implementing new features.
