import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shield, FileCheck, Wrench, Clock } from 'lucide-react';
import { Layout } from '../components/Layout';

function Home() {
  const [vinNumber, setVinNumber] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscando veículo para assistência:', vinNumber);
  };

  const handleEmergency = () => {
    console.log('Solicitando ajuda emergencial para:', vinNumber || 'Localização atual');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative">
        <div className="grid md:grid-cols-2 gap-12 items-center py-16">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              SOS Mecânicos: Seu Suporte na Estrada
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Informe o VIN ou placa para assistência imediata ou consulte o histórico do seu veículo.
            </p>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={vinNumber}
                  onChange={(e) => setVinNumber(e.target.value)}
                  placeholder="Digite o VIN ou placa do veículo"
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
            <button
              onClick={handleEmergency}
              className="mt-4 px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Socorro Imediato
            </button>
          </div>
          <div className="relative">
            <img
              src="/images/mechanic-emergency.svg" // Sugestão de imagem de um mecânico em ação
              alt="Mecânico prestando socorro"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Por que Escolher o SOS Mecânicos?
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="font-semibold mb-2">Diagnóstico Preciso</h3>
            <p className="text-gray-600">
              Identificação rápida de falhas com base em dados do veículo.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="font-semibold mb-2">Atendimento 24/7</h3>
            <p className="text-gray-600">
              Estamos sempre prontos para te ajudar, dia ou noite.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="font-semibold mb-2">Reparos Emergenciais</h3>
            <p className="text-gray-600">
              Soluções rápidas para você voltar à estrada.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-900" />
            </div>
            <h3 className="font-semibold mb-2">Histórico Acessível</h3>
            <p className="text-gray-600">
              Consulte manutenções passadas a qualquer momento.
            </p>
          </div>
        </div>
      </div>

      {/* Report Preview Section */}
      <div className="py-16 bg-gray-50 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Como o SOS Mecânicos Ajuda Você</h2>
          <p className="text-xl text-gray-600">
            Soluções completas para emergências e manutenção
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
                  <h4 className="font-semibold">Assistência Rápida</h4>
                  <p className="text-gray-600">Socorro em minutos</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="font-semibold">02</span>
                </div>
                <div>
                  <h4 className="font-semibold">Registro de Serviços</h4>
                  <p className="text-gray-600">Histórico sempre disponível</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="font-semibold">03</span>
                </div>
                <div>
                  <h4 className="font-semibold">Análise de Problemas</h4>
                  <p className="text-gray-600">Diagnósticos confiáveis</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="font-semibold">04</span>
                </div>
                <div>
                  <h4 className="font-semibold">Acompanhamento</h4>
                  <p className="text-gray-600">Status do veículo em tempo real</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Junte-se ao SOS Mecânicos Hoje
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Tenha paz de espírito com assistência rápida e confiável para seu veículo.
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