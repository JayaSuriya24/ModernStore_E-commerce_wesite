import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const { shippingAddress, couponCode } = await request.json();

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip || !shippingAddress.country) {
      return NextResponse.json(
        { error: 'Missing address', message: 'Shipping address is required' },
        { status: 400 },
      );
    }

    const cartItems = await prisma.cart.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          select: { id: true, name: true, price: true, stock: true, isActive: true, slug: true },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Empty cart', message: 'Your cart is empty' },
        { status: 400 },
      );
    }

    const invalidItems = cartItems.filter(
      (item) => !item.product?.isActive || item.product.stock < item.quantity,
    );
    if (invalidItems.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid items',
          message: `Some items are no longer available or out of stock`,
        },
        { status: 400 },
      );
    }

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive) {
        const subtotal = cartItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        );
        if (coupon.type === 'PERCENT') {
          discountAmount = Math.round((subtotal * coupon.discount) / 100);
        } else {
          discountAmount = Math.min(coupon.discount, subtotal);
        }
      }
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const total = Math.max(0, subtotal - discountAmount);

    const address = await prisma.address.create({
      data: {
        userId: session.userId,
        name: shippingAddress.name || 'Default',
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
        country: shippingAddress.country,
        phone: shippingAddress.phone || '',
        isDefault: false,
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: session.userId,
        total,
        shippingAddressId: address.id,
        status: 'PENDING',
        items: {
          create: cartItems.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    if (couponCode) {
      await prisma.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        status: 'PENDING',
      },
    });

    if (stripe) {
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cartItems.map((item) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.product.name,
            },
            unit_amount: item.product.price,
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
        metadata: { orderId: order.id, userId: session.userId },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: stripeSession.id },
      });

      return NextResponse.json({
        data: { sessionId: stripeSession.id, url: stripeSession.url },
        message: 'Checkout session created',
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PROCESSING' },
    });
    await prisma.payment.update({
      where: { orderId: order.id },
      data: { status: 'COMPLETED', method: 'mock' },
    });
    await prisma.cart.deleteMany({ where: { userId: session.userId } });

    return NextResponse.json({
      data: { orderId: order.id, url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}` },
      message: 'Order placed successfully (mock)',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to process checkout' },
      { status: 500 },
    );
  }
}
