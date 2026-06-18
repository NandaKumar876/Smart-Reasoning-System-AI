'use client';

import { useState } from 'react';
import { Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { StepCard } from '@/components/StepCard';
import type { ReasoningResult } from '@/types/reasoning';

export default function ReasonPage() {
  const [problem, setProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReasoningResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runReasoning() {
    if (!problem.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      setResult({ steps: data.steps, final_answer: data.final_answer });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      runReasoning();
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-base-border px-6 py-3.5">
          <h2 className="text-[15px] font-medium text-[#e6f5f1]">Reasoning engine</h2>
          <span className="rounded-full bg-teal-500/15 px-2.5 py-1 text-[11px] font-medium text-teal-300">
            claude-sonnet-4-6
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 flex gap-3">
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a complex problem… e.g. 'Should I migrate our monolith to microservices?' or 'How do I reduce React re-renders in this component tree?'"
                className="h-[76px] flex-1 resize-none rounded-lg border border-base-border bg-base-surface px-3.5 py-2.5 text-sm text-[#e6f5f1] placeholder:text-[#4f6b65] focus:border-teal-500/50 focus:outline-none"
              />
              <button
                onClick={runReasoning}
                disabled={loading || !problem.trim()}
                className="flex h-[76px] w-[88px] flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg bg-teal-500 text-sm font-medium text-base-bg transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                {loading ? 'Thinking' : 'Reason'}
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 rounded-xl border border-base-border px-4 py-3 text-sm text-[#9ab8b1]">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400"
                    style={{ animationDelay: '0.4s' }}
                  />
                </span>
                Breaking the problem into steps…
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {result && (
              <div className="flex flex-col gap-3">
                {result.steps.map((step, i) => (
                  <StepCard key={i} step={step} index={i} />
                ))}

                <div className="mt-2 rounded-xl border border-base-border bg-base-surface px-4 py-3.5">
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-emerald-400">
                    <Sparkles size={13} />
                    Final answer
                  </div>
                  <p className="text-sm leading-relaxed text-[#e6f5f1]">{result.final_answer}</p>
                </div>
              </div>
            )}

            {!loading && !result && !error && (
              <div className="rounded-xl border border-dashed border-base-border px-4 py-10 text-center text-sm text-[#4f6b65]">
                Enter a problem above and press <kbd className="rounded bg-base-surface2 px-1.5 py-0.5 text-xs">⌘ Enter</kbd> to start reasoning.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
