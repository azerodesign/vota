import React, { useState, useMemo } from 'react';
import {
  Folder,
  File,
  ChevronRight,
  ArrowUpDown,
  XCircle,
  RefreshCw,
  Lock,
  ArrowLeft,
  Video,
  Image,
  Package,
  FileArchive,
  Search,
  List,
  Grid,
  ShieldCheck,
} from 'lucide-react';
import { TreemapNode } from '../types';
import { formatBytes } from '../lib/storageEngine';

interface TreemapAnalyzerProps {
  rootNode: TreemapNode;
  onRefreshScan: () => void;
}

interface TileRect {
  node: TreemapNode;
  x: number;
  y: number;
  w: number;
  h: number;
  pct: number;
}

// 2D Squarified / Binary Recursive Partition
function computeTreemapLayout(
  nodes: TreemapNode[],
  x: number,
  y: number,
  w: number,
  h: number,
  totalSize: number
): TileRect[] {
  if (nodes.length === 0 || totalSize <= 0) return [];
  if (nodes.length === 1) {
    return [{
      node: nodes[0],
      x,
      y,
      w,
      h,
      pct: +((nodes[0].sizeBytes / totalSize) * 100).toFixed(1),
    }];
  }

  // Find partition point closest to 50% of size
  const half = totalSize / 2;
  let currentSum = 0;
  let splitIndex = 0;

  for (let i = 0; i < nodes.length; i++) {
    currentSum += nodes[i].sizeBytes;
    if (currentSum >= half || i === nodes.length - 1) {
      splitIndex = Math.max(1, i);
      break;
    }
  }

  const leftNodes = nodes.slice(0, splitIndex);
  const rightNodes = nodes.slice(splitIndex);

  const leftSize = leftNodes.reduce((acc, n) => acc + n.sizeBytes, 0);
  const rightSize = rightNodes.reduce((acc, n) => acc + n.sizeBytes, 0);
  const leftRatio = leftSize / (leftSize + rightSize);

  // Split along longest dimension
  if (w >= h) {
    const leftW = Math.round(w * leftRatio);
    const rightW = w - leftW;
    return [
      ...computeTreemapLayout(leftNodes, x, y, leftW, h, totalSize),
      ...computeTreemapLayout(rightNodes, x + leftW, y, rightW, h, totalSize),
    ];
  } else {
    const topH = Math.round(h * leftRatio);
    const bottomH = h - topH;
    return [
      ...computeTreemapLayout(leftNodes, x, y, w, topH, totalSize),
      ...computeTreemapLayout(rightNodes, x, y + topH, w, bottomH, totalSize),
    ];
  }
}

export const TreemapAnalyzer: React.FC<TreemapAnalyzerProps> = ({
  rootNode,
  onRefreshScan,
}) => {
  const [currentPath, setCurrentPath] = useState<string[]>(['root']);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'treemap' | 'list'>('treemap');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortDescending, setSortDescending] = useState(true);
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

  // Navigation handlers
  const handleDrillDown = (childId: string) => {
    setCurrentPath((prev) => [...prev, childId]);
    setSelectedNodeId(null);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setCurrentPath((prev) => prev.slice(0, index + 1));
    setSelectedNodeId(null);
  };

  const handleStepUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath((prev) => prev.slice(0, prev.length - 1));
      setSelectedNodeId(null);
    }
  };

  // Scan simulation with progress
  const handleStartScan = () => {
    onRefreshScan();
    setIsScanning(true);
    setScanProgress(0);
    setCurrentScanningPath('/sdcard/Android/media...');

    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      if (p <= 100) {
        setScanProgress(p);
        if (p === 40) setCurrentScanningPath('/sdcard/Download...');
        if (p === 80) setCurrentScanningPath('/sdcard/DCIM/Camera...');
      } else {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 350);
  };

  const handleCancelScan = () => {
    setIsScanning(false);
    setScanProgress(100);
  };

  // Filter & Sort Children
  const rawChildren = activeNode.children ? [...activeNode.children] : [];
  const totalCurrentSize = rawChildren.reduce((acc, c) => acc + c.sizeBytes, 0) || 1;

  const filteredChildren = useMemo(() => {
    let list = [...rawChildren];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.path.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'all') {
      list = list.filter((c) => {
        if (selectedCategory === 'video') return c.extension === '.mp4' || c.name.toLowerCase().includes('video');
        if (selectedCategory === 'image') return c.extension === '.jpg' || c.extension === '.png' || c.name.toLowerCase().includes('dcim') || c.name.toLowerCase().includes('image');
        if (selectedCategory === 'apk') return c.extension === '.apk';
        if (selectedCategory === 'archive') return c.extension === '.zip' || c.extension === '.rar';
        if (selectedCategory === 'restricted') return !!c.isInaccessible;
        return true;
      });
    }

    if (sortDescending) {
      list.sort((a, b) => b.sizeBytes - a.sizeBytes);
    } else {
      list.sort((a, b) => a.sizeBytes - b.sizeBytes);
    }
    return list;
  }, [rawChildren, searchQuery, selectedCategory, sortDescending]);

  // Compute 2D Treemap Tiles
  const treemapTiles = useMemo(() => {
    return computeTreemapLayout(filteredChildren, 0, 0, 100, 100, totalCurrentSize);
  }, [filteredChildren, totalCurrentSize]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return rawChildren.find((c) => c.id === selectedNodeId) || null;
  }, [selectedNodeId, rawChildren]);

  // Node Category Badge & Style Helper
  const getNodeStyling = (node: TreemapNode) => {
    if (node.isInaccessible) {
      return {
        bg: 'bg-rose-50 hover:bg-rose-100',
        border: 'border-rose-300',
        text: 'text-rose-900',
        badge: 'bg-rose-100 text-rose-800',
        icon: <Lock className="h-4 w-4 text-rose-600" />,
        categoryName: 'Restricted / Scoped Storage',
      };
    }
    const nameLower = node.name.toLowerCase();
    const ext = node.extension?.toLowerCase() || '';

    if (ext === '.mp4' || nameLower.includes('video') || nameLower.includes('movie')) {
      return {
        bg: 'bg-purple-50/80 hover:bg-purple-100/90',
        border: 'border-purple-300',
        text: 'text-purple-950',
        badge: 'bg-purple-100 text-purple-800',
        icon: <Video className="h-4 w-4 text-purple-600" />,
        categoryName: 'Video & Rekaman',
      };
    }
    if (ext === '.jpg' || ext === '.png' || nameLower.includes('camera') || nameLower.includes('dcim') || nameLower.includes('image')) {
      return {
        bg: 'bg-sky-50/80 hover:bg-sky-100/90',
        border: 'border-sky-300',
        text: 'text-sky-950',
        badge: 'bg-sky-100 text-sky-800',
        icon: <Image className="h-4 w-4 text-sky-600" />,
        categoryName: 'Foto & Gambar',
      };
    }
    if (ext === '.apk') {
      return {
        bg: 'bg-emerald-50/80 hover:bg-emerald-100/90',
        border: 'border-emerald-300',
        text: 'text-emerald-950',
        badge: 'bg-emerald-100 text-emerald-800',
        icon: <Package className="h-4 w-4 text-emerald-600" />,
        categoryName: 'Paket Installer APK',
      };
    }
    if (ext === '.zip' || ext === '.rar') {
      return {
        bg: 'bg-amber-50/80 hover:bg-amber-100/90',
        border: 'border-amber-300',
        text: 'text-amber-950',
        badge: 'bg-amber-100 text-amber-800',
        icon: <FileArchive className="h-4 w-4 text-amber-600" />,
        categoryName: 'Arsip & Dokumen',
      };
    }
    if (node.isDir) {
      return {
        bg: 'bg-blue-50/80 hover:bg-blue-100/90',
        border: 'border-blue-300',
        text: 'text-blue-950',
        badge: 'bg-blue-100 text-blue-800',
        icon: <Folder className="h-4 w-4 text-blue-600" />,
        categoryName: 'Direktori Folder',
      };
    }
    return {
      bg: 'bg-slate-50 hover:bg-slate-100',
      border: 'border-slate-300',
      text: 'text-slate-900',
      badge: 'bg-slate-200 text-slate-800',
      icon: <File className="h-4 w-4 text-slate-600" />,
      categoryName: 'Berkas Data',
    };
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 animate-fade-in">
      {/* Header & Scanning Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Storage Treemap Visualizer
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              2D Proportional Hierarchy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Eksplorasi visual proporsi ukuran folder dan berkas dengan zoom interaktif dan deteksi partisi terproteksi.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('treemap')}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'treemap' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
              title="Tampilan Visual Treemap 2D"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
              }`}
              title="Tampilan Tabel Berkas Detail"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {isScanning ? (
            <button
              onClick={handleCancelScan}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5 text-rose-600" />
              <span>Batal</span>
            </button>
          ) : (
            <button
              onClick={handleStartScan}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer btn-bounce"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Pindai Ulang</span>
            </button>
          )}
        </div>
      </div>

      {/* Scan Progress Bar */}
      {isScanning && (
        <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2 animate-pulse">
          <div className="flex justify-between items-center text-xs">
            <span className="text-blue-900 font-mono flex items-center gap-2 font-semibold">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
              Memindai: <span className="text-slate-800 truncate max-w-xs">{currentScanningPath}</span>
            </span>
            <span className="font-mono font-bold text-blue-600">{scanProgress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-sky-500 transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Directory Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="text-[10px] text-slate-500 font-medium">Ukuran Folder Ini</div>
          <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
            {formatBytes(activeNode.sizeBytes, 2)}
          </div>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="text-[10px] text-slate-500 font-medium">Jumlah Sub-Item</div>
          <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
            {rawChildren.length} Item
          </div>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="text-[10px] text-slate-500 font-medium">Total Berkas di Dalamnya</div>
          <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
            {activeNode.fileCount.toLocaleString()} File
          </div>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="text-[10px] text-slate-500 font-medium">Status Akses Android</div>
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Terbuka & Terindeks</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation Trail */}
      <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
          {currentPath.length > 1 && (
            <button
              onClick={handleStepUp}
              className="mr-1 px-2 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Kembali ke folder sebelumnya"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Kembali</span>
            </button>
          )}

          {currentPath.map((id, index) => {
            let label = '/sdcard';
            if (id === 'root') label = 'sdcard';
            else {
              const n = findNodeById(rootNode, id);
              label = n?.name || id;
            }

            const isLast = index === currentPath.length - 1;

            return (
              <React.Fragment key={id}>
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                <button
                  onClick={() => handleNavigateBreadcrumb(index)}
                  disabled={isLast}
                  className={`px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ${
                    isLast
                      ? 'text-blue-600 font-black bg-blue-50 border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:underline cursor-pointer'
                  }`}
                >
                  {label}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-500 shrink-0 font-medium hidden sm:block">
          Klik blok untuk masuk ke sub-folder
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Semua Tipe' },
            { id: 'video', label: 'Video (.mp4)' },
            { id: 'image', label: 'Foto/Gambar' },
            { id: 'apk', label: 'Installer APK' },
            { id: 'archive', label: 'Arsip ZIP' },
            { id: 'restricted', label: 'Restricted 🔒' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer text-xs ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSortDescending(!sortDescending)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            title={sortDescending ? 'Urutan: Ukuran Terbesar' : 'Urutan: Ukuran Terkecil'}
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">{sortDescending ? 'Terbesar' : 'Terkecil'}</span>
          </button>
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari folder / berkas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: 2D SQUARIFIED VISUAL TREEMAP CONTAINER */}
      {viewMode === 'treemap' && (
        <div className="space-y-3">
          <div className="relative w-full h-80 sm:h-96 bg-slate-950/5 border border-slate-200 rounded-2xl overflow-hidden p-1.5">
            {treemapTiles.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Folder className="h-8 w-8 text-slate-300 mb-1" />
                <span>Tidak ada sub-folder atau berkas di lokasi ini.</span>
              </div>
            ) : (
              treemapTiles.map(({ node, x, y, w, h, pct }) => {
                const style = getNodeStyling(node);
                const isSelected = selectedNodeId === node.id;

                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      if (node.isDir && !node.isInaccessible) {
                        handleDrillDown(node.id);
                      }
                    }}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${w}%`,
                      height: `${h}%`,
                    }}
                    className={`absolute p-2.5 rounded-xl border ${style.border} ${style.bg} transition-all duration-150 cursor-pointer overflow-hidden flex flex-col justify-between group shadow-xs ${
                      isSelected ? 'ring-2 ring-blue-600 z-20' : 'hover:scale-[0.99] hover:z-10'
                    }`}
                  >
                    {/* Top Row: Icon + Name + Percentage */}
                    <div className="flex items-start justify-between gap-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="shrink-0">{style.icon}</div>
                        <span className={`font-bold text-xs truncate ${style.text}`}>
                          {node.name}
                        </span>
                      </div>
                      {w >= 14 && h >= 14 && (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md shrink-0 ${style.badge}`}>
                          {pct}%
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Size + File count (if tile is large enough) */}
                    {w >= 16 && h >= 22 && (
                      <div className="mt-1 pt-1 border-t border-black/5 flex items-center justify-between text-[11px] font-mono">
                        <span className="font-bold text-slate-900">
                          {formatBytes(node.sizeBytes, 1)}
                        </span>
                        {!node.isInaccessible && (
                          <span className="text-[10px] text-slate-500 font-sans">
                            {node.fileCount} file
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Interactive Inspection Detail Card */}
          {selectedNode && (
            <div className="p-4 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-white border border-blue-200 rounded-xl shadow-xs">
                  {getNodeStyling(selectedNode).icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 text-sm">{selectedNode.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {getNodeStyling(selectedNode).categoryName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 break-all select-all">
                    {selectedNode.path}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs font-mono">
                    <span className="font-bold text-slate-900">
                      Ukuran: {formatBytes(selectedNode.sizeBytes, 2)}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">
                      {selectedNode.fileCount.toLocaleString()} Berkas
                    </span>
                  </div>
                </div>
              </div>

              {selectedNode.isDir && !selectedNode.isInaccessible && (
                <button
                  onClick={() => handleDrillDown(selectedNode.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer btn-bounce self-start sm:self-center"
                >
                  <span>Masuk ke Folder Ini</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DETAILED HIERARCHICAL TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 font-mono">
              <tr>
                <th className="py-2.5 px-4 font-bold">Nama Item</th>
                <th className="py-2.5 px-4 font-bold">Kategori</th>
                <th className="py-2.5 px-4 font-bold">Jumlah Berkas</th>
                <th className="py-2.5 px-4 text-right font-bold">Ukuran</th>
                <th className="py-2.5 px-4 text-right font-bold">Proporsi (%)</th>
                <th className="py-2.5 px-4 text-center font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredChildren.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada berkas yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredChildren.map((item) => {
                  const style = getNodeStyling(item);
                  const pct = +((item.sizeBytes / totalCurrentSize) * 100).toFixed(1);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        {style.icon}
                        <span className={item.isInaccessible ? 'text-rose-600' : ''}>
                          {item.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-500 text-[11px]">
                        {style.categoryName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.isInaccessible ? '-' : `${item.fileCount.toLocaleString()} file`}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatBytes(item.sizeBytes, 1)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-600">
                        {pct}%
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        {item.isInaccessible ? (
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            Terkunci
                          </span>
                        ) : item.isDir ? (
                          <button
                            onClick={() => handleDrillDown(item.id)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            Buka &rarr;
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Berkas</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
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
