import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!profile) {
    return (
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-1 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                SOS Mecânicos
              </Link>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <Link
                to="/register"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Cadastro
              </Link>
              <Link
                to="/login"
                className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
              >
                Login
              </Link>
            </div>
            <button
              onClick={toggleMenu}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
          {/* Menu Mobile */}
          {isMenuOpen && (
            <div className="sm:hidden py-4 space-y-4">
              <Link
                to="/register"
                className="block text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Cadastro
              </Link>
              <Link
                to="/login"
                className="block text-gray-600 hover:text-gray-900 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-1 flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              SOS Mecânicos
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Dashboard
              </Link>
              {profile.user_type === 'client' && (
                <>
                  <Link
                    to="/vehicles"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Veículos
                  </Link>
                  <Link
                    to="/services"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Serviços
                  </Link>
                </>
              )}
              {profile.user_type === 'mechanic' && (
                <>
                  <Link
                    to="/mechanic"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Mecânica
                  </Link>
                  <Link
                    to="/services"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Serviços
                  </Link>
                </>
              )}
              {profile.user_type === 'insurance' && (
                <>
                  <Link
                    to="/quotes"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Minhas Cotações
                  </Link>
                  <Link
                    to="/clients"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Clientes
                  </Link>
                </>
              )}
              {profile.user_type === 'tow' && (
                <>
                  <Link
                    to="/clients"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Clientes
                  </Link>
                  <Link
                    to="/towed-vehicles"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Últimos Veículos Guinchados
                  </Link>
                  <Link
                    to="/partner-insurers"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Seguradoras Parceiras
                  </Link>
                </>
              )}
              <Link
                to="/profile"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Meu Perfil
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="hidden sm:flex items-center gap-2">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{profile.user_type}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden md:inline">Sair</span>
            </button>
            <button
              onClick={toggleMenu}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="sm:hidden py-4 space-y-4 border-t border-gray-100">
            <Link
              to="/dashboard"
              className="block text-gray-600 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            {profile.user_type === 'client' && (
              <>
                <Link
                  to="/vehicles"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Veículos
                </Link>
                <Link
                  to="/services"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Serviços
                </Link>
              </>
            )}
            {profile.user_type === 'mechanic' && (
              <>
                <Link
                  to="/mechanic"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mecânica
                </Link>
                <Link
                  to="/services"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Serviços
                </Link>
              </>
            )}
            {profile.user_type === 'insurance' && (
              <>
                <Link
                  to="/quotes"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Minhas Cotações
                </Link>
                <Link
                  to="/clients"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Clientes
                </Link>
              </>
            )}
            {profile.user_type === 'tow' && (
              <>
                <Link
                  to="/clients"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Clientes
                </Link>
                <Link
                  to="/towed-vehicles"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Últimos Veículos Guinchados
                </Link>
                <Link
                  to="/partner-insurers"
                  className="block text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Seguradoras Parceiras
                </Link>
              </>
            )}
            <Link
              to="/profile"
              className="block text-gray-600 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Meu Perfil
            </Link>
            <div className="flex items-center gap-2 py-2">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{profile.user_type}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}