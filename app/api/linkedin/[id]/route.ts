import {NextRequest, NextResponse} from 'next/server';
import getUserIdFromRequest from "@/utils/authUtils";
import executeQuery from "@/utils/dbUtils";

export async function GET(
  req: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
  const user = await getUserIdFromRequest(req);
  if (!user) {
    return new NextResponse(null, {status: 401});
  }

  const id = (await params).id;
  const requestedUsername = req.nextUrl.searchParams.get('username');

  try {
    let rows = await executeQuery(
      'SELECT * FROM data WHERE userId = ? AND linkedinKey = ?',
      [user.id, id]
    );


    if ((!rows || rows.length === 0) && requestedUsername) {
      console.log("Searching by user");
      rows = await executeQuery(
        'SELECT * FROM data WHERE userId = ? AND linkedinUser = ?',
        [user.id, requestedUsername]
      );
    }

    const result = rows && rows.length > 0 ? rows[0] : null;

    console.log(`Result Query [${user.id}, ${id}, ${requestedUsername}] -> ${JSON.stringify(result || {})}`);
    return NextResponse.json(result || {}, {status: 200});
  } catch (error: any) {
    console.error("Error fetching note by ID:", error);
    return NextResponse.json({error: "Failed to fetch note"}, {status: 500});
  }
}

export async function PUT(
  req: NextRequest,
  {params}: { params: Promise<{ id: string }> }
)  {
  const username = req.headers.get('username');
  const password = req.headers.get('password');

  if (!username || !password) {
    return new NextResponse(null, { status: 401, statusText: 'Missing credentials' });
  }

  try {
    const queryResult = await executeQuery('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

    if (!Array.isArray(queryResult) || queryResult.length === 0) {
      return new NextResponse(null, { status: 401, statusText: 'Invalid credentials' });
    }

    const user = queryResult[0];
    const id = (await params).id;
    const body = await req.json();

    // Construct the update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    const allowedFields = ['lastUpdate', 'tags', 'statusId'];

    for (const key in body) {
      if (body.hasOwnProperty(key) && allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No valid updates provided' }, { status: 200 });
    }

    values.push(id, user.id);
    const query = `UPDATE data SET ${updates.join(', ')} WHERE id = ? AND userId = ?`;

    await executeQuery(query, values);
    return NextResponse.json({ message: 'Data updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
