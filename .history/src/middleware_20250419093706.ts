import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

type UserType = 'cliente' | 'mecanico' | 'guincho' | 'seguradora'

interface UserData {
  tipo_usuario: UserType
}

export async function middleware(request: NextRequest) {
  try {
    const supabase = createMiddlewareClient<Database>({ req: request, res: NextResponse.next() })

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      throw new Error(`Erro ao obter sessão: ${sessionError.message}`)
    }

    const path = request.nextUrl.pathname

    if (path.startsWith('/dashboard')) {
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tipo_usuario')
        .eq('id', session.user.id)
        .single<UserData>()

      if (userError) {
        throw new Error(`Erro ao obter dados do usuário: ${userError.message}`)
      }

      const userTypeRoutes: Record<UserType, string> = {
        cliente: '/dashboard/cliente',
        mecanico: '/dashboard/mecanica',
        guincho: '/dashboard/guincho',
        seguradora: '/dashboard/seguradora'
      }

      if (userData && userData.tipo_usuario) {
        const correctPath = userTypeRoutes[userData.tipo_usuario]
        if (correctPath && path !== correctPath) {
          return NextResponse.redirect(new URL(correctPath, request.url))
        }
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Erro no middleware:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 