import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from './types/supabase'

type UserType = Database['public']['Tables']['users']['Row']['tipo_usuario']
type UserData = Pick<Database['public']['Tables']['users']['Row'], 'tipo_usuario'>

const userTypeRoutes: Record<UserType, string> = {
  cliente: '/dashboard/cliente',
  mecanico: '/dashboard/mecanica',
  guincho: '/dashboard/guincho',
  seguradora: '/dashboard/seguradora'
}

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req: request, res })

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data, error } = await supabase
      .from('users')
      .select('tipo_usuario')
      .eq('id', session.user.id)
      .single()

    if (error || !data) {
      console.error('Erro ao buscar dados do usuário:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const userData = data as UserData
    const userType = userData.tipo_usuario
    if (!userType || !(userType in userTypeRoutes)) {
      console.error('Tipo de usuário inválido:', userType)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const expectedPath = userTypeRoutes[userType]
    const currentPath = new URL(request.url).pathname

    if (currentPath.startsWith('/dashboard') && !currentPath.startsWith(expectedPath)) {
      return NextResponse.redirect(new URL(expectedPath, request.url))
    }

    return res
  } catch (error) {
    console.error('Erro no middleware:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 