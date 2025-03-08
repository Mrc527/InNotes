// app/api/group/[id]/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import executeQuery from "@/utils/dbUtils";
import getUserIdFromRequest from "@/utils/authUtils";

export async function GET(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = await params;

    try {
        const queryResult = await executeQuery(
            `SELECT u.* FROM users u JOIN user_group_members ugm ON u.id = ugm.userId WHERE ugm.groupId = ?`,
            [id]
        );

        if (!Array.isArray(queryResult)) {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(queryResult, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching group members:", error);
        return NextResponse.json({ error: "Failed to fetch group members" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = await params;

    try {
        const body = await req.json();
        let { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "Missing userId field" }, { status: 400 });
        }

        const insertResult = await executeQuery(
            `INSERT INTO user_group_members (groupId, userId) VALUES (?, ?)`,
            [id, userId]
        ) as any;

        return new NextResponse(null, { status: 201 });
    } catch (error: any) {
        console.error("Error adding group member:", error);
        return NextResponse.json({ error: "Failed to add group member" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = await params;

    try {
        const body = await req.json();
        let { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "Missing userId field" }, { status: 400 });
        }

        const deleteResult = await executeQuery(
            `DELETE FROM user_group_members WHERE groupId = ? AND userId = ?`,
            [id, userId]
        );

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error("Error deleting group member:", error);
        return NextResponse.json({ error: "Failed to delete group member" }, { status: 500 });
    }
}
