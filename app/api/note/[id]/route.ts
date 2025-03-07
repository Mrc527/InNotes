// app/api/note/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import getUserIdFromRequest from "@/utils/authUtils";
import { getNote, getNoteForEdit } from "@/utils/noteUtils";
import executeQuery from "@/utils/dbUtils";

const TIMEZONE_OFFSET = 1; // UTC+1

function convertFromUTC(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() + TIMEZONE_OFFSET); // Add 1 hour to convert from UTC to UTC+1
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = params;

    const note = await getNote(id, user.id);

    if (!note) {
        return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json(note, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = await(params);

    const note = await getNoteForEdit(id, user.id);

    if (!note) {
        return new NextResponse(null, { status: 404 });
    }

    try {
        const body = await req.json();
        const { text, flagColor, lastUpdate, visibility } = body;

        // Format the lastUpdate value to a MySQL-compatible datetime string
        const formattedLastUpdate = convertFromUTC(lastUpdate);

        await executeQuery(
            `UPDATE notes SET text = ?, flagColor = ?, lastUpdate = ?, visibility = ? WHERE id = ?`,
            [text, flagColor, formattedLastUpdate, visibility, id]
        );

        return new NextResponse(null, { status: 200 });
    } catch (error: any) {
        console.error("Error updating note:", error);
        return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserIdFromRequest(req);
    if (!user || !user.id) {
        return new NextResponse(null, { status: 401 });
    }

    const { id } = params;

     const note = await getNoteForEdit(id, user.id);

    if (!note) {
        return new NextResponse(null, { status: 404 });
    }

    try {
        await executeQuery(
            `DELETE FROM notes WHERE id = ?`,
            [id]
        );

        return new NextResponse(null, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting note:", error);
        return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
    }
}
