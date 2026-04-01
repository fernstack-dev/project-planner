import { db } from '@/db/db';
import { kanbanColumns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request, { params }) {
  const { id: columnId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const updates = await request.json();
  console.log('Column update received:', { columnId, updates });

  try {
    const updated = await db.update(kanbanColumns)
      .set(updates)
      .where(eq(kanbanColumns.id, columnId))
      .returning();
    if (!updated.length) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id: columnId } = await params;
  console.log('DELETE column request for ID:', columnId);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await db.delete(kanbanColumns).where(eq(kanbanColumns.id, columnId)).returning();
    console.log('Deleted rows:', result.length);
    if (result.length === 0) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: result.length });
  } catch (error) {
    console.error('Delete column error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}