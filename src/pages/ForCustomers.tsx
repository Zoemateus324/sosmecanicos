export default function ForCustomers() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Para Clientes</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Por que usar nossa plataforma?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Facilidade e Praticidade</h3>
              <p className="text-gray-600">Encontre mecânicos qualificados próximos a você com apenas alguns cliques.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Economia de Tempo</h3>
              <p className="text-gray-600">Receba múltiplos orçamentos sem precisar se deslocar ou fazer várias ligações.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Segurança</h3>
              <p className="text-gray-600">Todos os profissionais são verificados e avaliados pela comunidade.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Transparência</h3>
              <p className="text-gray-600">Compare preços e avaliações para fazer a melhor escolha.</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Como Funciona</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-4">1</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Cadastre seu Veículo</h3>
                <p className="text-gray-600">Registre as informações do seu veículo de forma simples e rápida.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-4">2</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Descreva o Problema</h3>
                <p className="text-gray-600">Informe o serviço necessário e receba orçamentos de mecânicos próximos.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-4">3</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Compare e Escolha</h3>
                <p className="text-gray-600">Analise os orçamentos, avaliações e escolha o melhor profissional.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 text-gray-900 rounded-full flex items-center justify-center mr-4">4</div>
              <div>
                <h3 className="text-lg font-medium mb-2">Acompanhe o Serviço</h3>
                <p className="text-gray-600">Monitore o status do serviço e faça o pagamento de forma segura pela plataforma.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Serviços Disponíveis</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Manutenção Preventiva</h3>
              <p className="text-gray-600">Revisões periódicas para manter seu veículo em dia</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Reparos Gerais</h3>
              <p className="text-gray-600">Soluções para problemas mecânicos e elétricos</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Diagnóstico</h3>
              <p className="text-gray-600">Análise detalhada do problema do seu veículo</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-6">Comece Agora</h2>
          <p className="text-gray-600 mb-6">Encontre o melhor profissional para cuidar do seu veículo</p>
          <div className="space-x-4">
            <a href="/auth/register" className="inline-block bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
              Cadastre-se Gratuitamente
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