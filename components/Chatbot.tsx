'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  'How does the reasoning engine work?',
  'Suggest a problem to try',
  'What do the 4 steps mean?',
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm ReasonAI's assistant. I can help you understand the reasoning engine, navigate the app, or suggest problems to try. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  async function sendMessage(text?: string) {
    const messageText = (text ?? input).trim();
    if (!messageText || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: updatedMessages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const reply = data.reply ?? "Sorry, I couldn't process that. Please try again!";

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again!' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-glow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-slate-800 rotate-90 scale-95 border border-white/10'
            : 'gradient-btn animate-glow-pulse hover:scale-110'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <span className="relative z-10">
          {isOpen ? (
            <X size={22} className="text-slate-300" />
          ) : (
            <MessageCircle size={22} className="text-white" />
          )}
        </span>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] animate-slide-up">
          <div className="glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/[0.04]" style={{ maxHeight: '540px' }}>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-glow-sm">
                <Bot size={18} className="text-white sparkle-spin" />
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b1120] bg-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100">ReasonAI Concierge</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Assistant
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ minHeight: '300px', maxHeight: '360px' }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3.5 animate-step-in ${
                    msg.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                      msg.role === 'assistant'
                        ? 'bg-indigo-500/15 border border-indigo-500/20'
                        : 'bg-cyan-500/15 border border-cyan-500/20'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <Sparkles size={13} className="text-indigo-400 sparkle-spin" />
                    ) : (
                      <User size={13} className="text-cyan-400" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[260px] rounded-2xl px-4 py-3 text-[12.5px] leading-relaxed shadow-sm font-medium ${
                      msg.role === 'assistant'
                        ? 'bg-white/[0.03] text-slate-300 border border-white/[0.03]'
                        : 'bg-indigo-500/15 text-indigo-100 border border-indigo-500/15'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-3.5 animate-step-in">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20">
                    <Sparkles size={13} className="text-indigo-400 sparkle-spin" />
                  </div>
                  <div className="rounded-2xl bg-white/[0.03] px-4 py-3 border border-white/[0.03] flex items-center justify-center">
                    <div className="flex gap-1.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" style={{ animationDelay: '0.2s' }} />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions (show only when no user messages yet) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    className="rounded-xl bg-white/[0.03] px-3.5 py-2 text-[10.5px] text-slate-400 transition-all hover:bg-indigo-500/10 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/20 font-semibold"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="border-t border-white/5 px-4 py-3.5 bg-white/[0.01]">
              <div className="flex items-center gap-2.5">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  disabled={loading}
                  className="flex-1 rounded-xl input-glass px-4 py-3 text-[12.5px] text-slate-200 disabled:opacity-50 focus-ring placeholder-slate-650"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="gradient-btn flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl disabled:opacity-30 disabled:transform-none disabled:shadow-none"
                >
                  <Send size={14} className="relative z-10 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
