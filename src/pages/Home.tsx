import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, FileCheck, Wrench, Clock } from 'lucide-react';
import { Layout } from '../components/Layout';

function Home() {
  const [vinNumber, setVinNumber] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar a busca por VIN
    console.log('Buscando VIN:', vinNumber);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative">
        <div className="grid md:grid-cols-2 gap-12 items-center py-16">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Pesquise um Veículo pelo Número VIN
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Validamos seu VIN com nossa base de dados e fornecemos um relatório completo do histórico do veículo.
            </p>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={vinNumber}
                  onChange={(e) => setVinNumber(e.target.value)}
                  placeholder="Digite o número VIN ou número do registro"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>
          <div className="relative">
            <img
              src="/images/car-hero.svg"
              alt="Ilustração de um carro"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          O relatório mais completo garantido
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="font-semibold mb-2">Verificação de Título</h3>
            <p className="text-gray-600">
              Verificamos o histórico completo do título e propriedade do veículo.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="font-semibold mb-2">Lista de Problemas</h3>
            <p className="text-gray-600">
              Identificamos possíveis problemas e recalls do fabricante.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="font-semibold mb-2">Histórico de Acidentes</h3>
            <p className="text-gray-600">
              Revelamos o histórico completo de acidentes e danos.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="font-semibold mb-2">Histórico de Serviços</h3>
            <p className="text-gray-600">
              Detalhamos todos os serviços e manutenções registrados.
            </p>
          </div>
        </div>
      </div>

      {/* Report Preview Section */}
      <div className="py-16 bg-gray-50 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nosso Relatório Verifica</h2>
          <p className="text-xl text-gray-600">
            Fornecemos informações detalhadas sobre cada aspecto do veículo
          </p>
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="font-semibold">01</span>
                </div>
                <div>
                  <h4 className="font-semibold">Acidentes Anteriores</h4>
                  <p className="text-gray-600">Histórico completo de colisões</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="font-semibold">02</span>
                </div>
                <div>
                  <h4 className="font-semibold">Histórico de Serviços</h4>
                  <p className="text-gray-600">Registros de manutenção</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="font-semibold">03</span>
                </div>
                <div>
                  <h4 className="font-semibold">Recalls e Problemas</h4>
                  <p className="text-gray-600">Alertas do fabricante</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="font-semibold">04</span>
                </div>
                <div>
                  <h4 className="font-semibold">Avaliação e Documentação</h4>
                  <p className="text-gray-600">Status da documentação</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Comece a usar nosso sistema hoje
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Registre-se gratuitamente e tenha acesso a todas as funcionalidades do nosso sistema
          de gerenciamento de veículos.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Criar conta
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Fazer login
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default Home;