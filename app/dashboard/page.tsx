'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { CircleDot, BarChart3, Zap, Clock, Coins } from 'lucide-react';

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

const CARD_ICONS = [BarChart3, Zap, Clock, Coins];
const CARD_COLORS = [
  'text-indigo-400',
  'text-purple-400',
  'text-cyan-400',
  'text-amber-400',
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => {
        if (!r.ok) throw new Error('Stats fetch failed');
        return r.json();
      })
      .then((data) => {
        setStats(data);
        setIsConnected(true);
      })
      .catch((err) => {
        console.error(err);
        setIsConnected(false);
      });

    fetch('/api/sessions?limit=8')
      .then((r) => {
        if (!r.ok) throw new Error('Sessions fetch failed');
        return r.json();
      })
      .then((data) => setSessions(data.sessions ?? []))
      .catch((err) => console.error(err));
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
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 glass-strong">
          <div className="flex items-center gap-2.5">
            <BarChart3 size={18} className="text-indigo-400" />
            <h2 className="text-[15px] font-semibold text-slate-100">Admin Dashboard</h2>
          </div>
          <span className="badge badge-emerald flex items-center gap-1.5">
            <CircleDot size={10} /> Live
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Stats grid */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            {cards.map((c, i) => {
              const Icon = CARD_ICONS[i];
              return (
                <div
                  key={c.label}
                  className="stat-card glass-card rounded-xl p-4 animate-step-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{c.label}</span>
                    <Icon size={16} className={CARD_COLORS[i]} />
                  </div>
                  <div className="text-2xl font-bold text-slate-100 mb-0.5">{c.value}</div>
                  <div className="text-[11px] text-slate-600">{c.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Recent sessions table */}
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-slate-200">Recent sessions</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
          </div>
          <div className="mb-6 overflow-hidden rounded-xl glass-card">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Problem</th>
                  <th className="px-4 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Model</th>
                  <th className="px-4 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Latency</th>
                  <th className="px-4 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Time</th>
                  <th className="px-4 py-3 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                      No sessions yet
                    </td>
                  </tr>
                )}
                {sessions.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-t border-white/5 transition-colors hover:bg-white/[0.02] animate-step-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-300">
                      {s.problem}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {s.model}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{s.latency_ms}ms</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(s.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${s.status === 'success' ? 'badge-emerald' : 'badge-red'}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Supabase connection */}
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-slate-200">Supabase Connection</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" />
          </div>
          <div className="rounded-xl glass-card p-4">
            <div className="mb-2 flex items-center gap-2.5">
              {isConnected === true ? (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  <span className="text-sm font-medium text-slate-200">Connected</span>
                </>
              ) : isConnected === false ? (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
                  <span className="text-sm font-medium text-red-400">Disconnected (Check env vars / logs)</span>
                </>
              ) : (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-500 animate-pulse" />
                  <span className="text-sm font-medium text-slate-400">Checking connection...</span>
                </>
              )}
            </div>
            <div className="font-mono text-xs text-slate-500">
              {process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NEXT_PUBLIC_SUPABASE_URL not set'}
            </div>
            <div className="mt-1 text-xs text-slate-600">
              Tables: sessions · app_config · system_logs
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
