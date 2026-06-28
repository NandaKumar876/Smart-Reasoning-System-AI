'use client';

import { useEffect, useState } from 'react';
import { Clock, ChevronRight, History, Search, Cpu, Sparkles } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { StepCard } from '@/components/StepCard';

interface SessionSummary {
  id: string;
  problem: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  status: 'success' | 'error';
  created_at: string;
}

interface SessionDetail extends SessionSummary {
  steps: { type: string; title: string; content: string; why: string }[];
  final_answer: string | null;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selected, setSelected] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/sessions?limit=30')
      .then((r) => {
        if (!r.ok) throw new Error(`Server error (${r.status})`);
        return r.json();
      })
      .then((data) => setSessions(data.sessions ?? []))
      .catch((err) => console.error('Failed to load sessions:', err))
      .finally(() => setLoading(false));
  }, []);

  async function openSession(id: string) {
    try {
      const res = await fetch(`/api/sessions/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to load session details: Server error (${res.status})`);
      }
      const data = await res.json();
      setSelected(data.session);
    } catch (err) {
      console.error(err);
    }
  }

  // Filter sessions based on search query
  const filteredSessions = sessions.filter((s) =>
    s.problem.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden dot-grid">
      <Sidebar />
      <main className="flex flex-1 overflow-hidden relative">
        {/* Decorative corner ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/5 via-cyan-500/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

        {/* Session list panel */}
        <div className="flex w-[380px] flex-shrink-0 flex-col border-r border-white/5 glass-strong relative z-10">
          <header className="flex flex-col gap-3.5 border-b border-white/5 px-5 py-4.5 bg-gradient-to-b from-white/[0.01] to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={16} className="text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-100 tracking-tight">Query Logs</h2>
              </div>
              <span className="badge badge-indigo shadow-sm">
                {filteredSessions.length} total
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search past queries..."
                className="w-full rounded-xl input-glass py-2 px-3.5 pl-9 text-xs text-slate-200 placeholder-slate-600 focus-ring"
              />
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-shimmer rounded-xl h-20 glass-card" />
                ))}
              </div>
            )}
            {!loading && filteredSessions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5">
                  <Search size={16} className="text-slate-500" />
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {searchQuery ? 'No matching logs found.' : 'No queries stored yet.'}
                </p>
                <p className="text-[10px] text-slate-600 mt-1 max-w-[200px] leading-relaxed">
                  {searchQuery ? 'Try matching keywords or symbols' : 'Run reasoning workspace to populate'}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              {filteredSessions.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => openSession(s.id)}
                  className={`animate-step-in rounded-xl text-left transition-all duration-200 p-4 border border-transparent ${
                    selected?.id === s.id
                      ? 'glass-card border-indigo-500/25 bg-indigo-500/10 shadow-glow-sm'
                      : 'glass-card hover:bg-white/[0.02] hover:border-white/[0.04]'
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-xs font-semibold text-slate-200 leading-relaxed">
                      {s.problem}
                    </p>
                    <ChevronRight size={13} className="mt-0.5 flex-shrink-0 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[9.5px] text-slate-500">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock size={10} className="text-slate-600" />
                      {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <span
                      className={`badge flex-shrink-0 text-[8.5px] font-bold ${
                        s.status === 'success' ? 'badge-emerald' : 'badge-red'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          {!selected && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 animate-float">
                <History size={26} className="text-indigo-400/60" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Inspect Log Details</h3>
              <p className="text-xs text-slate-500 max-w-[280px] mx-auto mt-2 leading-relaxed">
                Select any past execution session from the panel to audit reasoning chains.
              </p>
            </div>
          )}
          {selected && (
            <div className="mx-auto flex max-w-2xl flex-col gap-4 animate-slide-in-right">
              {/* Header metrics card */}
              <div className="glass-card rounded-2xl p-5 border border-white/[0.04] shadow-md flex items-start justify-between gap-6">
                <div className="space-y-1.5">
                  <span className="badge badge-indigo flex items-center gap-1 w-fit shadow-sm">
                    <Cpu size={10} />
                    {selected.model}
                  </span>
                  <h3 className="text-[15px] font-bold text-slate-100 leading-relaxed">{selected.problem}</h3>
                </div>
                <div className="flex flex-col items-end gap-1.5 text-right flex-shrink-0">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Metrics</span>
                  <span className="text-xs font-bold text-slate-200">{selected.latency_ms} ms</span>
                  <span className="text-[9px] text-slate-600">{(selected.input_tokens + selected.output_tokens).toLocaleString()} tokens</span>
                </div>
              </div>

              {/* Steps render */}
              {selected.steps.map((step, i) => (
                <StepCard key={i} step={step as any} index={i} />
              ))}

              {/* Synthesis Answer */}
              {selected.final_answer && (
                <div className="mt-2 rounded-xl glass-card border-l-[3px] border-l-emerald-500 overflow-hidden shadow-lg">
                  <div className="bg-gradient-to-r from-emerald-500/10 to-transparent px-5 py-3.5 border-b border-white/[0.03]">
                    <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-emerald-400">
                      <Sparkles size={13} className="sparkle-spin" />
                      Final Synthesis & Conclusion
                    </div>
                  </div>
                  <div className="px-5 py-4 bg-emerald-950/5">
                    <p className="text-[13px] leading-relaxed text-slate-200 font-medium">{selected.final_answer}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
