import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export type PlanType = 'urban' | 'travel' | 'premium';
export type BillingPeriod = 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  description: string;
  features: string[];
  monthly_price: number;
  yearly_price: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  billing_period: BillingPeriod;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface SubscriptionPayment {
  id: string;
  subscription_id: string;
  amount: number;
  status: string;
  payment_method: string;
  payment_date: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar planos disponíveis
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('monthly_price');

      if (error) throw error;
      setPlans(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Buscar assinatura atual do usuário
  const fetchCurrentSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentSubscription(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Criar nova assinatura
  const createSubscription = async (planId: string, billingPeriod: BillingPeriod) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      setLoading(true);
      setError(null);

      // Verificar se já existe uma assinatura ativa
      if (currentSubscription) {
        throw new Error('Você já possui uma assinatura ativa');
      }

      // Calcular datas do período
      const startDate = new Date();
      const endDate = new Date();
      if (billingPeriod === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Criar assinatura
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: user.id,
            plan_id: planId,
            status: 'active',
            billing_period: billingPeriod,
            current_period_start: startDate.toISOString(),
            current_period_end: endDate.toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setCurrentSubscription(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar assinatura
  const cancelSubscription = async () => {
    if (!user || !currentSubscription) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      setCurrentSubscription({
        ...currentSubscription,
        cancel_at_period_end: true
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reativar assinatura cancelada
  const reactivateSubscription = async () => {
    if (!user || !currentSubscription) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: false })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      setCurrentSubscription({
        ...currentSubscription,
        cancel_at_period_end: false
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Mudar plano
  const changePlan = async (newPlanId: string) => {
    if (!user || !currentSubscription) return;

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('subscriptions')
        .update({ plan_id: newPlanId })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      const updatedSubscription = {
        ...currentSubscription,
        plan_id: newPlanId
      };

      setCurrentSubscription(updatedSubscription);
      return updatedSubscription;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPlans(),
          fetchCurrentSubscription()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  return {
    plans,
    currentSubscription,
    loading,
    error,
    createSubscription,
    cancelSubscription,
    reactivateSubscription,
    changePlan
  };
} 