import { db } from '@/db/db';
import { kanbanBoards } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  const { id: projectId } = await params;
  console.log('GET boards for project:', projectId);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const boards = await db.select().from(kanbanBoards).where(eq(kanbanBoards.projectId, projectId)).orderBy(kanbanBoards.position);
    return NextResponse.json(boards);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { id: projectId } = await params;
  console.log('Creating board for project:', projectId);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = await request.json();
  try {
    const existing = await db.select().from(kanbanBoards).where(eq(kanbanBoards.projectId, projectId));
    const maxPos = existing.reduce((max, b) => Math.max(max, b.position), -1);
    const newBoard = await db.insert(kanbanBoards).values({
      projectId,
      name: name || 'Новая доска',
      position: maxPos + 1,
    }).returning();
    console.log('Created board:', newBoard[0]);
    return NextResponse.json(newBoard[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}