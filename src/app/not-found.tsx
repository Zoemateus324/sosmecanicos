'use client';
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const { user, userType } = useAuth();
  const router = useRouter();

  const handleRedirect = () => {
    if (user && userType) {
      switch (userType.toLowerCase()) {
        case "cliente":
          router.push("/dashboard/cliente");
          break;
        case "mecanico":
          router.push("/dashboard/mecanico");
          break;
        case "guincho":
          router.push("/dashboard/guincho");
          break;
        case "seguradora":
          router.push("/dashboard/seguradora");
          break;
        default:
          router.push("/");
      }
    } else {
      router.push("/");
    }
  };

  return (
    <div className=" flex flex-col gap-4 h-screen items-center justify-center">
      <h1 className=" text-4xl font-bold">404 - Página não encontrada</h1>
      <p className=" text-lg">Sentimos muito, a página que você está procurando não foi encontrada.</p>
      <button
        onClick={handleRedirect}
        className="text-blue-500 hover:text-blue-600 underline bg-transparent border-none cursor-pointer text-lg"
      >
        Voltar para a página inicial
      </button>
    </div>
  );
}


