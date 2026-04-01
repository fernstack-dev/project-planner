import { db } from '@/db/db';
import { kanbanBoards, kanbanColumns, kanbanCards } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let projectId = id;

  // Fallback extraction (optional, keep if needed)
  if (!projectId) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const projectsIndex = pathParts.indexOf('projects');
    if (projectsIndex !== -1 && pathParts[projectsIndex + 1]) {
      projectId = pathParts[projectsIndex + 1];
    }
  }

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    let board = await db.select().from(kanbanBoards).where(eq(kanbanBoards.projectId, projectId)).limit(1);
    if (board.length === 0) {
      // Create default board
      const newBoard = await db.insert(kanbanBoards).values({
        projectId,
        name: 'Канбан-доска',
        position: 0,
      }).returning();
      board = newBoard;
    }
    // Fetch columns
    const columns = await db.select().from(kanbanColumns)
      .where(eq(kanbanColumns.boardId, board[0].id))
      .orderBy(kanbanColumns.position);
    const columnIds = columns.map(c => c.id);
    let cards = [];
    if (columnIds.length > 0) {
      cards = await db.select().from(kanbanCards)
        .where(inArray(kanbanCards.columnId, columnIds))
        .orderBy(kanbanCards.position);
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