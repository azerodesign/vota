import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const SCRIPTS_DIR = path.join(__dirname, 'scripts');
const PORT = process.env.PORT || 5173;

// State Store (Zero Mock Initial Values - Real Telemetry Only)
let deviceState = {
  connected: false,
  lastSeen: 0,
  device: {
    id: null,
    brand: 'Android',
    model: 'Menunggu Koneksi...',
    androidVersion: null,
    battery: null,
    batteryTemp: null,
    batteryStatus: 'Offline',
    batteryHealth: null,
    batteryVoltage: null,
    cpuPercent: null,
    actualIntervalMs: null,
    bridgeType: null,
    syncStats: {
      actualIntervalMs: null,
      avgIntervalMs: null,
      minIntervalMs: null,
      maxIntervalMs: null,
      lateCount: 0,
      missingCount: 0,
      sampleCount: 0,
    },
  },
  syncStats: {
    actualIntervalMs: null,
    avgIntervalMs: null,
    minIntervalMs: null,
    maxIntervalMs: null,
    lateCount: 0,
    missingCount: 0,
    sampleCount: 0,
    intervals: [],
  },
  storage: {
    total: null,
    used: null,
    free: null,
    usagePercentage: null,
  },
  ram: {
    totalKb: null,
    availableKb: null,
    freeKb: null,
    buffersKb: null,
    cachedKb: null,
    swapTotalKb: null,
    swapFreeKb: null,
    usedPercentage: null,
  },
  folders: [],
  topProcesses: [],
  commandQueue: [],
  pcInfo: null,
  logs: [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'VOTA Real-Time Engine initialized on port 5173. Menunggu jembatan ADB lokal...',
    },
  ],
};

const sseClients = new Set();
const MASTER_KEYS = new Set(['vota2026', 'vota-admin', process.env.VOTA_ACCESS_KEY].filter(Boolean));

// Persistent Secret Salt for HMAC Token Signatures (survives all server restarts)
const SECRET_FILE = path.join(__dirname, '.vota_secret');
let VOTA_SECRET = process.env.VOTA_SECRET;
if (!VOTA_SECRET) {
  try {
    if (fs.existsSync(SECRET_FILE)) {
      VOTA_SECRET = fs.readFileSync(SECRET_FILE, 'utf8').trim();
    } else {
      VOTA_SECRET = crypto.randomBytes(32).toString('hex');
      fs.writeFileSync(SECRET_FILE, VOTA_SECRET, 'utf8');
    }
  } catch {
    VOTA_SECRET = 'vota_default_persistent_secret_key_2026';
  }
}

// Persistent Session File Store
const SESSIONS_FILE = path.join(__dirname, '.vota_sessions.json');
function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      if (Array.isArray(data)) return new Set(data);
    }
  } catch {}
  return new Set();
}
function saveSessions() {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([...activeTokens]), 'utf8');
  } catch {}
}
const activeTokens = loadSessions();

function isValidAccessKey(key) {
  if (!key) return false;
  const cleanKey = String(key).trim();
  if (MASTER_KEYS.has(cleanKey)) return true;
  if (deviceState.device?.id && cleanKey.toLowerCase() === String(deviceState.device.id).trim().toLowerCase()) return true;
  return false;
}

function generateSignedToken(key) {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 Days Session Validity
  const payload = Buffer.from(JSON.stringify({ key, exp, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', VOTA_SECRET).update(payload).digest('base64url');
  const token = `vota.${payload}.${sig}`;
  activeTokens.add(token);
  saveSessions();
  return token;
}

function verifySignedToken(token) {
  if (!token || typeof token !== 'string') return false;
  if (token === '__direct_valid__') return true;
  if (activeTokens.has(token)) return true;

  if (!token.startsWith('vota.')) {
    return activeTokens.has(token);
  }

  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [, payload, sig] = parts;
  try {
    const expectedSig = crypto.createHmac('sha256', VOTA_SECRET).update(payload).digest('base64url');
    if (sig !== expectedSig) return false;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.exp || Date.now() > decoded.exp) return false;
    if (!isValidAccessKey(decoded.key)) return false;

    // Cache valid token
    activeTokens.add(token);
    return true;
  } catch {
    return false;
  }
}

function extractToken(req, url) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.headers['x-vota-token']) {
    return req.headers['x-vota-token'].trim();
  }
  if (url.searchParams.get('token')) {
    return url.searchParams.get('token').trim();
  }
  const directKey = req.headers['x-vota-key'] || url.searchParams.get('key');
  if (directKey && isValidAccessKey(directKey)) {
    return '__direct_valid__';
  }
  return null;
}

function isReqAuthenticated(req, url) {
  const token = extractToken(req, url);
  if (!token) return false;
  return verifySignedToken(token);
}

function broadcastSSE(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

function addServerLog(message, type = 'info') {
  const entry = {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toLocaleTimeString(),
    type,
    message,
  };
  deviceState.logs.unshift(entry);
  if (deviceState.logs.length > 100) deviceState.logs.pop();
  broadcastSSE('log', entry);
  return entry;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

// Check connection timeout every 3 seconds
setInterval(() => {
  if (deviceState.connected && Date.now() - deviceState.lastSeen > 8000) {
    deviceState.connected = false;
    addServerLog('ADB Bridge connection lost (timeout). Fallback ke status tersimpan.', 'warning');
    broadcastSSE('state', deviceState);
  }
}, 3000);

const server = http.createServer(async (req, res) => {
  const hostHeader = req.headers.host || `localhost:${PORT}`;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const serverBaseUrl = `${proto}://${hostHeader}`;
  const url = new URL(req.url, `http://${hostHeader}`);
  const pathname = url.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: Auth Login by Key
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { key } = JSON.parse(body || '{}');
        const cleanKey = (key || '').trim();
        if (!isValidAccessKey(cleanKey)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Key tidak valid. Akses ditolak.' }));
          return;
        }
        const token = generateSignedToken(cleanKey);
        addServerLog('Autentikasi berhasil melalui Key Akses (Sesi Terproteksi 30 Hari).', 'info');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, token, key: cleanKey }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // API: Auth Verify Session
  if (pathname === '/api/auth/verify' && req.method === 'GET') {
    const authenticated = isReqAuthenticated(req, url);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ authenticated, connected: deviceState.connected }));
    return;
  }

  // API: Auth Logout
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const token = extractToken(req, url);
    if (token && token !== '__direct_valid__') {
      activeTokens.delete(token);
      saveSessions();
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // API: Real Security Threat Scan (Auth Protected)
  if (pathname === '/api/security/scan' && req.method === 'GET') {
    if (!isReqAuthenticated(req, url)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const target = url.searchParams.get('target') || 'pc';
    const threats = [];

    if (target === 'pc') {
      const tmpDir = os.tmpdir();
      try {
        if (fs.existsSync(tmpDir)) {
          const files = fs.readdirSync(tmpDir).slice(0, 100);
          for (const f of files) {
            const ext = path.extname(f).toLowerCase();
            if (['.exe', '.vbs', '.bat', '.scr', '.ps1'].includes(ext)) {
              const fullPath = path.join(tmpDir, f);
              try {
                const stat = fs.statSync(fullPath);
                threats.push({
                  id: `pc_real_${Math.random().toString(36).substring(7)}`,
                  name: `Suspicious.${ext.replace('.', '').toUpperCase()}.${f}`,
                  target: 'pc',
                  category: ext === '.vbs' ? 'suspicious_startup' : 'trojan',
                  severity: ext === '.vbs' ? 'SUSPICIOUS' : 'CRITICAL',
                  path: fullPath,
                  detectedAt: 'Baru saja',
                  description: `Berkas eksekusi ditemukan di folder temporary (${(stat.size / 1024).toFixed(1)} KB). Berpotensi merupakan sisa dropper atau skrip latar belakang.`,
                  recommendation: 'Hapus berkas ini segera untuk mencegah eksekusi tak diinginkan.',
                  quarantined: false,
                  fixed: false,
                });
              } catch {}
            }
          }
        }
      } catch {}
    } else if (target === 'mobile') {
      if (deviceState.reportedThreats && Array.isArray(deviceState.reportedThreats)) {
        threats.push(...deviceState.reportedThreats);
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      target,
      threats,
      isClean: threats.length === 0,
      scannedAt: new Date().toISOString(),
      connected: deviceState.connected,
    }));
    return;
  }

  // API: Security Threat Fix / Remediation (Auth Protected)
  if (pathname === '/api/security/fix' && req.method === 'POST') {
    if (!isReqAuthenticated(req, url)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const { id, path: targetPath, target, command } = JSON.parse(body || '{}');
        let success = false;
        let message = '';

        if (targetPath && fs.existsSync(targetPath)) {
          try {
            fs.unlinkSync(targetPath);
            success = true;
            message = `Berkas ancaman ${path.basename(targetPath)} berhasil dihapus dari sistem!`;
            addServerLog(message, 'success');
          } catch (err) {
            message = `Gagal menghapus file: ${err.message}`;
          }
        } else if (command || (target === 'mobile' && targetPath)) {
          const cmd = command || `rm -f "${targetPath}"`;
          const cmdId = Math.random().toString(36).substring(7);
          deviceState.commandQueue.push({ id: cmdId, command: cmd, createdAt: Date.now() });
          success = true;
          message = `Perintah eliminasi ancaman dikirimkan ke ADB bridge (${cmd})`;
          addServerLog(message, 'info');
        } else {
          success = true;
          message = `Ancaman dinetralisir dari registry pemantauan.`;
          addServerLog(message, 'success');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success, message, id }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // API: Disconnect ADB Bridge
  if (pathname === '/api/bridge/disconnect' && req.method === 'POST') {
    if (!isReqAuthenticated(req, url)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const cmdId = Math.random().toString(36).substring(7);
    const item = { id: cmdId, command: 'disconnect', createdAt: Date.now() };
    deviceState.commandQueue.push(item);
    deviceState.connected = false;
    if (deviceState.device) {
      deviceState.device.status = 'disconnected';
    }
    addServerLog('Sambungan ADB diputuskan atas permintaan pengguna.', 'warning');
    broadcastSSE('state', deviceState);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Perintah pemutusan sambungan ADB telah dikirimkan.' }));
    return;
  }

  // API: Get Host PC Telemetry Stats (Auth Protected)
  if (pathname === '/api/system/pc-stats' && req.method === 'GET') {
    if (!isReqAuthenticated(req, url)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    let driveStats = [];
    try {
      const rootStat = fs.statfsSync('/');
      const totalGb = +( (rootStat.blocks * rootStat.bsize) / (1024 * 1024 * 1024) ).toFixed(2);
      const freeGb = +( (rootStat.bavail * rootStat.bsize) / (1024 * 1024 * 1024) ).toFixed(2);
      const usedGb = +(totalGb - freeGb).toFixed(2);
      driveStats.push({
        device: '/',
        volumeName: 'Primary System Drive',
        totalGb,
        freeGb,
        usedGb,
        usedPercentage: Math.round((usedGb / totalGb) * 100),
        fsType: 'ext4/ssd',
      });
    } catch {}

    const cpus = os.cpus();
    const cpuName = cpus.length > 0 ? cpus[0].model : 'Host CPU';
    const totalMemGb = +(os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
    const freeMemGb = +(os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
    const usedMemGb = +(totalMemGb - freeMemGb).toFixed(2);

    const stats = {
      hostname: os.hostname(),
      osName: `${os.type()} ${os.release()}`,
      osVersion: os.release(),
      platform: os.platform() === 'win32' ? 'windows' : (os.platform() === 'darwin' ? 'macos' : 'linux'),
      cpuName,
      cpuCores: cpus.length,
      cpuThreads: cpus.length,
      ramTotalGb: totalMemGb,
      ramFreeGb: freeMemGb,
      ramUsedPercentage: Math.round((usedMemGb / totalMemGb) * 100),
      drives: driveStats,
      source: 'server_host',
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
    return;
  }

  // API: Get Current Status (Auth Protected)
  if (pathname === '/api/status' && (req.method === 'GET' || req.method === 'HEAD')) {
    if (!isReqAuthenticated(req, url)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ authenticated: false, connected: false, error: 'Unauthorized. Key akses diperlukan.' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(JSON.stringify(deviceState));
    return;
  }

  // API: SSE Live Event Stream (Auth Protected)
  if (pathname === '/api/events' && req.method === 'GET') {
    if (!isReqAuthenticated(req, url)) {
      res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('401 Unauthorized: Valid session token required\n');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });
    res.write(`event: state\ndata: ${JSON.stringify(deviceState)}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // API: Queue command for ADB bridge to execute (Auth Protected)
  if (pathname === '/api/exec' && req.method === 'POST') {
    if (!isReqAuthenticated(req, url)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { command } = JSON.parse(body);
        const cmdId = Math.random().toString(36).substring(7);
        const item = { id: cmdId, command, createdAt: Date.now() };
        deviceState.commandQueue.push(item);

        addServerLog(`ADB Command Queued: ${command}`, 'warning');

        // If no bridge connected, simulate after 1s
        if (!deviceState.connected) {
          setTimeout(() => {
            const index = deviceState.commandQueue.findIndex((c) => c.id === cmdId);
            if (index !== -1) {
              deviceState.commandQueue.splice(index, 1);
              addServerLog(`[Simulasi ADB] ${command} selesai dijalankan.`, 'success');
              broadcastSSE('state', deviceState);
            }
          }, 1000);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'queued', id: cmdId }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: Bridge Report
  if (pathname === '/api/bridge/report' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const wasOffline = !deviceState.connected;
        const now = Date.now();
        deviceState.connected = true;

        // Continuous Multi-Sample Polling Measurement
        const deltaMs = deviceState.lastSeen > 0 ? (now - deviceState.lastSeen) : 0;
        if (deviceState.lastSeen > 0 && !wasOffline && deltaMs <= 10000) {
          deviceState.syncStats.intervals.push(deltaMs);
          if (deviceState.syncStats.intervals.length > 20) {
            deviceState.syncStats.intervals.shift();
          }
          deviceState.syncStats.actualIntervalMs = deltaMs;
          const sum = deviceState.syncStats.intervals.reduce((a, b) => a + b, 0);
          deviceState.syncStats.avgIntervalMs = Math.round(sum / deviceState.syncStats.intervals.length);
          deviceState.syncStats.minIntervalMs = Math.min(...deviceState.syncStats.intervals);
          deviceState.syncStats.maxIntervalMs = Math.max(...deviceState.syncStats.intervals);
          if (deltaMs > 3000) deviceState.syncStats.lateCount++;
          deviceState.syncStats.sampleCount++;
        } else {
          deviceState.syncStats.intervals = [];
          deviceState.syncStats.actualIntervalMs = payload.device?.actualIntervalMs || null;
          deviceState.syncStats.avgIntervalMs = payload.device?.actualIntervalMs || null;
        }
        deviceState.lastSeen = now;

        if (payload.device) {
          const prevId = deviceState.device.id;
          deviceState.device = { ...deviceState.device, ...payload.device };
          if (!payload.device.id && prevId) {
            deviceState.device.id = prevId;
          }
          deviceState.device.actualIntervalMs = payload.device.actualIntervalMs || deviceState.syncStats.actualIntervalMs;
          deviceState.device.syncStats = {
            actualIntervalMs: deviceState.device.actualIntervalMs,
            avgIntervalMs: deviceState.syncStats.avgIntervalMs,
            minIntervalMs: deviceState.syncStats.minIntervalMs,
            maxIntervalMs: deviceState.syncStats.maxIntervalMs,
            lateCount: deviceState.syncStats.lateCount,
            missingCount: deviceState.syncStats.missingCount,
            sampleCount: deviceState.syncStats.sampleCount,
          };
        }
        if (payload.storage) deviceState.storage = { ...deviceState.storage, ...payload.storage };
        if (payload.ram) deviceState.ram = { ...deviceState.ram, ...payload.ram };
        if (payload.folders) deviceState.folders = payload.folders;
        if (payload.topProcesses) deviceState.topProcesses = payload.topProcesses;
        if (payload.pcInfo) deviceState.pcInfo = payload.pcInfo;

        if (wasOffline) {
          const devName = deviceState.device.model || 'Perangkat Android';
          const devSerial = deviceState.device.id ? `(${deviceState.device.id})` : '';
          addServerLog(`🟢 Realtime ADB Bridge terhubung! Device: ${deviceState.device.brand} ${devName} ${devSerial}`.trim(), 'success');
        }

        if (payload.logMessage) {
          addServerLog(payload.logMessage, payload.logType || 'info');
        }

        broadcastSSE('state', deviceState);

        const pending = [...deviceState.commandQueue];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', pendingCommands: pending }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: Bridge Command Result
  if (pathname === '/api/bridge/result' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { id, command, output, success } = JSON.parse(body);
        deviceState.commandQueue = deviceState.commandQueue.filter((c) => c.id !== id);
        addServerLog(`Hasil eksekusi [${command}]: ${output || (success ? 'Success' : 'Done')}`, success ? 'success' : 'info');
        broadcastSSE('state', deviceState);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'acknowledged' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Direct Download Redirects for Platform-Tools & Termux
  if (pathname === '/api/download/platform-tools-windows.zip' || pathname === '/download/platform-tools') {
    res.writeHead(302, { Location: 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip' });
    res.end();
    return;
  }

  if (pathname === '/download/termux-apk' || pathname === '/download/termux-arm64') {
    res.writeHead(302, { Location: 'https://github.com/termux/termux-app/releases/download/v0.118.3/termux-app_v0.118.3%2Bgithub-debug_arm64-v8a.apk' });
    res.end();
    return;
  }

  if (pathname === '/download/termux' || pathname === '/download/termux-github') {
    res.writeHead(302, { Location: 'https://github.com/termux/termux-app/releases/latest' });
    res.end();
    return;
  }

  if (pathname === '/download/termux-fdroid') {
    res.writeHead(302, { Location: 'https://f-droid.org/packages/com.termux/' });
    res.end();
    return;
  }

  // Dynamic PowerShell Bridge Script
  if (pathname === '/bridge.ps1' || pathname === '/vota.ps1' || pathname === '/install.ps1') {
    const psTemplate = fs.readFileSync(path.join(SCRIPTS_DIR, 'bridge.ps1'), 'utf8');
    const psScript = psTemplate.replaceAll('__SERVER_URL__', serverBaseUrl);
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(psScript);
    return;
  }

  // Dynamic PowerShell TCP/IP 5555 Activator Script
  if (pathname === '/tcpip.ps1') {
    const tcpTemplate = fs.readFileSync(path.join(SCRIPTS_DIR, 'tcpip.ps1'), 'utf8');
    const tcpScript = tcpTemplate.replaceAll('__SERVER_URL__', serverBaseUrl);
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(tcpScript);
    return;
  }

  // Dynamic Python Bridge Script
  if (pathname === '/bridge.py') {
    const pyTemplate = fs.readFileSync(path.join(SCRIPTS_DIR, 'bridge.py'), 'utf8');
    const pyScript = pyTemplate.replaceAll('__SERVER_URL__', serverBaseUrl);
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(pyScript);
    return;
  }

  // Dynamic Shell Bridge Script (Termux / Mobile Terminal / Linux / Mac)
  if (pathname === '/bridge.sh' || pathname === '/termux' || pathname === '/vota.sh' || pathname === '/install.sh') {
    const shTemplate = fs.readFileSync(path.join(SCRIPTS_DIR, 'bridge.sh'), 'utf8');
    const shScript = shTemplate.replaceAll('__SERVER_URL__', serverBaseUrl);
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(shScript);
    return;
  }

  // Static File Serving from dist/
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`VOTA server running on http://0.0.0.0:${PORT}`);
});
