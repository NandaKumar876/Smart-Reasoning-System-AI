import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('sessions')
    .select('input_tokens, output_tokens, latency_ms, status, steps');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = data.length;
  const successCount = data.filter((s) => s.status === 'success').length;
  const totalInputTokens = data.reduce((sum, s) => sum + (s.input_tokens ?? 0), 0);
  const totalOutputTokens = data.reduce((sum, s) => sum + (s.output_tokens ?? 0), 0);
  const avgLatency = total
    ? Math.round(data.reduce((sum, s) => sum + (s.latency_ms ?? 0), 0) / total)
    : 0;
  const avgSteps = total
    ? Math.round(
        (data.reduce((sum, s) => sum + ((s.steps as unknown[])?.length ?? 0), 0) / total) * 10
      ) / 10
    : 0;

  return NextResponse.json({
    total_sessions: total,
    success_rate: total ? Math.round((successCount / total) * 1000) / 10 : 0,
    total_input_tokens: totalInputTokens,
    total_output_tokens: totalOutputTokens,
    avg_latency_ms: avgLatency,
    avg_steps: avgSteps,
  });
}
