import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('app_config').select('key, value');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dbConfig = Object.fromEntries(data.map((row) => [row.key, row.value]));

  // Mask the API key for the response to avoid exposing it to the browser.
  const apiKeyValue = dbConfig.gemini_api_key;
  const maskedKey = typeof apiKeyValue === 'string' && apiKeyValue.trim() ? 'AIza••••••••••••••••' : '';

  const config = {
    ...dbConfig,
    gemini_api_key: maskedKey,
  };

  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  const supabase = createSupabaseAdminClient();
  const body = await req.json();

  const updates = [];
  const updatedKeys = [];

  for (const [key, value] of Object.entries(body)) {
    if (key === 'gemini_api_key' && value === 'AIza••••••••••••••••') {
      // Don't update the key if it was the masked version (meaning it was not changed)
      continue;
    }
    updates.push({
      key,
      value,
      updated_at: new Date().toISOString(),
    });
    updatedKeys.push(key);
  }

  if (updates.length > 0) {
    const { error } = await supabase.from('app_config').upsert(updates);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (updatedKeys.length > 0) {
    await supabase.from('system_logs').insert({
      level: 'info',
      message: `Config updated: ${updatedKeys.join(', ')}`,
    });
  }

  return NextResponse.json({ success: true });
}
