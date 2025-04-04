import React from 'react';
import { Layout } from '../../components/Layout';
import { Wrench, Shield, Clock, MapPin, Star, CreditCard, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ComoFunciona() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Como Funciona</h1>

        {/* Para Clientes */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Para Clientes</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Cadastro Simples</h3>
                <p className="text-gray-600">
                  Crie sua conta gratuitamente em poucos minutos. Adicione seus veículos e informações básicas.
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
                  Descreva o problema do seu veículo e selecione o tipo de serviço necessário. Nossa plataforma encontrará mecânicos qualificados próximos a você.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Escolha o Mecânico</h3>
                <p className="text-gray-600">
                  Compare preços, avaliações e perfis dos mecânicos disponíveis. Escolha o profissional que melhor atende suas necessidades.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                4
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Acompanhamento</h3>
                <p className="text-gray-600">
                  Acompanhe o status do serviço em tempo real. Receba atualizações e comunique-se diretamente com o mecânico.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                5
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Pagamento Seguro</h3>
                <p className="text-gray-600">
                  Efetue o pagamento de forma segura através da plataforma apenas após a conclusão satisfatória do serviço.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Para Mecânicos */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Para Mecânicos</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Cadastro e Verificação</h3>
                <p className="text-gray-600">
                  Cadastre-se como mecânico e envie seus documentos para verificação. Nossa equipe validará suas informações para garantir a segurança da plataforma.
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
                  Adicione suas especialidades, serviços oferecidos, preços e área de atendimento. Um perfil completo aumenta suas chances de receber solicitações.
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
                  Receba solicitações de serviço de clientes em sua região. Analise os detalhes e decida se aceita o serviço.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                4
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Realize o Serviço</h3>
                <p className="text-gray-600">
                  Atenda o cliente com excelência. Mantenha-o informado sobre o progresso do serviço através da plataforma.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-bold">
                5
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Receba o Pagamento</h3>
                <p className="text-gray-600">
                  Receba o pagamento de forma segura através da plataforma após a conclusão do serviço.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Vantagens */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Vantagens da Plataforma</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Shield className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Segurança</h3>
              <p className="text-sm text-gray-600">
                Profissionais verificados e pagamentos seguros
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Users className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Comunidade</h3>
              <p className="text-sm text-gray-600">
                Sistema de avaliações e recomendações
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Star className="w-6 h-6 text-yellow-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-2">Qualidade</h3>
              <p className="text-sm text-gray-600">
                Serviços garantidos e suporte dedicado
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Comece Agora</h2>
          <div className="space-x-4">
            <Link
              to="/register?type=client"
              className="inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
            >
              Sou Cliente
            </Link>
            <Link
              to="/register?type=mechanic"
              className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Sou Mecânico
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
} 