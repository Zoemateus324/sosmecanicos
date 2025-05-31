import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import Footer from "@/components/Footer";
import "leaflet/dist/leaflet.css";
import { Toaster } from "sonner"; // Importamos Toaster diretamente de sonner
import { SupabaseProvider } from "@/components/supabase-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}