import { db } from '@/db/db';
import { kanbanCards } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: columnId } = await params;
  console.log('POST /cards - columnId:', columnId);

  const body = await request.json();
  console.log('Request body:', body);

  const { content, priority = 'none' } = body;

  try {
    // Get current max position for this column
    const existing = await db.select().from(kanbanCards).where(eq(kanbanCards.columnId, columnId));
    const maxPos = existing.reduce((max, card) => Math.max(max, card.position), -1);
    const position = maxPos + 1;

    const newCard = await db.insert(kanbanCards).values({
      columnId,
      content,
      priority,
      position,
    }).returning();

    console.log('Created card:', newCard[0]);
    return NextResponse.json(newCard[0]);
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}