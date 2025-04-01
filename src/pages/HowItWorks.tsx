import React from 'react';

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Como Funciona</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Para Clientes</h2>
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-3">1</span>
              <p>Cadastre seu veículo e solicite um serviço descrevendo o problema</p>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-3">2</span>
              <p>Receba orçamentos de mecânicos qualificados da sua região</p>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-3">3</span>
              <p>Compare preços e avaliações para escolher o melhor profissional</p>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-3">4</span>
              <p>Acompanhe o status do serviço em tempo real</p>
            </li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Para Mecânicos</h2>
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-3">1</span>
              <p>Cadastre-se como mecânico e configure seu perfil profissional</p>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-3">2</span>
              <p>Receba solicitações de serviço de clientes próximos</p>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-3">3</span>
              <p>Envie orçamentos personalizados para cada serviço</p>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-3">4</span>
              <p>Gerencie seus agendamentos e pagamentos pela plataforma</p>
            </li>
          </ol>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Benefícios da Plataforma</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Segurança</h3>
            <p className="text-gray-600">Profissionais verificados e pagamentos seguros pela plataforma</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Praticidade</h3>
            <p className="text-gray-600">Encontre profissionais qualificados rapidamente</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Qualidade</h3>
            <p className="text-gray-600">Sistema de avaliações e feedback dos usuários</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-6">Pronto para começar?</h2>
        <div className="space-x-4">
          <a href="/auth/register" className="inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
            Cadastre-se Agora
          </a>
          <a href="/support" className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            Saiba Mais
          </a>
        </div>
      </div>
    </div>
  );
}