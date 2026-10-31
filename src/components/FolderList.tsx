import React from 'react';
import {
  Folder,
  HardDrive,
  AlertCircle,
  FileText,
  Film,
  MessageCircle,
  ShieldCheck,
  Lock,
  HelpCircle,
  FolderSearch,
} from 'lucide-react';
import { FolderItem, SafetyRiskLevel } from '../types';

interface FolderListProps {
  folders: FolderItem[];
  onInspectFolder?: (folder: FolderItem) => void;
}

export const FolderList: React.FC<FolderListProps> = ({ folders }) => {
  const getCategoryIcon = (category: FolderItem['category']) => {
    switch (category) {
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4 text-emerald-600" />;
      case 'media':
        return <Film className="h-4 w-4 text-blue-600" />;
      case 'download':
        return <FileText className="h-4 w-4 text-amber-600" />;
      case 'cache':
        return <AlertCircle className="h-4 w-4 text-purple-600" />;
      default:
        return <Folder className="h-4 w-4 text-slate-500" />;
    }
  };

  const getRiskBadge = (risk?: SafetyRiskLevel) => {
    switch (risk) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            SAFE
          </span>
        );
      case 'REVIEW REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="h-3 w-3 text-amber-600" />
            REVIEW REQUIRED
          </span>
        );
      case 'PROTECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Lock className="h-3 w-3 text-indigo-600" />
            PROTECTED
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <HelpCircle className="h-3 w-3 text-slate-500" />
            UNKNOWN
          </span>
        );
    }
  };

  const getAccessBadge = (status?: FolderItem['accessStatus']) => {
    switch (status) {
      case 'accessible':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Terbaca
          </span>
        );
      case 'inaccessible':
        return (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60"
            title="Terproteksi oleh Android Scoped Storage"
          >
            Terproteksi OS
          </span>
        );
      case 'not_found':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200/60">
            Tidak Ditemukan
          </span>
        );
      case 'unverified':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-400 border border-slate-200/60">
            Belum Diverifikasi
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl text-blue-600">
            <HardDrive className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Daftar Folder Penguras Memori Terbesar
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Validasi Akses &amp; Klasifikasi Risiko
        </span>
      </div>

      {folders.length === 0 ? (
        <div className="py-10 px-4 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center bg-slate-50/50">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600 mb-2.5 shadow-xs">
            <FolderSearch className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Belum Ada Data Folder</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
            Folder belum dipindai. Jalankan pemindaian storage untuk membaca direktori perangkat, memvalidasi izin akses aktual, dan mengklasifikasikan risiko keamanan.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout (Visible on sm screens and below) */}
          <div className="grid grid-cols-1 gap-2.5 sm:hidden">
            {folders.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 card-interactive"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                      <span className="capitalize text-[10px] text-slate-500">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {item.sizeGb} GB
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono truncate bg-white p-1 rounded border border-slate-100">
                  {item.path}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                  <div>{getAccessBadge(item.accessStatus)}</div>
                  <div>
                    {getRiskBadge(
                      item.riskLevel || (item.safeToDelete ? 'SAFE' : 'REVIEW REQUIRED')
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop / Tablet Table Layout (Hidden on mobile) */}
          <div className="hidden sm:block overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-2.5 px-4 font-bold">Nama Folder &amp; Jalur</th>
                  <th className="py-2.5 px-4 font-bold">Kategori</th>
                  <th className="py-2.5 px-4 font-bold">Ukuran</th>
                  <th className="py-2.5 px-4 font-bold">Akses Aktual</th>
                  <th className="py-2.5 px-4 font-bold">Klasifikasi Risiko</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {folders.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-xs md:max-w-md">
                            {item.path}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      {item.sizeGb} GB
                    </td>
                    <td className="py-3 px-4">
                      {getAccessBadge(item.accessStatus)}
                    </td>
                    <td className="py-3 px-4">
                      {getRiskBadge(
                        item.riskLevel || (item.safeToDelete ? 'SAFE' : 'REVIEW REQUIRED')
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
