import React, { useState } from 'react';
import { usePayment, PaymentData } from '../hooks/usePayment';

type PaymentProcessorProps = {
  serviceDescription: string;
  totalAmount: number;
  mechanicId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCpf?: string;
  onSuccess: (paymentInfo: any) => void;
  onError: (error: string) => void;
};

export function PaymentProcessor({
  serviceDescription,
  totalAmount,
  mechanicId,
  customerName,
  customerEmail,
  customerPhone,
  customerCpf,
  onSuccess,
  onError
}: PaymentProcessorProps) {
  const { loading, error, paymentStatus, createPayment, getPaymentStatus } = usePayment();
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const handlePayment = async () => {
    // Validar dados antes de enviar
    if (!totalAmount || totalAmount <= 0) {
      onError('O valor do pagamento deve ser maior que zero');
      return;
    }

    if (!serviceDescription) {
      onError('A descrição do serviço é obrigatória');
      return;
    }

    if (!customerName || !customerEmail) {
      onError('Nome e email do cliente são obrigatórios');
      return;
    }

    try {
      const paymentData: PaymentData = {
        total: totalAmount,
        description: serviceDescription,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          cpf: customerCpf
        },
        split: {
          mechanic_id: mechanicId,
          platform_fee_percentage: 15 // 15% para a plataforma
        }
      };

      const result = await createPayment(paymentData);
      setPaymentInfo(result);
      setShowPaymentInfo(true);
      onSuccess(result);
    } catch (error: any) {
      onError(error.message || 'Erro ao processar pagamento');
    }
  };

  // Função para verificar o status do pagamento
  const checkPaymentStatus = async () => {
    if (!paymentInfo?.payment_id) return;
    
    try {
      setCheckingStatus(true);
      const status = await getPaymentStatus(paymentInfo.payment_id);
      setPaymentInfo(prev => ({ ...prev, status }));
      
      if (status === 'paid') {
        onSuccess({ ...paymentInfo, status });
      }
    } catch (error: any) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Processamento de Pagamento</h2>
      
      <div className="mb-4">
        <p className="text-gray-700">Descrição: {serviceDescription}</p>
        <p className="text-gray-700">Valor Total: R$ {totalAmount.toFixed(2)}</p>
      </div>

      {!showPaymentInfo ? (
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-yellow-400 text-gray-900 py-2 px-4 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              <span className="ml-2">Processando...</span>
            </div>
          ) : (
            'Gerar Pagamento'
          )}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Informações de Pagamento</h3>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${{
                  'pending': 'bg-yellow-100 text-yellow-800',
                  'processing': 'bg-blue-100 text-blue-800',
                  'paid': 'bg-green-100 text-green-800',
                  'failed': 'bg-red-100 text-red-800',
                  'refunded': 'bg-gray-100 text-gray-800'
                }[paymentInfo.status] || 'bg-gray-100 text-gray-800'}`}>
                  {{
                    'pending': 'Pendente',
                    'processing': 'Processando',
                    'paid': 'Pago',
                    'failed': 'Falhou',
                    'refunded': 'Reembolsado'
                  }[paymentInfo.status] || paymentInfo.status}
                </span>
                <button
                  onClick={checkPaymentStatus}
                  disabled={checkingStatus}
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  {checkingStatus ? 'Verificando...' : 'Atualizar'}
                </button>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              {paymentInfo.barcode && (
                <div className="p-3 bg-white rounded border border-gray-200">
                  <p className="font-medium text-sm">Código de Barras:</p>
                  <p className="font-mono text-sm break-all mt-1">{paymentInfo.barcode}</p>
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                {paymentInfo.payment_url && (
                  <a
                    href={paymentInfo.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Abrir Página de Pagamento
                  </a>
                )}
                
                {paymentInfo.pdf && (
                  <a
                    href={paymentInfo.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Baixar Boleto PDF
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowPaymentInfo(false)}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Gerar Novo Pagamento
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}