import React from 'react';
import { Smartphone, Cpu, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AdbDevice } from '../types';

interface DeviceBannerProps {
  device: AdbDevice;
}

export const DeviceBanner: React.FC<DeviceBannerProps> = ({ device }) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#121826] border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-cyan-500/5 to-transparent pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-cyan-950/60 border border-cyan-800/40 rounded-2xl text-cyan-400">
            <Smartphone className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">{device.brand} {device.model}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3" />
                ADB Authorized
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Device Serial: <span className="text-slate-300">{device.id}</span> • OS: Android {device.androidVersion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>ADB Bridge: <strong className="text-emerald-400 font-mono">ONLINE</strong></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Integrity: <strong className="text-slate-100">Clean</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
