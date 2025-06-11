"use client";

import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe';
import { useEffect, useState } from 'react';
import { Stripe } from '@stripe/stripe-js';

interface StripeProviderProps {
  children: React.ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    try {
      const promise = getStripe();
      setStripePromise(promise);
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      // You might want to show a user-friendly error message here
    }
  }, []);

  if (!stripePromise) {
    return <>{children}</>; // Render children without Stripe if not configured
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
} 