"use client"
import {useAuth} from "@/contexts/AuthContext";
import Link from "next/link";


const menus ={
    cliente:[
        {name:"Dashboard", href:"/dashboard"},
        {name:"Meus Veículos", href:"/veiculos"},
        {name:"Solicitar Serviço", href:"/solicitar"},
        {name:"Meus Pedidos", href:"/pedidos"},
        {name:"Perfil", href:"/perfil"},
    ],mecanico: [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Solicitações", href: "/solicitacoes" },
        { name: "Meus Serviços", href: "/servicos" },
        { name: "Conta", href: "/conta" },
      ],
      guincho: [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Serviços por km", href: "/servicos-km" },
        { name: "Solicitações", href: "/solicitacoes" },
        { name: "Perfil", href: "/perfil" },
      ],
      seguradora: [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Planos", href: "/planos" },
        { name: "Clientes", href: "/clientes" },
        { name: "Solicitações", href: "/solicitacoes" },
      ],
};


export default function Navbar(){
    const { session,userType, loading } = useAuth();

    if (loading) return null;



    return(
        <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link href="/">SOS Mecânicos</Link>
        <div className="space-x-4">
          {!session ? (
            <>
              <Link href="/como-funciona">Como Funciona</Link>
              <Link href="/para-clientes">Para Clientes</Link>
              <Link href="/para-mecanicos">Para Mecânicos</Link>
              <Link href="/login">Entrar</Link>
              <Link href="/cadastro">Cadastrar</Link>
            </>
          ) : (
            <>
              {userType &&
                menus[userType as keyof typeof menus]?.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.name}
                  </Link>
                ))}
              <button
                onClick={() => supabase.auth.signOut()}
                className="ml-4"
              >
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
    );
}