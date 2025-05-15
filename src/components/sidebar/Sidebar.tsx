'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, PanelBottom, Home } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet'





  // Handle logout
  const handleLogout = async () => {
    if (!isSupabaseInitialized(supabase)) {
      toast.error('Não é possível fazer logout: conexão com o banco de dados não está disponível', {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Erro ao sair: ' + error.message, {
        style: { backgroundColor: '#EF4444', color: '#ffffff' },
      });
    } else {
      router.push('/login');
    }
  };



export function Sidebar() {
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
                <Link href="/dashboard/cliente"
                  className='flex h-10 w-10 bg-fuchsia-800 rounded-full
                text-lg items-center justify-center gap-2 text-primary-foreground md:text-base'
                  prefetch={false}
                >
                  <Package className='w-5 h-5' />
                  <span className='sr-only'>Logo do Projeto</span>
                </Link>

                <Link href="/dashboard/cliente"
                  className='flex items-center gap-4 px-2.5 text-muted-foreground'
                  prefetch={false}
                >
                  <Home className='w-5 h-5' />
                  Dashboard
                </Link>

                <Link href="/dashboard/veiculos"
                  className='flex items-center gap-4 px-2.5 text-muted-foreground'
                  prefetch={false}
                >
                  <Package className='w-5 h-5' />
                  Meus veículos
                </Link>

                <Link href="/dashboard/ajuda"
                  className='flex items-center gap-4 px-2.5 text-muted-foreground'
                  prefetch={false}
                >
                  <Package className='w-5 h-5' />
                  Suporte
                </Link>
 <Link href="/dashboard/perfil"
                  className='flex items-center gap-4 px-2.5 text-muted-foreground'
                  prefetch={false}
                >
                  <Package className='w-5 h-5' />
                  Perfil
                </Link>


              </nav>
<Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </Button>
            </SheetContent>
          </Sheet>
        </header>
      </div>
    </div>
  );
}