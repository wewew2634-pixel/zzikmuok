/**
 * Stripe Webhook Handler
 * POST /api/stripe/webhook
 * 
 * Stripe에서 이벤트 수신 (결제 완료, 구독 변경 등)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, stripeConfig } from '@/lib/api-clients';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !stripeConfig.webhookSecret) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  try {
    const stripe = await getStripeClient();

    // Webhook 서명 검증
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeConfig.webhookSecret
    );

    console.log('Stripe webhook event:', event.type);

    // 이벤트 타입별 처리
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout completed:', session.id);
        
        // TODO: 데이터베이스에 구독 정보 저장
        // await createSubscription({
        //   userId: session.metadata?.userId,
        //   stripeCustomerId: session.customer,
        //   subscriptionId: session.subscription,
        // });
        
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        console.log('Subscription created:', subscription.id);
        
        // TODO: 구독 활성화
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription.id);
        
        // TODO: 구독 정보 업데이트
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('Subscription deleted:', subscription.id);
        
        // TODO: 구독 취소 처리
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Payment failed:', invoice.id);
        
        // TODO: 결제 실패 알림 발송
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
}
