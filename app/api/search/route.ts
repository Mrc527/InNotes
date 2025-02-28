import mysql from 'mysql2/promise';
import {NextRequest, NextResponse} from "next/server";

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

        const rows = result as any[];

        if (rows && rows.length === 1 && rows[0].id) {
            console.log(`u -> ${username}, id -> ${rows[0].id}`);
            return rows[0].id;
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

    const searchTerm = req.nextUrl.searchParams.get('searchTerm') || '';
    if (!searchTerm) {
        return NextResponse.json({ error: "Search term is required" }, { status: 400 });
    }

    try {
        const [results] = await pool.query(
            `SELECT linkedinUser, note, data
             FROM data
             WHERE userId = ?
               AND (data LIKE ? OR note LIKE ?)`,
            [userId, `%${searchTerm}%`, `%${searchTerm}%`]
        );

        console.log(`Search Results [${userId}, ${searchTerm}] -> ${JSON.stringify(results || {})}`);
        return NextResponse.json(results || {}, { status: 200 });
    } catch (error: any) {
        console.error("Error during search", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
