import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('app_config').select('key, value');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const config = Object.fromEntries(data.map((row) => [row.key, row.value]));
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  const body = await req.json();

  const updates = Object.entries(body).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('app_config').upsert(updates);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('system_logs').insert({
    level: 'info',
    message: `Config updated: ${Object.keys(body).join(', ')}`,
  });

  return NextResponse.json({ success: true });
}
