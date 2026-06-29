import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'SSV Camp App',
  description: 'Inventory & receipts for Sangha Shiksha Varg camp',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('h-full', inter.variable)}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          theme="light"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e2e5ef',
              color: '#0d0f1a',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
