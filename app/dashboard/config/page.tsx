'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';

interface Config {
  model: string;
  max_steps: number;
  show_why_explanations: boolean;
  save_sessions: boolean;
  show_token_usage: boolean;
}

const DEFAULT_CONFIG: Config = {
  model: 'claude-sonnet-4-6',
  max_steps: 6,
  show_why_explanations: true,
  save_sessions: true,
  show_token_usage: false,
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="relative inline-block h-5 w-9 flex-shrink-0 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span className="absolute inset-0 rounded-full bg-base-border transition-colors peer-checked:bg-teal-500" />
      <span className="absolute left-[3px] top-[3px] h-3.5 w-3.5 rounded-full bg-[#e6f5f1] transition-transform peer-checked:translate-x-[18px]" />
    </label>
  );
}

export default function ConfigPage() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setConfig({ ...DEFAULT_CONFIG, ...data.config });
      });
  }, []);

  async function save() {
    await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-base-border px-6 py-3.5">
          <h2 className="text-[15px] font-medium text-[#e6f5f1]">System config</h2>
          <button
            onClick={save}
            className="rounded-lg bg-teal-500 px-4 py-1.5 text-[13px] font-medium text-base-bg transition-opacity hover:opacity-90"
          >
            {saved ? 'Saved!' : 'Save changes'}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mx-auto flex max-w-xl flex-col gap-4">
            <div className="rounded-xl border border-base-border p-4">
              <div className="mb-3 text-[13px] font-medium text-[#e6f5f1]">Model settings</div>

              <div className="mb-3">
                <label className="mb-1.5 block text-[11px] font-medium text-[#7a9d96]">
                  Primary model
                </label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full rounded-md border border-base-border bg-base-bg px-2.5 py-2 text-[13px] text-[#e6f5f1] focus:border-teal-500/50 focus:outline-none"
                >
                  <option value="claude-sonnet-4-6">claude-sonnet-4-6 (recommended)</option>
                  <option value="claude-opus-4-6">claude-opus-4-6</option>
                  <option value="claude-haiku-4-5">claude-haiku-4-5</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-[#7a9d96]">
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
                  className="w-full rounded-md border border-base-border bg-base-bg px-2.5 py-2 text-[13px] text-[#e6f5f1] focus:border-teal-500/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-base-border p-4">
              <div className="mb-1 text-[13px] font-medium text-[#e6f5f1]">Features</div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-[#cfe6e1]">Show &quot;why&quot; explanations</span>
                <Toggle
                  checked={config.show_why_explanations}
                  onChange={(v) => setConfig({ ...config, show_why_explanations: v })}
                />
              </div>
              <div className="flex items-center justify-between border-t border-base-border py-2.5">
                <span className="text-sm text-[#cfe6e1]">Save sessions to Supabase</span>
                <Toggle
                  checked={config.save_sessions}
                  onChange={(v) => setConfig({ ...config, save_sessions: v })}
                />
              </div>
              <div className="flex items-center justify-between border-t border-base-border py-2.5">
                <span className="text-sm text-[#cfe6e1]">Show token usage</span>
                <Toggle
                  checked={config.show_token_usage}
                  onChange={(v) => setConfig({ ...config, show_token_usage: v })}
                />
              </div>
            </div>

            <p className="text-xs text-[#4f6b65]">
              Supabase URL and keys are set via environment variables (.env.local) — not editable
              here, since they require a server restart to take effect.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
