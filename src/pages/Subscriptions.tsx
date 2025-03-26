import React from 'react';
import { SubscriptionPlans } from '../components/SubscriptionPlans';

export default function Subscriptions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Planos e Preços
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Escolha o plano ideal para suas necessidades
            </p>
          </div>

          <div className="mt-16">
            <SubscriptionPlans />
          </div>
        </div>
      </div>
    </div>
  );
} 