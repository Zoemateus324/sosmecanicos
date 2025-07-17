// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// Cria um Payment Intent
export const createPaymentIntent = async (amount: number) => {
  return await stripe.paymentIntents.create({
    amount,
    currency: 'brl',
    payment_method_types: ['card'],
    application_fee_amount: calculatePlatformFee(amount),
    transfer_group: 'ORDER_1234',
  });
};

// Cria uma transferência para o provedor conectado
export const createTransfer = async (
  amount: number,
  connectedAccountId: string,
  paymentIntentId: string
) => {
  return await stripe.transfers.create({
    amount,
    currency: 'brl',
    destination: connectedAccountId,
    transfer_group: 'ORDER_1234',
  });
};

// Calcula a taxa da plataforma (exemplo: 10%)
export const calculatePlatformFee = (amount: number) => {
  return Math.floor(amount * 0.1); // 10%
};

// Calcula o valor a ser repassado ao prestador
export const calculateServiceProviderAmount = (amount: number) => {
  return amount - calculatePlatformFee(amount);
};

// Cliente Stripe para lado do cliente (se necessário)
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = import('@stripe/stripe-js').then((module) =>
      module.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    );
  }
  return stripePromise;
};
