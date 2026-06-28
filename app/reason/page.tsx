'use client';

import { useState } from 'react';
import { Sparkles, AlertCircle, Loader2, Zap, Brain, ArrowRight } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { StepCard } from '@/components/StepCard';
import type { ReasoningResult } from '@/types/reasoning';

const SUGGESTIONS = [
  { text: 'Should we migrate our legacy monolithic API to serverless functions?', label: 'Architecture' },
  { text: 'How do I optimize React performance for a list containing 10,000 items?', label: 'Frontend' },
  { text: 'Explain the mathematical intuition behind backpropagation in deep neural networks.', label: 'Deep Learning' }
];

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
    <div className="flex h-screen overflow-hidden dot-grid">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden relative">
        {/* Decorative corner ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 glass-strong relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Brain size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight">Reasoning Workspace</h2>
              <p className="text-[10px] text-slate-500 font-medium">Deconstruct complex problems step-by-step</p>
            </div>
          </div>
          <span className="badge badge-indigo flex items-center gap-1.5 shadow-glow-sm">
            <Zap size={10} className="fill-current text-indigo-400" />
            gemini-2.5-flash
          </span>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Input section */}
            <div className="glass-card rounded-2xl p-4.5 border border-white/[0.04] shadow-lg flex flex-col gap-4">
              <div className="flex gap-4">
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a complex engineering challenge, logic puzzle, or design decision..."
                  className="h-[96px] flex-1 resize-none rounded-xl input-glass px-4.5 py-3.5 text-[13.5px] leading-relaxed text-slate-100 font-sans focus-ring placeholder-slate-600"
                />
                <button
                  onClick={runReasoning}
                  disabled={loading || !problem.trim()}
                  className="gradient-btn flex h-[96px] w-[100px] flex-shrink-0 flex-col items-center justify-center gap-2 rounded-xl text-xs font-bold disabled:cursor-default disabled:opacity-20 disabled:transform-none disabled:shadow-none transition-all"
                >
                  <span className="relative z-10 flex flex-col items-center gap-2">
                    {loading ? (
                      <Loader2 size={22} className="animate-spin text-white" />
                    ) : (
                      <Sparkles size={22} className="text-white sparkle-spin" />
                    )}
                    <span>{loading ? 'Thinking' : 'Analyze'}</span>
                  </span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                <span>Use <kbd className="bg-white/5 border border-white/10 px-1 py-0.5 rounded text-[9px] font-mono text-slate-400">Ctrl + Enter</kbd> to submit</span>
                <span>Max 4000 characters</span>
              </div>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="glass-card rounded-xl px-5 py-5 animate-step-in border border-indigo-500/10 shadow-glow-sm">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Loader2 size={18} className="animate-spin text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200">Deconstructing your query...</div>
                    <div className="text-xs text-slate-500">Initiating structured reasoning chains</div>
                  </div>
                  <div className="ml-auto flex gap-1.5">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" style={{ animationDelay: '0.2s' }} />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
                {/* Shimmer bar */}
                <div className="mt-4.5 h-1.5 w-full rounded-full overflow-hidden bg-white/5 border border-white/[0.02]">
                  <div className="h-full w-full animate-shimmer rounded-full bg-gradient-to-r from-indigo-500/0 via-indigo-500/40 to-indigo-500/0" style={{ backgroundSize: '200% 100%' }} />
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="animate-step-in flex items-start gap-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4.5 py-4 text-sm text-rose-300">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-rose-400" />
                <div>
                  <div className="font-semibold text-rose-200">Reasoning execution failed</div>
                  <div className="mt-1 text-xs text-rose-400/80 leading-relaxed">{error}</div>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="flex flex-col gap-4.5 relative step-connector pl-0">
                {result.steps.map((step, i) => (
                  <StepCard key={i} step={step} index={i} />
                ))}

                {/* Final answer */}
                <div className="mt-2 rounded-xl glass-card border-l-[3px] border-l-emerald-500 overflow-hidden shadow-lg animate-step-in" style={{ animationDelay: `${result.steps.length * 100}ms` }}>
                  <div className="bg-gradient-to-r from-emerald-500/10 to-transparent px-5 py-4 border-b border-white/[0.03]">
                    <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-emerald-400">
                      <Sparkles size={14} className="sparkle-spin" />
                      Final Synthesis & Conclusion
                    </div>
                  </div>
                  <div className="px-5 py-4.5 bg-emerald-950/5">
                    <p className="text-[13px] leading-relaxed text-slate-200 font-medium">{result.final_answer}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !result && !error && (
              <div className="space-y-6">
                <div className="animate-step-in rounded-2xl glass-card px-8 py-14 text-center border border-white/[0.03] shadow-xl relative overflow-hidden">
                  {/* Background grid overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04),transparent_70%)] pointer-events-none" />

                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-500/20 animate-float">
                    <Brain size={30} className="text-indigo-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-2 tracking-tight">Structured Cognitive Reasoning</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                    Provide any system-design question, logic puzzle, or strategic dilemma. ReasonAI will formulate an execution chain verifying the integrity of each node.
                  </p>
                  <div className="flex justify-center gap-2">
                    <span className="badge badge-indigo">Decompose</span>
                    <span className="badge badge-cyan">Analyze</span>
                    <span className="badge badge-amber">Reason</span>
                    <span className="badge badge-emerald">Conclude</span>
                  </div>
                </div>

                {/* Suggestions quick action list */}
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">Example Templates</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {SUGGESTIONS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setProblem(s.text)}
                        className="group text-left p-3.5 rounded-xl glass-card border border-white/[0.03] hover:bg-white/[0.02] flex items-center justify-between gap-4 transition-all duration-300 animate-step-in"
                        style={{ animationDelay: `${(idx + 1) * 100}ms` }}
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">{s.label}</span>
                          <span className="text-[12.5px] text-slate-300 font-medium truncate group-hover:text-slate-200 transition-colors">{s.text}</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
