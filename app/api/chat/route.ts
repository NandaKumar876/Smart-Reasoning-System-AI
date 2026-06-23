import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Lightweight chat endpoint wrapping Anthropic API for conversational
 * responses. Separate from the structured reasoning endpoint — this
 * provides freeform conversational help about using the app.
 */
export async function POST(req: NextRequest) {
  let body: { message?: string; history?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      reply:
        "I'm currently in demo mode since the API key isn't configured. I'm ReasonAI's assistant — I can help you navigate the app, explain how the reasoning engine works, or suggest problems to try. Just ask!",
    });
  }

  const systemPrompt = `You are ReasonAI's helpful assistant chatbot. You help users:
- Understand how the structured reasoning engine works (4-step process: decompose, analyze, reason, conclude)
- Navigate the app (Reasoning page, History, Dashboard, Config, Logs)
- Suggest interesting problems to try
- Explain the reasoning output and "why" justifications
- Answer general questions about AI reasoning

Be concise, friendly, and helpful. Keep responses under 3 sentences unless the user asks for detail.
Use markdown formatting sparingly. Never use code blocks unless discussing code.`;

  const history = (body.history ?? []).slice(-10).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        system: systemPrompt,
        messages: [...history, { role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Anthropic chat error:', errData);
      return NextResponse.json({
        reply: "Sorry, I'm having trouble connecting right now. Try again in a moment!",
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    return NextResponse.json({
      reply: "Sorry, something went wrong. Please try again!",
    });
  }
}
