import { ListTree, Microscope, Lightbulb, CheckCircle2, Info } from 'lucide-react';
import type { ReasoningStep, StepType } from '@/types/reasoning';
import clsx from 'clsx';

const STEP_META: Record<
  StepType,
  { icon: typeof ListTree; label: string; gradient: string; badgeClass: string; borderColor: string }
> = {
  decompose: {
    icon: ListTree,
    label: 'Decompose',
    gradient: 'from-indigo-500/20 to-indigo-500/5',
    badgeClass: 'badge-indigo',
    borderColor: 'border-l-indigo-500',
  },
  analyze: {
    icon: Microscope,
    label: 'Analyze',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    badgeClass: 'badge-cyan',
    borderColor: 'border-l-cyan-500',
  },
  reason: {
    icon: Lightbulb,
    label: 'Reason',
    gradient: 'from-amber-500/20 to-amber-500/5',
    badgeClass: 'badge-amber',
    borderColor: 'border-l-amber-500',
  },
  conclude: {
    icon: CheckCircle2,
    label: 'Conclude',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    badgeClass: 'badge-emerald',
    borderColor: 'border-l-emerald-500',
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
        'animate-step-in overflow-hidden rounded-xl glass-card border-l-2',
        meta.borderColor
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Step header */}
      <div className={clsx(
        'flex items-center gap-2.5 bg-gradient-to-r px-4 py-3',
        meta.gradient
      )}>
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-[11px] font-bold text-slate-200">
          {index + 1}
        </div>
        <Icon size={15} strokeWidth={1.75} className="text-slate-400" />
        <span className="text-sm font-medium text-slate-100">{step.title}</span>
        <span className={clsx('badge ml-auto', meta.badgeClass)}>
          {meta.label}
        </span>
      </div>

      {/* Step content */}
      <div className="px-4 py-3.5">
        <p className="text-[13px] leading-relaxed text-slate-300">{step.content}</p>

        {showWhy && step.why && (
          <div className="mt-3 rounded-lg border-l-2 border-indigo-500/40 bg-indigo-500/5 px-3 py-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
              <Info size={11} />
              Why this makes sense
            </div>
            <p className="text-xs leading-relaxed text-slate-400">{step.why}</p>
          </div>
        )}
      </div>
    </div>
  );
}
