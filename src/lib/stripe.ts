import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Load Stripe.js
export const getStripe = () => {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return stripePromise;
};

// Create a payment intent
export const createPaymentIntent = async (amount: number, currency: string = 'brl') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Create a transfer to split payment
export const createTransfer = async (
  amount: number,
  destination: string,
  paymentIntentId: string
) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'brl',
      destination,
      source_transaction: paymentIntentId,
    });
    return transfer;
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw error;
  }
};

// Calculate platform fee (e.g., 10%)
export const calculatePlatformFee = (amount: number, feePercentage: number = 0.1) => {
  return amount * feePercentage;
};

// Calculate service provider amount (e.g., 90%)
export const calculateServiceProviderAmount = (amount: number, feePercentage: number = 0.1) => {
  return amount * (1 - feePercentage);
}; 