import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sobre</h3>
              <p className="text-gray-600">
                Sistema de gerenciamento de serviços automotivos conectando clientes e mecânicos.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Serviços</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Manutenção Preventiva</li>
                <li>Reparos Gerais</li>
                <li>Diagnóstico</li>
                <li>Revisão</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Como Funciona</li>
                <li>Para Mecânicos</li>
                <li>Para Clientes</li>
                <li>Suporte</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-600">
                <li>contato@exemplo.com</li>
                <li>(11) 95150-5824</li>
                <li>Seg - Sex: 8h às 18h</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; 2025 SOS Mecânicos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 