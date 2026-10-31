<div align="center">

# ⚡ VOTA (Voice of Telemetry & Storage Analytics)

### Next-Gen Real-Time Storage, ADB Telemetry & Virus Threat Scanner
**Open Source • Zero-Root Safe • Multi-Platform (Android & Windows) • Vercel Ready**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/azerodesign/vota)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://github.com/azerodesign/vota/actions)
[![Android Compatibility](https://img.shields.io/badge/Android-10%20to%2016%20HyperOS-emerald)](https://vota.axy.my.id)
[![Windows Compatibility](https://img.shields.io/badge/Windows-10%20%26%2011%20Pro-blue)](https://vota.axy.my.id)

---

**Live Demo Dashboard:** [https://vota.axy.my.id](https://vota.axy.my.id) • **Default Master Key:** `vota2026`

</div>

---

## 🌟 What is VOTA?

**VOTA** is a modern, high-performance web and terminal telemetry engine designed to audit, visualize, clean, and protect storage across **Android smartphones** and **Windows laptops / PCs** in real-time.

Built with **React 19, TypeScript, Tailwind CSS, and Node.js**, VOTA operates under a strict **Zero-Mock Policy**: every single byte count, battery temperature, CPU load, and RAM partition shown is directly queried from real hardware APIs via ADB and Windows WMI/CIM.

---

## 🚀 Key Capabilities

### 1. 📱 Android Device Optimizer (via Wireless / Termux / USB ADB)
* **Zero-PC Mobile Mode:** Connect your phone directly using Termux without needing any computer or cable.
* **Smart WhatsApp Media Purge:** Safely removes duplicate forwarded files (`WhatsApp Video/Sent`, `Images/Sent`, `Documents/Sent`) without affecting received chats or gallery photos.
* **1-Click System Cache Trim:** Reclaims gigabytes of cached application data safely (`pm trim-caches 999G`).
* **Safe Bloatware & Adware Manager:** Deactivates intrusive carrier packages, GetApps, and telemetry daemons with 1-click restore.
* **Live Telemetry Stream:** Real-time battery temperature, charging voltage, RAM buffer breakdown, and CPU frequency.

### 2. 🖥️ Windows PC & Laptop Engine
* **Physical Drive Diagnostics:** Audits physical SSD/HDD partitions (`C:\`, `D:\`) with capacity warning gauges.
* **1-Click Windows Optimizer:**
  - Clears `%TEMP%` and temporary installation extraction directories.
  - Empties Recycle Bin (`$Recycle.Bin`).
  - Purges old Windows Update cache (`C:\Windows\SoftwareDistribution\Download`).
  - Flushes DNS Resolver Cache and Windows Explorer thumbnail database.
* **Live Process Task Manager:** Live audit of top Windows processes sorted by RAM and CPU usage.

### 3. 🗺️ Proportional 2D Squarified Treemap
* Interactive 2D hierarchical squarified storage map for both Android internal storage and Windows Drive C:.
* Category themes (System, Applications, Media, Downloads, Cache).
* Interactive drill-down zoom, breadcrumbs navigation, tile inspector, and list/tree view toggles.

### 4. 🛡️ Heuristic Virus & Security Threat Scanner
* **Android Threats:** Audits sideloaded APKs for dangerous permissions (`RECEIVE_SMS` / OTP interceptors, `SYSTEM_ALERT_WINDOW` screen overlay phishing, and accessibility service abuse).
* **Windows Threats:** Scans for hidden startup persistence scripts (`.vbs`, `.bat`), unsigned executables lurking in `%TEMP%`, and malicious browser extensions.
* **1-Click Neutralizer:** Quarantines or safely eliminates identified threats with zero risk to operating system stability.

### 5. 👯 Duplicate Finder & Deep Storage Scanner
* Bit-accurate duplicate file scanner preserving original files while eliminating redundant copies.
* Deep scanner identifying forgotten massive files (disk ISOs, installer `.msi`/`.exe`, crash memory dumps).

---

## ⚡ 1-Click Deploy to Vercel (Public Multi-User)

VOTA is fully optimized to run on **Vercel Serverless & Edge Network**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/azerodesign/vota)

### Multi-Tenant Architecture
Every user or team can use their own private Room ID:
```text
https://your-vota-app.vercel.app/?room=my-room-name
```
The bridge script connects directly to that isolated room:
```powershell
powershell -ExecutionPolicy Bypass -c "irm 'https://your-vota-app.vercel.app/bridge.ps1?room=my-room-name' | iex"
```

---

## 💻 Quickstart Guide

### Option A: Connect Windows Laptop (1-Line PowerShell)
Open **PowerShell** on your Windows laptop and run:
```powershell
powershell -ExecutionPolicy Bypass -c "irm https://vota.axy.my.id/bridge.ps1 | iex"
```
*Automatically downloads Google platform-tools if not installed, reads physical drive partitions, and bridges connected USB Android devices.*

### Option B: Connect Android Phone (Without PC via Termux)
1. Install **Termux** from F-Droid.
2. Enable **Wireless Debugging** in Developer Options on your phone.
3. Open Termux and paste:
```bash
pkg install -y android-tools curl && curl -sL https://vota.axy.my.id/bridge.sh | bash
```

### Option C: Self-Host via VPS / Docker / Node.js
```bash
# 1. Clone the repository
git clone https://github.com/azerodesign/vota.git
cd vota

# 2. Install dependencies
npm install

# 3. Build frontend production assets
npm run build

# 4. Start backend server
node server.mjs
```
The web dashboard will be available at `http://localhost:5173`.

---

## 🔒 Security & Authentication

* **Access Key Gate:** Protected by default master keys (`vota2026`, `vota-admin`) or custom environment variable `VOTA_ACCESS_KEY`.
* **Zero Elevated Permissions Required:** Does not require Android root (`su`) or Windows Administrator rights for standard telemetries.
* **Disconnect Kill-Switch:** 1-Click "Putuskan ADB" button in web interface immediately terminates active bridges.

---

## 🤝 Contributing

Contributions from the open source community are warmly welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development workflow.

---

## 📄 License

This project is open-sourced under the **[MIT License](LICENSE)**.

Copyright © 2026 [Azero Design](https://github.com/azerodesign) & VOTA Contributors.
