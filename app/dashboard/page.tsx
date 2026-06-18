'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { CircleDot } from 'lucide-react';

interface Stats {
  total_sessions: number;
  success_rate: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_latency_ms: number;
  avg_steps: number;
}

interface SessionRow {
  id: string;
  problem: string;
  model: string;
  latency_ms: number;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then(setStats);
    fetch('/api/sessions?limit=8')
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []));
  }, []);

  const cards = [
    { label: 'Total queries', value: stats?.total_sessions ?? '—', sub: 'All time' },
    { label: 'Avg steps', value: stats?.avg_steps ?? '—', sub: 'Per session' },
    {
      label: 'Avg latency',
      value: stats ? `${(stats.avg_latency_ms / 1000).toFixed(1)}s` : '—',
      sub: 'API response',
    },
    {
      label: 'Total tokens',
      value: stats ? (stats.total_input_tokens + stats.total_output_tokens).toLocaleString() : '—',
      sub: 'Input + output',
    },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-base-border px-6 py-3.5">
          <h2 className="text-[15px] font-medium text-[#e6f5f1]">Admin dashboard</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            <CircleDot size={11} /> Live
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-6 grid grid-cols-4 gap-3">
            {cards.map((c) => (
              <div key={c.label} className="rounded-lg bg-base-surface p-3.5">
                <div className="mb-1.5 text-[11px] text-[#7a9d96]">{c.label}</div>
                <div className="text-[22px] font-medium text-[#e6f5f1]">{c.value}</div>
                <div className="mt-0.5 text-[11px] text-[#4f6b65]">{c.sub}</div>
              </div>
            ))}
          </div>

          <div className="mb-3 text-[13px] font-medium text-[#e6f5f1]">Recent sessions</div>
          <div className="mb-6 overflow-hidden rounded-xl border border-base-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-base-surface2 text-left text-[#7a9d96]">
                  <th className="px-3.5 py-2.5 font-medium">Problem</th>
                  <th className="px-3.5 py-2.5 font-medium">Model</th>
                  <th className="px-3.5 py-2.5 font-medium">Latency</th>
                  <th className="px-3.5 py-2.5 font-medium">Time</th>
                  <th className="px-3.5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3.5 py-6 text-center text-[#4f6b65]">
                      No sessions yet
                    </td>
                  </tr>
                )}
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-base-border">
                    <td className="max-w-[220px] truncate px-3.5 py-2.5 text-[#cfe6e1]">
                      {s.problem}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-[#9ab8b1]">
                      {s.model}
                    </td>
                    <td className="px-3.5 py-2.5 text-[#9ab8b1]">{s.latency_ms}ms</td>
                    <td className="px-3.5 py-2.5 text-[#9ab8b1]">
                      {new Date(s.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          s.status === 'success'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-red-500/15 text-red-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-3 text-[13px] font-medium text-[#e6f5f1]">Supabase connection</div>
          <div className="rounded-xl border border-base-border p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-sm text-[#e6f5f1]">Connected</span>
            </div>
            <div className="font-mono text-xs text-[#7a9d96]">
              {process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NEXT_PUBLIC_SUPABASE_URL not set'}
            </div>
            <div className="mt-1 text-xs text-[#7a9d96]">
              Tables: sessions · app_config · system_logs
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
