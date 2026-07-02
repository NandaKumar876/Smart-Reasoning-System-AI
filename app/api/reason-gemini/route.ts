import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { callGemini, GeminiApiError } from '@/lib/gemini';
import { runReasoning, ReasoningError } from '@/lib/reasoning-agent';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

/**
 * Zod schema for the request body.
 *
 * - `problem`  — the query to reason about (required)
 * - `provider` — which AI model backend to use (optional, defaults to "gemini-sdk")
 *
 * "gemini-sdk"  → existing reasoning-agent using @google/generative-ai SDK (structured output)
 * "gemini-rest" → raw REST call via lib/gemini.ts (lightweight, no SDK)
 */
const ReasonRequestSchema = z.object({
  problem: z
    .string()
    .min(1, 'Problem text cannot be empty.')
    .max(4000, 'Problem text is too long (max 4000 characters).'),
  provider: z
    .enum(['gemini-sdk', 'gemini-rest'])
    .optional()
    .default('gemini-sdk'),
});

// ── Rate limiter (same pattern as the main /api/reason route) ─────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count += 1;
  return false;
}

// ── The structured system prompt for the REST-based path ──────────────────
const REASONING_SYSTEM_PROMPT = `You are a structured reasoning engine. Break the problem into exactly 4 stages:
1. "decompose" — split the problem into its core sub-parts or unknowns
2. "analyze"   — examine each sub-part: relevant facts, constraints, tradeoffs
3. "reason"    — weigh options/approaches against each other using evidence from step 2
4. "conclude"  — state the final recommendation or solution clearly

Rules:
- Each step must have a "why" field explaining WHY that reasoning is sound.
- Be specific to the actual problem given.
- Keep each "content" field to 2-4 sentences. Keep each "why" field to 1-2 sentences.
- The "final_answer" should be a direct, actionable answer.

Respond with ONLY valid JSON matching exactly this shape:
{
  "steps": [
    { "type": "decompose", "title": string, "content": string, "why": string },
    { "type": "analyze",   "title": string, "content": string, "why": string },
    { "type": "reason",    "title": string, "content": string, "why": string },
    { "type": "conclude",  "title": string, "content": string, "why": string }
  ],
  "final_answer": string
}`;

// Zod schema for validating the model's JSON output
const StepSchema = z.object({
  type: z.enum(['decompose', 'analyze', 'reason', 'conclude']),
  title: z.string().min(1),
  content: z.string().min(1),
  why: z.string().min(1),
});
const ReasoningResultSchema = z.object({
  steps: z.array(StepSchema).min(1),
  final_answer: z.string().min(1),
});

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : raw).trim();
}

// ── Route handler ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
      { status: 429 }
    );
  }

  // ── Parse & validate body ───────────────────────────────────────────────
  let parsed: z.infer<typeof ReasonRequestSchema>;
  try {
    const body = await req.json();
    const validation = ReasonRequestSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message ?? 'Invalid input.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }
    parsed = validation.data;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { problem, provider } = parsed;

  // ── Optional Supabase logging ───────────────────────────────────────────
  let supabase: any = null;
  try {
    supabase = createSupabaseAdminClient();
  } catch (err) {
    console.warn(
      'Supabase admin client could not be initialized:',
      err instanceof Error ? err.message : err
    );
  }

  try {
    let result: { steps: any[]; final_answer: string };
    let inputTokens = 0;
    let outputTokens = 0;
    let latencyMs: number;
    let modelName: string;

    if (provider === 'gemini-rest') {
      // ── REST-based path (lib/gemini.ts) ──────────────────────────────
      modelName = 'gemini-2.0-flash';
      const startedAt = Date.now();
      const rawText = await callGemini(
        `${REASONING_SYSTEM_PROMPT}\n\nProblem: ${problem}`,
        { model: modelName, temperature: 0.7, maxOutputTokens: 1500 }
      );
      latencyMs = Date.now() - startedAt;

      const parsedJson = JSON.parse(extractJson(rawText));
      const validation = ReasoningResultSchema.safeParse(parsedJson);
      if (!validation.success) {
        throw new Error('Model response did not match expected schema.');
      }
      result = validation.data;
    } else {
      // ── SDK-based path (existing reasoning-agent.ts) ─────────────────
      modelName = 'gemini-2.5-flash';
      const output = await runReasoning(problem);
      result = output.result;
      inputTokens = output.inputTokens;
      outputTokens = output.outputTokens;
      latencyMs = output.latencyMs;
    }

    // ── Persist session to Supabase ─────────────────────────────────────
    let sessionData: any = null;
    if (supabase) {
      try {
        const { data, error: dbError } = await supabase
          .from('sessions')
          .insert({
            problem,
            steps: result.steps,
            final_answer: result.final_answer,
            model: modelName,
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
          message: `[${provider}] Reasoning completed in ${latencyMs}ms (${inputTokens}+${outputTokens} tokens)`,
        });
      } catch (dbErr) {
        console.error('Database log operation failed:', dbErr);
      }
    }

    return NextResponse.json({
      id: sessionData?.id ?? null,
      ...result,
      meta: {
        model: modelName,
        provider,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        latency_ms: latencyMs,
        created_at: sessionData?.created_at ?? new Date().toISOString(),
      },
    });
  } catch (err) {
    const message =
      err instanceof ReasoningError || err instanceof GeminiApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Unexpected server error.';

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
          message: `[${provider}] Reasoning failed: ${message}`,
        });
      } catch (dbErr) {
        console.error('Failed to write failure log to database:', dbErr);
      }
    }

    console.error('Reasoning error:', err);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
