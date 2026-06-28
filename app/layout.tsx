import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SSV Camp App',
  description: 'Inventory & receipts for Sangha Shiksha Varg camp',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: { background: '#111827', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' },
          }}
        />
      </body>
    </html>
  );
}
