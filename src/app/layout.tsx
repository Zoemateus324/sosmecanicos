// app/layout.tsx ou app/providers.tsx
import './globals.css';
import { Inter } from 'next/font/google';

import  {SupabaseProvider}  from '@/components/SupabaseProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { StripeProvider } from '@/components/StripeProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="min-h-screen bg-gray-100 text-gray-900 antialiased">
        <StripeProvider>
          <SupabaseProvider >
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors />
            </AuthProvider>
          </SupabaseProvider>
        </StripeProvider>
      </body>
    </html>
  );
}
