'use client';

import { useEffect, useState } from 'react';
import { Clock, ChevronRight, History, Search } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { StepCard } from '@/components/StepCard';
import { Sparkles } from 'lucide-react';

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

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 overflow-hidden">
        {/* Session list panel */}
        <div className="flex w-[360px] flex-shrink-0 flex-col border-r border-white/5 glass-strong">
          <header className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <History size={16} className="text-indigo-400" />
              <h2 className="text-[15px] font-semibold text-slate-100">History</h2>
            </div>
            <span className="badge badge-indigo">
              {sessions.length} queries
            </span>
          </header>

          <div className="flex-1 overflow-y-auto p-3">
            {loading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-shimmer rounded-lg h-16 glass-card" />
                ))}
              </div>
            )}
            {!loading && sessions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Search size={18} className="text-indigo-400" />
                </div>
                <p className="text-xs text-slate-500">
                  No queries yet. Run a reasoning session to see it here.
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {sessions.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => openSession(s.id)}
                  className={`animate-step-in rounded-xl text-left transition-all duration-200 px-3.5 py-3 ${
                    selected?.id === s.id
                      ? 'glass-card border-indigo-500/30 bg-indigo-500/10 shadow-glow-sm'
                      : 'glass-card hover:border-white/10'
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-[13px] font-medium text-slate-200">
                      {s.problem}
                    </p>
                    <ChevronRight size={14} className="mt-0.5 flex-shrink-0 text-slate-600" />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                    <Clock size={11} />
                    {new Date(s.created_at).toLocaleString()}
                    <span
                      className={`badge ml-auto ${
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
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {!selected && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 animate-float">
                <History size={28} className="text-indigo-400/50" />
              </div>
              <p className="text-sm text-slate-500">Select a session to view its reasoning steps.</p>
            </div>
          )}
          {selected && (
            <div className="mx-auto flex max-w-2xl flex-col gap-3 animate-slide-in-right">
              <h3 className="mb-2 text-lg font-semibold text-slate-100">{selected.problem}</h3>
              {selected.steps.map((step, i) => (
                <StepCard key={i} step={step as any} index={i} />
              ))}
              {selected.final_answer && (
                <div className="mt-2 rounded-xl glass-card border-l-2 border-l-emerald-500 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 px-4 py-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                      <Sparkles size={13} />
                      Final Answer
                    </div>
                  </div>
                  <div className="px-4 py-3.5">
                    <p className="text-sm leading-relaxed text-slate-200">{selected.final_answer}</p>
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
