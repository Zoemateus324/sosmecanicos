import React from 'react';

export default function Support() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Suporte</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Como Podemos Ajudar?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-3">Dúvidas Frequentes</h3>
              <ul className="space-y-3 text-gray-600">
                <li>Como funciona o sistema de pagamento?</li>
                <li>Como avaliar um serviço?</li>
                <li>Como atualizar minhas informações?</li>
                <li>Política de cancelamento</li>
              </ul>
              <a href="#faq" className="text-yellow-600 hover:text-yellow-700 font-medium mt-4 inline-block">
                Ver todas as dúvidas →
              </a>
            </div>
            <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-3">Contato Direto</h3>
              <ul className="space-y-3 text-gray-600">
                <li>Email: suporte@plataforma.com</li>
                <li>WhatsApp: (11) 99999-9999</li>
                <li>Horário: Seg-Sex, 8h às 18h</li>
              </ul>
              <button className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors mt-4">
                Iniciar Chat
              </button>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-8 mb-8" id="faq">
          <h2 className="text-2xl font-semibold mb-6">Perguntas Frequentes</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Como funciona o sistema de pagamento?</h3>
              <p className="text-gray-600">Nosso sistema de pagamento é 100% seguro. O valor só é repassado ao mecânico após a conclusão do serviço e sua confirmação. Aceitamos cartões de crédito, débito e PIX.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Como escolher o melhor mecânico?</h3>
              <p className="text-gray-600">Você pode comparar avaliações, preços e experiência dos mecânicos. Todos os profissionais são verificados e avaliados por outros clientes.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Qual a garantia dos serviços?</h3>
              <p className="text-gray-600">Os serviços têm garantia mínima de 90 dias. Cada mecânico pode oferecer garantias adicionais, que estarão especificadas no orçamento.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Como cancelar um serviço?</h3>
              <p className="text-gray-600">Você pode cancelar um serviço antes da sua execução sem custos. Após iniciado, consulte nossa política de cancelamento para mais detalhes.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Canais de Atendimento</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-600">Resposta em até 24 horas</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Chat Online</h3>
              <p className="text-gray-600">Atendimento imediato</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Telefone</h3>
              <p className="text-gray-600">Seg-Sex, 8h às 18h</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-6">Ainda com Dúvidas?</h2>
          <p className="text-gray-600 mb-6">Nossa equipe está pronta para ajudar você</p>
          <div className="space-x-4">
            <button className="inline-block bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-yellow-500 transition-colors">
              Fale Conosco
            </button>
            <a href="/how-it-works" className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
              Como Funciona
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}