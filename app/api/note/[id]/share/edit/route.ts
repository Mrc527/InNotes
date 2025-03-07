// app/api/note/[id]/share/edit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import executeQuery from "@/utils/dbUtils";
import getUserIdFromRequest from "@/utils/authUtils";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = params;

    try {
        const body = await req.json();
        let { userId, groupId } = body;

        if (!userId && !groupId) {
            return NextResponse.json({ error: "Missing userId or groupId field" }, { status: 400 });
        }

        const [insertResult] = await executeQuery(
            `INSERT INTO note_shared_edit (noteId, userId, groupId) VALUES (?, ?, ?)`,
            [id, userId, groupId]
        ) as any;

        return new NextResponse(null, { status: 201 });
    } catch (error: any) {
        console.error("Error sharing note (edit):", error);
        return NextResponse.json({ error: "Failed to share note (edit)" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = params;

    try {
        const body = await req.json();
        let { userId, groupId } = body;

         if (!userId && !groupId) {
            return NextResponse.json({ error: "Missing userId or groupId field" }, { status: 400 });
        }

        const [deleteResult] = await executeQuery(
            `DELETE FROM note_shared_edit WHERE noteId = ? AND (userId = ? OR groupId = ?)`,
            [id, userId, groupId]
        );

        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        console.error("Error unsharing note (edit):", error);
        return NextResponse.json({ error: "Failed to unshare note (edit)" }, { status: 500 });
    }
}
