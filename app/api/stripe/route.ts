import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import getUserIdFromRequest from "@/utils/authUtils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const HOST_NAME =
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` // Use Vercel URL if available
    : 'http://localhost:3000'; // Default to localhost in development

export async function POST(req: NextRequest) {
  const user = await getUserIdFromRequest(req);
  if (!user?.id) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    const { priceId } = await req.json();
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata : { userId : user.id },
      //customer: 'cus_123',
      mode: 'subscription',
      success_url: `${HOST_NAME}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${HOST_NAME}/stripe/cancel`,
    },{});


    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: e.message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
