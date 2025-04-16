// Exemplo em app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [userType, setUserType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserType = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("users") // Use "users" em vez de "usuarios" se for o nome correto
        .select("tipo_usuario")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar tipo de usuário:", error);
        setError("Erro ao carregar dados do usuário.");
      } else {
        setUserType(data.tipo_usuario);
      }
    };

    fetchUserType();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light">
      <div className="p-6 bg-white shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-4">Dashboard</h2>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : userType ? (
          <p>Bem-vindo! Tipo de usuário: {userType}</p>
        ) : (
          <p>Carregando...</p>
        )}
      </div>
    </div>
  );
}