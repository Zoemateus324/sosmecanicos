import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Footer from "@/components/Footer";
import "leaflet/dist/leaflet.css";
import { Toaster } from "sonner"; // Importamos Toaster diretamente de sonner
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
        <SpeedInsights/>
          {children}
          
        </AuthProvider>
      </body>
    </html>
  );
}