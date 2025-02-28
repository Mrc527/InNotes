import mysql from 'mysql2/promise';
import {NextRequest, NextResponse} from 'next/server';

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

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return new NextResponse(null, {status: 401});
  }

  try {
    const [queryResult] = await pool.query('SELECT * FROM data WHERE userId = ?', [userId]);

    // Narrow the type to allow checking length
    if (!Array.isArray(queryResult) || queryResult.length === 0) {
      // Handle the case where there are no results
      console.log(`No data found for userId: ${userId}`);
      return NextResponse.json({}, {status: 200}); // Or return an appropriate empty response
    }

    const rows = queryResult[0] as any[];

    console.log(`Result Self Data [${userId}] -> ${JSON.stringify(rows || {})}`);
    return NextResponse.json(rows || {}, {status: 200});
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({error: "Failed to fetch notes"}, {status: 500});
  }


}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return new NextResponse(null, {status: 401});
  }

  try {
    const body = await req.json();
    let {note, key, linkedinUser, data} = body;

    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }

    if (!key) {
      key = "";
    }

    await pool.query(
      `INSERT INTO data (userId, linkedinKey, linkedinUser, note, lastUpdate, data)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE note = ?,
                               linkedinUser = ?,
                               lastUpdate = ?,
                               linkedinKey = ?,
                               data = ?`,
      [userId, key, linkedinUser, note, new Date().getTime(), data, note, linkedinUser, new Date().getTime(), key, data]
    );

    return new NextResponse(null, {status: 200});
  } catch (error: any) {
    console.error("Error creating/updating note:", error);
    return NextResponse.json({error: "Failed to create/update note"}, {status: 500});
  }
}
