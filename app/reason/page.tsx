'use client';

import { useState } from 'react';
import { Sparkles, AlertCircle, Loader2, Zap, Brain } from 'lucide-react';
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

      let data: any = null;
      try {
        data = await res.json();
      } catch (jsonErr) {
        if (!res.ok) {
          throw new Error(`Server error (${res.status}): ${res.statusText || 'Internal Server Error'}`);
        }
        throw new Error('Failed to parse server response.');
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Something went wrong.');
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
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 glass-strong">
          <div className="flex items-center gap-2.5">
            <Brain size={18} className="text-indigo-400" />
            <h2 className="text-[15px] font-semibold text-slate-100">Reasoning Engine</h2>
          </div>
          <span className="badge badge-indigo flex items-center gap-1.5">
            <Zap size={10} />
            claude-sonnet-4-6
          </span>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-3xl">
            {/* Input section */}
            <div className="mb-6 flex gap-3">
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a complex problem… e.g. 'Should I migrate our monolith to microservices?' or 'How do I reduce React re-renders in this component tree?'"
                className="h-[80px] flex-1 resize-none rounded-xl input-glass px-4 py-3 text-sm text-slate-100 font-sans"
              />
              <button
                onClick={runReasoning}
                disabled={loading || !problem.trim()}
                className="gradient-btn flex h-[80px] w-[92px] flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl text-sm font-semibold disabled:cursor-default disabled:opacity-30 disabled:transform-none disabled:shadow-none"
              >
                <span className="relative z-10 flex flex-col items-center gap-1.5">
                  {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  {loading ? 'Thinking' : 'Reason'}
                </span>
              </button>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="glass-card rounded-xl px-5 py-4 animate-step-in">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">Analyzing your problem</div>
                    <div className="text-xs text-slate-500">Breaking it down into reasoning steps…</div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" style={{ animationDelay: '0.2s' }} />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
                {/* Shimmer bar */}
                <div className="mt-3 h-1 w-full rounded-full overflow-hidden bg-white/5">
                  <div className="h-full w-full animate-shimmer rounded-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" style={{ backgroundSize: '200% 100%' }} />
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="animate-step-in flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 text-sm text-red-300">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-400" />
                <div>
                  <div className="font-medium text-red-300">Reasoning failed</div>
                  <div className="mt-0.5 text-xs text-red-400/80">{error}</div>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="flex flex-col gap-3">
                {result.steps.map((step, i) => (
                  <StepCard key={i} step={step} index={i} />
                ))}

                {/* Final answer */}
                <div className="mt-2 rounded-xl glass-card border-l-2 border-l-emerald-500 overflow-hidden animate-step-in" style={{ animationDelay: `${result.steps.length * 100}ms` }}>
                  <div className="bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 px-4 py-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                      <Sparkles size={13} />
                      Final Answer
                    </div>
                  </div>
                  <div className="px-4 py-3.5">
                    <p className="text-sm leading-relaxed text-slate-200">{result.final_answer}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !result && !error && (
              <div className="animate-step-in rounded-xl glass-card px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 animate-float">
                  <Brain size={28} className="text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-1.5">Ready to reason</h3>
                <p className="text-sm text-slate-500 mb-3">
                  Enter a complex problem above and press{' '}
                  <kbd className="rounded-md bg-white/10 px-1.5 py-0.5 text-xs font-mono text-slate-300 border border-white/10">
                    Ctrl+Enter
                  </kbd>{' '}
                  to start.
                </p>
                <div className="flex justify-center gap-2">
                  <span className="badge badge-indigo">Decompose</span>
                  <span className="badge badge-cyan">Analyze</span>
                  <span className="badge badge-amber">Reason</span>
                  <span className="badge badge-emerald">Conclude</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
