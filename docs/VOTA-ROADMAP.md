# VOTA Development Roadmap & Implementation Plan
**Project:** VOTA (Storage Intelligence & Device Optimization Platform)  
**Document:** Prioritized Development Roadmap  
**Date:** 2026-10-30  
**Status:** Staged & Awaiting Authorization (Stage C: Technical Plan)

---

## 1. Roadmap Overview & Phasing

To transform VOTA into a dependable, production-grade storage intelligence platform, development is structured into five sequential phases, adhering strictly to the principle of **Evidence before assumptions, Correctness before features, and Safety before optimization**.

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Critical Fixes & Source of Truth Alignment (Immediate P0)     │
│ ├── SEC-01: Abolish raw shell execution; implement Typed Dispatcher    │
│ ├── FIX-01: Fix hardcoded StorageGauge breakdown (512GB vs 103.7GB)    │
│ └── FIX-02: Eliminate fabricated Drive Health & simulated desktop clean│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ PHASE 2: Core Architectural Decoupling (P0)                            │
│ ├── Modularize repository (Core, Android Engine, PC Engine, Safety)    │
│ └── Establish real PC filesystem provider via Node.js system calls     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ PHASE 3: Essential Storage & Safety Features (P0)                      │
│ ├── 3.1 Storage Treemap Analyzer (Visual directory navigation)        │
│ ├── 3.2 Advanced Duplicate Finder (SHA-256 chunked hash verification)  │
│ ├── 3.3 Deep Storage Scanner (Large files, temp, cache, installers)    │
│ ├── 3.4 Cleanup Safety Center (Mandatory dry-run & explicit approval)  │
│ └── 3.5 Realtime System Monitor (Real CPU/RAM/Thermal metrics)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ PHASE 4: Intelligence Features & Platform Expansion (P1)               │
│ ├── 4.1 Smart Cleanup Recommendations (Contextual heuristics)          │
│ ├── 4.2 Transparent Device Health Score (Measurable formula)           │
│ ├── 4.3 Multi-Drive PC Support (C:\, D:\, external storage mounts)     │
│ ├── 4.4 Storage History Tracker (Local persistent trends)              │
│ └── 4.5 Android Wireless ADB Support (TCP/IP & pairing UI)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ PHASE 5: Advanced Intelligence (P2 - Post-Stabilization)               │
│ ├── 5.1 Predictive Storage Forecasting                                │
│ ├── 5.2 Multi-Device Management Profiles                               │
│ └── 5.3 Scheduled Background Scanning & Notifications                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Task Specifications (Phase 1 & Phase 3)

### Task 1.1: Security Remediation of Command Execution (SEC-01)
- **Problem:** [`server.mjs#L145`](file:///home/ubuntu/repos/storagepulse/server.mjs#L145) receives arbitrary shell commands via unauthenticated POST to `/api/exec`, which [`scripts/bridge.ps1#L140`](file:///home/ubuntu/repos/storagepulse/scripts/bridge.ps1#L140) executes blindly.
- **Evidence:** `curl -X POST https://vota.axy.my.id/api/exec -d '{"command":"..."}'` queues arbitrary shell strings.
- **Proposed Solution:**
  1. Replace `command` string with an `action` object: `{ actionType: 'TRIM_CACHE' | 'UNINSTALL_PKG' | 'RESTORE_PKG', payload: { ... } }`.
  2. In `bridge.ps1` and `bridge.py`, execute strictly parameter-mapped CLI calls rather than shell string interpolation.
  3. Validate package names with `/^[a-zA-Z0-9._]{3,128}$/`.
- **Files Affected:** `server.mjs`, `scripts/bridge.ps1`, `scripts/bridge.py`, `src/App.tsx`, `src/lib/adbService.ts`.
- **Dependencies:** None.
- **Risk:** Low (internal contract refactoring).
- **Testing Strategy:** Unit test action schema; send invalid/malicious payloads and assert rejection.
- **Estimated Complexity:** Moderate.

---

### Task 1.2: Decouple Storage Categories & Fix 512 GB vs 103.7 GB Discrepancy
- **Problem:** [`src/components/StorageGauge.tsx#L62-L94`](file:///home/ubuntu/repos/storagepulse/src/components/StorageGauge.tsx#L62-L94) contains hardcoded Android WhatsApp numbers rendered inside both Android and PC Desktop views.
- **Evidence:** PC mode with 512 GB drive shows WhatsApp Media ~26.5 GB, Data & Cache ~7.8 GB, totaling ~104 GB.
- **Proposed Solution:**
  1. Refactor `StorageGauge` to accept dynamic props:
     ```typescript
     interface StorageCategoryPill {
       id: string;
       label: string;
       sizeGb: number;
       color: string;
     }
     ```
  2. Implement separate category computation for Android (via ADB `du` parser) and for PC (via native filesystem aggregator).
  3. Show "Analyzing categories..." during active scan rather than showing static values.
- **Files Affected:** `src/components/StorageGauge.tsx`, `src/App.tsx`, `src/types/index.ts`.
- **Dependencies:** Task 1.3.
- **Risk:** Low.
- **Testing Strategy:** Validate rendered sums against total used storage in both modes.
- **Estimated Complexity:** Low.

---

### Task 1.3: Real PC Filesystem Engine & Elimination of Mock Health
- **Problem:** Desktop cleanup ([`src/App.tsx#L238`](file:///home/ubuntu/repos/storagepulse/src/App.tsx#L238)) is a simulated `setTimeout` reducing hardcoded `4.8 GB`, and drive health is a hardcoded `<Cpu /> Drive Health: Good (100%)`.
- **Evidence:** Code review of `handleCleanDesktopTemp` and JSX line 277.
- **Proposed Solution:**
  1. Add native PC scanning endpoints in `server.mjs` / local bridge:
     - `GET /api/pc/drives`: Enumerates physical drives with free/total bytes.
     - `GET /api/pc/temp-analysis`: Scans real temporary folder `%TEMP%` (Windows) or `/tmp` (Linux) with candidate counts and sizes.
  2. Update drive health UI to either report real S.M.A.R.T. status (if elevated permissions exist) or explicitly display: `Hardware SMART Info: Requires Elevated Permissions / N/A`.
- **Files Affected:** `server.mjs`, `src/App.tsx`, `scripts/bridge.ps1`.
- **Dependencies:** Node.js `fs` / PowerShell Win32 API.
- **Risk:** Low.
- **Testing Strategy:** Verify real temporary directory sizes match OS Explorer properties.
- **Estimated Complexity:** Moderate.

---

### Task 3.1: Interactive Storage Treemap Analyzer (Feature 6.1)
- **Problem:** Users have no hierarchical visual explorer to identify which directories consume the most space.
- **Proposed Solution:**
  1. Build a responsive Canvas / SVG Treemap component displaying rectangular tiles proportional to directory size.
  2. Support clicking a folder to zoom into its children (breadcrumbs navigation).
  3. Support sorting by size, filtering by file extension, and live cancellation.
- **Files Affected:** New `src/components/Treemap/TreemapView.tsx`, `src/lib/treemapEngine.ts`.
- **Dependencies:** D3-hierarchy or lightweight custom squarified treemap algorithm (zero heavy dependencies).
- **Risk:** Low.
- **Testing Strategy:** Test deep directory hierarchies and edge cases with 0-byte or inaccessible folders.
- **Estimated Complexity:** High.

---

### Task 3.2: Advanced Duplicate Detection Engine (Feature 6.2)
- **Problem:** Duplicate cleanup is currently limited to blind WhatsApp `Sent/` folder wipes.
- **Proposed Solution:**
  1. Two-pass duplicate finder:
     - **Pass 1 (Fast Filter)**: Group candidate files by identical byte length. Singletons are discarded immediately.
     - **Pass 2 (Verification)**: Calculate SHA-256 hash in 64 KB streaming chunks.
  2. UI displays side-by-side grouped duplicates with preview thumbnails (for images/videos) and metadata.
  3. Enforce **Safety Policy: Never allow deleting all copies**. One copy must remain marked as "Original / Protected".
- **Files Affected:** New `src/components/DuplicateFinder/`, `src/lib/duplicateEngine.ts`.
- **Dependencies:** Native Web Crypto API / Node.js `crypto`.
- **Risk:** Moderate.
- **Testing Strategy:** Test against dummy directory with exact duplicates, partial duplicates, and empty files.
- **Estimated Complexity:** High.

---

### Task 3.4: Cleanup Safety Center & Dry-Run Engine (Feature 6.4)
- **Problem:** Cleanup operations execute immediately without previewing candidate file lists or confirming risk categories.
- **Proposed Solution:**
  1. Implement a unified `SafetyModal` that requires:
     - Inspection summary (File count, target paths, bytes to free).
     - Risk badge: `SAFE`, `REVIEW REQUIRED`, `PROTECTED`.
     - Explicit user toggle confirmation: "Saya mengerti tindakan ini tidak dapat dibatalkan".
  2. Execute dry-run first; only perform actual deletion upon secondary confirmation.
  3. Measure storage before and after to verify exact freed space.
- **Files Affected:** `src/components/SafetyCenter/`, `src/components/QuickActions.tsx`, `src/App.tsx`.
- **Dependencies:** None.
- **Risk:** Low.
- **Testing Strategy:** Attempt deletion with unconfirmed dialog; verify abort. Confirm deletion; verify atomic execution.
- **Estimated Complexity:** Moderate.
