import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 20);

  const { data, error } = await supabase
    .from('sessions')
    .select('id, problem, model, input_tokens, output_tokens, latency_ms, status, created_at')
    .order('created_at', { ascending: false })
    .limit(Math.min(limit, 100));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data });
}
