import React from 'react';
import {
  Smartphone,
  Battery,
  BatteryCharging,
  Thermometer,
  Radio,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { AdbDevice, RamInfo } from '../types';

interface DeviceBannerProps {
  device: AdbDevice;
  ram?: RamInfo;
  isBridgeConnected: boolean;
  onOpenBridgeModal: () => void;
}

export const DeviceBanner: React.FC<DeviceBannerProps> = ({
  device,
  ram,
  isBridgeConnected,
  onOpenBridgeModal,
}) => {
  const ramAvailableGb = ram ? (ram.availableKb / 1048576).toFixed(1) : '3.9';
  const ramTotalGb = ram ? (ram.totalKb / 1048576).toFixed(1) : '7.8';
  const ramUsagePct = ram?.usedPercentage ?? 50;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#121826] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none" />

      {/* Top row: Device Info + Connection Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 pb-4 border-b border-slate-800/80">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-cyan-950/60 border border-cyan-800/40 rounded-2xl text-cyan-400">
            <Smartphone className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-100">
                {device.brand} {device.model}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />
                ADB Authorized
              </span>
              {isBridgeConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Real-Time Sync Aktif
                </span>
              ) : (
                <button
                  onClick={onOpenBridgeModal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                  title="Klik untuk pairing bridge"
                >
                  <Radio className="h-3 w-3 text-amber-400 animate-pulse" />
                  Hubungkan Realtime ADB
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Serial: <span className="text-slate-300">{device.id}</span> • OS: Android {device.androidVersion}
            </p>
          </div>
        </div>

        {/* Action Button to open Modal */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBridgeModal}
            className="text-xs px-3.5 py-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-800/50 text-cyan-300 flex items-center gap-2 font-medium transition-colors"
          >
            <Radio className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isBridgeConnected ? 'Bridge Status (Online)' : 'Setup Live ADB'}</span>
          </button>
        </div>
      </div>

      {/* Real-time telemetry cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 relative z-10">
        {/* Battery Card */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/50 border border-emerald-800/40 rounded-lg text-emerald-400">
            {device.batteryStatus === 'Charging' ? (
              <BatteryCharging className="h-5 w-5" />
            ) : (
              <Battery className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Baterai Realtime</div>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>{device.battery ?? 84}%</span>
              <span className="text-[10px] font-normal text-emerald-400">
                {device.batteryStatus || 'Aktif'}
              </span>
            </div>
          </div>
        </div>

        {/* Battery Temperature Card */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 bg-amber-950/50 border border-amber-800/40 rounded-lg text-amber-400">
            <Thermometer className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Suhu Perangkat</div>
            <div className="text-sm font-bold text-slate-100">
              {device.batteryTemp ? `${device.batteryTemp}°C` : '32.0°C'}
              <span className="text-[10px] font-normal text-slate-400 ml-1">Normal</span>
            </div>
          </div>
        </div>

        {/* RAM Status Card */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950/50 border border-indigo-800/40 rounded-lg text-indigo-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">RAM Tersedia (/proc)</div>
            <div className="text-sm font-bold text-slate-100">
              {ramAvailableGb} GB{' '}
              <span className="text-[10px] font-normal text-indigo-300">
                / {ramTotalGb} GB ({ramUsagePct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Polling Rate */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/50 border border-cyan-800/40 rounded-lg text-cyan-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Interval Sinkron</div>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>{isBridgeConnected ? '2.0 detik' : 'Siap Sinkron'}</span>
              <span className="text-[10px] font-mono text-cyan-400">
                {isBridgeConnected ? 'LIVE' : 'AUTO'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
