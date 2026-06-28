'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(params.get('redirect') || '/dashboard');
    } else {
      let errMsg = 'Login failed.';
      try {
        const data = await res.json();
        errMsg = data.error || errMsg;
      } catch {
        errMsg = `Server error (${res.status}): ${res.statusText || 'Internal Server Error'}`;
      }
      setError(errMsg);
    }
    setLoading(false);
  }

  return (
    <div className="flex h-screen items-center justify-center bg-base-bg relative overflow-hidden dot-grid">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="animate-step-in w-[380px] rounded-2xl glass-strong p-8 border border-white/[0.04] shadow-2xl relative"
      >
        {/* Decorative subtle border top light */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 shadow-glow-md">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-[17px] font-bold text-slate-100 tracking-tight">Admin Gate</h1>
          <p className="mt-1.5 text-xs text-slate-500 font-medium">Verify credentials to audit backend logs</p>
        </div>

        {/* Password input */}
        <div className="relative mb-5">
          <input
            type={showPwd ? 'text' : 'password'}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="System access key"
            className="w-full rounded-xl input-glass px-4.5 py-3.5 text-xs text-slate-100 pr-11 focus-ring placeholder-slate-650"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs text-rose-400 animate-step-in font-medium leading-relaxed">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="gradient-btn w-full rounded-xl py-3.5 text-xs font-bold text-white disabled:opacity-50 disabled:transform-none disabled:shadow-none"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Sparkles size={14} className="sparkle-spin" />
                Access Dashboard
              </>
            )}
          </span>
        </button>
      </form>
    </div>
  );
}
