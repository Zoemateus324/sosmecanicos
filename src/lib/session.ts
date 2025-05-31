import { NextResponse } from 'next/server'

export async function updateSession() {
  // Aqui você pode adicionar qualquer lógica de autenticação, cookies, etc.
  // Exemplo: log simples ou manipulação de cookie
  const response = NextResponse.next()

  // Exemplo: definir cookie fictício de sessão
  response.cookies.set('example-session', 'ativo', { path: '/' })

  return response
}
