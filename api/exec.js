import { updateRoomState } from './_state.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const roomId = req.query?.room || req.headers['x-vota-room'] || 'default';
  const { command } = req.body || {};
  const cmdId = Math.random().toString(36).substring(7);

  updateRoomState(roomId, (prev) => {
    const queue = [...prev.commandQueue, { id: cmdId, command, createdAt: Date.now() }];
    return { ...prev, commandQueue: queue };
  });

  res.status(200).json({ success: true, commandId: cmdId });
}
