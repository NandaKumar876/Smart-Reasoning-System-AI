'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, Lock, Mail, Loader2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | 'email' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam.includes('unauthorized')) {
        setError('Access restricted: Your account is not registered in the admin_users table.');
      } else {
        setError(errorParam);
      }
    }
  }, [searchParams]);

  // Handle Google / GitHub OAuth
  async function handleOAuthLogin(provider: 'google' | 'github') {
    setLoadingProvider(provider);
    setError(null);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (oauthError) {
        throw new Error(oauthError.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth sign-in failed.');
      setLoadingProvider(null);
    }
  }

  // Handle Email + Password login via rate-limited API route
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password || loadingProvider) return;

    setLoadingProvider('email');
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to log in.');
      }

      // Successful login -> Redirect to admin dashboard
      router.push(data.redirect || '/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      setLoadingProvider(null);
    }
  }

  return (
    <div className="bg-[#111817]/90 backdrop-blur-xl border border-teal-500/20 rounded-2xl p-7 shadow-[0_0_30px_rgba(45,212,191,0.08)]">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 animate-fadeIn">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-rose-400" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}

      {/* OAuth Buttons Section */}
      <div className="space-y-3 mb-6">
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          disabled={loadingProvider !== null}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-teal-500/20 text-slate-200 text-xs font-semibold transition-all hover:border-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loadingProvider === 'google' ? (
            <Loader2 size={16} className="animate-spin text-teal-400" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
              />
            </svg>
          )}
          <span>Sign in with Google</span>
        </button>

        {/* GitHub OAuth Button */}
        <button
          type="button"
          onClick={() => handleOAuthLogin('github')}
          disabled={loadingProvider !== null}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-teal-500/20 text-slate-200 text-xs font-semibold transition-all hover:border-teal-500/40 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loadingProvider === 'github' ? (
            <Loader2 size={16} className="animate-spin text-teal-400" />
          ) : (
            <svg className="w-4 h-4 fill-slate-200" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          )}
          <span>Sign in with GitHub</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-teal-500/10" />
        </div>
        <span className="relative z-10 bg-[#111817] px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Or admin password
        </span>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Admin Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail size={16} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@yourdomain.com"
              className="w-full bg-slate-950/60 border border-teal-500/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock size={16} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="w-full bg-slate-950/60 border border-teal-500/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/30 transition-all font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loadingProvider !== null || !email.trim() || !password}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_25px_rgba(45,212,191,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loadingProvider === 'email' ? (
            <>
              <Loader2 size={16} className="animate-spin text-slate-950" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Sign In as Admin</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen w-full bg-[#0a0f0e] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Subtle Teal Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.03),transparent_70%)] pointer-events-none" />

      <main className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20 shadow-[0_0_20px_rgba(45,212,191,0.15)] mb-4">
            <Brain size={28} className="text-teal-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center justify-center gap-2">
            ReasonAI Admin
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <ShieldCheck size={10} /> Secure Gate
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Authorized administrator authentication portal
          </p>
        </div>

        {/* Card Container wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="bg-[#111817]/90 backdrop-blur-xl border border-teal-500/20 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 size={24} className="animate-spin text-teal-400" />
              <span className="text-xs text-slate-400 font-medium">Loading login portal...</span>
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>

        {/* Security Footer Note */}
        <div className="text-center mt-6 text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck size={13} className="text-teal-500/60" />
          <span>Access is protected by Supabase RLS and Admin Gate Middleware.</span>
        </div>
      </main>
    </div>
  );
}
