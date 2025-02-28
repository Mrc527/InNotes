import mysql from 'mysql2/promise';
import { NextRequest, NextResponse } from 'next/server';

const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    debug: false
});

async function getUserIdFromRequest(req: NextRequest) {
    const username = req.headers.get('username');
    const password = req.headers.get('password');

    if (!username || !password) {
        return undefined;
    }

    try {
        const [result] = await pool.query(
            'SELECT id FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        // Correctly type the result
        const rows = result as any[]; // Or RowDataPacket[], if you have that type

        if (rows && rows.length === 1 && rows[0].id) {
            console.log(`u -> ${username}, id -> ${rows[0].id}`);
            return rows[0].id as number; // Explicitly assert the type of id
        } else {
            console.log(`u -> ${username} -> unauthorized`);
            return undefined;
        }
    } catch (error) {
        console.error("Error fetching user ID:", error);
        return undefined;
    }
}

export async function GET(req: NextRequest) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return new NextResponse(null, { status: 401 });
    }

  try {
    const [result] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

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
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, password]
        );

        return NextResponse.json(result, { status: 200 });
    } catch (error : any) {
      console.error("Error user registration -> ", error.message);
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
}
