import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const SCRIPTS_DIR = path.join(__dirname, 'scripts');
const PORT = process.env.PORT || 5173;

// State Store
let deviceState = {
  connected: false,
  lastSeen: 0,
  device: {
    id: 'yhso8t7xeuganb7t',
    brand: 'Xiaomi',
    model: 'HyperOS Mobile',
    androidVersion: '14',
    battery: 84,
    batteryTemp: 32.0,
    batteryStatus: 'Charging',
    batteryHealth: 'Good',
  },
  storage: {
    total: 108.0,
    used: 104.2,
    free: 3.8,
    usagePercentage: 97,
  },
  ram: {
    totalKb: 7833420,
    availableKb: 3908224,
    freeKb: 64688,
    buffersKb: 4300,
    usedPercentage: 50,
  },
  topProcesses: [
    { name: 'system', pid: '1679', rssKb: 659120 },
    { name: 'com.whatsapp', pid: '15227', rssKb: 496923 },
    { name: 'com.android.systemui', pid: '28738', rssKb: 388897 },
    { name: 'com.google.android.gms', pid: '24926', rssKb: 334700 },
    { name: 'com.miui.home', pid: '24239', rssKb: 240404 },
  ],
  commandQueue: [],
  logs: [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'StoragePulse Real-Time Engine initialized on port 5173.',
    },
  ],
};

const sseClients = new Set();

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

  // API: Get Current Status
  if (pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(deviceState));
    return;
  }

  // API: SSE Live Event Stream
  if (pathname === '/api/events' && req.method === 'GET') {
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

  // API: Queue command for ADB bridge to execute
  if (pathname === '/api/exec' && req.method === 'POST') {
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
        deviceState.connected = true;
        deviceState.lastSeen = Date.now();

        if (payload.device) deviceState.device = { ...deviceState.device, ...payload.device };
        if (payload.storage) deviceState.storage = { ...deviceState.storage, ...payload.storage };
        if (payload.ram) deviceState.ram = { ...deviceState.ram, ...payload.ram };
        if (payload.topProcesses) deviceState.topProcesses = payload.topProcesses;

        if (wasOffline) {
          addServerLog(`🟢 Realtime ADB Bridge terhubung! Device: ${deviceState.device.brand} ${deviceState.device.model} (${deviceState.device.id})`, 'success');
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

  // Direct Download Redirects for Platform-Tools
  if (pathname === '/api/download/platform-tools-windows.zip' || pathname === '/download/platform-tools') {
    res.writeHead(302, { Location: 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip' });
    res.end();
    return;
  }

  // Dynamic PowerShell Bridge Script
  if (pathname === '/bridge.ps1') {
    const psTemplate = fs.readFileSync(path.join(SCRIPTS_DIR, 'bridge.ps1'), 'utf8');
    const psScript = psTemplate.replaceAll('__SERVER_URL__', serverBaseUrl);
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(psScript);
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
  console.log(`StoragePulse server running on http://0.0.0.0:${PORT}`);
});
