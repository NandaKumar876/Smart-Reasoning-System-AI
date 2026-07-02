/**
 * lib/gemini.ts
 *
 * Lightweight Gemini helper using raw fetch (no SDK dependency).
 * Use this when you want a direct REST call to the Gemini API
 * without pulling in @google/generative-ai.
 *
 * The existing reasoning-agent.ts uses the SDK for structured
 * reasoning; this module is useful for simpler one-shot prompts,
 * fallback scenarios, or cost comparison experiments.
 */

export class GeminiApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'GeminiApiError';
  }
}

/**
 * Calls the Gemini 2.0 Flash model with a plain-text prompt via the
 * REST API (no SDK). Returns the generated text.
 *
 * @param prompt - The user prompt to send.
 * @param options - Optional generation config overrides.
 */
export async function callGemini(
  prompt: string,
  options?: {
    model?: string;
    maxOutputTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new GeminiApiError(
      'GEMINI_API_KEY is not set. Add it to .env.local.'
    );
  }

  const model = options?.model ?? 'gemini-2.0-flash';

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options?.maxOutputTokens ?? 1500,
          temperature: options?.temperature ?? 0.7,
        },
      }),
    }
  );

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new GeminiApiError(
      `Gemini API error: ${res.status} ${res.statusText}${errorBody ? ` — ${errorBody}` : ''}`,
      res.status
    );
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!text) {
    throw new GeminiApiError('Gemini returned no text content.');
  }

  return text;
}
