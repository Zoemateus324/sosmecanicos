import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Info, Users, Wrench } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userType, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-yellow-500">
                  SOS Mecânicos
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/como-funciona"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === '/como-funciona'
                      ? 'border-yellow-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Como Funciona
                </Link>
                <Link
                  to="/para-clientes"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === '/para-clientes'
                      ? 'border-yellow-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Para Clientes
                </Link>
                <Link
                  to="/para-mecanicos"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === '/para-mecanicos'
                      ? 'border-yellow-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Para Mecânicos
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/subscriptions"
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${
                      location.pathname === '/subscriptions'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Planos
                  </Link>
                  <button
                    onClick={signOut}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                  >
                    Cadastre-se
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/como-funciona"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === '/como-funciona'
                  ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Como Funciona
            </Link>
            <Link
              to="/para-clientes"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === '/para-clientes'
                  ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Para Clientes
            </Link>
            <Link
              to="/para-mecanicos"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                location.pathname === '/para-mecanicos'
                  ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Para Mecânicos
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/subscriptions"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    location.pathname === '/subscriptions'
                      ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Planos
                </Link>
                <button
                  onClick={signOut}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                >
                  Cadastre-se
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
} 