import React, { useState } from 'react';
import { useSubscription, Plan, BillingPeriod } from '../hooks/useSubscription';
import { Check, X } from 'lucide-react';

export function SubscriptionPlans() {
  const {
    plans,
    currentSubscription,
    loading,
    error,
    createSubscription,
    cancelSubscription,
    reactivateSubscription
  } = useSubscription();

  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>('monthly');
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const handleSubscribe = async (plan: Plan) => {
    try {
      setProcessingPlanId(plan.id);
      await createSubscription(plan.id, selectedPeriod);
    } catch (error) {
      console.error('Erro ao assinar plano:', error);
    } finally {
      setProcessingPlanId(null);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSubscription();
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
    }
  };

  const handleReactivate = async () => {
    try {
      await reactivateSubscription();
    } catch (error) {
      console.error('Erro ao reativar assinatura:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Erro ao carregar planos. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Seletor de período */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => setSelectedPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedPeriod === 'monthly'
                ? 'bg-yellow-400 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setSelectedPeriod('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedPeriod === 'yearly'
                ? 'bg-yellow-400 text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Anual (10% de desconto)
          </button>
        </div>
      </div>

      {/* Grade de planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.plan_id === plan.id;
          const price = selectedPeriod === 'monthly' ? plan.monthly_price : plan.yearly_price;

          return (
            <div
              key={plan.id}
              className={`relative rounded-lg border ${
                isCurrentPlan ? 'border-yellow-400' : 'border-gray-200'
              } p-6 shadow-sm hover:shadow-md transition-shadow`}
            >
              {isCurrentPlan && (
                <div className="absolute top-0 right-0 -mt-3 -mr-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Plano Atual
                  </span>
                </div>
              )}

              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-gray-500">{plan.description}</p>

              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  R$ {price.toFixed(2)}
                </span>
                <span className="text-gray-500">/{selectedPeriod === 'monthly' ? 'mês' : 'ano'}</span>
              </div>

              <ul className="mt-6 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="ml-3 text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {isCurrentPlan ? (
                  currentSubscription?.cancel_at_period_end ? (
                    <button
                      onClick={handleReactivate}
                      className="w-full px-4 py-2 border border-yellow-400 text-yellow-600 rounded-md hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Reativar Assinatura
                    </button>
                  ) : (
                    <button
                      onClick={handleCancel}
                      className="w-full px-4 py-2 border border-red-400 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancelar Assinatura
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={!!currentSubscription || processingPlanId === plan.id}
                    className="w-full px-4 py-2 bg-yellow-400 text-white rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingPlanId === plan.id
                      ? 'Processando...'
                      : currentSubscription
                      ? 'Você já possui um plano'
                      : 'Assinar Agora'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Aviso de cancelamento */}
      {currentSubscription?.cancel_at_period_end && (
        <div className="mt-8 p-4 bg-yellow-50 rounded-md">
          <div className="flex">
            <div className="shrink-0">
              <X className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Assinatura será cancelada
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Sua assinatura será cancelada ao final do período atual em{' '}
                  {new Date(currentSubscription.current_period_end).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 