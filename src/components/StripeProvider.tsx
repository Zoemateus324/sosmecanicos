"use client";

import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';

interface StripeProviderProps {
  children: React.ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
} 