'use client';

import { useEffect, useState } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
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

  useEffect(() => {
    fetch('/api/sessions?limit=30')
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function openSession(id: string) {
    const res = await fetch(`/api/sessions/${id}`);
    const data = await res.json();
    setSelected(data.session);
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex w-[360px] flex-shrink-0 flex-col border-r border-base-border">
          <header className="flex items-center justify-between border-b border-base-border px-5 py-3.5">
            <h2 className="text-[15px] font-medium text-[#e6f5f1]">History</h2>
            <span className="rounded-full bg-teal-500/15 px-2.5 py-1 text-[11px] font-medium text-teal-300">
              {sessions.length} queries
            </span>
          </header>
          <div className="flex-1 overflow-y-auto p-3">
            {loading && <p className="px-2 text-xs text-[#7a9d96]">Loading…</p>}
            {!loading && sessions.length === 0 && (
              <p className="px-2 text-xs text-[#7a9d96]">
                No queries yet. Run a reasoning session to see it here.
              </p>
            )}
            <div className="flex flex-col gap-2">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => openSession(s.id)}
                  className={`rounded-lg border border-base-border px-3.5 py-3 text-left transition-colors hover:bg-base-surface2 ${
                    selected?.id === s.id ? 'bg-base-surface2' : 'bg-base-surface'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-[13px] font-medium text-[#e6f5f1]">
                      {s.problem}
                    </p>
                    <ChevronRight size={14} className="mt-0.5 flex-shrink-0 text-[#4f6b65]" />
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#7a9d96]">
                    <Clock size={11} />
                    {new Date(s.created_at).toLocaleString()}
                    <span
                      className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        s.status === 'success'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-red-500/15 text-red-300'
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

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!selected && (
            <div className="flex h-full items-center justify-center text-sm text-[#4f6b65]">
              Select a session to view its reasoning steps.
            </div>
          )}
          {selected && (
            <div className="mx-auto flex max-w-2xl flex-col gap-3">
              <h3 className="mb-1 text-base font-medium text-[#e6f5f1]">{selected.problem}</h3>
              {selected.steps.map((step, i) => (
                <StepCard key={i} step={step as any} index={i} />
              ))}
              {selected.final_answer && (
                <div className="mt-2 rounded-xl border border-base-border bg-base-surface px-4 py-3.5">
                  <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-emerald-400">
                    Final answer
                  </div>
                  <p className="text-sm leading-relaxed text-[#e6f5f1]">{selected.final_answer}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
