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
