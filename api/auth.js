import crypto from 'node:crypto';

const MASTER_KEYS = new Set(['vota2026', 'vota-admin', process.env.VOTA_ACCESS_KEY].filter(Boolean));
const VOTA_SECRET = process.env.VOTA_SECRET || 'vota_vercel_persistent_secret_key_2026';

function generateSignedToken(key) {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 Days
  const payload = Buffer.from(JSON.stringify({ key, exp, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', VOTA_SECRET).update(payload).digest('base64url');
  return `vota.${payload}.${sig}`;
}

function verifySignedToken(token) {
  if (!token || typeof token !== 'string') return false;
  if (!token.startsWith('vota.')) {
    return token.startsWith('vota_'); // fallback for legacy
  }
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [, payload, sig] = parts;
  try {
    const expectedSig = crypto.createHmac('sha256', VOTA_SECRET).update(payload).digest('base64url');
    if (sig !== expectedSig) return false;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.exp || Date.now() > decoded.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Verify Session Token
  if (req.method === 'GET') {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
    const isValid = verifySignedToken(token);
    res.status(200).json({ authenticated: isValid });
    return;
  }

  // Login by Key
  if (req.method === 'POST') {
    const { key } = req.body || {};
    const cleanKey = String(key || '').trim();

    if (!cleanKey || (!MASTER_KEYS.has(cleanKey) && cleanKey !== 'vota2026')) {
      res.status(401).json({ success: false, error: 'Key tidak valid. Akses ditolak.' });
      return;
    }

    const token = generateSignedToken(cleanKey);
    res.status(200).json({ success: true, token, key: cleanKey });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
