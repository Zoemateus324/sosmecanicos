import { useState } from 'react';
import axios from 'axios';

const EFIBANK_API_URL = 'https://api.efipay.com.br';
const CLIENT_ID = import.meta.env.VITE_EFIBANK_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_EFIBANK_CLIENT_SECRET;
const PLATFORM_RECIPIENT_ID = import.meta.env.VITE_EFIBANK_PLATFORM_RECIPIENT_ID;

interface EfibankAuthResponse {
  access_token: string;
}

interface EfibankBankingBillet {
  barcode: string;
  pdf: string;
}

interface EfibankPaymentResponse {
  id: string;
  status: PaymentStatus;
  payment_url: string;
  banking_billet?: EfibankBankingBillet;
}

export type PaymentData = {
  total: number;
  description: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
  };
  split?: {
    mechanic_id: string;
    platform_fee_percentage: number;
  };
};

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAccessToken = async () => {
    try {
      const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
      
      const response = await axios.post<EfibankAuthResponse>(
        `${EFIBANK_API_URL}/oauth/token`,
        {
          grant_type: 'client_credentials'
        },
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Erro ao obter token de acesso:', error);
      throw new Error('Falha ao autenticar com o Efibank');
    }
  };

  const createPayment = async (data: PaymentData) => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getAccessToken();

      const paymentResponse = await axios.post<EfibankPaymentResponse>(
        `${EFIBANK_API_URL}/v1/charge`,
        {
          items: [{
            name: data.description,
            value: Math.round(data.total * 100), // Converter para centavos
            amount: 1
          }],
          customer: {
            name: data.customer.name,
            email: data.customer.email,
            phone_number: data.customer.phone,
            cpf: data.customer.cpf
          },
          payment: {
            banking_billet: {
              expire_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
              customer_payment_term: 3,
              message: 'Pagamento do serviço mecânico'
            }
          },
          split: data.split ? {
            splits: [
              {
                recipient_id: data.split.mechanic_id,
                percentage: 100 - data.split.platform_fee_percentage
              },
              {
                recipient_id: PLATFORM_RECIPIENT_ID,
                percentage: data.split.platform_fee_percentage
              }
            ]
          } : undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        payment_id: paymentResponse.data.id,
        status: paymentResponse.data.status,
        payment_url: paymentResponse.data.payment_url,
        barcode: paymentResponse.data.banking_billet?.barcode,
        pdf: paymentResponse.data.banking_billet?.pdf
      };
    } catch (error: any) {
      console.error('Erro ao criar pagamento:', error);
      setError(error.response?.data?.message || 'Erro ao processar pagamento');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = async (paymentId: string) => {
    try {
      const accessToken = await getAccessToken();

      const response = await axios.get<EfibankPaymentResponse>(
        `${EFIBANK_API_URL}/v1/charge/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.status;
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      throw error;
    }
  };

  const refundPayment = async (paymentId: string) => {
    try {
      const accessToken = await getAccessToken();

      await axios.post(
        `${EFIBANK_API_URL}/v1/charge/${paymentId}/refund`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Erro ao reembolsar pagamento:', error);
      throw error;
    }
  };

  return {
    loading,
    error,
    createPayment,
    getPaymentStatus,
    refundPayment
  };
} 