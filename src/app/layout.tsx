import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import Footer from "@/components/Footer";
import "leaflet/dist/leaflet.css";
import { SupabaseProvider } from "@/components/supabase-provider";
import { Toaster } from "sonner"; // Importamos Toaster diretamente de sonner
import SupabaseProvider from "@/components/supabase-provider";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <SupabaseProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}