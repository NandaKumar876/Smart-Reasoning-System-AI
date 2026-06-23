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
      const data = await res.json();
      setError(data.error || 'Login failed.');
    }
    setLoading(false);
  }

  return (
    <div className="flex h-screen items-center justify-center bg-base-bg relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="animate-step-in w-[360px] rounded-2xl glass-card p-7 relative"
      >
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-glow-md">
            <Lock size={22} className="text-white" />
          </div>
          <h1 className="text-base font-semibold text-slate-100">Admin Access</h1>
          <p className="mt-1 text-xs text-slate-500">Enter your password to continue</p>
        </div>

        {/* Password input */}
        <div className="relative mb-4">
          <input
            type={showPwd ? 'text' : 'password'}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-xl input-glass px-4 py-3 text-sm text-slate-100 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400 animate-step-in">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="gradient-btn w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-50 disabled:transform-none disabled:shadow-none"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Sign in
              </>
            )}
          </span>
        </button>
      </form>
    </div>
  );
}
