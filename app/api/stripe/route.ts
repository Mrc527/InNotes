import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const HOST_NAME =
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.VERCEL_URL}` // Use Vercel URL if available
    : 'http://localhost:3000'; // Default to localhost in development

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json();
//price_1Qxlx3KkAMzrwMPSSBJAg2S2
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${HOST_NAME}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${HOST_NAME}/cancel`,
    });


    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: e.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
