import React from 'react';
import type { Metadata } from 'next';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kairos: AI System Architect',
  description:
    'Stop guessing your stack. Kairos asks the right questions and gives you a precise, opinionated tech stack recommendation with an interactive architecture diagram.',
  keywords: ['tech stack', 'system architecture', 'AI', 'solo developer', 'indie hacker'],
  openGraph: {
    title: 'Kairos: AI System Architect',
    description: 'Stop guessing your stack. Ship with confidence.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('theme');
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && systemDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  console.error(e);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
