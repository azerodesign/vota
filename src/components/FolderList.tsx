import React from 'react';
import { Folder, HardDrive, AlertCircle, FileText, Film, MessageCircle } from 'lucide-react';
import { FolderItem } from '../types';

interface FolderListProps {
  folders: FolderItem[];
  onInspectFolder?: (folder: FolderItem) => void;
}

export const FolderList: React.FC<FolderListProps> = ({ folders }) => {
  const getCategoryIcon = (category: FolderItem['category']) => {
    switch (category) {
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4 text-emerald-400" />;
      case 'media':
        return <Film className="h-4 w-4 text-sky-400" />;
      case 'download':
        return <FileText className="h-4 w-4 text-amber-400" />;
      case 'cache':
        return <AlertCircle className="h-4 w-4 text-purple-400" />;
      default:
        return <Folder className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-[#0f1523] border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <HardDrive className="h-5 w-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-200">Daftar Folder Penguras Memori Terbesar</h3>
        </div>
        <span className="text-xs text-slate-400">Diurutkan berdasarkan ukuran (GB)</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 font-semibold">Nama Folder &amp; Jalur</th>
              <th className="pb-3 font-semibold">Kategori</th>
              <th className="pb-3 font-semibold">Ukuran</th>
              <th className="pb-3 font-semibold">Status Keamanan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {folders.map((item) => (
              <tr key={item.id} className="hover:bg-slate-900/40 transition">
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">{item.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-xs md:max-w-md">
                        {item.path}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 pr-4">
                  <span className="capitalize px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60">
                    {item.category}
                  </span>
                </td>
                <td className="py-3.5 pr-4 font-mono font-bold text-slate-100 text-sm">
                  {item.sizeGb} GB
                </td>
                <td className="py-3.5">
                  {item.safeToDelete ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Aman Dibersihkan
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      Data Pengguna
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
