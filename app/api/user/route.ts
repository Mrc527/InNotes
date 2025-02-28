import { NextRequest, NextResponse } from 'next/server';
import getUserIdFromRequest from "@/utils/authUtils";
import executeQuery from "@/utils/dbUtils";


export async function GET(req: NextRequest) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return new NextResponse(null, { status: 401 });
    }

  try {
    const [result] = await executeQuery('SELECT * FROM users WHERE id = ?', [userId]);

    // Correctly type the result
    const rows = result as any[];

    if (!rows || rows.length === 0) {
      return new NextResponse(null, {status: 404});
    }

    const user = rows[0];
    delete user.password; // Remove password before sending
    console.log("result", user);
    return NextResponse.json(user, {status: 200});
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({error: "Failed to fetch user" }, { status: 500 });
}

}

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();

    if (!username || !password) {
        return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    try {
        const result = await executeQuery(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, password]
        );

        return NextResponse.json(result, { status: 200 });
    } catch (error : any) {
      console.error("Error user registration -> ", error.message);
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
}
