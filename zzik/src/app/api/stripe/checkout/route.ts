/**
 * Stripe Checkout Session Creation
 * POST /api/stripe/checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, stripeConfig } from '@/lib/api-clients';

// Stripe는 Node.js runtime 필요
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { priceId, customerId, successUrl, cancelUrl } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const stripe = await getStripeClient();

    // Checkout Session 생성
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customerId,
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId: customerId || 'guest',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
