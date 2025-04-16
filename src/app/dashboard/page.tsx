"use client"; // Marca o componente como cliente

import { useAuth } from "@/contexts/AuthContext"; // Ajuste o caminho conforme necessário
import { useEffect } from "react";

export default function Dashboard() {
  const { session, userType } = useAuth();

  useEffect(() => {
    if (!session) {
      // Redireciona para login se não estiver autenticado (opcional)
      window.location.href = "/login";
    }
  }, [session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light">
      <div className="p-6 bg-white shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-4">Dashboard</h2>
        {session ? (
          <p>Bem-vindo, {session.user.email}! Tipo: {userType}</p>
        ) : (
          <p>Carregando...</p>
        )}
      </div>
    </div>
  );
}