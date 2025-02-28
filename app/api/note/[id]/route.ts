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

        const rows = result as any[];

        if (rows && rows.length === 1 && rows[0].id) {
            console.log(`u -> ${username}, id -> ${rows[0].id}`);
            return rows[0].id;
        } else {
            console.log(`u -> ${username} -> unauthorized`);
            return undefined;
        }
    } catch (error: any) {
        console.error("Error fetching user ID:", error);
        return undefined;
    }
}

interface Params {
    id: string;
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return new NextResponse(null, { status: 401 });
    }

    const id = params.id;
    const requestedUsername = req.nextUrl.searchParams.get('username');

    try {
        let queryResult = await pool.query(
            'SELECT * FROM data WHERE userId = ? AND linkedinKey = ?',
            [userId, id]
        );

        let rows = queryResult[0] as any[];

        if ((!rows || rows.length === 0) && requestedUsername) {
            console.log("Searching by user");
            queryResult = await pool.query(
                'SELECT * FROM data WHERE userId = ? AND linkedinUser = ?',
                [userId, requestedUsername]
            );
            rows = queryResult[0] as any[];
        }

        const result = rows && rows.length > 0 ? rows[0] : null;

        console.log(`Result Query [${userId}, ${id}, ${requestedUsername}] -> ${JSON.stringify(result || {})}`);
        return NextResponse.json(result || {}, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching note by ID:", error);
        return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
    }
}
