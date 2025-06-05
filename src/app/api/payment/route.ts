import { NextResponse } from 'next/server';
import { createPaymentIntent, createTransfer, calculatePlatformFee, calculateServiceProviderAmount } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, serviceType, serviceId, providerId } = body;

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount);

    // Calculate splits
    const platformFee = calculatePlatformFee(amount);
    const providerAmount = calculateServiceProviderAmount(amount);

    // Create transfer to service provider
    await createTransfer(
      providerAmount,
      providerId, // This should be the Stripe connected account ID of the service provider
      paymentIntent.id
    );

    // Store payment information in database
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        payment_intent_id: paymentIntent.id,
        amount,
        platform_fee: platformFee,
        provider_amount: providerAmount,
        service_type: serviceType,
        service_id: serviceId,
        provider_id: providerId,
        status: 'pending'
      });

    if (paymentError) {
      throw new Error('Error storing payment information');
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Error processing payment' },
      { status: 500 }
    );
  }
} 