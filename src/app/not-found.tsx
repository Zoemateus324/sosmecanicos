'use client';
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Página não encontrada</h2>
        <p className="text-gray-600 mb-8">
          Desculpe, a página que você está procurando não existe.
        </p>
        <Button
          onClick={() => window.history.back()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Voltar
        </Button>
      </div>
    </div>
  );
}


