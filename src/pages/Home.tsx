import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { MapPin, Wrench, Clock, Shield, Car, ThumbsUp, FileCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
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
      <section className="bg-gradient-to-b from-yellow-50 to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Assistência Mecânica onde você estiver
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Seu veículo quebrou? Não se preocupe! O SOS Mecânicos conecta você aos melhores profissionais próximos da sua localização, seja na cidade ou na estrada.
              </p>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex gap-4">
                </div>
              </form>
              <div className="mt-4 space-x-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
                >
                  Cadastre-se Agora
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold border border-gray-300 hover:border-yellow-400 transition-colors"
                >
                  Fazer Login
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/images/car-hero.svg" 
                alt="Ilustração de assistência mecânica"
                className="w-full max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Por que Escolher o SOS Mecânicos?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Diagnóstico Preciso</h3>
              <p className="text-gray-600">
                Identificação rápida de falhas com base em dados do veículo.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Atendimento 24/7</h3>
              <p className="text-gray-600">
                Estamos sempre prontos para te ajudar, dia ou noite.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Reparos Emergenciais</h3>
              <p className="text-gray-600">
                Soluções rápidas para você voltar à estrada.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">Histórico Acessível</h3>
              <p className="text-gray-600">
                Consulte manutenções passadas a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Como o SOS Mecânicos funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Localize</h3>
              <p className="text-gray-600">
                Compartilhe sua localização e encontre mecânicos próximos a você
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Solicite</h3>
              <p className="text-gray-600">
                Descreva o problema e escolha um profissional qualificado
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Resolva</h3>
              <p className="text-gray-600">
                Receba assistência profissional onde você estiver
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-yellow-400">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Precisa de um mecânico agora?
          </h2>
          <p className="text-lg text-gray-800 mb-8 max-w-2xl mx-auto">
            Não fique parado na estrada. Encontre ajuda profissional em minutos com o SOS Mecânicos.
          </p>
          <button 
            onClick={() => navigate('/register')}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Começar Agora
          </button>
        </div>
      </section>
    </Layout>
  );
}
