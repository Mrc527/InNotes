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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return new NextResponse(null, { status: 401 });
    }

    const id = params.id;
    const requestedUsername = req.nextUrl.searchParams.get('username');
    let selectedColumn = "linkedinKey";

    if (requestedUsername) {
        selectedColumn = "linkedinUser";
    }

    try {
        const [result] = await pool.query(
            `SELECT lastUpdate FROM data WHERE userId = ? AND ${selectedColumn} = ?`,
            [userId, id]
        );

        const rows = result as any[];
        const lastUpdate = rows && rows.length > 0 && rows[0].lastUpdate ? rows[0].lastUpdate : 0;

        console.log("result", result);
        return NextResponse.json({ "lastUpdate": lastUpdate, "userId": userId }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching last update:", error);
        return NextResponse.json({ error: "Failed to fetch last update" }, { status: 500 });
    }
}
