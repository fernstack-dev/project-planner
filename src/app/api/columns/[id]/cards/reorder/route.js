import { db } from '@/db/db';
import { kanbanCards } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { columnId } = await params;
  const { orderedCardIds } = await request.json();
  try {
    // Update each card's position based on the new order
    for (let i = 0; i < orderedCardIds.length; i++) {
      await db.update(kanbanCards)
        .set({ position: i })
        .where(eq(kanbanCards.id, orderedCardIds[i]));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}