import React from 'react';
import {
  Smartphone,
  HardDrive,
  Sparkles,
  RefreshCw,
  Zap,
  Lock,
  Menu,
  BookOpen,
  Settings,
  LayoutDashboard,
  Key,
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
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  currentPath = '/',
  onNavigate,
  onOpenSidebar,
  isScanning,
  onRefresh,
  onOpenHpOnlyModal,
  onLogout,
  isBridgeConnected: _isBridgeConnected = false,
  isPhoneConnected = false,
  isPcConnected = false,
  userRole = 'user',
  onOpenKeyManager,
}) => {
  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Desktop Nav Links */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div
            onClick={() => onNavigate && onNavigate('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
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

          {/* Desktop Navigation Links */}
          {onNavigate && (
            <nav className="hidden md:flex items-center gap-1 text-xs font-bold pl-2 border-l border-slate-200">
              <button
                onClick={() => onNavigate('/')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  currentPath === '/'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => onNavigate('/docs')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  currentPath === '/docs'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Dokumentasi</span>
              </button>
              <button
                onClick={() => onNavigate('/settings')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  currentPath === '/settings'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Pengaturan</span>
              </button>
            </nav>
          )}
        </div>

        {/* Right Area: Mode Switcher, Quick Actions & Mobile Hamburger */}
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

          {/* Desktop Connection Status Pill */}
          <div className="hidden lg:flex items-center">
            {isPhoneConnected && isPcConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>HP &amp; PC Terhubung</span>
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap"
              >
                <Zap className="h-3.5 w-3.5 text-blue-600" />
                <span>Hubungkan HP</span>
              </button>
            )}
          </div>

          {/* Admin Key Manager Button (Visible only to Admin) */}
          {userRole === 'admin' && onOpenKeyManager && (
            <button
              onClick={onOpenKeyManager}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer transition shrink-0 btn-bounce"
              title="Buka Pusat Manajemen Kunci Akses"
            >
              <Key className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kelola Kunci</span>
              <span className="text-[9px] px-1 py-0.2 bg-amber-700/60 rounded font-black">ADM</span>
            </button>
          )}

          {/* Refresh / Scan Button */}
          <button
            onClick={onRefresh}
            disabled={isScanning}
            className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 btn-bounce"
            title="Segarkan telemetri"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-600 ${isScanning ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">{isScanning ? 'Memindai...' : 'Pindai'}</span>
          </button>

          {/* Lock / Logout Button on Desktop */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer transition shrink-0"
              title="Kunci Dashboard (Keluar sesi)"
            >
              <Lock className="h-3.5 w-3.5 text-slate-600" />
              <span>Kunci</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Button */}
          {onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer transition flex items-center justify-center shrink-0"
              title="Buka Menu Navigasi"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
