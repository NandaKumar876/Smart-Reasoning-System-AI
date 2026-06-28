import { NextRequest, NextResponse } from 'next/server';
import { runReasoning, ReasoningError } from '@/lib/reasoning-agent';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter (per server instance).
// For multi-instance deployments, swap this for a Redis/Upstash-backed limiter.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests
const RATE_WINDOW_MS = 60_000; // per minute

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
      { status: 429 }
    );
  }

  let body: { problem?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const problem = body.problem?.trim();
  if (!problem) {
    return NextResponse.json({ error: 'Field "problem" is required.' }, { status: 400 });
  }

  let supabase: any = null;
  try {
    supabase = createSupabaseAdminClient();
  } catch (err) {
    console.warn('Supabase admin client could not be initialized:', err instanceof Error ? err.message : err);
  }

  try {
    const { result, inputTokens, outputTokens, latencyMs } = await runReasoning(problem);

    let sessionData: any = null;
    if (supabase) {
      try {
        const { data, error: dbError } = await supabase
          .from('sessions')
          .insert({
            problem,
            steps: result.steps,
            final_answer: result.final_answer,
            model: 'gemini-2.5-flash',
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            latency_ms: latencyMs,
            status: 'success',
          })
          .select('id, created_at')
          .single();

        if (dbError) {
          console.error('Failed to persist session:', dbError.message);
        } else {
          sessionData = data;
        }

        await supabase.from('system_logs').insert({
          level: 'success',
          message: `Reasoning completed in ${latencyMs}ms (${inputTokens}+${outputTokens} tokens)`,
        });
      } catch (dbErr) {
        console.error('Database log operation failed:', dbErr);
      }
    }

    return NextResponse.json({
      id: sessionData?.id ?? null,
      ...result,
      meta: {
        model: 'gemini-2.5-flash',
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        latency_ms: latencyMs,
        created_at: sessionData?.created_at ?? new Date().toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected server error.';

    if (supabase) {
      try {
        await supabase.from('sessions').insert({
          problem,
          steps: [],
          final_answer: null,
          status: 'error',
          error_message: message,
        });

        await supabase.from('system_logs').insert({
          level: 'error',
          message: `Reasoning failed: ${message}`,
        });
      } catch (dbErr) {
        console.error('Failed to write failure log to database:', dbErr);
      }
    }

    console.error('Reasoning error:', err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
