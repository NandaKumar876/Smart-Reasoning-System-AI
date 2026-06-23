'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, History, LayoutDashboard, Settings, FileText, MessageCircle, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/reason', label: 'Reasoning', icon: Brain, section: 'Workspace' },
  { href: '/history', label: 'History', icon: History, section: 'Workspace' },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Admin' },
  { href: '/dashboard/config', label: 'Config', icon: Settings, section: 'Admin' },
  { href: '/dashboard/logs', label: 'Logs', icon: FileText, section: 'Admin' },
];

export function Sidebar() {
  const pathname = usePathname();
  let lastSection = '';

  return (
    <aside className="flex h-screen w-[240px] flex-shrink-0 flex-col glass-strong">
      {/* Brand header */}
      <div className="relative border-b border-white/5 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-glow-sm">
            <Sparkles size={18} className="text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 opacity-50 blur-md" />
          </div>
          <div>
            <h1 className="text-sm font-semibold gradient-text">ReasonAI</h1>
            <p className="text-[10px] text-slate-500">Smart reasoning engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {navItems.map((item) => {
          const showSection = item.section !== lastSection;
          lastSection = item.section;
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <div key={item.href}>
              {showSection && (
                <div className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                  {item.section}
                </div>
              )}
              <Link
                href={item.href}
                className={clsx(
                  'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all duration-200',
                  active
                    ? 'glass-card bg-indigo-500/10 font-medium text-indigo-300 shadow-glow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )}
              >
                <Icon
                  size={16}
                  strokeWidth={1.75}
                  className={clsx(
                    'transition-colors',
                    active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                {item.label}
                {active && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-bold text-white shadow-glow-sm">
            N
          </div>
          <div>
            <div className="text-xs font-medium text-slate-200">Nanda</div>
            <div className="text-[10px] text-slate-500">Admin</div>
          </div>
          <div className="ml-auto">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
