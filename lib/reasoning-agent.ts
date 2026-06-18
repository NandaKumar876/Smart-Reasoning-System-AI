import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { ReasoningResult } from '@/types/reasoning';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const REASONING_MODEL = 'claude-sonnet-4-6';

/**
 * The system prompt is the single most important piece of prompt engineering
 * here. It forces the model into a consistent 4-stage reasoning structure
 * and requires a "why" justification for every step, which is what makes the
 * output trustworthy rather than just a black-box answer.
 */
const SYSTEM_PROMPT = `You are a structured reasoning engine. Your job is to take any problem \
— technical, business, personal, or abstract — and reason through it transparently.

Always break the problem into exactly 4 stages, in this order:
1. "decompose"  — split the problem into its core sub-parts or unknowns
2. "analyze"    — examine each sub-part: relevant facts, constraints, tradeoffs
3. "reason"     — weigh options/approaches against each other using evidence from step 2
4. "conclude"   — state the final recommendation or solution clearly

Rules:
- Each step must have a "why" field explaining WHY that reasoning is sound — not a summary, an actual justification (what makes this a valid logical move).
- Be specific to the actual problem given. Never use generic filler like "this step helps us understand the problem better."
- If the problem is technical (code, math, systems), include concrete details (numbers, names, mechanisms) in "content".
- If the problem is ambiguous, state your interpretation in the "decompose" step rather than asking a clarifying question — this is a non-interactive tool.
- Keep each "content" field to 2-4 sentences. Keep each "why" field to 1-2 sentences.
- The "final_answer" should be a direct, actionable answer — not a recap of the steps.

Respond with ONLY valid JSON, no markdown fences, no preamble, matching exactly this shape:
{
  "steps": [
    { "type": "decompose", "title": string, "content": string, "why": string },
    { "type": "analyze",   "title": string, "content": string, "why": string },
    { "type": "reason",    "title": string, "content": string, "why": string },
    { "type": "conclude",  "title": string, "content": string, "why": string }
  ],
  "final_answer": string
}`;

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

export class ReasoningError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'ReasoningError';
  }
}

export interface RunReasoningOutput {
  result: ReasoningResult;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

/**
 * Strips markdown code fences if the model wraps JSON in ```json ... ```
 * despite instructions not to — defensive parsing for production reliability.
 */
function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : raw).trim();
}

/**
 * Calls Claude with the reasoning system prompt, validates the structured
 * JSON response against a schema, and returns timing/token metadata for
 * observability in the admin dashboard.
 */
export async function runReasoning(problem: string): Promise<RunReasoningOutput> {
  if (!problem || problem.trim().length === 0) {
    throw new ReasoningError('Problem text cannot be empty.');
  }
  if (problem.length > 4000) {
    throw new ReasoningError('Problem text is too long (max 4000 characters).');
  }

  const startedAt = Date.now();

  let response;
  try {
    response = await anthropic.messages.create({
      model: REASONING_MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: problem }],
    });
  } catch (err) {
    throw new ReasoningError('Anthropic API request failed.', err);
  }

  const latencyMs = Date.now() - startedAt;

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new ReasoningError('Model returned no text content.');
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJson(textBlock.text));
  } catch (err) {
    throw new ReasoningError('Model response was not valid JSON.', err);
  }

  const validation = ReasoningResultSchema.safeParse(parsedJson);
  if (!validation.success) {
    throw new ReasoningError(
      'Model response did not match expected schema.',
      validation.error
    );
  }

  return {
    result: validation.data,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latencyMs,
  };
}
