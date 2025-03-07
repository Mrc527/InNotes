import Stripe from 'stripe';
import executeQuery from "@/utils/dbUtils";
import Image from 'next/image';

interface SessionData {
  id: string;
  payment_status: string;
  customer_email: string;
  metadata: any;
  customer: any;
  subscription: any;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

type SearchParamType = Promise<{
  session_id: string
}>;

async function getSessionData(sessionId: string): Promise<SessionData | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer'],
    });
    const subscriptionId = session.subscription as string;

    let subscription = null;

    if (subscriptionId) {
      subscription = await stripe.subscriptions.retrieve(subscriptionId);
    }

    const sessionData: SessionData = {
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email || 'N/A',
      metadata: session.metadata,
      customer: session.customer,
      subscription: subscription
    };

    return sessionData;
  } catch (error: any) {
    console.error("Error retrieving session:", error);
    return null;
  }
}

async function updateUserInfo(userId: string, email: string, customer: any, subscriptionId: string | null): Promise<any> {
  try {
    // Fetch user from DB
    const user = await executeQuery("SELECT id, email, name, status, subscriptionId FROM users WHERE id = ?", [userId]);

    if (!user) {
      throw new Error(`User with ID ${userId} not found in database.`);
    }

    await executeQuery("UPDATE users SET status = 'premium' WHERE id = ?", [userId]);

    // Update email if different
    if (email && user.email !== email) {
      await executeQuery("UPDATE users SET email = ? WHERE id = ?", [email, userId]);
    }

    //Update name if different
    if (customer?.name && user.name !== customer.name) {
      await executeQuery("UPDATE users SET name = ? WHERE id = ?", [customer.name, userId]);
    }

    // Update subscriptionId
    if (subscriptionId !== user.subscriptionId) {
      await executeQuery("UPDATE users SET subscriptionId = ? WHERE id = ?", [subscriptionId, userId]);
    }

    return user; // Return the user object
  } catch (error: any) {
    console.error("Error updating user info:", error);
    throw error;
  }
}

export default async function SuccessPage(params: {searchParams: SearchParamType} ) { // MODIFY THIS LINE
  const session_id = (await params.searchParams).session_id
  if (!session_id) {
    return (
      <div style={{textAlign: 'center', padding: '20px', color: 'var(--text-color)'}}>
        <p>No session ID available.</p>
      </div>
    );
  }

  const sessionData = session_id ? await getSessionData(session_id) : null;
  if (!sessionData) {
    return (
      <div style={{textAlign: 'center', padding: '20px', color: 'var(--text-color)'}}>
        <p>No session data available.</p>
      </div>
    );
  }

  const userId = sessionData.metadata?.userId;

  if (!userId) {
    return (
      <div style={{textAlign: 'center', padding: '20px', color: 'var(--text-color)'}}>
        <p>Error: User ID not found in metadata.</p>
      </div>
    );
  }

  try {
    const user = await updateUserInfo(userId, sessionData.customer_email, sessionData.customer, sessionData.subscription?.id || null);

    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'var(--background-color)',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        color: 'var(--text-color)'
      }}>
        <Image
          src="/icons/Logo_128.png"
          alt="InNotes Logo"
          width={100}
          height={100}
          style={{marginBottom: '20px'}}
        />
        <h1 style={{color: '#28a745', marginBottom: '20px'}}>Payment Successful!</h1>
        <p style={{fontSize: '1.2em'}}>
          Thank you, {user.name}, for your payment!
        </p>
        <p style={{fontSize: '1.1em', marginBottom: '30px'}}>
          Your account has been upgraded to Pro.
        </p>
        <p style={{fontSize: '0.9em'}}>
          You can now close this page.
        </p>
      </div>
    );
  } catch (error: any) {
    return (
      <div style={{textAlign: 'center', padding: '20px', color: 'red'}}>
        <p>Error: {error.message}</p>
      </div>
    );
  }
}
