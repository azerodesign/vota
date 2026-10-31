import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { LogEntry } from '../types';

interface TerminalLogsProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, onClear }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs font-mono text-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800">
          <div className="p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-600">
            <Terminal className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900 font-sans">Terminal Output &amp; Activity Log</span>
        </div>
        <button
          onClick={onClear}
          className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center gap-1 transition cursor-pointer font-sans font-semibold"
        >
          <Trash2 className="h-3 w-3" />
          <span>Bersihkan Log</span>
        </button>
      </div>

      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 max-h-48 overflow-y-auto pr-1 shadow-inner">
        {logs.length === 0 ? (
          <p className="text-slate-500 italic">Belum ada aktivitas. Klik salah satu aksi pembersihan untuk memulai.</p>
        ) : (
          logs.map((log) => {
            const color =
              log.type === 'success'
                ? 'text-emerald-400'
                : log.type === 'error'
                ? 'text-rose-400'
                : log.type === 'warning'
                ? 'text-amber-300'
                : 'text-slate-300';

            return (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed text-[11px]">
                <span className="text-slate-500 text-[10px] shrink-0 font-mono">[{log.timestamp}]</span>
                <span className={color}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
