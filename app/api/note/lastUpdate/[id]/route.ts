import { NextRequest, NextResponse } from 'next/server';
import getUserIdFromRequest from "@/utils/authUtils";
import executeQuery from "@/utils/dbUtils";

export async function GET(
  req: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return new NextResponse(null, { status: 401 });
    }

    const id = (await params).id;
    const requestedUsername = req.nextUrl.searchParams.get('username');
    let selectedColumn = "linkedinKey";

    if (requestedUsername) {
        selectedColumn = "linkedinUser";
    }

    try {
        const [result] = await executeQuery(
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
