import React from 'react';
import {
  Smartphone,
  HardDrive,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Zap,
  Laptop,
  Radio,
  PowerOff,
  Lock,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { DeviceMode, AdbDevice } from '../types';

interface HeaderProps {
  mode: DeviceMode;
  onModeChange: (mode: DeviceMode) => void;
  isScanning: boolean;
  onRefresh: () => void;
  onOpenHpOnlyModal: () => void;
  onOpenBridgeModal?: () => void;
  onOpenSwitchTutorial?: () => void;
  onOpenSecurityScanner?: () => void;
  onDisconnectAdb?: () => void;
  onLogout?: () => void;
  device?: AdbDevice;
  isBridgeConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  isScanning,
  onRefresh,
  onOpenHpOnlyModal,
  onOpenBridgeModal,
  onOpenSwitchTutorial,
  onOpenSecurityScanner,
  onDisconnectAdb,
  onLogout,
  device,
  isBridgeConnected = false,
}) => {
  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
        {/* Mobile Top Row: Brand + Mode Switcher + Quick Lock */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-black tracking-wider text-slate-900 leading-none">
                  VOTA
                </h1>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Clean
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-none mt-1">
                Realtime ADB & System Engine
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => onModeChange('android')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer btn-bounce ${
                mode === 'android'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>HP (ADB)</span>
              <span className="relative flex h-2 w-2 ml-0.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isBridgeConnected ? 'bg-emerald-400' : 'bg-amber-400'
                  } opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isBridgeConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
            </button>

            <button
              onClick={() => onModeChange('desktop')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer btn-bounce ${
                mode === 'desktop'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardDrive className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>PC Desktop</span>
            </button>
          </div>

          {/* Lock Icon Button on Mobile */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="md:hidden p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 cursor-pointer"
              title="Kunci Dashboard"
            >
              <Lock className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Action Pills & Status Badges (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none flex-nowrap shrink-0">
          {/* Dynamic ADB Connection Badge */}
          {isBridgeConnected ? (
            device?.bridgeType === 'hp_only' ? (
              <div
                onClick={onOpenHpOnlyModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs cursor-pointer hover:bg-blue-100 transition whitespace-nowrap shrink-0"
                title="Terdeteksi dari HP (Termux). Klik untuk panduan."
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                <Smartphone className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>Mode HP Only</span>
              </div>
            ) : device?.bridgeType === 'laptop' ? (
              <div
                onClick={onOpenBridgeModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs cursor-pointer hover:bg-indigo-100 transition whitespace-nowrap shrink-0"
                title="Terdeteksi dari Laptop/PC. Klik untuk bantuan."
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                </span>
                <Laptop className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>Mode Adb Laptop</span>
              </div>
            ) : (
              <div
                onClick={onOpenBridgeModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap shrink-0"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>ADB Terhubung</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onOpenHpOnlyModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap"
                title="Buka panduan koneksi ponsel tanpa PC (Termux)"
              >
                <Zap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>Hubungkan HP</span>
              </button>
              <button
                onClick={onOpenBridgeModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-xs cursor-pointer whitespace-nowrap"
                title="Buka panduan koneksi PC / Laptop"
              >
                <Radio className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                <span>Hubungkan Laptop</span>
              </button>
            </div>
          )}

          {/* Putuskan ADB Button */}
          {isBridgeConnected && onDisconnectAdb && (
            <button
              onClick={onDisconnectAdb}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold shadow-xs cursor-pointer transition whitespace-nowrap shrink-0"
              title="Putuskan sambungan ADB perangkat ini"
            >
              <PowerOff className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>Putuskan ADB</span>
            </button>
          )}

          {/* Tutorial Ubah ke HP Button */}
          {onOpenSwitchTutorial && (
            <button
              onClick={onOpenSwitchTutorial}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-xs cursor-pointer transition whitespace-nowrap shrink-0"
              title="Tutorial cara memindahkan ADB Laptop ke HP (Termux)"
            >
              <HelpCircle className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>Tutorial Ubah ke HP</span>
            </button>
          )}

          {/* Virus & Security Scanner Button */}
          {onOpenSecurityScanner && (
            <button
              onClick={onOpenSecurityScanner}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs cursor-pointer transition whitespace-nowrap shrink-0"
              title="Pindai Virus, Trojan, dan Ancaman Keamanan"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>Virus Scanner</span>
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium whitespace-nowrap shrink-0">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>No-Root Safe</span>
          </div>

          {/* Refresh / Scan Button */}
          <button
            onClick={onRefresh}
            disabled={isScanning}
            className="px-3 sm:px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0 btn-bounce"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-600 ${isScanning ? 'animate-spin' : ''}`}
            />
            <span>{isScanning ? 'Memindai...' : 'Pindai'}</span>
          </button>

          {/* Lock / Logout Button on Desktop */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer transition whitespace-nowrap shrink-0"
              title="Kunci Dashboard (Keluar sesi)"
            >
              <Lock className="h-3.5 w-3.5 text-slate-600 shrink-0" />
              <span>Kunci</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
