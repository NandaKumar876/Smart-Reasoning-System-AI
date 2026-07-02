'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Zap,
  ShieldCheck,
  Calendar,
  Activity,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export interface AdminUserRow {
  id: string;
  email: string;
  provider: string; // 'google' | 'github' | 'email' | 'unknown'
  createdAt: string;
  lastSignInAt: string;
  sessionCount: number;
}

interface AdminDashboardClientProps {
  adminEmail: string;
  users: AdminUserRow[];
  totalCount: number;
}

const PAGE_SIZE = 20;

export function AdminDashboardClient({
  adminEmail,
  users,
  totalCount,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Filter users by search term (email matching)
  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
      setIsLoggingOut(false);
    }
  }

  function getProviderBadge(provider: string) {
    switch (provider.toLowerCase()) {
      case 'google':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <svg className="w-3 h-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </span>
        );
      case 'github':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <UserCheck size={11} />
            Email
          </span>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f0e] text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-teal-500/20 bg-[#111817]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-[0_0_15px_rgba(45,212,191,0.15)]">
            <Brain size={20} className="text-teal-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2">
              ReasonAI Admin Portal
              <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-mono">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Logged in as <span className="text-teal-300 font-mono">{adminEmail}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-teal-500/20 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all shadow-sm"
        >
          <LogOut size={14} />
          <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
        </button>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6 relative z-10">
        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111817]/80 border border-teal-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(45,212,191,0.04)] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered Users</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-1">{totalCount}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <UserCheck size={20} />
            </div>
          </div>

          <div className="bg-[#111817]/80 border border-teal-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(45,212,191,0.04)] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Reasoning Sessions</p>
              <h3 className="text-2xl font-bold text-teal-300 mt-1">
                {users.reduce((acc, u) => acc + u.sessionCount, 0)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Zap size={20} />
            </div>
          </div>

          <div className="bg-[#111817]/80 border border-teal-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(45,212,191,0.04)] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security & Access</p>
              <h3 className="text-xs font-semibold text-emerald-400 mt-1.5 flex items-center gap-1.5">
                <ShieldCheck size={14} /> RLS Enabled & Enforced
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={20} />
            </div>
          </div>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111817]/80 border border-teal-500/20 rounded-2xl p-4">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search users by email..."
              className="w-full bg-slate-950/60 border border-teal-500/20 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="text-teal-300 font-semibold">{filteredUsers.length}</span> results
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-[#111817]/90 border border-teal-500/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-[10.5px] uppercase tracking-wider font-bold text-slate-400 border-b border-teal-500/20">
                <tr>
                  <th className="px-5 py-3.5">User / Email</th>
                  <th className="px-5 py-3.5">Sign-up Method</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5">Last Active</th>
                  <th className="px-5 py-3.5 text-right">Reasoning Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-500/10 text-slate-300">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500 font-medium">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-teal-500/[0.03] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-slate-200 font-medium">
                        {u.email}
                      </td>
                      <td className="px-5 py-3.5">{getProviderBadge(u.provider)}</td>
                      <td className="px-5 py-3.5 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-500" />
                          <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Activity size={13} className="text-slate-500" />
                          <span>
                            {u.lastSignInAt
                              ? new Date(u.lastSignInAt).toLocaleString([], {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })
                              : 'Never'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-teal-400">
                        {u.sessionCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-5 py-3.5 bg-slate-950/60 border-t border-teal-500/20 flex items-center justify-between text-xs text-slate-400">
            <div>
              Page <span className="text-slate-200 font-semibold">{currentPage}</span> of{' '}
              <span className="text-slate-200 font-semibold">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-900 border border-teal-500/20 text-slate-300 hover:text-teal-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg bg-slate-900 border border-teal-500/20 text-slate-300 hover:text-teal-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
