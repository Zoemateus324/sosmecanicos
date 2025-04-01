export default function ForMechanics() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Para Mecânicos</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Por que se juntar à nossa plataforma?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Mais Clientes</h3>
              <p className="text-gray-600">Acesse uma base crescente de clientes em busca de serviços automotivos de qualidade na sua região.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Gestão Simplificada</h3>
              <p className="text-gray-600">Gerencie agendamentos, orçamentos e pagamentos em uma única plataforma intuitiva.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Pagamentos Seguros</h3>
              <p className="text-gray-600">Receba seus pagamentos de forma segura e pontual através da nossa plataforma.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Visibilidade</h3>
              <p className="text-gray-600">Construa sua reputação através de avaliações e feedback dos clientes.</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Como Funciona</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-4">1</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Cadastro e Verificação</h3>
                <p className="text-gray-600">Complete seu cadastro com informações profissionais e documentação necessária para verificação.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-4">2</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Receba Solicitações</h3>
                <p className="text-gray-600">Visualize solicitações de serviço de clientes na sua região e escolha quais atender.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-4">3</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Envie Orçamentos</h3>
                <p className="text-gray-600">Analise as solicitações e envie orçamentos personalizados para cada serviço.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-4">4</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Realize o Serviço</h3>
                <p className="text-gray-600">Após a aprovação do orçamento, agende e realize o serviço com excelência.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Ferramentas para seu Sucesso</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Agenda Digital</h3>
              <p className="text-gray-600">Organize seus compromissos e serviços de forma eficiente</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Gestão Financeira</h3>
              <p className="text-gray-600">Acompanhe seus ganhos e histórico de pagamentos</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Proteção e Suporte</h3>
              <p className="text-gray-600">Conte com nossa equipe para ajudar em qualquer situação</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-6">Comece Agora</h2>
          <p className="text-gray-600 mb-6">Junte-se a milhares de mecânicos que já estão crescendo seus negócios com nossa plataforma</p>
          <div className="space-x-4">
            <a href="/auth/register" className="inline-block bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
              Cadastre-se como Mecânico
            </a>
            <a href="/support" className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
              Saiba Mais
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}