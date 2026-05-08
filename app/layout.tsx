import './globals.css';

import type { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'Ordera',
  description: 'Ordera dashboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Toaster position="top-right" closeButton richColors />
        {children}
      </body>
    </html>
  );
}

