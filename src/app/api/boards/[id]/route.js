import { db } from '@/db/db';
import { kanbanBoards, kanbanColumns, kanbanCards } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  const { id } = await params;
  let boardId = id;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Fetch board
    const board = await db.select().from(kanbanBoards).where(eq(kanbanBoards.id, boardId)).limit(1);
    if (board.length === 0) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    // Fetch columns
    let columns = await db.select().from(kanbanColumns).where(eq(kanbanColumns.boardId, boardId)).orderBy(kanbanColumns.position);
    const columnIds = columns.map(c => c.id);
    let cards = [];
    if (columnIds.length > 0) {
      cards = await db.select().from(kanbanCards).where(inArray(kanbanCards.columnId, columnIds)).orderBy(kanbanCards.position);
    }
    const columnsWithCards = columns.map(col => ({
      ...col,
      cards: cards.filter(card => card.columnId === col.id),
    }));
    return NextResponse.json({ board: board[0], columns: columnsWithCards });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id: boardId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = await request.json();
  try {
    const updated = await db.update(kanbanBoards).set({ name }).where(eq(kanbanBoards.id, boardId)).returning();
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id: boardId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await db.delete(kanbanBoards)
      .where(eq(kanbanBoards.id, boardId))
      .returning();
    if (result.length === 0) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}