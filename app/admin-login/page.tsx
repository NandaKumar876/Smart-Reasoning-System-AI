'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';

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
    <div className="flex h-screen items-center justify-center bg-base-bg">
      <form
        onSubmit={handleSubmit}
        className="w-[320px] rounded-xl border border-base-border bg-base-surface p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <Lock size={16} className="text-teal-400" />
          <h1 className="text-sm font-medium text-[#e6f5f1]">Admin access</h1>
        </div>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="mb-3 w-full rounded-md border border-base-border bg-base-bg px-3 py-2 text-sm text-[#e6f5f1] focus:border-teal-500/50 focus:outline-none"
        />
        {error && <p className="mb-3 text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-teal-500 py-2 text-sm font-medium text-base-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
