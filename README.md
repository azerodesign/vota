# ⚡ StoragePulse (Desktop & ADB Mobile Memory Optimizer)

Modern, ultra-fast storage cleaner and ADB device optimizer built with **React 19 + TypeScript + Tailwind CSS** designed for **Tauri v2** desktop deployment.

---

## 🌟 Key Features

### 1. 📱 Android Phone Optimization (via ADB)
* **Smart WhatsApp Cleaner:** Safely deletes duplicate sent files (`WhatsApp Business Video/Sent`, `Images/Sent`, `Documents/Sent`) without affecting received chat media or camera gallery.
* **1-Click System Cache Trim:** Executes `pm trim-caches 999G` to reclaim multi-gigabyte application cache instantly.
* **No-Root Safe Debloater:** Uses `pm uninstall -k --user 0` to disable ad services and preinstalled bloatware (such as Xiaomi GetApps `com.mi.appfinder` and MIUI System Ads `com.miui.msa.global`) with 1-click restore.
* **Visual Storage Treemap:** Real-time breakdown of internal storage and largest directories.

### 2. 🖥️ Local Desktop PC Optimization
* **Temporary Files & Crash Dump Cleaner:** Scans and clears `%TEMP%`, Windows Update cache, and browser junk.
* **Storage Gauges:** Live drive health and capacity gauges.

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```

---

## 📦 Packaging with Tauri v2

```bash
# Add Tauri CLI
npm install --save-dev @tauri-apps/cli

# Initialize Tauri
npx tauri init

# Build desktop installer (.exe / .dmg / .deb)
npx tauri build
```
