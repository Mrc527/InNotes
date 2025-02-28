import {NextRequest, NextResponse} from "next/server";
import getUserIdFromRequest from "@/utils/authUtils";
import executeQuery from "@/utils/dbUtils";


export async function GET(req: NextRequest) {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        return new NextResponse(null, { status: 401 });
    }

    const searchTerm = req.nextUrl.searchParams.get('searchTerm') || '';
    if (!searchTerm) {
        return NextResponse.json({ error: "Search term is required" }, { status: 400 });
    }

    try {
        const [results] = await executeQuery(
            `SELECT linkedinUser, note, data
             FROM data
             WHERE userId = ?
               AND (data LIKE ? OR note LIKE ?)`,
            [userId, `%${searchTerm}%`, `%${searchTerm}%`]
        );

        console.log(`Search Results [${userId}, ${searchTerm}] -> ${JSON.stringify(results || {})}`);
        return NextResponse.json(results || {}, { status: 200 });
    } catch (error: any) {
        console.error("Error during search", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
