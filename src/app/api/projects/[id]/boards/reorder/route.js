import { db } from '@/db/db';
import { kanbanBoards } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request, { params }) {
  const { id: projectId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { boardIds } = await request.json();
  try {
    for (let i = 0; i < boardIds.length; i++) {
      await db.update(kanbanBoards).set({ position: i }).where(eq(kanbanBoards.id, boardIds[i]));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}