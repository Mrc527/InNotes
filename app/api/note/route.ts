import { NextRequest, NextResponse } from 'next/server';
import executeQuery from "@/utils/dbUtils";
import getUserIdFromRequest from "@/utils/authUtils";

const TIMEZONE_OFFSET = 1; // UTC+1

function convertFromUTC(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() + TIMEZONE_OFFSET); // Add 1 hour to convert from UTC to UTC+1
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

export async function GET(req: NextRequest) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const linkedinDataId = searchParams.get('linkedinDataId');

        const [queryResult] = await executeQuery(
            'SELECT * FROM notes WHERE userId = ? AND linkedinDataId = ?',
            [user.id, linkedinDataId]
        );

        if (!Array.isArray(queryResult) || queryResult.length === 0) {
            console.log(`No notes found for userId: ${user.id} and linkedinDataId: ${linkedinDataId}`);
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(queryResult, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching notes:", error);
        return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    try {
        const body = await req.json();
        let { text, flagColor, lastUpdate, creationDate, visibility, linkedinDataId } = body;

        if (!linkedinDataId) {
            return NextResponse.json({ error: "linkedinDataId is required" }, { status: 400 });
        }

        // Format dates to be MySQL compatible
        lastUpdate = convertFromUTC(lastUpdate);
        creationDate = convertFromUTC(creationDate);

        let query = `INSERT INTO notes (userId, text, flagColor, lastUpdate, creationDate, linkedinDataId`;
        let values = [user.id, text, flagColor, lastUpdate, creationDate, linkedinDataId];

        if (visibility !== undefined) {
            query += `, visibility) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            values.push(visibility);
        } else {
            query += `) VALUES (?, ?, ?, ?, ?, ?)`;
        }

        const [insertResult] = await executeQuery(
          query,
          values
        ) as any;

        return NextResponse.json({ id: insertResult.insertId }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating/updating note:", error);
        return NextResponse.json({ error: "Failed to create/update note" }, { status: 500 });
    }
}
