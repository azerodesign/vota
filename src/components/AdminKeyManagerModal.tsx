import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Key,
  Shield,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
  Terminal,
  Smartphone,
  CheckCircle2,
  Search,
  Lock,
  Sparkles,
  Download,
  Layers,
  ShieldCheck,
  RotateCcw,
  Globe,
  MapPin,
} from 'lucide-react';

export interface VotaKeyRecord {
  key: string;
  role: 'admin' | 'user';
  label: string;
  createdAt: number;
  expiresAt: number | null;
  active: boolean;
  roomId: string;
  lastConnected: number | null;
  boundIp?: string | null;
  boundAt?: number | null;
  lastIp?: string | null;
}

interface AdminKeyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToken: string;
}

export const AdminKeyManagerModal: React.FC<AdminKeyManagerModalProps> = ({
  isOpen,
  onClose,
  adminToken,
}) => {
  const [keys, setKeys] = useState<VotaKeyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [newKeyRole, setNewKeyRole] = useState<'user' | 'admin'>('user');
  const [newKeyDuration, setNewKeyDuration] = useState<string>('30');
  const [newKeyCount, setNewKeyCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentlyCreatedKeys, setRecentlyCreatedKeys] = useState<VotaKeyRecord[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://vota.axy.my.id';

  const fetchKeys = useCallback(async () => {
    if (!adminToken) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/keys', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.keys)) {
        setKeys(data.keys);
      } else {
        setErrorMsg(data.error || 'Gagal memuat daftar kunci akses.');
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server untuk memuat kunci.');
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (isOpen) {
      fetchKeys();
      setRecentlyCreatedKeys([]);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, fetchKeys]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const durationDays = newKeyDuration === 'permanent' ? null : Number(newKeyDuration);
    const count = Math.max(1, Math.min(50, newKeyCount || 1));

    try {
      const res = await fetch('/api/admin/keys/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          label: newKeyLabel.trim() || undefined,
          durationDays,
          role: newKeyRole,
          count,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const records: VotaKeyRecord[] =
          data.keyRecords || (data.keyRecord ? [data.keyRecord] : []);
        setRecentlyCreatedKeys(records);
        if (records.length > 1) {
          setSuccessMsg(`Berhasil membuat ${records.length} kunci akses sekaligus!`);
        } else if (records.length === 1) {
          setSuccessMsg(`Kunci baru ${records[0].key} berhasil dibuat!`);
        }
        setNewKeyLabel('');
        fetchKeys();
      } else {
        setErrorMsg(data.error || 'Gagal membuat kunci baru.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi saat membuat kunci.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAllKeys = () => {
    if (recentlyCreatedKeys.length === 0) return;
    const text = recentlyCreatedKeys
      .map((k, idx) => `${idx + 1}. ${k.key} [${k.label}] - Room: ${k.roomId}`)
      .join('\n');
    copyToClipboard(text, 'all-keys-list');
  };

  // Copy all keys from entire list, EXCLUDING Master Key & Admin keys
  const handleCopyAllUserKeysFromList = (format: 'raw' | 'numbered' = 'raw') => {
    const userKeys = filteredKeys.filter(
      (k) => k.key !== 'ADM-VOTA-2026' && k.role !== 'admin'
    );
    if (userKeys.length === 0) {
      alert('Tidak ada kunci pengguna untuk disalin (Master Admin Key otomatis dikecualikan).');
      return;
    }

    let text = '';
    if (format === 'raw') {
      text = userKeys.map((k) => k.key).join('\n');
    } else {
      text = userKeys
        .map((k, idx) => `${idx + 1}. ${k.key} [${k.label}] - Room: ${k.roomId}`)
        .join('\n');
    }

    copyToClipboard(text, `all-users-${format}`);
  };

  const handleCopyAllUserScripts = (type: 'ps1' | 'sh') => {
    const userKeys = filteredKeys.filter(
      (k) => k.key !== 'ADM-VOTA-2026' && k.role !== 'admin'
    );
    if (userKeys.length === 0) {
      alert('Tidak ada kunci pengguna untuk disalin.');
      return;
    }

    let text = '';
    if (type === 'ps1') {
      text = userKeys
        .map(
          (k) =>
            `# ${k.label}\npowershell -ExecutionPolicy Bypass -c "irm '${currentOrigin}/vota.ps1?key=${k.key}' | iex"`
        )
        .join('\n\n');
    } else {
      text = userKeys
        .map((k) => `# ${k.label}\ncurl -sL ${currentOrigin}/vota.sh?key=${k.key} | bash`)
        .join('\n\n');
    }

    copyToClipboard(text, `all-users-scripts-${type}`);
  };

  const handleCopyAllPs1 = () => {
    if (recentlyCreatedKeys.length === 0) return;
    const text = recentlyCreatedKeys
      .map(
        (k) =>
          `# ${k.label}\npowershell -ExecutionPolicy Bypass -c "irm '${currentOrigin}/vota.ps1?key=${k.key}' | iex"`
      )
      .join('\n\n');
    copyToClipboard(text, 'all-ps1-list');
  };

  const handleCopyAllTermux = () => {
    if (recentlyCreatedKeys.length === 0) return;
    const text = recentlyCreatedKeys
      .map((k) => `# ${k.label}\ncurl -sL ${currentOrigin}/vota.sh?key=${k.key} | bash`)
      .join('\n\n');
    copyToClipboard(text, 'all-sh-list');
  };

  const handleDownloadTxt = () => {
    if (recentlyCreatedKeys.length === 0) return;
    const lines = [
      `=====================================================`,
      ` VOTA - DAFTAR KUNCI AKSES CLIENT (BATCH GENERATION) `,
      ` Tanggal Dibuat: ${new Date().toLocaleString('id-ID')}`,
      ` Server        : ${currentOrigin}`,
      ` Total Kunci   : ${recentlyCreatedKeys.length}`,
      `=====================================================\n`,
    ];

    recentlyCreatedKeys.forEach((k, idx) => {
      lines.push(`[${idx + 1}] KUNCI: ${k.key}`);
      lines.push(`    Label    : ${k.label}`);
      lines.push(`    Tipe     : ${k.role.toUpperCase()}`);
      lines.push(`    Room ID  : ${k.roomId}`);
      lines.push(
        `    Expired  : ${
          k.expiresAt ? new Date(k.expiresAt).toLocaleDateString('id-ID') : 'Permanen'
        }`
      );
      lines.push(
        `    Script PC: powershell -ExecutionPolicy Bypass -c "irm '${currentOrigin}/vota.ps1?key=${k.key}' | iex"`
      );
      lines.push(`    Script HP: curl -sL ${currentOrigin}/vota.sh?key=${k.key} | bash`);
      lines.push(`-----------------------------------------------------`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VOTA-Keys-Batch-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleActive = async (targetKey: string, currentActive: boolean) => {
    if (!adminToken) return;
    const endpoint = currentActive ? '/api/admin/keys/revoke' : '/api/admin/keys/activate';
    setActionLoadingKey(targetKey);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ key: targetKey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchKeys();
      } else {
        alert(data.error || 'Gagal mengubah status kunci.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleDeleteKey = async (targetKey: string) => {
    if (!adminToken) return;
    if (targetKey === 'ADM-VOTA-2026') {
      alert('Master Administrator Key tidak dapat dihapus!');
      return;
    }
    if (
      !window.confirm(
        `Yakin ingin menghapus kunci "${targetKey}" secara permanen? Perangkat terkait tidak akan bisa terhubung lagi.`
      )
    ) {
      return;
    }

    setActionLoadingKey(targetKey);
    try {
      const res = await fetch('/api/admin/keys/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ key: targetKey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecentlyCreatedKeys((prev) => prev.filter((k) => k.key !== targetKey));
        fetchKeys();
      } else {
        alert(data.error || 'Gagal menghapus kunci.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setActionLoadingKey(null);
    }
  };

  const handleResetIp = async (targetKey: string) => {
    if (!adminToken) return;
    if (
      !window.confirm(
        `Reset binding IP untuk kunci "${targetKey}"? Kunci ini akan dapat digunakan dari IP baru dan langsung terikat pada IP tersebut saat pertama kali login.`
      )
    ) {
      return;
    }

    setActionLoadingKey(targetKey);
    try {
      const res = await fetch('/api/admin/keys/reset-ip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ key: targetKey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchKeys();
      } else {
        alert(data.error || 'Gagal me-reset binding IP.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setActionLoadingKey(null);
    }
  };

  if (!isOpen) return null;

  const filteredKeys = keys.filter(
    (k) =>
      k.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = keys.filter(
    (k) => k.active && (!k.expiresAt || Date.now() < k.expiresAt)
  ).length;
  const expiredOrRevokedCount = keys.length - activeCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200/90 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-400/30">
              <Key className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white">
                  Key Manager & Multi-User
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  <Shield className="h-3 w-3" /> Admin Area
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Buat format key VOTA-XXXX-XXXX untuk klien (satuan atau banyak sekaligus) & atur ruang terisolasi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Kunci
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">{keys.length}</span>
            </div>
            <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                Kunci Aktif
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700">{activeCount}</span>
            </div>
            <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block mb-1">
                Revoked / Expired
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-700">
                {expiredOrRevokedCount}
              </span>
            </div>
          </div>

          {/* Alert Messages if any */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && recentlyCreatedKeys.length === 0 && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Create Key Card */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl shadow-md border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
                  Buat Kunci Akses Baru (Single / Batch Generator)
                </h3>
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                Dukungan pembuatan 1 hingga 50 key sekaligus
              </span>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
                {/* Label */}
                <div className="sm:col-span-4">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Nama Klien / Label Perangkat
                  </label>
                  <input
                    type="text"
                    value={newKeyLabel}
                    onChange={(e) => setNewKeyLabel(e.target.value)}
                    placeholder="Contoh: Laptop Kantor, QC Device"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-amber-400 rounded-xl text-white text-xs font-medium outline-none transition"
                  />
                </div>

                {/* Role */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Tipe Akses
                  </label>
                  <select
                    value={newKeyRole}
                    onChange={(e) => setNewKeyRole(e.target.value as 'user' | 'admin')}
                    className="w-full px-2.5 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-amber-400 rounded-xl text-white text-xs font-medium outline-none transition"
                  >
                    <option value="user">User (VOTA-)</option>
                    <option value="admin">Admin (ADM-)</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                    Masa Aktif
                  </label>
                  <select
                    value={newKeyDuration}
                    onChange={(e) => setNewKeyDuration(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-amber-400 rounded-xl text-white text-xs font-medium outline-none transition"
                  >
                    <option value="7">7 Hari (Trial)</option>
                    <option value="30">30 Hari (1 Bln)</option>
                    <option value="90">90 Hari (3 Bln)</option>
                    <option value="365">1 Tahun</option>
                    <option value="permanent">Permanen</option>
                  </select>
                </div>

                {/* Count / Quantity (Batch Generation) */}
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>Jumlah Kunci</span>
                    <span className="text-amber-400 font-mono font-bold">{newKeyCount}x</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newKeyCount}
                    onChange={(e) =>
                      setNewKeyCount(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))
                    }
                    className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 focus:border-amber-400 rounded-xl text-white text-xs font-mono font-bold outline-none transition text-center"
                  />
                </div>

                {/* Submit Button */}
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    <span>{newKeyCount > 1 ? `Bikin ${newKeyCount} Key` : 'Generate'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Batch Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Preset cepat:</span>
                {[1, 3, 5, 10, 20, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNewKeyCount(num)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      newKeyCount === num
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {num === 1 ? '1 Key (Satuan)' : `${num} Key Sekaligus`}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Prominent Newly Created Key (SINGLE RESULT) */}
          {recentlyCreatedKeys.length === 1 && (
            <div className="p-5 bg-emerald-50/90 border-2 border-emerald-400/80 rounded-3xl animate-scale-up shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h4 className="text-sm font-black text-emerald-950">
                    Kunci Akses Baru Siap Digunakan!
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {recentlyCreatedKeys[0].label}
                </span>
              </div>

              {/* Key Box */}
              <div className="flex items-center justify-between gap-3 p-3.5 bg-white border border-emerald-300 rounded-2xl mb-3 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Kunci Akses ({recentlyCreatedKeys[0].role.toUpperCase()})
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-wider">
                    {recentlyCreatedKeys[0].key}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(recentlyCreatedKeys[0].key, 'new-key')}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                >
                  {copiedField === 'new-key' ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Key</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Connect Snippets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* PowerShell Command */}
                <div className="p-3 bg-white/90 border border-emerald-200 rounded-xl flex flex-col justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Terminal className="h-3.5 w-3.5 text-blue-600" />
                    <span>Perintah Laptop / PC (PowerShell)</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg break-all border border-slate-200">
                    powershell -c &quot;irm &apos;{currentOrigin}/vota.ps1?key={recentlyCreatedKeys[0].key}&apos; | iex&quot;
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `powershell -ExecutionPolicy Bypass -c "irm '${currentOrigin}/vota.ps1?key=${recentlyCreatedKeys[0].key}' | iex"`,
                        'new-ps1'
                      )
                    }
                    className="self-end text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'new-ps1' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedField === 'new-ps1' ? 'Tersalin!' : 'Salin Perintah PC'}</span>
                  </button>
                </div>

                {/* Termux / Linux Command */}
                <div className="p-3 bg-white/90 border border-emerald-200 rounded-xl flex flex-col justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Perintah HP / Termux (Shell)</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg break-all border border-slate-200">
                    curl -sL {currentOrigin}/vota.sh?key={recentlyCreatedKeys[0].key} | bash
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `curl -sL ${currentOrigin}/vota.sh?key=${recentlyCreatedKeys[0].key} | bash`,
                        'new-sh'
                      )
                    }
                    className="self-end text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'new-sh' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedField === 'new-sh' ? 'Tersalin!' : 'Salin Perintah Termux'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Prominent Newly Created Keys (BATCH RESULT > 1) */}
          {recentlyCreatedKeys.length > 1 && (
            <div className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-400 rounded-3xl animate-scale-up shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-950">
                      🎉 {recentlyCreatedKeys.length} Kunci Akses Berhasil Dibuat Sekaligus!
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium">
                      Kunci telah terdaftar di database dan siap dibagikan ke klien.
                    </p>
                  </div>
                </div>

                {/* Batch Action Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCopyAllKeys}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    title="Salin seluruh kunci dalam format teks daftar"
                  >
                    {copiedField === 'all-keys-list' ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Daftar Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Semua Key (List)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyAllPs1}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    title="Salin seluruh skrip perintah PowerShell untuk semua kunci"
                  >
                    {copiedField === 'all-ps1-list' ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Perintah Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="h-3.5 w-3.5" />
                        <span>Salin Script PC (Semua)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyAllTermux}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    title="Salin seluruh skrip perintah Termux untuk semua kunci"
                  >
                    {copiedField === 'all-sh-list' ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Script HP Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="h-3.5 w-3.5" />
                        <span>Salin Script HP (Semua)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    title="Unduh daftar kunci dan panduan koneksi dalam format file .txt"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh File TXT</span>
                  </button>
                </div>
              </div>

              {/* Scrollable List of Created Keys */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {recentlyCreatedKeys.map((k, index) => (
                  <div
                    key={k.key}
                    className="p-3 bg-white/95 border border-emerald-300/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-sm tracking-wide">
                            {k.key}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {k.role.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {k.label} • Room: <code className="font-mono text-slate-700">{k.roomId}</code>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => copyToClipboard(k.key, `batch-key-${k.key}`)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition"
                      >
                        {copiedField === `batch-key-${k.key}` ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>Key</span>
                      </button>

                      <button
                        onClick={() =>
                          copyToClipboard(
                            `powershell -ExecutionPolicy Bypass -c "irm '${currentOrigin}/vota.ps1?key=${k.key}' | iex"`,
                            `batch-ps1-${k.key}`
                          )
                        }
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition border border-blue-200/80"
                      >
                        {copiedField === `batch-ps1-${k.key}` ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Terminal className="h-3 w-3" />
                        )}
                        <span>PC</span>
                      </button>

                      <button
                        onClick={() =>
                          copyToClipboard(
                            `curl -sL ${currentOrigin}/vota.sh?key=${k.key} | bash`,
                            `batch-sh-${k.key}`
                          )
                        }
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition border border-emerald-200/80"
                      >
                        {copiedField === `batch-sh-${k.key}` ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Smartphone className="h-3 w-3" />
                        )}
                        <span>HP</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Table / Cards Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-900 tracking-wide">
                Daftar Seluruh Kunci Akses ({filteredKeys.length})
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari key atau label..."
                    className="pl-8 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition"
                  />
                </div>
                <button
                  onClick={fetchKeys}
                  disabled={loading}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition cursor-pointer"
                  title="Segarkan daftar"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Quick Bulk Action Bar for Key List (Excluding Master Key) */}
            <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>
                    {filteredKeys.filter((k) => k.key !== 'ADM-VOTA-2026' && k.role !== 'admin').length} Kunci Klien Pengguna
                  </span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  🔒 Master Admin Key Dikecualikan
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleCopyAllUserKeysFromList('raw')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                  title="Salin seluruh kunci klien pengguna (Master Key otomatis dikecualikan)"
                >
                  {copiedField === 'all-users-raw' ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Semua Key Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Semua Key</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopyAllUserKeysFromList('numbered')}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs text-[11px]"
                  title="Salin semua kunci dengan nomor dan label (Master Key dikecualikan)"
                >
                  {copiedField === 'all-users-numbered' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Daftar Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin List + Label</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopyAllUserScripts('ps1')}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs text-[11px]"
                  title="Salin seluruh perintah PC untuk semua user"
                >
                  {copiedField === 'all-users-scripts-ps1' ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Script PC Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Terminal className="h-3.5 w-3.5" />
                      <span>Script PC Semua</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopyAllUserScripts('sh')}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs text-[11px]"
                  title="Salin seluruh perintah Termux untuk semua user"
                >
                  {copiedField === 'all-users-scripts-sh' ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Script HP Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-3.5 w-3.5" />
                      <span>Script HP Semua</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List */}
            {filteredKeys.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 text-xs font-medium">
                Tidak ada kunci akses yang cocok dengan pencarian.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredKeys.map((k) => {
                  const isExpired = k.expiresAt && Date.now() > k.expiresAt;
                  const isMaster = k.key === 'ADM-VOTA-2026';

                  return (
                    <div
                      key={k.key}
                      className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Key & Metadata */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm sm:text-base font-black text-slate-900 tracking-wider">
                            {k.key}
                          </span>
                          {/* Role Badge */}
                          {k.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              👑 {isMaster ? 'Master Admin' : 'Admin'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              👤 User
                            </span>
                          )}

                          {isMaster && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-amber-400/40">
                              🔒 Dikecualikan Dari Salin Semua
                            </span>
                          )}

                          {/* Status Badge */}
                          {!k.active ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              ⛔ Dicabut
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              ⏳ Kadaluwarsa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              🟢 Aktif
                            </span>
                          )}

                          {/* IP Binding Status Badge */}
                          {k.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <Globe className="h-3 w-3 text-indigo-600" />
                              <span>Bebas IP (Multi-IP Admin)</span>
                            </span>
                          ) : k.boundIp ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono">
                              <MapPin className="h-3 w-3 text-emerald-600" />
                              <span>Terikat: {k.boundIp}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                              ⚪ Belum Terikat (1 IP Otomatis)
                            </span>
                          )}
                        </div>

                        {/* Label & Room */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                          <span className="font-bold text-slate-700">{k.label}</span>
                          <span>•</span>
                          <span>
                            Room: <code className="font-mono text-slate-600">{k.roomId}</code>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {k.expiresAt
                              ? `Exp: ${new Date(k.expiresAt).toLocaleDateString('id-ID')}`
                              : 'Permanen'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {/* Copy Key */}
                        <button
                          onClick={() => copyToClipboard(k.key, `btn-key-${k.key}`)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition cursor-pointer"
                          title="Salin Key"
                        >
                          {copiedField === `btn-key-${k.key}` ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Copy PowerShell Cmd */}
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `powershell -ExecutionPolicy Bypass -c "irm '${currentOrigin}/vota.ps1?key=${k.key}' | iex"`,
                              `btn-ps1-${k.key}`
                            )
                          }
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition"
                          title="Salin Perintah PowerShell 1-Baris"
                        >
                          {copiedField === `btn-ps1-${k.key}` ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Terminal className="h-3 w-3" />
                          )}
                          <span className="hidden sm:inline">PS1</span>
                        </button>

                        {/* Copy Termux Cmd */}
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `curl -sL ${currentOrigin}/vota.sh?key=${k.key} | bash`,
                              `btn-sh-${k.key}`
                            )
                          }
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition"
                          title="Salin Perintah Termux 1-Baris"
                        >
                          {copiedField === `btn-sh-${k.key}` ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Smartphone className="h-3 w-3" />
                          )}
                          <span className="hidden sm:inline">Termux</span>
                        </button>

                        {/* Reset Bound IP (User Only) */}
                        {k.role === 'user' && k.boundIp && (
                          <button
                            onClick={() => handleResetIp(k.key)}
                            disabled={actionLoadingKey === k.key}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition cursor-pointer flex items-center gap-1"
                            title={`Reset binding IP (${k.boundIp})`}
                          >
                            <RotateCcw className={`h-3 w-3 ${actionLoadingKey === k.key ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Reset IP</span>
                          </button>
                        )}

                        {/* Revoke / Activate Toggle */}
                        {!isMaster && (
                          <button
                            onClick={() => handleToggleActive(k.key, k.active)}
                            disabled={actionLoadingKey === k.key}
                            className={`px-2.5 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                              k.active
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                            }`}
                            title={k.active ? 'Cabut Akses Kunci' : 'Aktifkan Kembali Kunci'}
                          >
                            {actionLoadingKey === k.key ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : k.active ? (
                              'Cabut'
                            ) : (
                              'Aktifkan'
                            )}
                          </button>
                        )}

                        {/* Delete Key */}
                        {!isMaster && (
                          <button
                            onClick={() => handleDeleteKey(k.key)}
                            disabled={actionLoadingKey === k.key}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition cursor-pointer"
                            title="Hapus Kunci Permanen"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>Sistem enkripsi HMAC-SHA256 aktif. Masa token sesi 30 hari.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
