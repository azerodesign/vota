const MASTER_KEYS = new Set(['vota2026', 'vota-admin', process.env.VOTA_ACCESS_KEY].filter(Boolean));

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
    const isValid = !!token;
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

    const token = 'vota_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    res.status(200).json({ success: true, token });
    return;
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
