// app/api/group/route.ts
import { NextRequest, NextResponse } from 'next/server';
import executeQuery from "@/utils/dbUtils";
import getUserIdFromRequest from "@/utils/authUtils";

export async function GET(req: NextRequest) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    try {
        const queryResult = await executeQuery('SELECT * FROM user_groups WHERE ownerId = ?', [user.id]);

        if (!Array.isArray(queryResult)) {
            console.log(`No groups found for userId: ${user.id}`);
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(queryResult, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching groups:", error);
        return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    try {
        const body = await req.json();
        let { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Missing name field" }, { status: 400 });
        }

        const insertResult = await executeQuery(
            `INSERT INTO user_groups (ownerId, name) VALUES (?, ?)`,
            [user.id, name]
        ) as any;

        return NextResponse.json({ id: insertResult.insertId }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating group:", error);
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}
