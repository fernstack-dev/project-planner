import { db } from '@/db/db';
import { kanbanCards } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  try {
    const card = await db.select().from(kanbanCards).where(eq(kanbanCards.id, cardId)).limit(1);
    if (card.length === 0) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json(card[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { cardId } = await params;
  const updates = await request.json();
  console.log('Updating card:', cardId, updates);

  if (updates.dueDate) {
    updates.dueDate = new Date(updates.dueDate);
  }

  try {
    const updated = await db.update(kanbanCards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(kanbanCards.id, cardId))
      .returning();
    if (updated.length === 0) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    console.log('Card updated:', updated[0]);
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { cardId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await db.delete(kanbanCards).where(eq(kanbanCards.id, cardId)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}