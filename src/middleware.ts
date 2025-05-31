import { NextResponse } from 'next/server'
import { updateSession } from './lib/session'

export async function middleware() {
  const response = await updateSession()
  return response || NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
  ],
}
