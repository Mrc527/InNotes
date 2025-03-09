import {NextRequest, NextResponse} from "next/server";
import executeQuery from "@/utils/dbUtils";
import {sendEmail} from "@/utils/emailUtils";

type User = {
  id?: string,
  username?: string,
  email?: string,
  password?: string,
  name: string,
  status?: string,
  creationDate?: Date,
  subscriptionId?: string,
  picture?: string
}

export default async function getUserIdFromRequest(req: NextRequest) {
  const username = req.headers.get('username');
  const password = req.headers.get('password');

  if (!username || !password) {
    return undefined;
  }

  try {
    const rows = await executeQuery(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows && rows.length === 1 && rows[0].id) {
      console.log(`u -> ${username}, id -> ${rows[0].id}`);
      return rows[0];
    } else {
      console.log(`u -> ${username} -> unauthorized`);
      return undefined;
    }
  } catch (error: any) {
    console.error("Error fetching user ID:", error);
    return undefined;
  }
}

export async function userExists(userId: string) {

  if (userId) {
    // Check if the email already exists
    const idRows = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (idRows && idRows.length > 0) {
      return true
    }
  }
  return false;

}

export async function authenticateUser(user: User) {

  if (!user.id) {
    return {}
  }


  // Check if the email already exists
  const idRows = await executeQuery(
    'SELECT * FROM users WHERE id = ?',
    [user.id]
  );

  if (idRows && idRows.length > 0) {
    return {username: idRows[0].username, password: idRows[0].password};
  }
}

export async function registerUser(user: User) {

  if (!user.id && (!user.username || !user.password || !user.email)) {
    throw new Error("Username, password and email are required");
  }

  if (user.username) {
    // Check if the username already exists
    const existingUsernames = await executeQuery(
      'SELECT * FROM users WHERE username = ?',
      [user.username]
    );

    const usernameRows = existingUsernames[0] as any[];

    if (usernameRows && usernameRows.length > 0) {
      throw new Error(`Username ${user.username} already taken`);
    }
  }

  if (user.email) {
    // Check if the email already exists
    const existingEmails = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [user.email]
    );
    const emailRows = existingEmails[0] as any[];

    if (emailRows && emailRows.length > 0) {
      throw new Error(`Email ${user.email} is already taken`);
    }

  }
  if (user.id) {
    // Check if the email already exists
    const idRows = await executeQuery(
      'SELECT * FROM users WHERE id = ?',
      [user.id]
    );

    if (idRows && idRows.length > 0) {
      throw new Error("ID already taken");
    }
    if (!user.username) {
      user.username = user.id
      user.password = `-IN-${Math.random().toString(36)}.${Math.random().toString(36)}.${Math.random().toString(36)}`
    }

  }

  let query = 'INSERT INTO users (';
  const values: any[] = [];
  const columns: string[] = [];

  for (const key in user) {
    if (user.hasOwnProperty(key)) {
      const value = (user as any)[key];
      if (value !== undefined && value !== null) {
        columns.push(key);
        values.push(value);
      }
    }
  }

  query += columns.join(', ') + ') VALUES (' + columns.map(() => '?').join(', ') + ')';
  await executeQuery(query, values);


  // Send welcome email after successful registration
  try {
    if (user.email && user.username) {
      await sendWelcomeEmail(user.email, user.username);
    }
  } catch (emailError: any) {
    console.error("Error sending welcome email:", emailError.message);
  }

  return {username: user.username, password: user.password};

}

// Function to send a welcome email
async function sendWelcomeEmail(email: string, username: string) {
  // Replace with your email sending logic (e.g., SendGrid, Mailgun, Nodemailer)
  console.log(`Sending welcome email to ${email} for user ${username}`);
  // Example using Nodemailer (install it with `npm install nodemailer`):
  try {
    return await sendEmail(email, 'Welcome to InNotes!', `Hi ${username},\n\nWelcome to InNotes! We're excited to have you on board.`)
  } catch (e: any) {
    console.log("Error in sending email ", e);
  }
}
