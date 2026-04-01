import { db } from '@/db/db';
import { kanbanColumns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = params;
  const { orderedColumnIds } = await request.json(); // array of column ids in new order
  try {
    for (let i = 0; i < orderedColumnIds.length; i++) {
      await db.update(kanbanColumns)
        .set({ position: i })
        .where(eq(kanbanColumns.id, orderedColumnIds[i]));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}