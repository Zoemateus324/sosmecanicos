"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, PanelBottom, Home, Car, BellRing, Bolt, KeySquare, MessageCircleWarning, Settings2, LogOut } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export function Sidebar() {

  return (
    <div className="flex w-full flex-col bg-muted/40">
      <aside
        className="fixed inset-y-0 left-0 z-10 hidden w-14 border-r bg-background sm:flex flex-col"
      >
        <nav className="flex flex-col items-center gap-4 px-2 py-5">
          <TooltipProvider>

            <Link href="/dashboard/cliente"
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-primary text-primary-foreground rounded-full">
              <Package className="h-4 w-4" />
              <span className="sr-only">Dashboard Avatar</span>
            </Link>

            <Tooltip >
              <TooltipTrigger asChild>

                <Link href="/dashboard/cliente"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-fore">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Dashboard</span>
                </Link>


              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            <Tooltip >
              <TooltipTrigger asChild>

                <Link href="/dashboard/veiculos"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-fore">
                  <Car className="h-4 w-4" />
                  <span className="sr-only">Meus veículos</span>
                </Link>


              </TooltipTrigger>
              <TooltipContent side="right">Meus Veículos</TooltipContent>
            </Tooltip>
            <Tooltip >
              <TooltipTrigger asChild>

                <Link href="/dashboard/solicitacoes"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-fore">
                  <BellRing className="h-4 w-4" />
                  <span className="sr-only">Minhas solicitações</span>
                </Link>


              </TooltipTrigger>
              <TooltipContent side="right">Minhas solicitações</TooltipContent>
            </Tooltip>
            <Tooltip >
              <TooltipTrigger asChild>

                <Link href="/dashboard/mecânicos"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-fore">
                  <Bolt className="h-4 w-4" />
                  <span className="sr-only">Mecânicos</span>
                </Link>


              </TooltipTrigger>
              <TooltipContent side="right">Mecânicos</TooltipContent>
            </Tooltip>
              <Tooltip >
              <TooltipTrigger asChild>

                <Link href="/dashboard/guinchos"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-fore">
                  <KeySquare className="h-4 w-4" />
                  <span className="sr-only">Guinchos</span>
                </Link>


              </TooltipTrigger>
              <TooltipContent side="right">Guinchos</TooltipContent>
            </Tooltip>
              <Tooltip >
              <TooltipTrigger asChild>

                <Link href="/dashboard/ajuda"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-fore">
                  <MessageCircleWarning className="h-4 w-4" />
                  <span className="sr-only">Suporte</span>
                </Link>


              </TooltipTrigger>
              <TooltipContent side="right">Suporte</TooltipContent>
            </Tooltip>
              <Tooltip >
              <TooltipTrigger asChild>

                <Link href="/dashboard/perfil"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-fore">
                  <Settings2 className="h-4 w-4" />
                  <span className="sr-only">Meu perfil</span>
                </Link>


              </TooltipTrigger>
              <TooltipContent side="right">Perfil</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-5">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="#"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-5 w-5 text-red-500"/>
            <span className="sr-only">Sair</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Sair</TooltipContent>
      </Tooltip>
    </TooltipProvider>
        </nav>

      </aside>
      <div className="sm:hidden flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header
          className="sticky top-0 z-30 flex h-14 items-center px-4 border-bg bg-background gap-4 
          sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
        >
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelBottom className="w-5 h-5" />
                <span className="sr-only">Abrir / Fechar menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent className="sm:max-w-xs">
              <SheetTitle className="px-4 py-2 border-b">Menu</SheetTitle>

              <nav className="grid gap-6 text-lg font-medium p-2">
                {/* Links de navegação */}
                <Link
                  href="/dashboard/cliente"
                  className="flex h-10 w-10 bg-fuchsia-800 rounded-full 
                  text-lg items-center justify-center gap-2 text-primary-foreground"
                  prefetch={false}
                >
                  <Package className="w-5 h-5" />
                  <span className="sr-only">SOS Mecânicos</span>

                </Link>

                <Link
                  href="/dashboard/cliente"
                  className="flex items-center gap-4 px-2.5 text-muted-foreground"
                  prefetch={false}
                >
                  <Home className="w-5 h-5" />
                  Dashboard
                </Link>

                <Link href="/dashboard/cliente"
                  className='flex items-center gap-4 px-2.5 text-muted-foreground'
                  prefetch={false}
                >
                  <Car className="w-5 h-5" />
                  Meus veículos
                </Link>

                <Link href="/dashboard/cliente"
                  className='flex items-center gap-4 px-2.5 text-muted-foreground'
                  prefetch={false}
                >
                  <MessageCircleWarning className="w-5 h-5" />
                  Suporte
                </Link>

              </nav>

            </SheetContent>
          </Sheet>
        </header>
      </div>
    </div>
  );
}
