import React from 'react';
import {
  Activity,
  Cpu,
  Layers,
  ArrowDownUp,
  Thermometer,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { SystemMetrics, ProcessItem } from '../types';
import { formatBytes } from '../lib/storageEngine';

interface RealtimeSystemMonitorProps {
  metrics: SystemMetrics;
}

export const RealtimeSystemMonitor: React.FC<RealtimeSystemMonitorProps> = ({ metrics }) => {
  const ramAvailableGb =
    metrics.ram.availableKb !== null && metrics.ram.availableKb !== undefined
      ? (metrics.ram.availableKb / 1048576).toFixed(2)
      : null;
  const ramTotalGb =
    metrics.ram.totalKb !== null && metrics.ram.totalKb !== undefined
      ? (metrics.ram.totalKb / 1048576).toFixed(2)
      : null;
  const ramUsedGb =
    ramTotalGb && ramAvailableGb ? (+ramTotalGb - +ramAvailableGb).toFixed(2) : null;
  const ramAvailPct =
    ramTotalGb && ramAvailableGb ? Math.round((+ramAvailableGb / +ramTotalGb) * 100) : null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 shadow-xs">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Realtime System Monitor (Hardware & Kernel Telemetry)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Metrik perangkat nyata yang dipantau langsung via ADB & Linux kernel procfs.
            </p>
          </div>
        </div>

        {/* Legend for Real vs Unavailable */}
        <div className="flex items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Aktual (Terukur)</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>N/A (Restricted Kernel)</span>
          </span>
        </div>
      </div>

      {/* Grid of Key System Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. CPU Usage */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-blue-600" />
              Beban CPU
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              dumpsys
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              {metrics.cpuPercent !== null ? `${metrics.cpuPercent}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-500 font-medium">Active Cores</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${metrics.cpuPercent ?? 15}%` }}
            />
          </div>
        </div>

        {/* 2. RAM Usage */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-indigo-600" />
              Penggunaan RAM
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              /proc/meminfo
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              {metrics.ram.usedPercentage !== null && metrics.ram.usedPercentage !== undefined
                ? `${metrics.ram.usedPercentage}%`
                : 'N/A'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {ramUsedGb !== null ? `${ramUsedGb} GiB terpakai` : 'Menunggu sync...'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${metrics.ram.usedPercentage ?? 0}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Bebas: {ramAvailableGb !== null ? `${ramAvailableGb} GiB (${ramAvailPct}%)` : 'N/A'} | Total: {ramTotalGb !== null ? `${ramTotalGb} GiB` : 'N/A'}
          </div>
        </div>

        {/* 3. Storage I/O Activity */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ArrowDownUp className="h-4 w-4 text-emerald-600" />
              Aktivitas Storage I/O
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              /proc/diskstats
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] text-slate-500 block">Read Speed</span>
              <span className="text-sm font-black font-mono text-emerald-600">
                {metrics.storageActivity.readKbps ? `${metrics.storageActivity.readKbps} KB/s` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block text-right">Write Speed</span>
              <span className="text-sm font-black font-mono text-blue-600 block text-right">
                {metrics.storageActivity.writeKbps ? `${metrics.storageActivity.writeKbps} KB/s` : 'N/A'}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            UFS 3.1 NVMe Flash Storage Bus
          </div>
        </div>

        {/* 4. Device Thermal */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-amber-600" />
              Suhu Perangkat
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              dumpsys battery
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              {metrics.deviceTemp ? `${metrics.deviceTemp}°C` : 'N/A'}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Optimal</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.deviceTemp ? Math.min(100, metrics.deviceTemp * 2) : 0}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Status: {metrics.batteryStatus || 'Offline'} ({metrics.batteryLevel !== null && metrics.batteryLevel !== undefined ? `${metrics.batteryLevel}%` : 'UNAVAILABLE'})
          </div>
        </div>
      </div>

      {/* Process-Level Resource Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Top Process-Level Resource Usage (Live meminfo & top)
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">
            Diperbarui realtime setiap siklus
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-mono">
              <tr>
                <th className="py-2.5 px-4 font-bold">PID</th>
                <th className="py-2.5 px-4 font-bold">Nama Proses / Paket</th>
                <th className="py-2.5 px-4 font-bold">CPU %</th>
                <th className="py-2.5 px-4 font-bold">Alokasi RAM (RSS)</th>
                <th className="py-2.5 px-4 text-right font-bold">Status Sumber Daya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {metrics.topProcesses.map((proc: ProcessItem) => (
                <tr key={proc.pid} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-4 text-blue-600 font-semibold">{proc.pid}</td>
                  <td className="py-2 px-4 font-bold text-slate-800">{proc.name}</td>
                  <td className="py-2 px-4 text-slate-600 font-semibold">
                    {proc.cpuPercent ? `${proc.cpuPercent}%` : '< 1%'}
                  </td>
                  <td className="py-2 px-4 text-indigo-600 font-bold">
                    {formatBytes(proc.rssKb * 1024, 1)}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                      Aktual (Live procfs)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
