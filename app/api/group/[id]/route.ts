// app/api/group/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import executeQuery from "@/utils/dbUtils";
import getUserIdFromRequest from "@/utils/authUtils";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = params;

    try {
        const [queryResult] = await executeQuery('SELECT * FROM user_groups WHERE id = ? AND ownerId = ?', [id, user.id]);

        if (!Array.isArray(queryResult) || queryResult.length === 0) {
            return new NextResponse(null, { status: 404 });
        }

        return NextResponse.json(queryResult[0], { status: 200 });
    } catch (error: any) {
        console.error("Error fetching group:", error);
        return NextResponse.json({ error: "Failed to fetch group" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = params;

    try {
        const body = await req.json();
        let { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Missing name field" }, { status: 400 });
        }

        const [updateResult] = await executeQuery(
            `UPDATE user_groups SET name = ? WHERE id = ? AND ownerId = ?`,
            [name, id, user.id]
        );

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error("Error updating group:", error);
        return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = params;

    try {
        const [deleteResult] = await executeQuery(
            `DELETE FROM user_groups WHERE id = ? AND ownerId = ?`,
            [id, user.id]
        );

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error("Error deleting group:", error);
        return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
    }
}
