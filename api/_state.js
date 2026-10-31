// VOTA Multi-Tenant Room & Device State Engine for Vercel Serverless & Node.js

const roomStore = new Map();

export function getDefaultState(roomId = 'default') {
  return {
    roomId,
    connected: false,
    lastSeen: 0,
    device: {
      id: null,
      model: 'Menunggu Koneksi...',
      brand: 'Android',
      androidVersion: null,
      status: 'offline',
      battery: null,
      batteryTemp: null,
      batteryStatus: 'Offline',
      batteryHealth: null,
      batteryVoltage: null,
      actualIntervalMs: null,
      bridgeType: null,
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
        message: `VOTA Cloud Serverless Engine aktif [Room: ${roomId}]. Menunggu bridge...`,
      },
    ],
  };
}

export function getRoomState(roomId = 'default') {
  const cleanId = String(roomId || 'default').trim().toLowerCase();
  if (!roomStore.has(cleanId)) {
    roomStore.set(cleanId, getDefaultState(cleanId));
  }
  const state = roomStore.get(cleanId);
  // Auto-expire connection if inactive > 12s
  if (state.connected && Date.now() - state.lastSeen > 12000) {
    state.connected = false;
    if (state.device) state.device.status = 'disconnected';
  }
  return state;
}

export function updateRoomState(roomId = 'default', updater) {
  const state = getRoomState(roomId);
  const updated = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
  roomStore.set(String(roomId || 'default').trim().toLowerCase(), updated);
  return updated;
}
