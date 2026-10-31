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
  Zap,
  PowerOff,
  HelpCircle,
} from 'lucide-react';
import { AdbDevice, RamInfo } from '../types';

interface DeviceBannerProps {
  device: AdbDevice;
  ram?: RamInfo;
  isBridgeConnected: boolean;
  onOpenBridgeModal: () => void;
  onOpenHpOnlyModal?: () => void;
  onOpenSwitchTutorial?: () => void;
  onDisconnectAdb?: () => void;
}

export const DeviceBanner: React.FC<DeviceBannerProps> = ({
  device,
  ram,
  isBridgeConnected,
  onOpenBridgeModal,
  onOpenHpOnlyModal,
  onOpenSwitchTutorial,
  onDisconnectAdb,
}) => {
  const ramAvailableGb =
    ram && ram.availableKb !== null && ram.availableKb !== undefined
      ? (ram.availableKb / 1048576).toFixed(2)
      : null;
  const ramTotalGb =
    ram && ram.totalKb !== null && ram.totalKb !== undefined
      ? (ram.totalKb / 1048576).toFixed(2)
      : null;
  const ramUsagePct = ram?.usedPercentage ?? null;

  const intervalSec = device.actualIntervalMs
    ? (device.actualIntervalMs / 1000).toFixed(1)
    : null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />

      {/* Top row: Device Info + Connection Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative z-10 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600 shadow-xs shrink-0">
            <Smartphone className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {device.brand} {device.model}
              </h2>
              {isBridgeConnected ? (
                <>
                  <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    ADB Authorized
                  </span>
                  {device.bridgeType === 'hp_only' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                      </span>
                      📱 Mode HP Only
                    </span>
                  ) : device.bridgeType === 'laptop' ? (
                    <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                      </span>
                      💻 Mode Adb Laptop
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Real-Time Sync Aktif
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    Belum Terhubung
                  </span>
                  <button
                    onClick={onOpenBridgeModal}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                    title="Klik untuk pairing bridge"
                  >
                    <Radio className="h-3 w-3 text-blue-600 animate-pulse" />
                    Hubungkan ADB
                  </button>
                </>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 font-mono">
              Serial: <span className="text-slate-800 font-semibold">{device.id || 'Menunggu pairing...'}</span> • OS: Android {device.androidVersion || 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons to open Modals and Manage Connection */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Putuskan ADB Button */}
          {isBridgeConnected && onDisconnectAdb && (
            <button
              onClick={onDisconnectAdb}
              className="text-xs px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 btn-bounce"
              title="Putuskan sambungan ADB perangkat ini"
            >
              <PowerOff className="h-3.5 w-3.5 text-rose-600" />
              <span>Putuskan ADB</span>
            </button>
          )}

          {/* Switch Tutorial Button */}
          {onOpenSwitchTutorial && (
            <button
              onClick={onOpenSwitchTutorial}
              className="text-xs px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-semibold transition shadow-xs cursor-pointer flex items-center gap-1.5 btn-bounce"
              title="Tutorial cara memindahkan ADB Laptop ke HP (Termux)"
            >
              <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
              <span>Ubah Laptop ➔ HP</span>
            </button>
          )}

          {onOpenHpOnlyModal && (
            <button
              onClick={onOpenHpOnlyModal}
              className={`text-xs px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border flex items-center gap-1.5 font-bold transition shadow-xs cursor-pointer btn-bounce ${
                device.bridgeType === 'hp_only'
                  ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{device.bridgeType === 'hp_only' ? 'Info Mode HP' : 'Panduan HP Only'}</span>
            </button>
          )}

          <button
            onClick={onOpenBridgeModal}
            className={`text-xs px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border flex items-center gap-2 font-semibold transition cursor-pointer btn-bounce ${
              device.bridgeType === 'laptop'
                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>{isBridgeConnected ? (device.bridgeType === 'laptop' ? 'Info ADB Laptop' : 'Bridge Aktif') : 'Panduan Laptop'}</span>
          </button>
        </div>
      </div>

      {/* Real-time telemetry cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 relative z-10">
        {/* Battery Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 card-interactive">
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-600">
            {device.batteryStatus === 'Charging' ? (
              <BatteryCharging className="h-5 w-5 animate-pulse" />
            ) : (
              <Battery className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Baterai Realtime</div>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>{device.battery !== null && device.battery !== undefined ? `${device.battery}%` : 'N/A'}</span>
              <span className="text-[10px] font-semibold text-emerald-600">
                {device.batteryStatus || 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Battery Temperature Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 card-interactive">
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-600">
            <Thermometer className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Suhu Perangkat</div>
            <div className="text-sm font-bold text-slate-800">
              {device.batteryTemp !== null && device.batteryTemp !== undefined
                ? `${device.batteryTemp}°C`
                : 'N/A'}
              {device.batteryTemp !== null && (
                <span className="text-[10px] font-normal text-slate-500 ml-1">Normal</span>
              )}
            </div>
          </div>
        </div>

        {/* RAM Status Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 card-interactive">
          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">RAM (/proc/meminfo)</div>
            <div className="text-sm font-bold text-slate-800">
              {ramAvailableGb ? (
                <>
                  <span className="text-slate-900 font-bold">{ramAvailableGb} GiB Bebas</span>
                  <span className="text-[10px] font-normal text-slate-500 ml-1">
                    / {ramTotalGb} GiB ({ramUsagePct}% terpakai)
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-400 font-normal">Menunggu sync...</span>
              )}
            </div>
          </div>
        </div>

        {/* Telemetry Polling Rate */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3 card-interactive">
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-medium">Interval Sinkron (Terukur)</div>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>
                {isBridgeConnected
                  ? intervalSec
                    ? `${intervalSec}s`
                    : 'Mengukur...'
                  : 'Siap Sinkron'}
              </span>
              <span className="text-[10px] font-mono font-bold text-blue-600">
                {isBridgeConnected
                  ? (device.syncStats?.avgIntervalMs
                      ? `rerata ${(device.syncStats.avgIntervalMs / 1000).toFixed(1)}s`
                      : 'LIVE')
                  : 'AUTO'}
              </span>
            </div>
            {isBridgeConnected && device.syncStats?.minIntervalMs != null && device.syncStats?.maxIntervalMs != null && (
              <div className="text-[10px] text-slate-400 font-mono">
                min {(device.syncStats.minIntervalMs / 1000).toFixed(1)}s • max {(device.syncStats.maxIntervalMs / 1000).toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
