import React from 'react';
import { Layout } from '../../components/Layout';
import { Wrench, Shield, Clock, MapPin, Star, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ParaClientes() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Para Clientes</h1>

        {/* Call to Action */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Precisa de um Mecânico?</h2>
          <p className="text-gray-600 mb-6">
            Encontre mecânicos qualificados próximos a você e resolva seu problema com segurança e praticidade.
          </p>
          <Link
            to="/register?type=client"
            className="inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
          >
            Cadastre-se Gratuitamente
          </Link>
        </div>

        {/* Vantagens */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Por que escolher o SOS Mecânicos?</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start space-x-4">
              <Shield className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Segurança</h3>
                <p className="text-gray-600">Mecânicos verificados e avaliados pela comunidade</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <MapPin className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Praticidade</h3>
                <p className="text-gray-600">Encontre mecânicos próximos a sua localização</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <CreditCard className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Pagamento Seguro</h3>
                <p className="text-gray-600">Pague apenas após a conclusão do serviço</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Star className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Qualidade</h3>
                <p className="text-gray-600">Avalie e veja avaliações de outros clientes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Como Funciona</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Cadastre-se</h3>
                <p className="text-gray-600">
                  Crie sua conta gratuitamente e adicione seus veículos.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Solicite um Serviço</h3>
                <p className="text-gray-600">
                  Descreva o problema e encontre mecânicos próximos disponíveis.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Compare e Escolha</h3>
                <p className="text-gray-600">
                  Veja preços, avaliações e escolha o melhor mecânico para você.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                4
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Acompanhe o Serviço</h3>
                <p className="text-gray-600">
                  Receba atualizações em tempo real e pague apenas quando satisfeito.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recursos</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Wrench className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Diversos Serviços</h3>
              <p className="text-sm text-gray-600">
                Manutenção preventiva, reparos, emergências e mais
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Atendimento 24/7</h3>
              <p className="text-sm text-gray-600">
                Suporte disponível a qualquer hora
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Cobertura</h3>
              <p className="text-sm text-gray-600">
                Atendimento em toda sua região
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
} 