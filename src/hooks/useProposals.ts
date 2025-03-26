import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usePayment } from './usePayment';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'paid';

export type Proposal = {
  id: string;
  service_request_id: string;
  mechanic_id: string;
  client_id: string;
  original_value: number;
  platform_fee: number;
  total_value: number;
  description: string;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
  payment_id?: string;
};

export function useProposals() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createPayment } = usePayment();

  const calculateTotalValue = (originalValue: number) => {
    const platformFee = originalValue * 0.1; // 10% de taxa
    return {
      platformFee,
      totalValue: originalValue + platformFee
    };
  };

  const createProposal = async (
    serviceRequestId: string,
    mechanicId: string,
    clientId: string,
    originalValue: number,
    description: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { platformFee, totalValue } = calculateTotalValue(originalValue);

      const { data: proposal, error } = await supabase
        .from('proposals')
        .insert([{
          service_request_id: serviceRequestId,
          mechanic_id: mechanicId,
          client_id: clientId,
          original_value: originalValue,
          platform_fee: platformFee,
          total_value: totalValue,
          description,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      // Criar notificação para o cliente
      await supabase
        .from('notifications')
        .insert([{
          user_id: clientId,
          title: 'Nova Proposta Recebida',
          message: `Um mecânico enviou uma proposta de R$ ${totalValue.toFixed(2)} (inclui taxa de 10% da plataforma)`,
          type: 'proposal',
          reference_id: proposal.id,
          read: false
        }]);

      return proposal;
    } catch (error: any) {
      console.error('Erro ao criar proposta:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const acceptProposal = async (proposal: Proposal, customerData: any) => {
    setLoading(true);
    setError(null);

    try {
      // Criar pagamento
      const paymentResult = await createPayment({
        total: proposal.total_value,
        description: `Serviço: ${proposal.description}`,
        customer: customerData,
        split: {
          mechanic_id: proposal.mechanic_id,
          platform_fee_percentage: 20 // 20% para a plataforma
        }
      });

      // Atualizar proposta com ID do pagamento
      const { error: updateError } = await supabase
        .from('proposals')
        .update({
          status: 'accepted',
          payment_id: paymentResult.payment_id
        })
        .eq('id', proposal.id);

      if (updateError) throw updateError;

      // Notificar mecânico
      await supabase
        .from('notifications')
        .insert([{
          user_id: proposal.mechanic_id,
          title: 'Proposta Aceita',
          message: 'O cliente aceitou sua proposta e realizou o pagamento',
          type: 'proposal_accepted',
          reference_id: proposal.id,
          read: false
        }]);

      return paymentResult;
    } catch (error: any) {
      console.error('Erro ao aceitar proposta:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeService = async (proposalId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: proposal, error: proposalError } = await supabase
        .from('proposals')
        .update({ status: 'completed' })
        .eq('id', proposalId)
        .select()
        .single();

      if (proposalError) throw proposalError;

      // Notificar mecânico
      await supabase
        .from('notifications')
        .insert([{
          user_id: proposal.mechanic_id,
          title: 'Serviço Concluído',
          message: 'O cliente confirmou a conclusão do serviço. O pagamento será liberado em breve.',
          type: 'service_completed',
          reference_id: proposal.id,
          read: false
        }]);

      return proposal;
    } catch (error: any) {
      console.error('Erro ao completar serviço:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const subscribeToProposals = (userId: string, onNewProposal: (proposal: Proposal) => void) => {
    const subscription = supabase
      .channel('proposals')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'proposals',
          filter: `client_id=eq.${userId}`
        },
        (payload) => {
          onNewProposal(payload.new as Proposal);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return {
    loading,
    error,
    createProposal,
    acceptProposal,
    completeService,
    subscribeToProposals
  };
} 