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
        const results = await executeQuery(
            `SELECT tags FROM data WHERE userId = ?`,
            [userId]
        );

        const allTags = results.reduce((acc: any, row: any) => {
            if (row.tags && Array.isArray(row.tags)) {
                acc.push(...row.tags);
            }
            return acc;
        }, []);

        const uniqueTags = [...new Set(allTags)];

        return NextResponse.json(uniqueTags, {status: 200});
    } catch (error) {
        console.error("Error fetching tags:", error);
        return NextResponse.json({error: "Failed to fetch tags"}, {status: 500});
    }
}
