import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ message: 'Stripe not configured' }, { status: 200 });
    }

    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 },
      );
    }

    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PROCESSING' },
        });

        await prisma.payment.update({
          where: { orderId },
          data: {
            status: 'COMPLETED',
            stripePaymentId: session.payment_intent as string,
            method: 'stripe',
          },
        });

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (order) {
          await prisma.cart.deleteMany({ where: { userId: order.userId } });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 },
    );
  }
}
