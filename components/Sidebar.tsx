'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, History, LayoutDashboard, Settings, FileText } from 'lucide-react';
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
    <aside className="flex h-screen w-[220px] flex-shrink-0 flex-col border-r border-base-border bg-base-surface">
      <div className="border-b border-base-border px-5 py-4">
        <h1 className="text-sm font-medium text-teal-300">ReasonAI</h1>
        <p className="mt-0.5 text-xs text-[#7a9d96]">Smart reasoning engine</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const showSection = item.section !== lastSection;
          lastSection = item.section;
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <div key={item.href}>
              {showSection && (
                <div className="px-5 pt-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-[#4f6b65]">
                  {item.section}
                </div>
              )}
              <Link
                href={item.href}
                className={clsx(
                  'flex items-center gap-2.5 px-5 py-2 text-sm transition-colors',
                  active
                    ? 'bg-base-surface2 font-medium text-teal-300'
                    : 'text-[#9ab8b1] hover:bg-base-surface2 hover:text-[#e6f5f1]'
                )}
              >
                <Icon size={16} strokeWidth={1.75} />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-base-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-900 text-xs font-medium text-teal-300">
            N
          </div>
          <div>
            <div className="text-xs font-medium text-[#e6f5f1]">Nanda</div>
            <div className="text-[10px] text-[#7a9d96]">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
