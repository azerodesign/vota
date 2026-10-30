# VOTA Security Audit & Data Safety Assessment
**Project:** VOTA (Storage Intelligence & Device Optimization Platform)  
**Host Target:** `https://vota.axy.my.id/`  
**Date:** 2026-10-30  
**Scope:** Frontend Codebase, Backend Server, Bridge Scripts, ADB Integrations, Safety Boundaries

---

## 1. Threat Model & Executive Summary

VOTA provides an interface that can execute system-level operations on both connected Android smartphones (via ADB) and the host PC. Because ADB commands operate with high privileges (Android `AID_SHELL`), and because the web server is exposed publicly via HTTPS (`vota.axy.my.id`), **strict security controls, input validation, and authorization boundaries are mandatory**.

The audit identified **one Critical vulnerability (Arbitrary Command Execution)**, **two High vulnerabilities (Unsafe Shell Interpolation and Open API without Auth)**, and **two Medium findings (Deceptive UI Metrics and Insecure Script Piping)**.

---

## 2. Vulnerability Findings & Technical Evidence

### 2.1 [CRITICAL] SEC-01: Remote Command Execution via Public `/api/exec`
- **CVSS Score:** 9.8 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)
- **Vulnerable Location:** [`server.mjs#L145-L177`](file:///home/ubuntu/repos/storagepulse/server.mjs#L145-L177) and [`scripts/bridge.ps1#L137-L149`](file:///home/ubuntu/repos/storagepulse/scripts/bridge.ps1#L137-L149)
- **Mechanism:**
  In `server.mjs`:
  ```javascript
  if (pathname === '/api/exec' && req.method === 'POST') {
    req.on('end', () => {
      const { command } = JSON.parse(body);
      deviceState.commandQueue.push({ id: cmdId, command, createdAt: Date.now() });
      ...
  ```
  In `scripts/bridge.ps1`:
  ```powershell
  if ($response.pendingCommands) {
    foreach ($cmd in $response.pendingCommands) {
      $cmdOutput = (& $adb shell $cmd.command 2>&1) | Out-String
  ```
- **Exploit Scenario:**
  Because `server.mjs` has no authentication and accepts wildcards via CORS (`Access-Control-Allow-Origin: *`), any external attacker or malicious web page can POST to `https://vota.axy.my.id/api/exec`:
  ```bash
  curl -X POST https://vota.axy.my.id/api/exec \
    -H "Content-Type: application/json" \
    -d '{"command": "rm -rf /sdcard/*"}'
  ```
  The bridge running on the user's laptop will automatically pull this command within 2 seconds and execute `adb shell rm -rf /sdcard/*` on the connected smartphone, destroying personal data without user awareness.
- **Remediation:**
  1. **Abolish raw command execution**: Disallow passing arbitrary shell strings over the wire.
  2. **Implement Typed Action Dispatcher**: The API must only accept strict Action Enums (e.g. `ACTION_TRIM_CACHE`, `ACTION_DEBLOAT_PACKAGE`), where parameters are strictly validated using regex:
     - Package Name: `/^[a-zA-Z0-9._]{3,128}$/`
  3. **Pairing Token / Nonce**: Issue a temporary local session secret generated during bridge startup, required in the `Authorization: Bearer <token>` header for all destructive operations.

---

### 2.2 [HIGH] SEC-02: Unvalidated Recursive Shell Globbing in Media Cleanup
- **CVSS Score:** 7.5 (CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:H)
- **Vulnerable Location:** [`src/lib/adbService.ts#L25-L31`](file:///home/ubuntu/repos/storagepulse/src/lib/adbService.ts#L25-L31)
- **Mechanism:**
  ```typescript
  static cleanWhatsAppSent(isBusiness: boolean = true): string {
    const basePath = isBusiness
      ? '/sdcard/Android/media/com.whatsapp.w4b/WhatsApp\\ Business/Media'
      : '/sdcard/Android/media/com.whatsapp/WhatsApp/Media';
    
    return `adb shell "rm -rf ${basePath}/*Video/Sent/* ${basePath}/*Images/Sent/* ${basePath}/*Documents/Sent/*"`;
  }
  ```
- **Risk Assessment:**
  1. The glob pattern `/*Video/Sent/*` expands inside shell quotation without boundary checks. If spaces or directory paths are parsed inconsistently across different Android toybox/toolbox versions, unintended files outside `Sent/` can be erased.
  2. There is no dry-run inspection, file count verification, or verification that target files actually reside inside `com.whatsapp`.
- **Remediation:**
  1. Enforce canonical path checking before deletion.
  2. Use itemized file deletion or explicit target validation (`find ... -path "*/Sent/*" -delete`) instead of blind `rm -rf`.

---

### 2.3 [HIGH] SEC-03: CORS Wildcard and Unauthenticated Telemetry
- **CVSS Score:** 7.1 (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N)
- **Vulnerable Location:** [`server.mjs#L112-L114`](file:///home/ubuntu/repos/storagepulse/server.mjs#L112-L114)
- **Mechanism:**
  `Access-Control-Allow-Origin: *` allows any website visited in the user's browser to read device telemetry (`/api/status`), including device serial numbers, battery health, and connected hardware details.
- **Remediation:**
  Restrict CORS origins to authorized hostnames (`https://vota.axy.my.id`) and bind local development origins explicitly.

---

### 2.4 [MEDIUM] SEC-04: Fabricated Security & Health Telemetry
- **CVSS Score:** 5.3 (CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N)
- **Vulnerable Location:** [`src/App.tsx#L275-L278`](file:///home/ubuntu/repos/storagepulse/src/App.tsx#L275-L278) and [`src/App.tsx#L238-L256`](file:///home/ubuntu/repos/storagepulse/src/App.tsx#L238-L256)
- **Observation:**
  - Renders `<Cpu /> <span>Drive Health: Good (100%)</span>` with zero hardware queries.
  - Renders desktop cleanup as freeing `4.8 GB` with a `setTimeout` dummy function.
- **Impact:**
  Violates safety and trust principles. Users may assume their NVMe drive is healthy when it is failing, or assume disk space was freed when disk was untouched.
- **Remediation:**
  Remove mock indicators. If S.M.A.R.T. health is unavailable, explicitly display `S.M.A.R.T. Unavailable`.

---

## 3. Strict Protected Path Policies

The Safety Engine must enforce non-deletable path boundaries across all platforms:

### 3.1 Android Protected Paths
The following directories must be hard-blocked from deletion under all circumstances:
- `/system`, `/vendor`, `/apex`, `/boot`, `/recovery`
- `/data/data` (Application internal storage and databases)
- `/sdcard` root (Deletion must be scoped to specific disposable leaves)
- `/sdcard/DCIM` (Personal camera photos and videos)
- `/sdcard/Documents`
- Any path containing `..` (Path traversal prevention)

### 3.2 PC Desktop Protected Paths
The following Windows and Linux directories must be hard-blocked from deletion:
- Windows: `C:\Windows`, `C:\Program Files`, `C:\Program Files (x86)`, `C:\ProgramData`, System Volume Information, `$Recycle.Bin`
- Linux: `/`, `/bin`, `/sbin`, `/usr`, `/etc`, `/boot`, `/lib`, `/dev`, `/sys`, `/proc`
- User Home directories in their entirety (`~`, `%USERPROFILE%`)

---

## 4. Deletion Protocol & Safety State Machine

Every cleanup operation must transition through four mandatory states:

```
[ IDENTIFY ] ──> [ PREVIEW / DRY-RUN ] ──> [ EXPLICIT CONFIRM ] ──> [ VERIFIED EXECUTE ]
      │                   │                         │                         │
Scans directory    Estimates bytes         User reviews targets       Measures post-state
Identifies hash    Displays count          Issues one-time nonce      Logs operation journal
```

- **Rule 1: Never delete without dry-run preview.**
- **Rule 2: Never delete all copies of a duplicate (always preserve original).**
- **Rule 3: Always verify bytes freed against post-deletion filesystem state.**
