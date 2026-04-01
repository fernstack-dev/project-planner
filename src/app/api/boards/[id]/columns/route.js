import { db } from '@/db/db';
import { kanbanColumns } from '@/db/schema';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq } from 'drizzle-orm';

export async function POST(request, { params }) {
  const { id: boardId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, color } = await request.json();

  try {
    // Get current max position
    const existing = await db.select().from(kanbanColumns).where(eq(kanbanColumns.boardId, boardId));
    const maxPos = existing.reduce((max, col) => Math.max(max, col.position), -1);
    const newColumn = await db.insert(kanbanColumns).values({
      boardId,
      name: name || 'Новая колонка',
      color: color || '#10b981',
      position: maxPos + 1,
    }).returning();
    return NextResponse.json(newColumn[0]);
  } catch (error) {
    console.error('Column creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}