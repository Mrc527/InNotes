import {NextRequest, NextResponse} from 'next/server';
import getUserIdFromRequest from "@/utils/authUtils";
import executeQuery from "@/utils/dbUtils";

interface Params {
  id: string;
}

export async function GET(req: NextRequest, {params}: { params: Params }) {
  const user = await getUserIdFromRequest(req);
  if (!user) {
    return new NextResponse(null, {status: 401});
  }
  const userId = user.id;
  const {id} = params;

  try {
    const [result] = await executeQuery(
      'SELECT * FROM statuses WHERE id = ? AND userId = ?',
      [id, userId]
    );
    const status = result as any;

    if (!status) {
      return new NextResponse(null, {status: 404});
    }

    return NextResponse.json(status, {status: 200});
  } catch (error) {
    console.error("Error fetching status:", error);
    return NextResponse.json({error: "Failed to fetch status"}, {status: 500});
  }
}

export async function PUT(req: NextRequest, {params}: { params: Params }) {
  const user = await getUserIdFromRequest(req);
  if (!user) {
    return new NextResponse(null, {status: 401});
  }
  const userId = user.id;
  const {id} = params;
  const {name} = await req.json();

  if (!name) {
    return NextResponse.json({error: "Status name is required"}, {status: 400});
  }

  try {
    const result = await executeQuery(
      'UPDATE statuses SET name = ? WHERE id = ? AND userId = ?',
      [name, id, userId]
    );

    return NextResponse.json(result, {status: 200});
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json({error: "Failed to update status"}, {status: 500});
  }
}

export async function DELETE(req: NextRequest, {params}: { params: Params }) {
  const user = await getUserIdFromRequest(req);
  if (!user) {
    return new NextResponse(null, {status: 401});
  }
  const userId = user.id;
  const {id} = params;

  try {
    const result = await executeQuery(
      'DELETE FROM statuses WHERE id = ? AND userId = ?',
      [id, userId]
    );

    return NextResponse.json(result, {status: 200});
  } catch (error) {
    console.error("Error deleting status:", error);
    return NextResponse.json({error: "Failed to delete status"}, {status: 500});
  }
}
