"use client";

import { useState } from "react";
import Link from "next/link";
import { createComponentClient } from "@/models/supabase";
import Image from "next/image";
import { cn } from "@/lib/utils"
const menus = {
  cliente: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Meus Veículos", href: "/veiculos" },
    { name: "Solicitar Serviço", href: "/solicitar" },
    { name: "Meus Pedidos", href: "/pedidos" },
    { name: "Perfil", href: "/perfil" },
  ],
  mecanico: [
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

export default function Navbar() {
  const supabase = createComponentClient();

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-lg z-50">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center space-x-2">
         
          <span className="text-xl md:text-2xl font-bold text-orange-500">SOS Mecânicos</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-4 md:space-x-6">
          {!session ? (
            <>
              <Link href="/como-funciona" className="text-gray-600 hover:text-orange-500 text-base md:text-lg">
                Como Funciona
              </Link>
              <Link href="/para-clientes" className="text-gray-600 hover:text-orange-500 text-base md:text-lg">
                Para Clientes
              </Link>
              <Link href="/para-mecanicos" className="text-gray-600 hover:text-orange-500 text-base md:text-lg">
                Para Mecânicos
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-orange-500 text-base md:text-lg">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg text-base md:text-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
              >
                Cadastrar
              </Link>
            </>
          ) : (
            <>
              {userType &&
                menus[userType as keyof typeof menus]?.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-600 hover:text-orange-500 text-base md:text-lg"
                  >
                    {item.name}
                  </Link>
                ))}
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-gray-600 hover:text-orange-500 text-base md:text-lg"
              >
                Sair
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-gray-600" onClick={toggleMenu}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {!session ? (
              <>
                <Link
                  href="/como-funciona"
                  className="text-gray-600 hover:text-orange-500 text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Como Funciona
                </Link>
                <Link
                  href="/para-clientes"
                  className="text-gray-600 hover:text-orange-500 text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Para Clientes
                </Link>
                <Link
                  href="/para-mecanicos"
                  className="text-gray-600 hover:text-orange-500 text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Para Mecânicos
                </Link>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-orange-500 text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-2 px-4 rounded-lg text-base font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Cadastrar
                </Link>
              </>
            ) : (
              <>
                {userType &&
                  menus[userType as keyof typeof menus]?.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-gray-600 hover:text-orange-500 text-base"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                <button
                  onClick={() => {
                    supabase.auth.signOut();
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-orange-500 text-base text-left"
                >
                  Sair
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}