'use client'
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6 text-center">
        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          Bem-vindo ao SOS Mecânicos
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Encontre mecânicos próximos e solicite serviços de guincho rapidamente.
        </p>
        <div className="space-x-4">
          <Button
            onClick={() => router.push("/login")}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Login
          </Button>
          <Button
            onClick={() => router.push("/cadastro")}
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            Cadastre-se
          </Button>
        </div>
      </main>
    </div>
  );
}