'use client';

import SupabaseProvider from '@/components/SupabaseProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';

// Configurar fonte (opcional)
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="min-h-screen bg-gray-100 text-gray-900">
        <SupabaseProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}