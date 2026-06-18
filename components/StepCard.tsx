import { ListTree, Microscope, Lightbulb, CheckCircle2, Info } from 'lucide-react';
import type { ReasoningStep, StepType } from '@/types/reasoning';
import clsx from 'clsx';

const STEP_META: Record<
  StepType,
  { icon: typeof ListTree; label: string; badgeClass: string; numClass: string }
> = {
  decompose: {
    icon: ListTree,
    label: 'Decompose',
    badgeClass: 'bg-indigo-500/15 text-indigo-300',
    numClass: 'bg-indigo-500/15 text-indigo-300',
  },
  analyze: {
    icon: Microscope,
    label: 'Analyze',
    badgeClass: 'bg-teal-500/15 text-teal-300',
    numClass: 'bg-teal-500/15 text-teal-300',
  },
  reason: {
    icon: Lightbulb,
    label: 'Reason',
    badgeClass: 'bg-amber-500/15 text-amber-300',
    numClass: 'bg-amber-500/15 text-amber-300',
  },
  conclude: {
    icon: CheckCircle2,
    label: 'Conclude',
    badgeClass: 'bg-emerald-500/15 text-emerald-300',
    numClass: 'bg-emerald-500/15 text-emerald-300',
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
      className="animate-step-in overflow-hidden rounded-xl border border-base-border bg-base-surface"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-2.5 border-b border-base-border bg-base-surface2 px-4 py-2.5">
        <div
          className={clsx(
            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-medium',
            meta.numClass
          )}
        >
          {index + 1}
        </div>
        <Icon size={15} strokeWidth={1.75} className="text-[#7a9d96]" />
        <span className="text-sm font-medium text-[#e6f5f1]">{step.title}</span>
        <span
          className={clsx(
            'ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium',
            meta.badgeClass
          )}
        >
          {meta.label}
        </span>
      </div>

      <div className="px-4 py-3.5">
        <p className="text-[13px] leading-relaxed text-[#cfe6e1]">{step.content}</p>

        {showWhy && step.why && (
          <div className="mt-3 rounded-lg border-l-2 border-teal-500/60 bg-base-surface2 px-3 py-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-teal-400">
              <Info size={12} />
              Why this makes sense
            </div>
            <p className="text-xs leading-relaxed text-[#9ab8b1]">{step.why}</p>
          </div>
        )}
      </div>
    </div>
  );
}
