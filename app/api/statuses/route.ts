import {NextRequest, NextResponse} from 'next/server';
import getUserIdFromRequest from "@/utils/authUtils";
import executeQuery from "@/utils/dbUtils";

export async function GET(req: NextRequest) {
    const user = await getUserIdFromRequest(req);
    if (!user) {
        return new NextResponse(null, {status: 401});
    }
    const userId = user.id;

    try {
        const results = await executeQuery('SELECT * FROM statuses WHERE userId = ?', [userId]);
        const statuses = results[0] as any[];
        return NextResponse.json(statuses, {status: 200});
    } catch (error) {
        console.error("Error fetching statuses:", error);
        return NextResponse.json({error: "Failed to fetch statuses"}, {status: 500});
    }
}

export async function POST(req: NextRequest) {
    const user = await getUserIdFromRequest(req);
    if (!user) {
        return new NextResponse(null, {status: 401});
    }
    const userId = user.id;
    const {name} = await req.json();

    if (!name) {
        return NextResponse.json({error: "Status name is required"}, {status: 400});
    }

    try {
        const result = await executeQuery(
            'INSERT INTO statuses (userId, name) VALUES (?, ?)',
            [userId, name]
        );

        return NextResponse.json(result, {status: 201});
    } catch (error) {
        console.error("Error creating status:", error);
        return NextResponse.json({error: "Failed to create status"}, {status: 500});
    }
}
