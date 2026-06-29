import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Invora App',
  description: 'Inventory & receipts for Sangha Shiksha Varg camp',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="bg-canvas text-ink min-h-full">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              border: '1px solid #e2e2e4',
              color: '#18181b',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
