import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import Footer from "@/components/Footer";
import "leaflet/dist/leaflet.css";
import SupabaseProvider, {useSupabase} from "@/components/SupabaseProvider";
import { Toaster } from "sonner"; // Importamos Toaster diretamente de sonner
import { Metadata } from "next";
import { Inter } from "next/font/google";
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