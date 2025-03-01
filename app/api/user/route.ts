import {NextRequest, NextResponse} from 'next/server';
import getUserIdFromRequest from "@/utils/authUtils";
import executeQuery from "@/utils/dbUtils";
import Stripe from 'stripe';
import {sendEmail} from "@/utils/emailUtils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Function to send a welcome email
async function sendWelcomeEmail(email: string, username: string) {
  // Replace with your email sending logic (e.g., SendGrid, Mailgun, Nodemailer)
  console.log(`Sending welcome email to ${email} for user ${username}`);
  // Example using Nodemailer (install it with `npm install nodemailer`):
  try{
    return await sendEmail(email, 'Welcome to InNotes!', `Hi ${username},\n\nWelcome to InNotes! We're excited to have you on board.`)
  }
  catch (e: any) {
    console.log("Error in sending email ", e);
  }
}

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

    if (user.subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          user.subscriptionId
        );

        if (subscription.status === 'active' && user.status !== 'premium') {
          await executeQuery('UPDATE users SET status = ? WHERE id = ?', ['premium', userid]);
          user.status = 'premium'; // Update the user object as well
        } else if (subscription.status !== 'active' && user.status === 'premium') {
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
  const {username, password, email} = await req.json();

  if (!username || !password || !email) {
    return NextResponse.json({error: "Username, password and email are required"}, {status: 400});
  }

  try {
    // Check if the username already exists
    const existingUsernames = await executeQuery(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    const usernameRows = existingUsernames as any[];

    if (usernameRows && usernameRows.length > 0) {
      return NextResponse.json({error: "Username already taken"}, {status: 403});
    }

    // Check if the email already exists
    const existingEmails = await executeQuery(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    const emailRows = existingEmails as any[];

    if (emailRows && emailRows.length > 0) {
      return NextResponse.json({error: "Email already taken"}, {status: 403});
    }

    const result = await executeQuery(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, password, email]
    );

    // Send welcome email after successful registration
    try {
      await sendWelcomeEmail(email, username);
    } catch (emailError: any) {
      console.error("Error sending welcome email:", emailError.message);
      // Consider whether to rollback the user creation or proceed despite email failure
      // For now, we'll log the error and proceed
    }

    return NextResponse.json(result, {status: 200});
  } catch (error: any) {
    console.error("Error user registration -> ", error.message);
    return NextResponse.json({error: error.message}, {status: 403});
  }
}
