import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReasonAI — Smart Reasoning System',
  description:
    'An AI tool that breaks complex problems into clear steps, shows transparent reasoning, and explains why each answer makes sense.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-bg text-[#e6f5f1] antialiased">{children}</body>
    </html>
  );
}
