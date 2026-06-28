'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Settings, Save, Check } from 'lucide-react';

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
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/5 px-6 py-3.5 glass-strong">
          <div className="flex items-center gap-2.5">
            <Settings size={18} className="text-indigo-400" />
            <h2 className="text-[15px] font-semibold text-slate-100">System Config</h2>
          </div>
          <div className="flex items-center gap-3">
            {error && (
              <span className="text-xs text-red-400 font-medium animate-pulse">
                {error}
              </span>
            )}
            <button
              onClick={save}
              className={`gradient-btn flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-all ${
                saved ? 'bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : ''
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {saved ? <Check size={14} /> : <Save size={14} />}
                {saved ? 'Saved!' : 'Save changes'}
              </span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-xl flex-col gap-5">
            {/* Model settings */}
            <div className="glass-card rounded-xl p-5 animate-step-in">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <h3 className="text-[13px] font-semibold text-slate-200">Model Settings</h3>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Primary model
                </label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full rounded-xl input-glass px-3.5 py-2.5 text-[13px] text-slate-200 cursor-pointer"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (recommended)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                  <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Max reasoning steps
                </label>
                <input
                  type="number"
                  min={2}
                  max={12}
                  value={config.max_steps}
                  onChange={(e) =>
                    setConfig({ ...config, max_steps: Number(e.target.value) })
                  }
                  className="w-full rounded-xl input-glass px-3.5 py-2.5 text-[13px] text-slate-200"
                />
              </div>
            </div>

            {/* Feature toggles */}
            <div className="glass-card rounded-xl p-5 animate-step-in" style={{ animationDelay: '80ms' }}>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                <h3 className="text-[13px] font-semibold text-slate-200">Features</h3>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="text-sm text-slate-200">Show &quot;why&quot; explanations</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Display reasoning justifications for each step</p>
                </div>
                <Toggle
                  checked={config.show_why_explanations}
                  onChange={(v) => setConfig({ ...config, show_why_explanations: v })}
                />
              </div>
              <div className="flex items-center justify-between border-t border-white/5 py-3">
                <div>
                  <span className="text-sm text-slate-200">Save sessions to Supabase</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Persist all reasoning sessions for history</p>
                </div>
                <Toggle
                  checked={config.save_sessions}
                  onChange={(v) => setConfig({ ...config, save_sessions: v })}
                />
              </div>
              <div className="flex items-center justify-between border-t border-white/5 py-3">
                <div>
                  <span className="text-sm text-slate-200">Show token usage</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Display input/output token counts</p>
                </div>
                <Toggle
                  checked={config.show_token_usage}
                  onChange={(v) => setConfig({ ...config, show_token_usage: v })}
                />
              </div>
            </div>

            {/* API Credentials */}
            <div className="glass-card rounded-xl p-5 animate-step-in" style={{ animationDelay: '160ms' }}>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <h3 className="text-[13px] font-semibold text-slate-200">API Credentials</h3>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter AIza..."
                  value={config.gemini_api_key}
                  onChange={(e) => setConfig({ ...config, gemini_api_key: e.target.value })}
                  className="w-full rounded-xl input-glass px-3.5 py-2.5 text-[13px] text-slate-200"
                />
                <p className="text-[11px] text-slate-600 mt-1.5">
                  Falls back to process.env.GEMINI_API_KEY if not configured here.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 animate-step-in" style={{ animationDelay: '240ms' }}>
              Supabase URL and keys are set via environment variables (.env.local) — not editable
              here, since they require a server restart to take effect.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
