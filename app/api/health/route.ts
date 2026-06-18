import { NextResponse } from 'next/server';

export async function GET() {
  const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  return NextResponse.json({
    status: hasAnthropicKey && hasSupabaseConfig ? 'ok' : 'degraded',
    checks: {
      anthropic_api_key: hasAnthropicKey,
      supabase_config: hasSupabaseConfig,
    },
    timestamp: new Date().toISOString(),
  });
}
