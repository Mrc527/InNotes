import {NextRequest, NextResponse} from 'next/server';
import executeQuery from "@/utils/dbUtils";
import getUserIdFromRequest from "@/utils/authUtils";

export async function GET(req: NextRequest) {
  const user = await getUserIdFromRequest(req);
  if (!user) {
    return new NextResponse(null, {status: 401});
  }

  try {
    const queryResult = await executeQuery('SELECT * FROM contacts WHERE userId = ?', [user.id]);

    if (!Array.isArray(queryResult) || queryResult.length === 0) {
      console.log(`No data found for userId: ${user.id}`);
      return NextResponse.json({}, {status: 200});
    }

    const rows = queryResult;
    console.log(`Result Self Data [${user.id}] -> ${JSON.stringify(rows || {})}`);
    return NextResponse.json(rows || {}, {status: 200});
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({error: "Failed to fetch notes"}, {status: 500});
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserIdFromRequest(req);
  if (!user) {
    return new NextResponse(null, {status: 401});
  }

  try {
    const body = await req.json();
    let {linkedinKey, linkedinUser, tags, statusId, pictureUrl, name} = body;
    linkedinUser = linkedinUser ? decodeURIComponent(linkedinUser) : null;
    tags = tags ? JSON.stringify(tags) : null;
    statusId = statusId || null;

    await executeQuery(
      `INSERT INTO contacts (userId, linkedinKey, linkedinUser, lastUpdate, tags, statusId, pictureUrl, name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE linkedinUser = ?,
                               lastUpdate = ?,
                               linkedinKey = ?,
                               tags = ?,
                               statusId = ?,
                               pictureUrl = ?,
                               name = ?`,
      [user.id, linkedinKey, linkedinUser, new Date().getTime(), tags, statusId, pictureUrl, name,
        linkedinUser, new Date().getTime(), linkedinKey, tags, statusId, pictureUrl, name]
    );

    return new NextResponse(null, {status: 200});
  } catch (error: any) {
    console.error("Error creating/updating note:", error);
    return NextResponse.json({error: "Failed to create/update note"}, {status: 500});
  }
}
