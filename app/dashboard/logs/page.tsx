'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';

interface LogEntry {
  id: number;
  level: 'info' | 'success' | 'error' | 'api';
  message: string;
  created_at: string;
}

const LEVEL_COLOR: Record<LogEntry['level'], string> = {
  info: 'text-[#9ab8b1]',
  success: 'text-emerald-400',
  error: 'text-red-400',
  api: 'text-indigo-300',
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    fetch('/api/logs?limit=100')
      .then((r) => r.json())
      .then((data) => setLogs(data.logs ?? []));
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-base-border px-6 py-3.5">
          <h2 className="text-[15px] font-medium text-[#e6f5f1]">System logs</h2>
          <span className="rounded-full bg-teal-500/15 px-2.5 py-1 text-[11px] font-medium text-teal-300">
            {logs.length} entries
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-base-border bg-base-surface p-4 font-mono text-[11px] leading-7">
            {logs.length === 0 && (
              <div className="text-[#4f6b65]">[system] No log entries yet.</div>
            )}
            {logs.map((log) => (
              <div key={log.id} className={LEVEL_COLOR[log.level]}>
                [{new Date(log.created_at).toLocaleTimeString()}][{log.level}] {log.message}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
