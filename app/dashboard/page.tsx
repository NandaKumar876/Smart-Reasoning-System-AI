'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { CircleDot, BarChart3, Zap, Clock, Coins, Database, Server, Terminal } from 'lucide-react';

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
  'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'text-amber-400 bg-amber-500/10 border-amber-500/20',
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
    { label: 'Total queries', value: stats?.total_sessions ?? '—', sub: 'All time submissions' },
    { label: 'Avg steps', value: stats?.avg_steps ?? '—', sub: 'Nodes per session' },
    {
      label: 'Avg latency',
      value: stats ? `${(stats.avg_latency_ms / 1000).toFixed(2)}s` : '—',
      sub: 'API cycle timing',
    },
    {
      label: 'Total tokens',
      value: stats ? (stats.total_input_tokens + stats.total_output_tokens).toLocaleString() : '—',
      sub: 'Context consumed',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden dot-grid">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {/* Decorative corner ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/5 via-cyan-500/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 glass-strong relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <BarChart3 size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight">Admin Dashboard</h2>
              <p className="text-[10px] text-slate-500 font-medium">Real-time application telemetry and usage statistics</p>
            </div>
          </div>
          <span className="badge badge-emerald flex items-center gap-1.5 shadow-glow-sm">
            <CircleDot size={10} className="fill-current text-emerald-400" /> Live Telemetry
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 relative z-10">
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-4.5">
            {cards.map((c, i) => {
              const Icon = CARD_ICONS[i];
              return (
                <div
                  key={c.label}
                  className="stat-card glass-card rounded-2xl p-5 border border-white/[0.03] shadow-md animate-step-in flex flex-col justify-between h-[130px] group"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</span>
                    <div className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${CARD_COLORS[i]}`}>
                      <Icon size={15} strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100 tracking-tight mb-1 group-hover:text-white transition-colors">{c.value}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{c.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Recent sessions table */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Sessions</h3>
                <span className="text-[10px] text-indigo-400 font-semibold hover:underline cursor-pointer">View all logs</span>
              </div>
              <div className="overflow-hidden rounded-2xl glass-card border border-white/[0.03] shadow-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-[9.5px]">Problem</th>
                      <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-[9.5px]">Model</th>
                      <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-[9.5px]">Latency</th>
                      <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-[9.5px]">Timestamp</th>
                      <th className="px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-[9.5px] text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-slate-500 text-xs font-medium">
                          No reasoning sessions registered yet.
                        </td>
                      </tr>
                    )}
                    {sessions.map((s, i) => (
                      <tr
                        key={s.id}
                        className="border-b border-white/[0.02] transition-colors hover:bg-white/[0.01] animate-step-in"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <td className="max-w-[200px] truncate px-5 py-4 text-xs font-semibold text-slate-300">
                          {s.problem}
                        </td>
                        <td className="px-5 py-4 font-mono text-[10px] text-slate-500">
                          {s.model}
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-slate-400">
                          {s.latency_ms.toLocaleString()} ms
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {new Date(s.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={`badge shadow-sm text-[8.5px] font-bold ${s.status === 'success' ? 'badge-emerald' : 'badge-red'}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Connection and config sidebars */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Supabase Infrastructure</h3>
                <div className="rounded-2xl glass-card border border-white/[0.03] p-5 shadow-lg space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Database size={16} className="text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Database Server</div>
                      <div className="text-[10px] text-slate-500 font-medium">PostgreSQL Relational DB</div>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                      <span className="text-slate-500 font-medium">Status</span>
                      {isConnected === true ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                          Connected
                        </span>
                      ) : isConnected === false ? (
                        <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          Offline
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold animate-pulse">Checking...</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-slate-500 font-medium">Host Address</span>
                      <span className="font-mono text-[10.5px] text-slate-400 break-all bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
                        {process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NEXT_PUBLIC_SUPABASE_URL not configured'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500 font-semibold uppercase tracking-wider pt-2 border-t border-white/5">
                    <Server size={11} />
                    <span>Schema Objects Audit: active</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Application Spec</h3>
                <div className="rounded-2xl glass-card border border-white/[0.03] p-5 shadow-lg space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Terminal size={15} className="text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">Runtime Node</div>
                      <div className="text-[10px] text-slate-500 font-medium">Next.js Edge Engine</div>
                    </div>
                  </div>
                  <div className="text-[10px] leading-relaxed text-slate-500 font-medium">
                    State tracking is logged via the Supabase <code className="text-indigo-300 font-mono">system_logs</code> audit table. Rate limiting is enforced at 10 requests per minute.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
