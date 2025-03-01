import Stripe from 'stripe';
import executeQuery from "@/utils/dbUtils";

interface SessionData {
    id: string;
    payment_status: string;
    customer_email: string;
    metadata: any;
    customer: any;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
});

interface Props {
    searchParams: { session_id: string };
}

async function getSessionData(sessionId: string): Promise<SessionData | null> {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'customer'],
        });

        const sessionData: SessionData = {
            id: session.id,
            payment_status: session.payment_status,
            customer_email: session.customer_details?.email || 'N/A',
            metadata: session.metadata,
            customer: session.customer
        };

        return sessionData;
    } catch (error: any) {
        console.error("Error retrieving session:", error);
        return null;
    }
}

async function updateUserInfo(userId: string, email: string, customer: any): Promise<any> {
    try {
        // Fetch user from DB
        const [user] = await executeQuery("SELECT id, email, name, status FROM users WHERE id = ?", [userId]);
        const userResult = user[0];

        if (!userResult) {
            throw new Error(`User with ID ${userId} not found in database.`);
        }

        // Update user status to "pro"
        await executeQuery("UPDATE users SET status = 'pro' WHERE id = ?", [userId]);

        // Update email if different
        if (email && userResult.email !== email) {
            await executeQuery("UPDATE users SET email = ? WHERE id = ?", [email, userId]);
        }

        //Update name if different
        if (customer?.name && userResult.name !== customer.name) {
            await executeQuery("UPDATE users SET name = ? WHERE id = ?", [customer.name, userId]);
        }

        return userResult; // Return the user object
    } catch (error: any) {
        console.error("Error updating user info:", error);
        throw error;
    }
}

export default async function SuccessPage({ searchParams }: Props) {
    const { session_id } = searchParams;
    const sessionData = session_id ? await getSessionData(session_id) : null;

    if (!sessionData) {
        return <div>No session data available.</div>;
    }
    console.log(sessionData);
    const userId = sessionData.metadata?.userId;

    if (!userId) {
        return <div>Error: User ID not found in metadata.</div>;
    }

    try {
        const user = await updateUserInfo(userId, sessionData.customer_email, sessionData.customer);

        return (
            <div>
                <h2>Payment Successful!</h2>
                <p>Thank you, {user.name}, for your payment!</p>
                <p>Your account has been upgraded to Pro.</p>
            </div>
        );
    } catch (error: any) {
        return <div>Error: {error.message}</div>;
    }
}
