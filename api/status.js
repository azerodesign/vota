import { getRoomState } from './_state.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const roomId = req.query?.room || req.headers['x-vota-room'] || 'default';
  const state = getRoomState(roomId);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(state);
}
