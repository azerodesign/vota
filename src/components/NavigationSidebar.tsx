import React from 'react';
import {
  X,
  LayoutDashboard,
  BookOpen,
  Settings,
  Smartphone,
  HardDrive,
  Zap,
  Radio,
  RefreshCw,
  ShieldAlert,
  Search,
  Copy,
  Package,
  PowerOff,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { DeviceMode, AdbDevice } from '../types';

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  mode: DeviceMode;
  onModeChange: (mode: DeviceMode) => void;
  isBridgeConnected: boolean;
  device?: AdbDevice;
  onOpenHpOnlyModal: () => void;
  onOpenBridgeModal: () => void;
  onOpenSwitchTutorial: () => void;
  onOpenSecurityScanner: () => void;
  onOpenDeepScanner?: () => void;
  onOpenDuplicates?: () => void;
  onOpenDebloat?: () => void;
  onDisconnectAdb?: () => void;
  onLogout?: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
  mode,
  onModeChange,
  isBridgeConnected,
  device,
  onOpenHpOnlyModal,
  onOpenBridgeModal,
  onOpenSwitchTutorial,
  onOpenSecurityScanner,
  onOpenDeepScanner,
  onOpenDuplicates,
  onOpenDebloat,
  onDisconnectAdb,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-out Sidebar Drawer */}
      <div className="relative flex flex-col w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl z-10 overflow-hidden text-slate-800 animate-slide-right">
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-wider text-white">VOTA</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Navigation & Device Center
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Section 1: Main Pages */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
              Menu Utama
            </span>
            <button
              onClick={() => {
                onNavigate('/');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                currentPath === '/'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4 text-blue-600" />
                <span>Dashboard Live</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onNavigate('/docs');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                currentPath === '/docs'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>Dokumentasi Resmi</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Publik
              </span>
            </button>

            <button
              onClick={() => {
                onNavigate('/settings');
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                currentPath === '/settings'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="h-4 w-4 text-slate-600" />
                <span>Pengaturan & Sesi</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>

          {/* Section 2: Mode Switcher */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
              Pilih Tampilan Perangkat
            </span>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  onModeChange('android');
                  if (currentPath !== '/') onNavigate('/');
                  onClose();
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                  mode === 'android'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                <span>HP (ADB)</span>
              </button>
              <button
                onClick={() => {
                  onModeChange('desktop');
                  if (currentPath !== '/') onNavigate('/');
                  onClose();
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                  mode === 'desktop'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HardDrive className="h-3.5 w-3.5 text-indigo-600" />
                <span>PC Desktop</span>
              </button>
            </div>
          </div>

          {/* Section 3: Connection & Pairing Center */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
              Pusat Sambungan ADB
            </span>
            <button
              onClick={() => {
                onOpenHpOnlyModal();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 text-blue-600" />
                <span>Panduan HP Only (Termux)</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onOpenBridgeModal();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Radio className="h-4 w-4 text-indigo-600" />
                <span>Hubungkan Laptop / PC</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                onOpenSwitchTutorial();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <RefreshCw className="h-4 w-4 text-emerald-600" />
                <span>Tutorial Ubah Laptop ke HP</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>

          {/* Section 4: Diagnostics & Optimization Tools */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
              Alat & Diagnostik
            </span>
            <button
              onClick={() => {
                onOpenSecurityScanner();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <span>Pemindai Virus & Malware</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                Audit
              </span>
            </button>

            {onOpenDeepScanner && (
              <button
                onClick={() => {
                  onOpenDeepScanner();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="h-4 w-4 text-indigo-600" />
                  <span>Deep Storage Scanner</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            )}

            {onOpenDuplicates && (
              <button
                onClick={() => {
                  onOpenDuplicates();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Copy className="h-4 w-4 text-amber-600" />
                  <span>Pencari File Duplikat</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            )}

            {onOpenDebloat && (
              <button
                onClick={() => {
                  onOpenDebloat();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span>Debloat Aplikasi Bawaan</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            )}
          </div>

          {/* Section 5: System Actions */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
              Tindakan Sesi
            </span>
            {isBridgeConnected && onDisconnectAdb && (
              <button
                onClick={() => {
                  onDisconnectAdb();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 font-bold transition cursor-pointer"
              >
                <PowerOff className="h-4 w-4 text-rose-600" />
                <span>Putuskan Sambungan ADB</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-slate-500" />
                <span>Kunci / Keluar Dashboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isBridgeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="truncate max-w-[170px]">
              {isBridgeConnected && device?.brand ? `${device.brand} ${device.model}` : (isBridgeConnected ? 'Bridge Aktif' : 'Menunggu Sambungan')}
            </span>
          </div>
          <a
            href="https://github.com/azerodesign/vota"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-bold transition"
          >
            <span>v1.0.0</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
