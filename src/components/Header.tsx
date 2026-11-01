import React from 'react';
import {
  Smartphone,
  HardDrive,
  Sparkles,
  RefreshCw,
  Zap,
  Menu,
} from 'lucide-react';
import { DeviceMode, AdbDevice } from '../types';

interface HeaderProps {
  mode: DeviceMode;
  onModeChange: (mode: DeviceMode) => void;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onOpenSidebar?: () => void;
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
  isPhoneConnected?: boolean;
  isPcConnected?: boolean;
  userRole?: 'admin' | 'user';
  onOpenKeyManager?: () => void;
  onOpenAdbGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  currentPath: _currentPath = '/',
  onNavigate,
  onOpenSidebar,
  isScanning,
  onRefresh,
  onOpenHpOnlyModal,
  onLogout: _onLogout,
  isBridgeConnected: _isBridgeConnected = false,
  isPhoneConnected = false,
  isPcConnected = false,
  userRole: _userRole = 'user',
  onOpenKeyManager: _onOpenKeyManager,
  onOpenAdbGuide: _onOpenAdbGuide,
}) => {
  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => onNavigate && onNavigate('/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
            title="Buka Dashboard"
          >
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-wider text-slate-900 leading-none font-display">
                  VOTA
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  v1.0.2
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-none mt-1 hidden sm:block">
                Realtime ADB &amp; System Engine
              </p>
            </div>
          </div>
        </div>

        {/* Right Area: Mode Switcher, Connection Pill, Refresh, Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => onModeChange('android')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer btn-bounce ${
                mode === 'android'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>HP</span>
              <span className="relative flex h-2 w-2 ml-0.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isPhoneConnected ? 'bg-emerald-400' : 'bg-amber-400'
                  } opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isPhoneConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
            </button>

            <button
              onClick={() => onModeChange('desktop')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer btn-bounce ${
                mode === 'desktop'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardDrive className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>PC</span>
              <span className="relative flex h-2 w-2 ml-0.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isPcConnected ? 'bg-emerald-400' : 'bg-slate-300'
                  } opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isPcConnected ? 'bg-emerald-500' : 'bg-slate-400'
                  }`}
                />
              </span>
            </button>
          </div>

          {/* Connection Status / Connect Button */}
          {isPhoneConnected && isPcConnected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">HP &amp; PC Terhubung</span>
              <span className="sm:hidden">Online</span>
            </span>
          ) : isPhoneConnected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>HP Terhubung</span>
            </span>
          ) : isPcConnected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs whitespace-nowrap">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>PC Terhubung</span>
            </span>
          ) : (
            <button
              onClick={onOpenHpOnlyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap transition-all btn-bounce"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Hubungkan HP</span>
            </button>
          )}

          {/* Refresh / Scan Icon Button */}
          <button
            onClick={onRefresh}
            disabled={isScanning}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-50 shrink-0 btn-bounce"
            title="Segarkan telemetri perangkat"
          >
            <RefreshCw
              className={`h-4 w-4 text-slate-600 ${isScanning ? 'animate-spin' : ''}`}
            />
          </button>

          {/* Hamburger Menu Button (Access to All Pages, Settings, Docs, Key Manager & Logout) */}
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer transition flex items-center justify-center shrink-0 btn-bounce"
              title="Buka Menu Navigasi"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
