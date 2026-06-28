import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

/**
 * Lightweight chat endpoint wrapping Google Gemini API for conversational
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

  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    try {
      const supabase = createSupabaseAdminClient();
      const { data } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', 'gemini_api_key')
        .single();
      if (data && typeof data.value === 'string' && data.value.trim()) {
        apiKey = data.value.trim();
      }
    } catch {}
  }

  if (!apiKey || !apiKey.trim()) {
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

  // Convert chat history to Gemini format
  const history = (body.history ?? []).slice(-10).map((m) => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }));

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    });

    const chat = model.startChat({
      history,
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text() ?? "I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    return NextResponse.json({
      reply: "Sorry, something went wrong. Please try again!",
    });
  }
}
