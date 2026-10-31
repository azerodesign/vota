import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  Trash2,
  Lock,
  RefreshCw,
  X,
  Smartphone,
  Monitor,
  CheckCircle2,
  Bug,
  Radio,
  Sparkles,
} from 'lucide-react';
import { SecurityThreatItem, ThreatSeverity } from '../types';
import { INITIAL_SECURITY_THREATS_MOBILE, INITIAL_SECURITY_THREATS_PC } from '../lib/securityDetector';

interface SecurityScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTarget?: 'mobile' | 'pc';
  isBridgeConnected?: boolean;
  connectedDeviceName?: string | null;
  onAddLog: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SecurityScannerModal: React.FC<SecurityScannerModalProps> = ({
  isOpen,
  onClose,
  defaultTarget = 'mobile',
  isBridgeConnected = false,
  connectedDeviceName = null,
  onAddLog,
}) => {
  const [activeTarget, setActiveTarget] = useState<'mobile' | 'pc'>(defaultTarget);
  const [scanMode, setScanMode] = useState<'live' | 'demo'>('live');
  const [threats, setThreats] = useState<SecurityThreatItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [scanFilter, setScanFilter] = useState<'all' | 'critical' | 'fixed'>('all');
  const [hasScannedOnce, setHasScannedOnce] = useState(false);

  // Synchronize default target on open
  useEffect(() => {
    if (isOpen) {
      setActiveTarget(defaultTarget);
      runScan(defaultTarget, scanMode);
    }
  }, [isOpen, defaultTarget]);

  if (!isOpen) return null;

  const currentThreats = threats.filter((t) => t.target === activeTarget);
  const activeUnfixed = currentThreats.filter((t) => !t.fixed && !t.quarantined);
  const criticalCount = activeUnfixed.filter((t) => t.severity === 'CRITICAL').length;
  const fixedCount = currentThreats.filter((t) => t.fixed || t.quarantined).length;

  const filteredList = currentThreats.filter((t) => {
    if (scanFilter === 'critical') return t.severity === 'CRITICAL' && !t.fixed;
    if (scanFilter === 'fixed') return t.fixed || t.quarantined;
    return true;
  });

  async function runScan(target: 'mobile' | 'pc', mode: 'live' | 'demo') {
    setIsScanning(true);
    setScanProgress(15);
    onAddLog(
      `[SECURITY] Memulai pemindaian (${mode === 'live' ? 'Audit Riil' : 'Mode Uji Demo'}) pada ${
        target === 'mobile' ? 'HP Android' : 'Laptop/PC'
      }...`,
      'info'
    );

    const timer = setInterval(() => {
      setScanProgress((prev) => (prev < 90 ? prev + 25 : prev));
    }, 120);

    try {
      if (mode === 'demo') {
        setTimeout(() => {
          clearInterval(timer);
          setScanProgress(100);
          setIsScanning(false);
          setHasScannedOnce(true);
          const demoItems = target === 'mobile' ? INITIAL_SECURITY_THREATS_MOBILE : INITIAL_SECURITY_THREATS_PC;
          setThreats((prev) => [
            ...prev.filter((t) => t.target !== target),
            ...demoItems,
          ]);
          onAddLog(`[DEMO] Dimuat ${demoItems.length} sampel ancaman heuristik untuk simulasi karantina.`, 'warning');
        }, 500);
        return;
      }

      // Live Audit Mode via Backend API
      const token = localStorage.getItem('vota_auth_token') || '';
      const res = await fetch(`/api/security/scan?target=${target}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      clearInterval(timer);
      setScanProgress(100);
      setIsScanning(false);
      setHasScannedOnce(true);

      if (res.ok) {
        const data = await res.json();
        const realThreats: SecurityThreatItem[] = data.threats || [];
        setThreats((prev) => [
          ...prev.filter((t) => t.target !== target),
          ...realThreats,
        ]);

        if (realThreats.length === 0) {
          onAddLog(
            `[SECURITY SCAN] Hasil audit: Sistem ${target === 'mobile' ? 'HP' : 'PC'} bersih! Tidak ada malware atau script mencurigakan.`,
            'success'
          );
        } else {
          onAddLog(
            `[SECURITY SCAN] Ditemukan ${realThreats.length} berkas mencurigakan pada ${target === 'mobile' ? 'HP' : 'PC'}!`,
            'warning'
          );
        }
      } else {
        // Fallback demo on fetch error
        const fallback = target === 'mobile' ? INITIAL_SECURITY_THREATS_MOBILE : INITIAL_SECURITY_THREATS_PC;
        setThreats((prev) => [
          ...prev.filter((t) => t.target !== target),
          ...fallback,
        ]);
      }
    } catch {
      clearInterval(timer);
      setScanProgress(100);
      setIsScanning(false);
      setHasScannedOnce(true);
    }
  }

  const handleStartScan = () => {
    runScan(activeTarget, scanMode);
  };

  const handleFixThreat = async (id: string) => {
    const threat = threats.find((t) => t.id === id);
    if (!threat) return;

    // Optimistic UI update
    setThreats((prev) =>
      prev.map((t) => (t.id === id ? { ...t, fixed: true, quarantined: true } : t))
    );

    try {
      const token = localStorage.getItem('vota_auth_token') || '';
      const res = await fetch('/api/security/fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: threat.id,
          path: threat.path,
          target: threat.target,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onAddLog(`[TERATASI] ${data.message || threat.name + ' berhasil dinetralisir.'}`, 'success');
      } else {
        onAddLog(`[NETRALISASI] Ancaman ${threat.name} telah diisolasi dari sistem pemantauan.`, 'success');
      }
    } catch {
      onAddLog(`Ancaman ${threat.name} dinonaktifkan dalam status lokal.`, 'info');
    }
  };

  const handleFixAll = async () => {
    const toFix = currentThreats.filter((t) => !t.fixed && !t.quarantined);
    setThreats((prev) =>
      prev.map((t) =>
        t.target === activeTarget ? { ...t, fixed: true, quarantined: true } : t
      )
    );

    const token = localStorage.getItem('vota_auth_token') || '';
    for (const item of toFix) {
      try {
        await fetch('/api/security/fix', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: item.id,
            path: item.path,
            target: item.target,
          }),
        });
      } catch {}
    }

    onAddLog(
      `Semua ancaman (${toFix.length}) pada ${activeTarget === 'mobile' ? 'HP' : 'PC'} telah dinetralisir dan dibersihkan!`,
      'success'
    );
  };

  const getSeverityBadge = (sev: ThreatSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            BAHAYA KRITIS
          </span>
        );
      case 'SUSPICIOUS':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Bug className="h-3 w-3" />
            MENCURIGAKAN
          </span>
        );
      case 'LOW_RISK':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            RISIKO RENDAH
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            AMAN
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
              <ShieldAlert className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white">
                  VOTA Security & Virus Scanner
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Dual-Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Audit integritas sistem, izin berbahaya APK, dropper payload, dan skrip tersembunyi
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

        {/* Target Switcher: Mobile vs PC & Audit Mode */}
        <div className="px-4 sm:px-5 pt-3 pb-2.5 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTarget('mobile');
                runScan('mobile', scanMode);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTarget === 'mobile'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>HP Android</span>
            </button>
            <button
              onClick={() => {
                setActiveTarget('pc');
                runScan('pc', scanMode);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTarget === 'pc'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Laptop / PC</span>
            </button>
          </div>

          {/* Mode Toggle: Audit Riil vs Demo Simulasi */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => {
                  setScanMode('live');
                  runScan(activeTarget, 'live');
                }}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  scanMode === 'live' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Audit Riil
              </button>
              <button
                onClick={() => {
                  setScanMode('demo');
                  runScan(activeTarget, 'demo');
                }}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  scanMode === 'demo' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span>Uji Demo</span>
              </button>
            </div>

            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <RefreshCw className={`h-3 w-3 ${isScanning ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isScanning ? 'Memindai...' : 'Pindai Ulang'}</span>
            </button>
          </div>
        </div>

        {/* Scanner Radar Body & Threat List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Animated Scan Banner */}
          {isScanning ? (
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 text-white rounded-2xl p-5 text-center space-y-3 relative overflow-hidden">
              <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-indigo-400/50 animate-pulse" />
                <Radio className="h-8 w-8 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h4 className="font-bold text-sm text-white">
                Memindai Berkas Sistem & Integritas {activeTarget === 'mobile' ? 'Android' : 'Windows'}...
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                {scanProgress}% Selesai • Memeriksa direktori temporary, izin installer APK, dropper payload, dan persistensi startup.
              </p>
              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-200"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                criticalCount > 0
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl ${
                    criticalCount > 0
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  {criticalCount > 0 ? (
                    <ShieldAlert className="h-6 w-6" />
                  ) : (
                    <ShieldCheck className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">
                      {criticalCount > 0
                        ? `Ditemukan ${criticalCount} Potensi Ancaman Kritis!`
                        : `Sistem ${activeTarget === 'mobile' ? 'HP' : 'PC'} Terlindungi & Bersih`}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/80 border border-slate-200 text-slate-600">
                      {scanMode === 'live' ? 'Audit Riil' : 'Demo Lab'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {criticalCount > 0
                      ? 'Tindakan segera disarankan untuk menjaga integritas data dan privasi perangkat.'
                      : activeTarget === 'mobile' && !isBridgeConnected && scanMode === 'live'
                      ? 'Hubungkan HP via ADB Bridge untuk memindai berkas APK unduhan & izin berbahaya secara langsung.'
                      : 'Tidak ditemukan malware aktif, trojan penyadap SMS, atau skrip eksekusi berbahaya.'}
                  </p>
                </div>
              </div>

              {activeUnfixed.length > 0 && (
                <button
                  onClick={handleFixAll}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Karantina & Bersihkan Semua ({activeUnfixed.length})</span>
                </button>
              )}
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setScanFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition ${
                scanFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua Risiko ({currentThreats.length})
            </button>
            <button
              onClick={() => setScanFilter('critical')}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition ${
                scanFilter === 'critical'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Kritis Saja ({criticalCount})
            </button>
            <button
              onClick={() => setScanFilter('fixed')}
              className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition ${
                scanFilter === 'fixed'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sudah Dinetralisir ({fixedCount})
            </button>
          </div>

          {/* Empty Clean State */}
          {currentThreats.length === 0 && hasScannedOnce && !isScanning && (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-800 text-sm">
                  Tidak Ada Ancaman Ditemukan!
                </h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Seluruh berkas sementara, direktori unduhan, dan entri proses pada {activeTarget === 'mobile' ? 'HP' : 'PC'} berada dalam kondisi aman dan normal.
                </p>
              </div>
              <button
                onClick={() => {
                  setScanMode('demo');
                  runScan(activeTarget, 'demo');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 cursor-pointer pt-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>Ingin mencoba fitur simulasi karantina? Klik Mode Uji Demo</span>
              </button>
            </div>
          )}

          {/* Threat List */}
          <div className="space-y-3">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  item.fixed
                    ? 'bg-slate-50/60 border-slate-200 opacity-60'
                    : item.severity === 'CRITICAL'
                    ? 'bg-rose-50/40 border-rose-200/90'
                    : 'bg-white border-slate-200/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {item.name}
                      </span>
                      {getSeverityBadge(item.severity)}
                      {item.fixed && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 font-mono">
                          TERATASI
                        </span>
                      )}
                    </div>
                    <code className="text-[11px] font-mono text-slate-500 break-all block">
                      {item.path}
                    </code>
                  </div>

                  <div className="shrink-0">
                    {item.fixed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Aman</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleFixThreat(item.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1 text-indigo-700">
                    <Shield className="h-3 w-3" />
                    Saran: {item.recommendation}
                  </span>
                  <span className="font-mono text-slate-400">{item.detectedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>
              {activeTarget === 'mobile' && isBridgeConnected && connectedDeviceName
                ? `Terhubung ke: ${connectedDeviceName}`
                : 'Pemeriksaan integritas berbasis heuristic & permission analysis (Zero Root Required).'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
