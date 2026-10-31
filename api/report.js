import { getRoomState, updateRoomState } from './_state.js';

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
  const payload = req.body || {};
  const now = Date.now();

  const updatedState = updateRoomState(roomId, (prev) => {
    const next = { ...prev, connected: true, lastSeen: now };

    if (payload.device) {
      next.device = { ...prev.device, ...payload.device };
    }
    if (payload.storage) next.storage = { ...prev.storage, ...payload.storage };
    if (payload.ram) next.ram = { ...prev.ram, ...payload.ram };
    if (payload.folders) next.folders = payload.folders;
    if (payload.topProcesses) next.topProcesses = payload.topProcesses;
    if (payload.pcInfo) next.pcInfo = payload.pcInfo;

    if (payload.logMessage) {
      const entry = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString(),
        type: payload.logType || 'info',
        message: payload.logMessage,
      };
      next.logs = [entry, ...prev.logs.slice(0, 99)];
    }

    return next;
  });

  const pending = [...(updatedState.commandQueue || [])];
  res.status(200).json({ success: true, pendingCommands: pending });
}
