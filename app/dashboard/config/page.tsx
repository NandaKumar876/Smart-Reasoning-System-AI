'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Settings, Save, Check, Cpu, Sparkles, KeyRound } from 'lucide-react';

interface Config {
  model: string;
  max_steps: number;
  show_why_explanations: boolean;
  save_sessions: boolean;
  show_token_usage: boolean;
  gemini_api_key: string;
}

const DEFAULT_CONFIG: Config = {
  model: 'gemini-2.5-flash',
  max_steps: 6,
  show_why_explanations: true,
  save_sessions: true,
  show_token_usage: false,
  gemini_api_key: '',
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`toggle-track ${checked ? 'active' : ''}`}
    >
      <div className="toggle-thumb" />
    </button>
  );
}

export default function ConfigPage() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => {
        if (!r.ok) throw new Error('Fetch failed');
        return r.json();
      })
      .then((data) => {
        if (data.config) setConfig({ ...DEFAULT_CONFIG, ...data.config });
      })
      .catch((err) => console.error('Failed to load config:', err));
  }, []);

  async function save() {
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        let errMsg = 'Failed to save configuration';
        try {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      console.error('Failed to save config:', err);
      setError(err instanceof Error ? err.message : 'Save failed');
      setTimeout(() => setError(null), 3000);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden dot-grid">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {/* Decorative corner ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/5 via-purple-500/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-4 glass-strong relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Settings size={16} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight">System Configuration</h2>
              <p className="text-[10px] text-slate-500 font-medium">Fine-tune the model parameters, features, and database settings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {error && (
              <span className="text-xs text-rose-400 font-semibold animate-pulse mr-1">
                {error}
              </span>
            )}
            <button
              onClick={save}
              className={`gradient-btn flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                saved ? 'bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.4)]' : ''
              }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {saved ? <Check size={14} className="stroke-[3]" /> : <Save size={14} />}
                {saved ? 'Saved!' : 'Save Config'}
              </span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          <div className="mx-auto flex max-w-xl flex-col gap-6">
            {/* Model settings */}
            <div className="glass-card rounded-2xl p-6 border border-white/[0.03] shadow-lg animate-step-in space-y-5">
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Cpu size={15} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Model Settings</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Select primary engine and parsing complexity</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
                    Primary Reasoning Engine
                  </label>
                  <select
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    className="w-full rounded-xl input-glass px-3.5 py-3 text-xs text-slate-200 cursor-pointer focus-ring"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (recommended)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                    <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
                    Max Reasoning Steps Limit
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={config.max_steps}
                    onChange={(e) =>
                      setConfig({ ...config, max_steps: Number(e.target.value) })
                    }
                    className="w-full rounded-xl input-glass px-3.5 py-2.5 text-xs text-slate-200 focus-ring"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Upper bound boundary to prevent response overflow.</span>
                </div>
              </div>
            </div>

            {/* Feature toggles */}
            <div className="glass-card rounded-2xl p-6 border border-white/[0.03] shadow-lg animate-step-in space-y-4" style={{ animationDelay: '80ms' }}>
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Features Activation</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Toggle core application layers</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Show &quot;why&quot; explanations</span>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 font-medium">Display reasoning justifications for each step</p>
                  </div>
                  <Toggle
                    checked={config.show_why_explanations}
                    onChange={(v) => setConfig({ ...config, show_why_explanations: v })}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 py-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Save sessions to Supabase</span>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 font-medium">Persist all reasoning sessions for history</p>
                  </div>
                  <Toggle
                    checked={config.save_sessions}
                    onChange={(v) => setConfig({ ...config, save_sessions: v })}
                  />
                </div>
                <div className="flex items-center justify-between border-t border-white/5 py-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Show token usage</span>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 font-medium">Display input/output token counts</p>
                  </div>
                  <Toggle
                    checked={config.show_token_usage}
                    onChange={(v) => setConfig({ ...config, show_token_usage: v })}
                  />
                </div>
              </div>
            </div>

            {/* API Credentials */}
            <div className="glass-card rounded-2xl p-6 border border-white/[0.03] shadow-lg animate-step-in space-y-4" style={{ animationDelay: '160ms' }}>
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <KeyRound size={14} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Credentials</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Configure Google Gemini access keys</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[9.5px] font-bold text-slate-500 uppercase tracking-widest">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter AIza..."
                  value={config.gemini_api_key}
                  onChange={(e) => setConfig({ ...config, gemini_api_key: e.target.value })}
                  className="w-full rounded-xl input-glass px-3.5 py-3 text-xs text-slate-200 focus-ring"
                />
                <p className="text-[10.5px] text-slate-500 mt-2 font-medium">
                  Falls back to process.env.GEMINI_API_KEY if not configured here.
                </p>
              </div>
            </div>

            <p className="text-[10.5px] text-slate-600 animate-step-in leading-relaxed text-center px-6" style={{ animationDelay: '240ms' }}>
              Supabase URL and database credentials are set via server-side environment variables (`.env.local`) and cannot be manipulated inside this client workspace.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
