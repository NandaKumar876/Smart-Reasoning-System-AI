'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { FileText, RefreshCw } from 'lucide-react';

interface LogEntry {
  id: number;
  level: 'info' | 'success' | 'error' | 'api';
  message: string;
  created_at: string;
}

const LEVEL_CONFIG: Record<LogEntry['level'], { color: string; badge: string; dot: string }> = {
  info: { color: 'text-slate-400', badge: 'badge-indigo', dot: 'bg-indigo-400' },
  success: { color: 'text-emerald-400', badge: 'badge-emerald', dot: 'bg-emerald-400' },
  error: { color: 'text-red-400', badge: 'badge-red', dot: 'bg-red-400' },
  api: { color: 'text-purple-300', badge: 'badge-purple', dot: 'bg-purple-400' },
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function loadLogs() {
    setRefreshing(true);
    const res = await fetch('/api/logs?limit=100');
    const data = await res.json();
    setLogs(data.logs ?? []);
    setRefreshing(false);
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 glass-strong">
          <div className="flex items-center gap-2.5">
            <FileText size={18} className="text-indigo-400" />
            <h2 className="text-[15px] font-semibold text-slate-100">System Logs</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadLogs}
              className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-400 transition-all hover:bg-white/10 hover:text-slate-200"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <span className="badge badge-indigo">
              {logs.length} entries
            </span>
          </div>
        </header>

        {/* Log viewer */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="glass-card rounded-xl p-1 overflow-hidden">
            {/* Terminal-style header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-[10px] font-mono text-slate-600 ml-2">system_logs — ReasonAI</span>
            </div>

            {/* Log entries */}
            <div className="p-4 font-mono text-[11px] leading-7 max-h-[calc(100vh-200px)] overflow-y-auto">
              {logs.length === 0 && (
                <div className="text-slate-600 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  [system] No log entries yet.
                </div>
              )}
              {logs.map((log, i) => {
                const config = LEVEL_CONFIG[log.level];
                return (
                  <div
                    key={log.id}
                    className={`${config.color} flex items-start gap-2 animate-step-in hover:bg-white/[0.02] px-2 py-0.5 rounded transition-colors`}
                    style={{ animationDelay: `${i * 20}ms` }}
                  >
                    <span className={`mt-2.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
                    <span className="text-slate-600 flex-shrink-0">
                      [{new Date(log.created_at).toLocaleTimeString()}]
                    </span>
                    <span className={`badge flex-shrink-0 ${config.badge}`}>
                      {log.level}
                    </span>
                    <span className="break-all">{log.message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
