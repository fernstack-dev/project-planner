import { db } from '@/db/db';
import { projects, kanbanBoards, kanbanColumns, kanbanCards } from '@/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function getIdFromUrl(request) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  return pathParts[pathParts.length - 1];
}

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = getIdFromUrl(request);
  if (!id) {
    return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
  }

  try {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = result[0];

    // Get all boards for this project
    const boards = await db.select().from(kanbanBoards).where(eq(kanbanBoards.projectId, id));
    const boardIds = boards.map(b => b.id);
    let tasksCount = 0;
    if (boardIds.length > 0) {
      // Get all columns for these boards
      const columns = await db.select().from(kanbanColumns).where(inArray(kanbanColumns.boardId, boardIds));
      const columnIds = columns.map(c => c.id);
      if (columnIds.length > 0) {
        const cardsResult = await db.select({ count: sql`count(*)` }).from(kanbanCards).where(inArray(kanbanCards.columnId, columnIds));
        tasksCount = Number(cardsResult[0]?.count || 0);
      }
    }

    // Members count: owner (1) + editors (0 for now)
    const membersCount = 1;

    return NextResponse.json({
      ...project,
      tasks: tasksCount,
      members: membersCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT and DELETE remain unchanged (keep them as they were)
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let id = await params?.id;
  if (!id) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    id = pathParts[pathParts.length - 1];
  }
  if (!id) {
    return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
  }

  try {
    const body = await request.json();
    console.log('Received update body:', body);

    // Define allowed fields (only those that exist in the projects table)
    const allowedUpdates = {
      name: body.name,
      description: body.description,
      category: body.category,
      status: body.status,
      color: body.color,
      pinned: body.pinned,
      settings: body.settings,
      updatedAt: new Date(),
    };

    // Remove undefined fields
    Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

    console.log('Updating project with:', allowedUpdates);

    const updated = await db.update(projects)
      .set(allowedUpdates)
      .where(eq(projects.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  let id = params?.id;
  if (!id) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    id = pathParts[pathParts.length - 1];
  }
  if (!id) {
    return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
  }

  try {
    const deleted = await db.delete(projects).where(eq(projects.id, id)).returning();
    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}