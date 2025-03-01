import {NextRequest} from "next/server";
import executeQuery from "@/utils/dbUtils";
type User = {
  id: string,
  username: string,
  email: string,
  password?: string,
  name: string,
  status: string,
  creationDate: Date,
  subscriptionId: string,
}
export default async function getUserIdFromRequest(req: NextRequest) {
  const username = req.headers.get('username');
  const password = req.headers.get('password');

  if (!username || !password) {
    return undefined;
  }

  try {
    const [result] = await executeQuery(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    const rows = result as [User];

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
