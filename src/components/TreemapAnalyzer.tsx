import React, { useState } from 'react';
import {
  Folder,
  File,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Filter,
  XCircle,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { TreemapNode } from '../types';
import { formatBytes } from '../lib/storageEngine';

interface TreemapAnalyzerProps {
  rootNode: TreemapNode;
  onRefreshScan: () => void;
}

export const TreemapAnalyzer: React.FC<TreemapAnalyzerProps> = ({
  rootNode,
  onRefreshScan,
}) => {
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [sortDescending, setSortDescending] = useState(true);
  const [selectedExt, setSelectedExt] = useState<string>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [currentScanningPath, setCurrentScanningPath] = useState('');

  // Find node by path trail
  const getCurrentNode = (): TreemapNode => {
    let curr = rootNode;
    for (let i = 1; i < currentPath.length; i++) {
      const child = curr.children?.find((c) => c.id === currentPath[i]);
      if (child) curr = child;
    }
    return curr;
  };

  const activeNode = getCurrentNode();

  // Navigation
  const handleDrillDown = (childId: string) => {
    setCurrentPath((prev) => [...prev, childId]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setCurrentPath((prev) => prev.slice(0, index + 1));
  };

  // Mock Scan with Cancellation Support
  const handleStartScan = () => {
    onRefreshScan();
    setIsScanning(true);
    setScanProgress(0);
    setCurrentScanningPath('/sdcard/Android/media...');

    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      if (p >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setScanProgress(100);
        setCurrentScanningPath('');
      } else {
        setScanProgress(p);
        setCurrentScanningPath(
          p < 50
            ? '/sdcard/Android/media/com.whatsapp.w4b...'
            : '/sdcard/DCIM/Camera/IMG_...'
        );
      }
    }, 250);

    // Save cancellation token on window or state
    (window as any).__votaScanCancel = () => {
      clearInterval(interval);
      setIsScanning(false);
      setScanProgress(100);
      setCurrentScanningPath('');
    };
  };

  const handleCancelScan = () => {
    if ((window as any).__votaScanCancel) {
      (window as any).__votaScanCancel();
    }
  };

  // Filter and sort children
  const children = activeNode.children || [];
  const filteredChildren = children
    .filter((child) => {
      if (selectedExt === 'all') return true;
      if (child.isDir) return true;
      return child.extension === selectedExt;
    })
    .sort((a, b) => {
      return sortDescending
        ? b.sizeBytes - a.sizeBytes
        : a.sizeBytes - b.sizeBytes;
    });

  const totalCurrentSize = children.reduce((acc, c) => acc + c.sizeBytes, 0) || 1;

  return (
    <div className="bg-[#0b101b] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Storage Treemap Analyzer (Visual Directory Hierarchy)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Eksplorasi visual ukuran folder dan file dengan dukungan filter ekstensi serta deteksi folder terproteksi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isScanning ? (
            <button
              onClick={handleCancelScan}
              className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <XCircle className="h-4 w-4 text-rose-400" />
              <span>Batalkan Scan</span>
            </button>
          ) : (
            <button
              onClick={handleStartScan}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Scan Ulang Direktori</span>
            </button>
          )}
        </div>
      </div>

      {/* Scan Progress Bar (if active) */}
      {isScanning && (
        <div className="p-4 bg-cyan-950/40 border border-cyan-800/40 rounded-xl space-y-2 animate-pulse">
          <div className="flex justify-between items-center text-xs">
            <span className="text-cyan-300 font-mono flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
              Memindai: <span className="text-slate-200">{currentScanningPath}</span>
            </span>
            <span className="font-mono font-bold text-cyan-400">{scanProgress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation Trail */}
      <div className="flex items-center flex-wrap gap-1.5 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800 font-mono">
        {currentPath.map((id, index) => {
          let label = '/sdcard';
          if (id === 'root') label = 'sdcard';
          else {
            // Find name
            const n = findNodeById(rootNode, id);
            label = n?.name || id;
          }

          const isLast = index === currentPath.length - 1;

          return (
            <React.Fragment key={id}>
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
              <button
                onClick={() => handleNavigateBreadcrumb(index)}
                disabled={isLast}
                className={`hover:text-cyan-300 transition-colors ${
                  isLast ? 'text-cyan-400 font-bold' : 'text-slate-400 cursor-pointer'
                }`}
              >
                {label}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Visual Proportional Treemap Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Representasi Visual Ukuran Sub-Folder:</span>
          <span className="font-mono text-slate-200">
            Total Terekam: {formatBytes(activeNode.sizeBytes, 1)}
          </span>
        </div>

        {/* Visual Multi-segment Bar */}
        <div className="h-9 w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex p-1 gap-1">
          {children.length === 0 ? (
            <div className="w-full flex items-center justify-center text-xs text-slate-500 font-mono">
              (Direktori ini tidak memiliki sub-folder)
            </div>
          ) : (
            children.map((child, idx) => {
              const pct = Math.max(3, Math.round((child.sizeBytes / totalCurrentSize) * 100));
              const colors = [
                'bg-cyan-500/80 hover:bg-cyan-400',
                'bg-indigo-500/80 hover:bg-indigo-400',
                'bg-emerald-500/80 hover:bg-emerald-400',
                'bg-amber-500/80 hover:bg-amber-400',
                'bg-rose-500/80 hover:bg-rose-400',
                'bg-purple-500/80 hover:bg-purple-400',
              ];
              const colorClass = child.isInaccessible
                ? 'bg-red-900/80 border border-red-500/50'
                : colors[idx % colors.length];

              return (
                <div
                  key={child.id}
                  onClick={() => child.isDir && !child.isInaccessible && handleDrillDown(child.id)}
                  style={{ width: `${pct}%` }}
                  title={`${child.name} - ${formatBytes(child.sizeBytes, 1)} (${child.fileCount} files)`}
                  className={`h-full rounded-lg ${colorClass} transition-all cursor-pointer flex items-center justify-center px-1 text-[10px] font-bold text-white truncate shadow-sm`}
                >
                  {child.isInaccessible ? '🔒' : pct >= 10 ? child.name : ''}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Controls: Sort and Extension Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortDescending(!sortDescending)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-cyan-400" />
            <span>Urutkan: {sortDescending ? 'Terbesar ke Terkecil' : 'Terkecil ke Terbesar'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Filter Ekstensi:</span>
          <select
            value={selectedExt}
            onChange={(e) => setSelectedExt(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">Semua Tipe Berkas</option>
            <option value=".mp4">Video (.mp4)</option>
            <option value=".jpg">Gambar (.jpg / .png)</option>
            <option value=".apk">Installer APK (.apk)</option>
            <option value=".zip">Arsip (.zip / .rar)</option>
          </select>
        </div>
      </div>

      {/* Directory Item List Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
            <tr>
              <th className="py-2.5 px-4">Nama Folder / File</th>
              <th className="py-2.5 px-4">Path Lengkap</th>
              <th className="py-2.5 px-4">Jumlah Berkas</th>
              <th className="py-2.5 px-4 text-right">Ukuran</th>
              <th className="py-2.5 px-4 text-center">Aksi / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
            {filteredChildren.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  Tidak ada berkas yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              filteredChildren.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200 flex items-center gap-2">
                    {item.isDir ? (
                      item.isInaccessible ? (
                        <Lock className="h-4 w-4 text-rose-400 flex-shrink-0" />
                      ) : (
                        <Folder className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      )
                    ) : (
                      <File className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={item.isInaccessible ? 'text-rose-300' : ''}>
                      {item.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[10px] max-w-xs truncate" title={item.path}>
                    {item.path}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {item.isInaccessible ? '-' : `${item.fileCount.toLocaleString()} file`}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-100">
                    {formatBytes(item.sizeBytes, 1)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.isInaccessible ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-sans">
                        <ShieldAlert className="h-3 w-3" />
                        Inaccessible (Restricted)
                      </span>
                    ) : item.isDir ? (
                      <button
                        onClick={() => handleDrillDown(item.id)}
                        className="px-2.5 py-1 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/50 rounded-lg text-[10px] transition cursor-pointer font-sans"
                      >
                        Buka &rarr;
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-sans">File</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function findNodeById(node: TreemapNode, id: string): TreemapNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const c of node.children) {
      const found = findNodeById(c, id);
      if (found) return found;
    }
  }
  return null;
}
