import { useState } from 'react';
import { useProposals } from '../hooks/useProposals';
import { PaymentProcessor } from './PaymentProcessor';

type PaymentPopupProps = {
  proposal: any;
  onClose: () => void;
  onSuccess: () => void;
};

type CustomerData = {
  name: string;
  email: string;
  phone: string;
};

export function PaymentPopup({ proposal, onClose, onSuccess }: PaymentPopupProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: ''
  });
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const { acceptProposal } = useProposals();

  const handlePayment = async (paymentData: any) => {
    setLoading(true);
    setError(null);

    try {
      await acceptProposal(proposal, { ...customerData, ...paymentData });
      onSuccess();
    } catch (err: any) {
      console.error('Erro no pagamento:', err);
      setError(err.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerData.name || !customerData.email || !customerData.phone) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    setShowPaymentProcessor(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pagamento do Serviço</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium mb-2">Detalhes do Serviço</h3>
          <p className="text-gray-600">{proposal.description}</p>
          <div className="mt-2 space-y-1">
            <p>Valor do serviço: R$ {proposal.original_value.toFixed(2)}</p>
            <p>Taxa da plataforma (10%): R$ {proposal.platform_fee.toFixed(2)}</p>
            <p className="font-semibold">
              Total a pagar: R$ {proposal.total_value.toFixed(2)}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!showPaymentProcessor ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <input
                type="text"
                value={customerData.name}
                onChange={(e) =>
                  setCustomerData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={customerData.email}
                onChange={(e) =>
                  setCustomerData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <input
                type="tel"
                value={customerData.phone}
                onChange={(e) =>
                  setCustomerData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              Continuar para o Pagamento
            </button>
          </form>
        ) : (
          <PaymentProcessor
            customerName={customerData.name}
            customerEmail={customerData.email}
            serviceDescription={proposal.description}
            totalAmount={proposal.total_value}
            mechanicId={proposal.mechanic_id}
            onSuccess={handlePayment}
            onError={(err) => setError(err)}
          />
        )}
      </div>
    </div>
  );
} 