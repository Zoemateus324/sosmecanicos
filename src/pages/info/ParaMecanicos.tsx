import React from 'react';
import { Layout } from '../../components/Layout';
import { Tool, Users, Wallet, ChartBar, Shield, Clock, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ParaMecanicos() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Para Mecânicos</h1>

        {/* Call to Action */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Faça Parte da Nossa Rede</h2>
          <p className="text-gray-600 mb-6">
            Junte-se a centenas de mecânicos que já estão aumentando sua renda através do SOS Mecânicos.
          </p>
          <Link
            to="/register?type=mechanic"
            className="inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
          >
            Cadastre-se como Mecânico
          </Link>
        </div>

        {/* Benefícios */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Benefícios</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start space-x-4">
              <Users className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Mais Clientes</h3>
                <p className="text-gray-600">Acesse uma base crescente de clientes em potencial</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Wallet className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Pagamento Garantido</h3>
                <p className="text-gray-600">Receba seus pagamentos de forma segura e garantida</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <ChartBar className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Gestão Simplificada</h3>
                <p className="text-gray-600">Ferramentas para controlar seus serviços e finanças</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Star className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900">Avaliações</h3>
                <p className="text-gray-600">Construa sua reputação através de avaliações dos clientes</p>
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
                <h3 className="font-medium text-gray-900">Cadastro e Verificação</h3>
                <p className="text-gray-600">
                  Complete seu cadastro com suas informações profissionais e documentos. Nossa equipe fará a verificação.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Configure seu Perfil</h3>
                <p className="text-gray-600">
                  Adicione suas especialidades, serviços oferecidos e área de atendimento.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Receba Solicitações</h3>
                <p className="text-gray-600">
                  Comece a receber solicitações de serviço de clientes em sua região.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                4
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Preste Serviços</h3>
                <p className="text-gray-600">
                  Atenda os clientes e receba pagamentos de forma segura através da plataforma.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recursos da Plataforma</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Geolocalização</h3>
              <p className="text-sm text-gray-600">
                Receba solicitações de clientes próximos à sua localização
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Agenda</h3>
              <p className="text-sm text-gray-600">
                Gerencie seus horários e compromissos
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Tool className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Serviços</h3>
              <p className="text-sm text-gray-600">
                Configure seus serviços e preços
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Shield className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Segurança</h3>
              <p className="text-sm text-gray-600">
                Proteção para você e seus clientes
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Wallet className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Pagamentos</h3>
              <p className="text-sm text-gray-600">
                Receba pagamentos de forma segura
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <ChartBar className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Relatórios</h3>
              <p className="text-sm text-gray-600">
                Acompanhe seu desempenho
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
} 