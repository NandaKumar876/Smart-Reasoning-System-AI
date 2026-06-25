import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  let hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim());
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (!hasAnthropicKey && hasSupabaseConfig) {
    try {
      const supabase = createSupabaseAdminClient();
      const { data } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'anthropic_api_key')
        .single();
      if (data && typeof data.value === 'string' && data.value.trim()) {
        hasAnthropicKey = true;
      }
    } catch {}
  }

  return NextResponse.json({
    status: hasAnthropicKey && hasSupabaseConfig ? 'ok' : 'degraded',
    checks: {
      anthropic_api_key: hasAnthropicKey,
      supabase_config: hasSupabaseConfig,
    },
    timestamp: new Date().toISOString(),
  });
}
