# VOTA — Feature Status Matrix
**Document Version:** 1.0.0  
**Target Codebase:** VOTA (`/home/ubuntu/repos/storagepulse`)  
**Status:** Completed (Stage A Discovery & Stage B Audit)

---

## 1. Feature Classification Summary

* **Implemented (Real):** The feature executes real platform commands/APIs and delivers verified data.
* **Partial:** The feature connects to real APIs or commands, but contains unverified assumptions, lacks error boundaries, or has security weaknesses.
* **Mocked / Hardcoded:** The feature renders UI backed by hardcoded strings, static objects, or fake timer decrements.
* **Missing:** The feature is planned or expected by the product specification but has no implementation in the codebase.
* **Broken:** The feature fails to execute, throws runtime/syntax errors, or produces incorrect calculations.

---

## 2. Complete Feature Matrix

| Feature | Status | Evidence in Code | Impact & Observation | Target Phase |
| :--- | :--- | :--- | :--- | :--- |
| **Android ADB Device Discovery** | **Implemented (Real)** | `scripts/bridge.ps1#L48-L56`, `server.mjs#L173-L198` | Queries `adb get-serialno`, `getprop ro.product.brand`, model, and version dynamically. | Existing |
| **Android Live Battery Telemetry** | **Implemented (Real)** | `scripts/bridge.ps1#L66-L81`, `src/components/DeviceBanner.tsx#L97-L126` | Realtime level, status, and temperature polled via `dumpsys battery`. | Existing |
| **Android Live RAM Telemetry** | **Implemented (Real)** | `scripts/bridge.ps1#L83-L96`, `src/components/DeviceBanner.tsx#L128-L141` | Realtime `MemTotal`, `MemAvailable`, and `MemFree` extracted from `/proc/meminfo`. | Existing |
| **Android Storage Gauge (/data)** | **Partial** | `scripts/bridge.ps1#L98-L113`, `src/components/StorageGauge.tsx#L40-L59` | Total and used space queried via `df -k /data`, but category breakdown is completely hardcoded. | Phase 1 (Task 1.2) |
| **Storage Category Breakdown** | **Broken / Mocked** | `src/components/StorageGauge.tsx#L62-L94` | Sums to ~104 GB of hardcoded phone categories, shown on both Android and 512 GB Desktop views. | Phase 1 (Task 1.2) |
| **PC Drive Capacity & Metrics** | **Mocked** | `src/App.tsx#L59-L64`, `src/App.tsx#L376` | Static state `{ total: 512.0, used: 345.5, free: 166.5 }`; no real drive discovery on host PC. | Phase 1 (Task 1.2) |
| **PC Drive Health Indicator** | **Broken / Mocked** | `src/App.tsx#L370-L373` | Hardcoded JSX string `Drive Health: Good (100%)`; does not query SMART or NVMe sensors. | Phase 1 (Task 1.3) |
| **WhatsApp Sent Cleaner** | **Partial / Dangerous** | `src/lib/adbService.ts#L25-L31`, `src/App.tsx#L147-L161` | Runs dangerous wildcard `rm -rf *Video/Sent/*`; recovery of +3.25 GB is hardcoded in state. | Phase 1 & 3 |
| **System Cache Optimizer** | **Partial** | `src/lib/adbService.ts#L33-L35`, `src/App.tsx#L171-L184` | Executes real `pm trim-caches 999G`, but assumes fixed +1.2 GB recovery without verifying `df`. | Phase 1 & 3 |
| **Safe Debloat Manager** | **Partial** | `src/lib/knownBloatware.ts#L3-L104`, `src/components/DebloatModal.tsx` | Excellent bloatware catalog; executes `pm uninstall -k --user 0`, but lacks live package installed check. | Phase 2 |
| **Desktop Temp File Cleaner** | **Mocked** | `src/App.tsx#L212-L230` | Pure simulated `setTimeout` subtracting 4.8 GB from static state; deletes zero files. | Phase 3 |
| **Realtime Telemetry SSE Stream** | **Implemented (Real)** | `server.mjs#L123-L138`, `src/App.tsx#L131-L180` | Native Server-Sent Events stream delivering updates to browser with zero reload. | Existing |
| **1-Click Auto-Installer for ADB** | **Implemented (Real)** | `scripts/bridge.ps1#L26-L54` | Automatically downloads and unzips Google SDK `platform-tools` if missing on host. | Existing |
| **Platform-Tools Download Center** | **Implemented (Real)** | `src/components/BridgeModal.tsx#L200-L280`, `server.mjs#L238-L244` | Direct links to official Google binaries for Windows, macOS, and Linux. | Existing |
| **Storage Treemap Analyzer (6.1)** | **Missing** | Not implemented | Required for visual hierarchical folder drill-down and size sorting. | Phase 3 (Task 3.1) |
| **Advanced Duplicate Finder (6.2)** | **Missing** | Not implemented | Required for cryptographic SHA-256 duplicate detection and preview. | Phase 3 (Task 3.2) |
| **Deep Storage Scanner (6.3)** | **Missing** | Not implemented | Required for multi-filter scanning (>100MB, APKs, installers, empty folders). | Phase 3 (Task 3.3) |
| **Cleanup Safety Center (6.4)** | **Missing** | Not implemented | Required for dry-run preview, risk categorization, and operation history ledger. | Phase 3 (Task 3.4) |
| **Realtime System Monitor (6.5)** | **Partial** | `src/components/DeviceBanner.tsx#L85-L150` | Displays battery and RAM, but lacks CPU %, disk I/O, and unavailable-metric distinctions. | Phase 3 (Task 3.5) |
| **Smart Recommendations (6.6)** | **Missing** | Not implemented | Required for intelligent recovery opportunities analysis and suggestion. | Phase 4 (Task 4.1) |
| **Command Injection Protection** | **Broken / Vulnerable** | `server.mjs#L140-L167`, `scripts/bridge.ps1#L135`, `scripts/bridge.py#L55` | Remote command injection vulnerability permits arbitrary shell commands from unauthenticated callers. | Phase 1 (Task 1.1) |
| **Protected Path Blacklist** | **Missing** | Not implemented | No mechanism prevents deletion of system partitions or app databases. | Phase 1 & 2 |
