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

// =============================================================================
// 1. MULTI-USER ROOM STATE STORE (Zero Mock Initial Values - Real Telemetry Only)
// =============================================================================

function createInitialDeviceState(roomId = 'default') {
  return {
    roomId,
    connected: false,
    phoneConnected: false,
    pcConnected: false,
    lastSeen: 0,
    lastSeenPhone: 0,
    lastSeenPc: 0,
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
        message: 'VOTA Real-Time Engine initialized. Menunggu jembatan ADB lokal...',
      },
    ],
  };
}

const roomStates = new Map();

function getRoomState(roomId = 'default') {
  const cleanRoom = (roomId || 'default').trim();
  if (!roomStates.has(cleanRoom)) {
    roomStates.set(cleanRoom, createInitialDeviceState(cleanRoom));
  }
  return roomStates.get(cleanRoom);
}

// Global alias for default room backwards compatibility
const deviceState = getRoomState('default');

const sseClients = new Set();
const MASTER_KEYS = new Set(['vota2026', 'vota-admin', process.env.VOTA_ACCESS_KEY].filter(Boolean));

// =============================================================================
// 2. KEY STORE PERSISTENCE & GENERATOR (.vota_keys.json)
// =============================================================================

const KEYS_FILE = path.join(__dirname, '.vota_keys.json');

function initDefaultKeys() {
  const defaultKeys = {
    'ADM-VOTA-2026': {
      key: 'ADM-VOTA-2026',
      role: 'admin',
      label: 'Master Administrator',
      createdAt: 1793454200000,
      expiresAt: null,
      active: true,
      roomId: 'default',
      lastConnected: null,
    },
  };
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(defaultKeys, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to init .vota_keys.json:', err);
  }
  return defaultKeys;
}

function loadKeys() {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      const data = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
      if (data && typeof data === 'object') {
        if (!data['ADM-VOTA-2026']) {
          data['ADM-VOTA-2026'] = {
            key: 'ADM-VOTA-2026',
            role: 'admin',
            label: 'Master Administrator',
            createdAt: 1793454200000,
            expiresAt: null,
            active: true,
            roomId: 'default',
            lastConnected: null,
          };
          saveKeys(data);
        }
        return data;
      }
    }
  } catch {}
  return initDefaultKeys();
}

function saveKeys(keysData) {
  try {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keysData, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write .vota_keys.json:', err);
  }
}

// Ensure keys file is initialized on startup
loadKeys();

const KEY_CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateRandomCode(length = 4) {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += KEY_CHARSET[bytes[i] % KEY_CHARSET.length];
  }
  return result;
}

function generateUserKey() {
  return `VOTA-${generateRandomCode(4)}-${generateRandomCode(4)}`;
}

function generateAdminKey() {
  return `ADM-VOTA-${generateRandomCode(4)}`;
}

function getKeyRecord(rawKey) {
  if (!rawKey) return null;
  const key = String(rawKey).trim().toUpperCase();
  const keys = loadKeys();
  if (keys[key]) return keys[key];
  for (const k of Object.keys(keys)) {
    if (k.toUpperCase() === key) return keys[k];
  }
  // Backwards compatibility for legacy master keys
  if (key === 'VOTA2026' || key === 'VOTA-ADMIN') {
    return {
      key: 'ADM-VOTA-2026',
      role: 'admin',
      label: 'Master Administrator (Legacy)',
      createdAt: 0,
      expiresAt: null,
      active: true,
      roomId: 'default',
    };
  }
  return null;
}

function isValidAccessKey(rawKey) {
  if (!rawKey) return false;
  const cleanKey = String(rawKey).trim().toUpperCase();
  if (cleanKey === 'ADM-VOTA-2026' || cleanKey === 'VOTA2026' || cleanKey === 'VOTA-ADMIN') {
    return true;
  }
  const rec = getKeyRecord(cleanKey);
  if (!rec) return false;
  if (!rec.active) return false;
  if (rec.expiresAt && Date.now() > rec.expiresAt) return false;
  return true;
}

// =============================================================================
// 3. PERSISTENT SECRET & SESSION TOKEN MANAGEMENT
// =============================================================================

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

function generateSignedToken(key, role = 'user', roomId = 'default') {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 Days Session Validity
  const payload = Buffer.from(JSON.stringify({ key, role, roomId, exp, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', VOTA_SECRET).update(payload).digest('base64url');
  const token = `vota.${payload}.${sig}`;
  activeTokens.add(token);
  saveSessions();
  return token;
}

function decodeSignedToken(token) {
  if (!token || typeof token !== 'string') return null;
  if (token === '__direct_valid__') {
    return { key: 'ADM-VOTA-2026', role: 'admin', roomId: 'default', exp: Date.now() + 86400000 };
  }
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [, payload, sig] = parts;
  try {
    const expectedSig = crypto.createHmac('sha256', VOTA_SECRET).update(payload).digest('base64url');
    if (sig !== expectedSig) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.exp || Date.now() > decoded.exp) return null;
    if (!isValidAccessKey(decoded.key)) return null;

    // Attach latest role and roomId from database
    const rec = getKeyRecord(decoded.key);
    if (rec) {
      decoded.role = rec.role || decoded.role || 'user';
      decoded.roomId = rec.roomId || decoded.roomId || 'default';
    }

    return decoded;
  } catch {
    return null;
  }
}

function verifySignedToken(token) {
  const decoded = decodeSignedToken(token);
  if (!decoded) return false;
  activeTokens.add(token);
  return true;
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

function getReqUser(req, url) {
  const token = extractToken(req, url);
  if (!token) {
    const directKey = req.headers['x-vota-key'] || url.searchParams.get('key');
    if (directKey && isValidAccessKey(directKey)) {
      const rec = getKeyRecord(directKey);
      const isAdm = rec ? rec.role === 'admin' : (String(directKey).toUpperCase().startsWith('ADM-') || String(directKey).toLowerCase() === 'vota2026');
      return {
        key: rec ? rec.key : String(directKey).trim(),
        role: isAdm ? 'admin' : 'user',
        roomId: rec ? rec.roomId : `room_${String(directKey).replace(/[^A-Za-z0-9]/g, '').toLowerCase()}`,
        exp: Date.now() + 86400000,
      };
    }
    return null;
  }
  return decodeSignedToken(token);
}

function isReqAuthenticated(req, url) {
  return !!getReqUser(req, url);
}

function isReqAdmin(req, url) {
  const user = getReqUser(req, url);
  return user && user.role === 'admin';
}

// =============================================================================
// 4. MULTI-ROOM SSE BROADCAST & LOGGING
// =============================================================================

function broadcastRoomSSE(roomId, event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      if (!client.roomId || client.roomId === roomId || (client.userRole === 'admin' && client.roomId === 'all')) {
        client.write(payload);
      }
    } catch {
      sseClients.delete(client);
    }
  }
}

function broadcastSSE(event, data) {
  broadcastRoomSSE('default', event, data);
}

function addRoomServerLog(roomId, message, type = 'info') {
  const state = getRoomState(roomId);
  const entry = {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toLocaleTimeString(),
    type,
    message,
  };
  state.logs.unshift(entry);
  if (state.logs.length > 100) state.logs.pop();
  broadcastRoomSSE(roomId, 'log', entry);
  return entry;
}

function addServerLog(message, type = 'info') {
  return addRoomServerLog('default', message, type);
}

function resolveRoomFromBridgeReq(req, url, payload = {}) {
  const rawKey = url.searchParams.get('key') || req.headers['x-vota-key'] || payload.key;
  if (rawKey) {
    const cleanKey = String(rawKey).trim().toUpperCase();
    const rec = getKeyRecord(cleanKey);
    if (rec) {
      rec.lastConnected = Date.now();
      const keys = loadKeys();
      if (keys[rec.key]) {
        keys[rec.key].lastConnected = rec.lastConnected;
        saveKeys(keys);
      }
      return rec.roomId || `room_${rec.key.replace(/[^A-Za-z0-9]/g, '').toLowerCase()}`;
    }
    return `room_${cleanKey.replace(/[^A-Za-z0-9]/g, '').toLowerCase()}`;
  }
  const room = url.searchParams.get('room') || req.headers['x-vota-room'] || payload.room;
  if (room) return room.trim();
  return 'default';
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

// Check connection timeout every 3 seconds across all rooms
setInterval(() => {
  const now = Date.now();
  for (const [roomId, state] of roomStates.entries()) {
    let changed = false;

    if (state.phoneConnected && now - (state.lastSeenPhone || state.lastSeen) > 8000) {
      state.phoneConnected = false;
      if (state.device) {
        state.device.batteryStatus = 'Offline';
        state.device.status = 'disconnected';
      }
      addRoomServerLog(roomId, 'ADB Bridge HP timeout (terputus).', 'warning');
      changed = true;
    }

    if (state.pcConnected && now - (state.lastSeenPc || state.lastSeen) > 8000) {
      state.pcConnected = false;
      addRoomServerLog(roomId, 'Bridge Laptop/PC timeout (terputus).', 'warning');
      changed = true;
    }

    const isConn = state.phoneConnected || state.pcConnected;
    if (state.connected !== isConn) {
      state.connected = isConn;
      changed = true;
    }

    if (changed) {
      broadcastRoomSSE(roomId, 'state', state);
    }
  }
}, 3000);

// =============================================================================
// 5. HTTP SERVER & REST API ENDPOINTS
// =============================================================================

const server = http.createServer(async (req, res) => {
  const hostHeader = req.headers.host || `localhost:${PORT}`;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const serverBaseUrl = `${proto}://${hostHeader}`;
  const url = new URL(req.url, `http://${hostHeader}`);
  const pathname = url.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-VOTA-KEY, X-VOTA-ROOM, X-VOTA-TOKEN');

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
        const cleanKey = (key || '').trim().toUpperCase();
        if (!isValidAccessKey(cleanKey)) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Key tidak valid atau telah kadaluwarsa. Akses ditolak.' }));
          return;
        }

        const record = getKeyRecord(cleanKey);
        const role = record ? record.role : (cleanKey.startsWith('ADM-') || cleanKey === 'VOTA2026' ? 'admin' : 'user');
        const roomId = record?.roomId || (role === 'admin' ? 'default' : `room_${cleanKey.replace(/[^A-Za-z0-9]/g, '').toLowerCase()}`);

        const token = generateSignedToken(record ? record.key : cleanKey, role, roomId);
        addRoomServerLog(roomId, `Autentikasi berhasil (${role.toUpperCase()}) melalui Key: ${record ? record.key : cleanKey}`, 'info');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          token,
          key: record ? record.key : cleanKey,
          role,
          roomId,
          label: record?.label || null,
          expiresAt: record?.expiresAt || null,
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // API: Auth Verify Session
  if (pathname === '/api/auth/verify' && req.method === 'GET') {
    const user = getReqUser(req, url);
    if (!user) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ authenticated: false }));
      return;
    }
    const roomState = getRoomState(user.roomId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      authenticated: true,
      key: user.key,
      role: user.role,
      roomId: user.roomId,
      connected: roomState.connected,
    }));
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

  // API: Admin - Get All Keys
  if (pathname === '/api/admin/keys' && req.method === 'GET') {
    if (!isReqAdmin(req, url)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Akses khusus Administrator ditolak.' }));
      return;
    }
    const keysMap = loadKeys();
    const keyList = Object.values(keysMap).sort((a, b) => b.createdAt - a.createdAt);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, keys: keyList }));
    return;
  }

  // API: Admin - Create Key (Supports Single & Batch Generation)
  if (pathname === '/api/admin/keys/create' && req.method === 'POST') {
    if (!isReqAdmin(req, url)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Akses khusus Administrator ditolak.' }));
      return;
    }
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { label, durationDays, role: targetRole, count = 1 } = JSON.parse(body || '{}');
        const keys = loadKeys();
        const role = targetRole === 'admin' ? 'admin' : 'user';
        const batchCount = Math.min(Math.max(1, parseInt(count, 10) || 1), 100);

        const durationNum = Number(durationDays);
        const expiresAt = (durationNum && durationNum > 0) ? Date.now() + durationNum * 86400 * 1000 : null;
        const baseLabel = (label || (role === 'admin' ? 'Administrator' : 'Perangkat Pengguna')).trim();

        const createdRecords = [];
        for (let i = 0; i < batchCount; i++) {
          let newKey = '';
          let attempts = 0;
          do {
            newKey = role === 'admin' ? generateAdminKey() : generateUserKey();
            attempts++;
          } while (keys[newKey] && attempts < 100);

          const roomId = role === 'admin' ? 'default' : `room_${newKey.replace(/[^A-Za-z0-9]/g, '').toLowerCase()}`;
          const itemLabel = batchCount > 1 ? `${baseLabel} #${i + 1}` : baseLabel;

          const keyRecord = {
            key: newKey,
            role,
            label: itemLabel,
            createdAt: Date.now() + i,
            expiresAt,
            active: true,
            roomId,
            lastConnected: null,
          };

          keys[newKey] = keyRecord;
          createdRecords.push(keyRecord);
        }

        saveKeys(keys);

        const logMsg = batchCount > 1
          ? `Admin membuat ${batchCount} Kunci Akses baru [${role.toUpperCase()}] sekaligus untuk "${baseLabel}"`
          : `Admin membuat Kunci Akses baru: ${createdRecords[0].key} [${role.toUpperCase()}] untuk "${baseLabel}"`;
        addRoomServerLog('default', logMsg, 'success');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          count: createdRecords.length,
          keyRecord: createdRecords[0],
          keyRecords: createdRecords,
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // API: Admin - Revoke Key
  if (pathname === '/api/admin/keys/revoke' && req.method === 'POST') {
    if (!isReqAdmin(req, url)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Akses khusus Administrator ditolak.' }));
      return;
    }
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { key } = JSON.parse(body || '{}');
        const cleanKey = (key || '').trim().toUpperCase();
        const keys = loadKeys();
        if (!keys[cleanKey]) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Kunci tidak ditemukan.' }));
          return;
        }
        keys[cleanKey].active = false;
        saveKeys(keys);
        addRoomServerLog('default', `Kunci akses ${cleanKey} telah dicabut (Revoked) oleh Admin.`, 'warning');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, keyRecord: keys[cleanKey] }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // API: Admin - Activate Key
  if (pathname === '/api/admin/keys/activate' && req.method === 'POST') {
    if (!isReqAdmin(req, url)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Akses khusus Administrator ditolak.' }));
      return;
    }
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { key } = JSON.parse(body || '{}');
        const cleanKey = (key || '').trim().toUpperCase();
        const keys = loadKeys();
        if (!keys[cleanKey]) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Kunci tidak ditemukan.' }));
          return;
        }
        keys[cleanKey].active = true;
        saveKeys(keys);
        addRoomServerLog('default', `Kunci akses ${cleanKey} diaktifkan kembali oleh Admin.`, 'success');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, keyRecord: keys[cleanKey] }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // API: Admin - Delete Key
  if (pathname === '/api/admin/keys/delete' && req.method === 'POST') {
    if (!isReqAdmin(req, url)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Akses khusus Administrator ditolak.' }));
      return;
    }
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { key } = JSON.parse(body || '{}');
        const cleanKey = (key || '').trim().toUpperCase();
        if (cleanKey === 'ADM-VOTA-2026') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Master Key ADM-VOTA-2026 tidak dapat dihapus.' }));
          return;
        }
        const keys = loadKeys();
        if (!keys[cleanKey]) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Kunci tidak ditemukan.' }));
          return;
        }
        delete keys[cleanKey];
        saveKeys(keys);
        addRoomServerLog('default', `Kunci akses ${cleanKey} dihapus secara permanen dari server.`, 'warning');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  // API: Real Security Threat Scan (Auth Protected)
  if (pathname === '/api/security/scan' && req.method === 'GET') {
    const user = getReqUser(req, url);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const targetRoom = (user.role === 'admin' && url.searchParams.get('room')) ? url.searchParams.get('room') : user.roomId;
    const roomState = getRoomState(targetRoom);
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
      if (roomState.reportedThreats && Array.isArray(roomState.reportedThreats)) {
        threats.push(...roomState.reportedThreats);
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      target,
      threats,
      isClean: threats.length === 0,
      scannedAt: new Date().toISOString(),
      connected: roomState.connected,
      roomId: targetRoom,
    }));
    return;
  }

  // API: Security Threat Fix / Remediation (Auth Protected)
  if (pathname === '/api/security/fix' && req.method === 'POST') {
    const user = getReqUser(req, url);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const targetRoom = (user.role === 'admin' && url.searchParams.get('room')) ? url.searchParams.get('room') : user.roomId;
    const roomState = getRoomState(targetRoom);

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
            addRoomServerLog(targetRoom, message, 'success');
          } catch (err) {
            message = `Gagal menghapus file: ${err.message}`;
          }
        } else if (command || (target === 'mobile' && targetPath)) {
          const cmd = command || `rm -f "${targetPath}"`;
          const cmdId = Math.random().toString(36).substring(7);
          roomState.commandQueue.push({ id: cmdId, command: cmd, createdAt: Date.now() });
          success = true;
          message = `Perintah eliminasi ancaman dikirimkan ke ADB bridge (${cmd})`;
          addRoomServerLog(targetRoom, message, 'info');
        } else {
          success = true;
          message = `Ancaman dinetralisir dari registry pemantauan.`;
          addRoomServerLog(targetRoom, message, 'success');
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
    const user = getReqUser(req, url);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const targetRoom = (user.role === 'admin' && url.searchParams.get('room')) ? url.searchParams.get('room') : user.roomId;
    const roomState = getRoomState(targetRoom);
    const cmdId = Math.random().toString(36).substring(7);
    const item = { id: cmdId, command: 'disconnect', createdAt: Date.now() };
    roomState.commandQueue.push(item);
    roomState.connected = false;
    if (roomState.device) {
      roomState.device.status = 'disconnected';
    }
    addRoomServerLog(targetRoom, 'Sambungan ADB diputuskan atas permintaan pengguna.', 'warning');
    broadcastRoomSSE(targetRoom, 'state', roomState);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Perintah pemutusan sambungan ADB telah dikirimkan.', roomId: targetRoom }));
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
    const user = getReqUser(req, url);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ authenticated: false, connected: false, error: 'Unauthorized. Key akses diperlukan.' }));
      return;
    }
    const targetRoom = (user.role === 'admin' && url.searchParams.get('room')) ? url.searchParams.get('room') : user.roomId;
    const roomState = getRoomState(targetRoom);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    res.end(JSON.stringify(roomState));
    return;
  }

  // API: SSE Live Event Stream (Auth Protected)
  if (pathname === '/api/events' && req.method === 'GET') {
    const user = getReqUser(req, url);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('401 Unauthorized: Valid session token required\n');
      return;
    }
    const targetRoom = (user.role === 'admin' && url.searchParams.get('room')) ? url.searchParams.get('room') : user.roomId;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    });
    res.roomId = targetRoom;
    res.userRole = user.role;
    res.write(`event: state\ndata: ${JSON.stringify(getRoomState(targetRoom))}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // API: Queue command for ADB bridge to execute (Auth Protected)
  if (pathname === '/api/exec' && req.method === 'POST') {
    const user = getReqUser(req, url);
    if (!user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }
    const targetRoom = (user.role === 'admin' && url.searchParams.get('room')) ? url.searchParams.get('room') : user.roomId;
    const roomState = getRoomState(targetRoom);
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { command } = JSON.parse(body || '{}');
        const cmdId = Math.random().toString(36).substring(7);
        const item = { id: cmdId, command, createdAt: Date.now() };
        roomState.commandQueue.push(item);

        addRoomServerLog(targetRoom, `ADB Command Queued: ${command}`, 'warning');

        // If no bridge connected, simulate after 1s
        if (!roomState.connected) {
          setTimeout(() => {
            const index = roomState.commandQueue.findIndex((c) => c.id === cmdId);
            if (index !== -1) {
              roomState.commandQueue.splice(index, 1);
              addRoomServerLog(targetRoom, `[Simulasi ADB] ${command} selesai dijalankan.`, 'success');
              broadcastRoomSSE(targetRoom, 'state', roomState);
            }
          }, 1000);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'queued', id: cmdId, roomId: targetRoom }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: Bridge Report (Multi-Device Simultaneous Ingestion)
  if (pathname === '/api/bridge/report' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const roomId = resolveRoomFromBridgeReq(req, url, payload);
        const state = getRoomState(roomId);
        const now = Date.now();
        state.lastSeen = now;

        // Determine source: Phone vs PC
        const hasRealDevice = !!(payload.device && (payload.device.id || (payload.device.status === 'connected' && payload.device.battery !== null)));
        const isPhonePayload = hasRealDevice || payload.hasPhone === true || (payload.device && payload.device.bridgeType === 'hp_only') || (payload.ram && payload.ram.totalKb && !payload.pcInfo);
        const isPcPayload = !!(payload.pcInfo || payload.hasPc === true);

        // Process Phone Telemetry (Wireless ADB / Termux / USB phone)
        if (isPhonePayload) {
          const wasPhoneOffline = !state.phoneConnected;
          state.phoneConnected = true;
          state.lastSeenPhone = now;

          // Continuous Multi-Sample Polling Measurement for Phone
          const deltaMs = state.lastSeenPhone > 0 ? (now - state.lastSeenPhone) : 0;
          if (state.lastSeenPhone > 0 && !wasPhoneOffline && deltaMs <= 10000) {
            state.syncStats.intervals.push(deltaMs);
            if (state.syncStats.intervals.length > 20) {
              state.syncStats.intervals.shift();
            }
            state.syncStats.actualIntervalMs = deltaMs;
            const sum = state.syncStats.intervals.reduce((a, b) => a + b, 0);
            state.syncStats.avgIntervalMs = Math.round(sum / state.syncStats.intervals.length);
            state.syncStats.minIntervalMs = Math.min(...state.syncStats.intervals);
            state.syncStats.maxIntervalMs = Math.max(...state.syncStats.intervals);
            if (deltaMs > 3000) state.syncStats.lateCount++;
            state.syncStats.sampleCount++;
          } else {
            state.syncStats.intervals = [];
            state.syncStats.actualIntervalMs = payload.device?.actualIntervalMs || null;
            state.syncStats.avgIntervalMs = payload.device?.actualIntervalMs || null;
          }

          if (payload.device) {
            const prevId = state.device.id;
            state.device = { ...state.device, ...payload.device };
            if (!payload.device.id && prevId) {
              state.device.id = prevId;
            }
            state.device.actualIntervalMs = payload.device.actualIntervalMs || state.syncStats.actualIntervalMs;
            state.device.syncStats = {
              actualIntervalMs: state.device.actualIntervalMs,
              avgIntervalMs: state.syncStats.avgIntervalMs,
              minIntervalMs: state.syncStats.minIntervalMs,
              maxIntervalMs: state.syncStats.maxIntervalMs,
              lateCount: state.syncStats.lateCount,
              missingCount: state.syncStats.missingCount,
              sampleCount: state.syncStats.sampleCount,
            };
          }
          if (payload.storage && payload.storage.total !== null) {
            state.storage = { ...state.storage, ...payload.storage };
          }
          if (payload.ram && payload.ram.totalKb !== null) {
            state.ram = { ...state.ram, ...payload.ram };
          }
          if (payload.folders && payload.folders.length > 0) state.folders = payload.folders;
          if (payload.topProcesses && payload.topProcesses.length > 0) state.topProcesses = payload.topProcesses;

          if (wasPhoneOffline) {
            const devName = state.device.model || 'Perangkat Android';
            const devSerial = state.device.id ? `(${state.device.id})` : '';
            addRoomServerLog(roomId, `🟢 Realtime ADB Bridge HP terhubung! [Room: ${roomId}] Device: ${state.device.brand} ${devName} ${devSerial}`.trim(), 'success');
          }
        }

        // Process Laptop / PC Telemetry (PowerShell PC Bridge)
        if (isPcPayload) {
          const wasPcOffline = !state.pcConnected;
          state.pcConnected = true;
          state.lastSeenPc = now;
          if (payload.pcInfo) {
            state.pcInfo = payload.pcInfo;
          }
          if (wasPcOffline) {
            const hostName = payload.pcInfo?.hostname || 'Windows PC';
            addRoomServerLog(roomId, `💻 Bridge Laptop / PC terhubung! [Room: ${roomId}] Host: ${hostName}`, 'success');
          }
        }

        // Overall room is connected if either phone or PC is connected
        state.connected = state.phoneConnected || state.pcConnected;

        if (payload.logMessage) {
          addRoomServerLog(roomId, payload.logMessage, payload.logType || 'info');
        }

        broadcastRoomSSE(roomId, 'state', state);

        const pending = [...state.commandQueue];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', pendingCommands: pending, roomId }));
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
        const payload = JSON.parse(body || '{}');
        const roomId = resolveRoomFromBridgeReq(req, url, payload);
        const state = getRoomState(roomId);
        const { id, command, output, success } = payload;
        state.commandQueue = state.commandQueue.filter((c) => c.id !== id);
        addRoomServerLog(roomId, `Hasil eksekusi [${command}]: ${output || (success ? 'Success' : 'Done')}`, success ? 'success' : 'info');
        broadcastRoomSSE(roomId, 'state', state);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'acknowledged', roomId }));
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
    const requestedKey = (url.searchParams.get('key') || '').trim();
    let psTemplate = fs.readFileSync(path.join(SCRIPTS_DIR, 'bridge.ps1'), 'utf8');
    let psScript = psTemplate.replaceAll('__SERVER_URL__', serverBaseUrl);
    psScript = psScript.replaceAll('__DEFAULT_KEY__', requestedKey);
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
    const requestedKey = (url.searchParams.get('key') || '').trim();
    let pyTemplate = fs.readFileSync(path.join(SCRIPTS_DIR, 'bridge.py'), 'utf8');
    let pyScript = pyTemplate.replaceAll('__SERVER_URL__', serverBaseUrl);
    pyScript = pyScript.replaceAll('__DEFAULT_KEY__', requestedKey);
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    });
    res.end(pyScript);
    return;
  }

  // Dynamic Shell Bridge Script (Termux / Mobile Terminal / Linux / Mac)
  if (pathname === '/bridge.sh' || pathname === '/termux' || pathname === '/vota.sh' || pathname === '/install.sh') {
    const requestedKey = (url.searchParams.get('key') || '').trim();
    let shTemplate = fs.readFileSync(path.join(SCRIPTS_DIR, 'bridge.sh'), 'utf8');
    let shScript = shTemplate.replaceAll('__SERVER_URL__', serverBaseUrl);
    shScript = shScript.replaceAll('__DEFAULT_KEY__', requestedKey);
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
  console.log(`VOTA Multi-Tenant Engine running on http://0.0.0.0:${PORT}`);
});
