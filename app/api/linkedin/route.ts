import { NextRequest, NextResponse } from 'next/server';
import executeQuery from "@/utils/dbUtils";
import getUserIdFromRequest from "@/utils/authUtils";

export async function GET(req: NextRequest) {
    const user = await getUserIdFromRequest(req);
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    try {
        const [queryResult] = await executeQuery('SELECT * FROM data WHERE userId = ?', [user.id]);

        if (!Array.isArray(queryResult) || queryResult.length === 0) {
            console.log(`No data found for userId: ${user.id}`);
            return NextResponse.json({}, { status: 200 });
        }

        const rows = queryResult;
        console.log(`Result Self Data [${user.id}] -> ${JSON.stringify(rows || {})}`);
        return NextResponse.json(rows || {}, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching notes:", error);
        return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const user = await getUserIdFromRequest(req);
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    try {
        const body = await req.json();
        let { note, key, linkedinUser, notes, tags, statusId } = body;

        if (typeof notes === 'object') {
            notes = JSON.stringify(notes);
        }

        if (!key) {
            key = "";
        }

        tags = tags ? JSON.stringify(tags) : null;
        statusId = statusId || null;

        await executeQuery(
            `INSERT INTO data (userId, linkedinKey, linkedinUser, note, lastUpdate, notes, tags, statusId)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             note = ?, linkedinUser = ?, lastUpdate = ?, linkedinKey = ?, notes = ?, tags = ?, statusId = ?`,
            [user.id, key, linkedinUser, note, new Date().getTime(), notes, tags, statusId,
                note, linkedinUser, new Date().getTime(), key, notes, tags, statusId]
        );

        return new NextResponse(null, { status: 200 });
    } catch (error: any) {
        console.error("Error creating/updating note:", error);
        return NextResponse.json({ error: "Failed to create/update note" }, { status: 500 });
    }
}
