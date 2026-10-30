import React from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { LogEntry } from '../types';

interface TerminalLogsProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, onClear }) => {
  return (
    <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl p-5 shadow-xl font-mono text-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Terminal Output &amp; Activity Log</span>
        </div>
        <button
          onClick={onClear}
          className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 transition"
        >
          <Trash2 className="h-3 w-3" />
          <span>Bersihkan Log</span>
        </button>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <p className="text-slate-400 italic">Belum ada aktivitas. Klik salah satu tombol pembersihan untuk memulai.</p>
        ) : (
          logs.map((log) => {
            const color =
              log.type === 'success'
                ? 'text-emerald-400'
                : log.type === 'error'
                ? 'text-rose-400'
                : log.type === 'warning'
                ? 'text-amber-400'
                : 'text-slate-300';

            return (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-400 text-[11px] shrink-0">[{log.timestamp}]</span>
                <span className={color}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
