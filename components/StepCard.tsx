import { ListTree, Microscope, Lightbulb, CheckCircle2, Info } from 'lucide-react';
import type { ReasoningStep, StepType } from '@/types/reasoning';
import clsx from 'clsx';

const STEP_META: Record<
  StepType,
  { icon: typeof ListTree; label: string; gradient: string; badgeClass: string; borderColor: string; bgSoft: string }
> = {
  decompose: {
    icon: ListTree,
    label: 'Decompose',
    gradient: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
    badgeClass: 'badge-indigo',
    borderColor: 'border-l-indigo-500',
    bgSoft: 'bg-indigo-500/5',
  },
  analyze: {
    icon: Microscope,
    label: 'Analyze',
    gradient: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
    badgeClass: 'badge-cyan',
    borderColor: 'border-l-cyan-500',
    bgSoft: 'bg-cyan-500/5',
  },
  reason: {
    icon: Lightbulb,
    label: 'Reason',
    gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
    badgeClass: 'badge-amber',
    borderColor: 'border-l-amber-500',
    bgSoft: 'bg-amber-500/5',
  },
  conclude: {
    icon: CheckCircle2,
    label: 'Conclude',
    gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    badgeClass: 'badge-emerald',
    borderColor: 'border-l-emerald-500',
    bgSoft: 'bg-emerald-500/5',
  },
};

export function StepCard({
  step,
  index,
  showWhy = true,
}: {
  step: ReasoningStep;
  index: number;
  showWhy?: boolean;
}) {
  const meta = STEP_META[step.type] ?? STEP_META.decompose;
  const Icon = meta.icon;

  return (
    <div
      className={clsx(
        'animate-step-in overflow-hidden rounded-xl glass-card border-l-[3px] shadow-sm relative group',
        meta.borderColor
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Decorative top-right soft glow */}
      <div className={clsx(
        'absolute -top-12 -right-12 h-24 w-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none',
        step.type === 'decompose' && 'bg-indigo-500',
        step.type === 'analyze' && 'bg-cyan-500',
        step.type === 'reason' && 'bg-amber-500',
        step.type === 'conclude' && 'bg-emerald-500'
      )} />

      {/* Step header */}
      <div className={clsx(
        'flex items-center gap-3 bg-gradient-to-r px-4.5 py-3.5 border-b border-white/[0.03]',
        meta.gradient
      )}>
        <div className={clsx(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-glow-sm transition-all duration-300 group-hover:scale-105",
          step.type === 'decompose' && 'bg-indigo-500/25',
          step.type === 'analyze' && 'bg-cyan-500/25',
          step.type === 'reason' && 'bg-amber-500/25',
          step.type === 'conclude' && 'bg-emerald-500/25'
        )}>
          {index + 1}
        </div>
        <Icon size={16} strokeWidth={2} className="text-slate-400 group-hover:text-slate-300 transition-colors" />
        <span className="text-sm font-semibold text-slate-100 tracking-tight">{step.title}</span>
        <span className={clsx('badge ml-auto shadow-sm', meta.badgeClass)}>
          {meta.label}
        </span>
      </div>

      {/* Step content */}
      <div className="px-5 py-4 space-y-3.5 relative z-10">
        <p className="text-[13px] leading-relaxed text-slate-300 font-normal">{step.content}</p>

        {showWhy && step.why && (
          <div className="mt-3.5 rounded-xl border border-indigo-500/10 bg-indigo-950/20 px-4 py-3 shadow-inner transition-all duration-300 hover:border-indigo-500/20">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-indigo-400">
              <Info size={12} strokeWidth={2} />
              Reasoning Justification
            </div>
            <p className="text-[11.5px] leading-relaxed text-indigo-200/90 font-medium">{step.why}</p>
          </div>
        )}
      </div>
    </div>
  );
}
