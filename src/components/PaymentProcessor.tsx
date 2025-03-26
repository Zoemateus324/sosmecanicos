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
  const { loading, error, createPayment } = usePayment();
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  const handlePayment = async () => {
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
          platform_fee_percentage: 20 // 20% para a plataforma
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
            <h3 className="font-semibold mb-2">Informações de Pagamento</h3>
            <p>Status: {paymentInfo.status}</p>
            {paymentInfo.barcode && (
              <div className="mt-2">
                <p className="font-medium">Código de Barras:</p>
                <p className="font-mono text-sm break-all">{paymentInfo.barcode}</p>
              </div>
            )}
            {paymentInfo.payment_url && (
              <a
                href={paymentInfo.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-yellow-600 hover:text-yellow-700"
              >
                Abrir Página de Pagamento
              </a>
            )}
            {paymentInfo.pdf && (
              <a
                href={paymentInfo.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-yellow-600 hover:text-yellow-700"
              >
                Baixar Boleto PDF
              </a>
            )}
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