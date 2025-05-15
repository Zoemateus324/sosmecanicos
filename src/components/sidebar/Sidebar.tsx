'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Menu, Package, PanelBottom } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex w-full flex-col bg-muted/40">




      <div className="sm:hidden flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className='sticky top-0 z-30 flex h-14 items-center px-4
        border-bg bg-background gap-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6'>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className='sm:hidden'>
                <PanelBottom className='w-5 h-5' />
                <span className='sr-only'>Abrir / Fechar menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className='sm:max-w-x'>
              <nav className='grid gap-6 text-lg font-medium p-2'>

                {/*Links de navegação */}
                <Link href="/"
                  className='flex h-10 w-10 bg-fuchsia-800 rounded-full
                text-lg items-center justify-center gap-2 text-primary-foreground md:text-base'
                  prefetch={false}
                >
                  <Package className='w-5 h-5' />
                  <span className='sr-only'>Dashboard</span>
                </Link>

                <Link href="/dashboard/cliente"
                  className='flex h-10 w-10 bg-fuchsia-800 rounded-full
                text-lg items-center justify-center gap-2 text-primary-foreground md:text-base'
                  prefetch={false}
                >
                  <Package className='w-5 h-5' />
                  <span className='sr-only'>Solicitações</span>
                </Link>

                <Link href="/dashboard/cliente"
                  className='flex h-10 w-10 bg-fuchsia-800 rounded-full
                text-lg items-center justify-center gap-2 text-primary-foreground md:text-base'
                  prefetch={false}
                >
                  <Package className='w-5 h-5' />
                  <span className='sr-only'>Meus veículos</span>
                </Link>

                <Link href="/dashboard/cliente"
                  className='flex h-10 w-10 bg-fuchsia-800 rounded-full
                text-lg items-center justify-center gap-2 text-primary-foreground md:text-base'
                  prefetch={false}
                >
                  <Package className='w-5 h-5' />
                  <span className='sr-only'>Suporte</span>
                </Link>


              </nav>
            </SheetContent>

          </Sheet>
        </header>
      </div>
    </div>
  );
}