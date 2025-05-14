'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:w-64 bg-white shadow-lg h-full z-50">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-purple-600">SOS Mecânicos</h2>
      </div>
      <nav className="mt-6 hidden md:block">
        <Link
          href="/dashboard/cliente"
          className="block py-2.5 px-4 text-purple-700 bg-purple-50 font-semibold"
        >
          Dashboard
        </Link>
        <Link
          href="/dashboard/solicitacoes"
          className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 hover:text-purple-700"
        >
          Solicitações
        </Link>
        <Link
          href="/dashboard/perfil"
          className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 hover:text-purple-700"
        >
          Perfil
        </Link>
        <Link
          href="/ajuda"
          className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 hover:text-purple-700"
        >
          Ajuda
        </Link>
      </nav>

      {/* Mobile Sheet */}
      <div className="md:hidden p-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold text-purple-600">SOS Mecânicos</SheetTitle>
              <SheetDescription>Menu de navegação</SheetDescription>
            </SheetHeader>
            <nav className="mt-6">
              <Link
                href="/dashboard/cliente"
                className="block py-2.5 px-4 text-purple-700 bg-purple-50 font-semibold"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/solicitacoes"
                className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                onClick={() => setIsOpen(false)}
              >
                Solicitações
              </Link>
              <Link
                href="/dashboard/perfil"
                className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                onClick={() => setIsOpen(false)}
              >
                Perfil
              </Link>
              <Link
                href="/ajuda"
                className="block py-2.5 px-4 text-gray-600 hover:bg-purple-100 hover:text-purple-700"
                onClick={() => setIsOpen(false)}
              >
                Ajuda
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}