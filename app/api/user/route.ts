import {NextRequest, NextResponse} from 'next/server';
import getUserIdFromRequest from "@/utils/authUtils";
import executeQuery from "@/utils/dbUtils";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(req: NextRequest) {
  const user = await getUserIdFromRequest(req);
  if (!user) {
    return new NextResponse(null, {status: 401});
  }
  const userid= user.id;
  try {
    const [result] = await executeQuery('SELECT * FROM users WHERE id = ?', [userid]);

    // Correctly type the result
    const rows = result as any[];

    if (!rows || rows.length === 0) {
      return new NextResponse(null, {status: 404});
    }

    const user = rows[0];
    delete user.password; // Remove password before sending

    if (user.status !== 'free' && user.subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          user.stripe_subscription_id
        );

        if (subscription.status !== 'active') {
          // Subscription is not active, downgrade user to "free"
          await executeQuery('UPDATE users SET status = ? WHERE id = ?', ['free', userid]);
          user.status = 'free'; // Update the user object as well
        }
      } catch (stripeError: any) {
        console.error("Error checking Stripe subscription:", stripeError.message);
        // Handle Stripe API errors gracefully. Downgrade user to avoid infinite loops if stripe is down
        await executeQuery('UPDATE users SET status = ? WHERE id = ?', ['free', userid]);
        user.status = 'free'; // Update the user object as well
      }
    }

    console.log("result", user);
    return NextResponse.json(user, {status: 200});
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({error: "Failed to fetch user"}, {status: 500});
  }

}

export async function POST(req: NextRequest) {
  const {username, password} = await req.json();

  if (!username || !password) {
    return NextResponse.json({error: "Username and password are required"}, {status: 400});
  }

  try {
    const result = await executeQuery(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, password]
    );

    return NextResponse.json(result, {status: 200});
  } catch (error: any) {
    console.error("Error user registration -> ", error.message);
    return NextResponse.json({error: error.message}, {status: 403});
  }
}
