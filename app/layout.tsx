import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Chatbot } from '@/components/Chatbot';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ReasonAI — Smart Reasoning System',
  description:
    'An AI tool that breaks complex problems into clear steps, shows transparent reasoning, and explains why each answer makes sense.',
  keywords: ['AI', 'reasoning', 'Gemini', 'smart reasoning', 'problem solving', 'Google AI'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-base-bg text-slate-100 antialiased font-sans">
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
