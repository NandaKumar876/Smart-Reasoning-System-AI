'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, History, LayoutDashboard, Settings, FileText, Sparkles, Cpu, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/reason', label: 'Reasoning', icon: Brain, section: 'Workspace', description: 'AI-powered analysis' },
  { href: '/history', label: 'History', icon: History, section: 'Workspace', description: 'Past sessions' },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Admin', description: 'Usage analytics' },
  { href: '/dashboard/config', label: 'Config', icon: Settings, section: 'Admin', description: 'System settings' },
  { href: '/dashboard/logs', label: 'Logs', icon: FileText, section: 'Admin', description: 'Event history' },
];

export function Sidebar() {
  const pathname = usePathname();
  let lastSection = '';

  return (
    <aside className="flex h-screen w-[260px] flex-shrink-0 flex-col glass-strong">
      {/* Brand header */}
      <div className="relative border-b border-white/5 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 shadow-glow-md">
            <Sparkles size={19} className="text-white sparkle-spin" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 opacity-40 blur-lg" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold gradient-text tracking-tight">ReasonAI</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Cpu size={9} className="text-cyan-400" />
              <p className="text-[10px] text-slate-500 font-medium">Powered by Gemini</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((item) => {
          const showSection = item.section !== lastSection;
          lastSection = item.section;
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <div key={item.href}>
              {showSection && (
                <div className="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                  {item.section}
                </div>
              )}
              <Link
                href={item.href}
                className={clsx(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-250 mb-0.5',
                  active
                    ? 'glass-card bg-indigo-500/10 font-semibold text-indigo-200 shadow-glow-sm border-indigo-500/20'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                )}
              >
                <div
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-250',
                    active
                      ? 'bg-indigo-500/15 shadow-glow-sm'
                      : 'bg-white/[0.03] group-hover:bg-white/[0.06]'
                  )}
                >
                  <Icon
                    size={15}
                    strokeWidth={1.75}
                    className={clsx(
                      'transition-all duration-250',
                      active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.label}</div>
                  {active && (
                    <div className="text-[9px] text-indigo-400/60 font-normal mt-0.5 truncate">
                      {item.description}
                    </div>
                  )}
                </div>
                {active && (
                  <div className="flex-shrink-0 h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Status bar */}
      <div className="px-4 py-2">
        <div className="rounded-lg bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-white/[0.03] px-3 py-2">
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span className="font-medium text-emerald-400/80">System Online</span>
            <span className="ml-auto text-slate-600">v1.0</span>
          </div>
        </div>
      </div>

      {/* User section */}
      <div className="border-t border-white/5 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-glow-sm">
              N
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a0f1e] bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-slate-200 truncate">Nanda</div>
            <div className="text-[10px] text-slate-500 font-medium">Administrator</div>
          </div>
          <ExternalLink size={13} className="text-slate-600 hover:text-slate-400 transition-colors cursor-pointer flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
