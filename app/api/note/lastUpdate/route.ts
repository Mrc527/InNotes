import {NextRequest, NextResponse} from 'next/server';
import getUserIdFromRequest from "@/utils/authUtils";
import executeQuery from "@/utils/dbUtils";

export async function GET(req: NextRequest) {
  const user = await getUserIdFromRequest(req);
  if (!user) {
    return new NextResponse(null, {status: 401});
  }

  try {
    const [queryResult] = await executeQuery('SELECT * FROM data WHERE userId = ?', [user.id]);

    // Narrow the type to allow checking length
    if (!Array.isArray(queryResult) || queryResult.length === 0) {
      // Handle the case where there are no results
      console.log(`No data found for userId: ${user.id}`);
      return NextResponse.json({}, {status: 200}); // Or return an appropriate empty response
    }

    const rows = queryResult[0] as any[];

    console.log(`Result Self Data [${user.id}] -> ${JSON.stringify(rows || {})}`);
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
    let {note, key, linkedinUser, notes} = body;

    if (typeof notes === 'object') {
      notes = JSON.stringify(notes);
    }

    if (!key) {
      key = "";
    }

    await executeQuery(
      `INSERT INTO data (userId, linkedinKey, linkedinUser, note, lastUpdate, notes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE note = ?,
                               linkedinUser = ?,
                               lastUpdate = ?,
                               linkedinKey = ?,
                               notes = ?`,
      [userId, key, linkedinUser, note, new Date().getTime(), notes, note, linkedinUser, new Date().getTime(), key, notes]
    );

    return new NextResponse(null, {status: 200});
  } catch (error: any) {
    console.error("Error creating/updating note:", error);
    return NextResponse.json({error: "Failed to create/update note"}, {status: 500});
  }
}
