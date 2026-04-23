import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/db";
import { projects } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log("Fetching categories for user:", userId);

    const result = await db
      .select({ category: projects.category })
      .from(projects)
      .where(
        and(
          eq(projects.ownerId, userId),
          sql`${projects.category} IS NOT NULL`
        )
      )
      .groupBy(projects.category); // добавил GROUP BY для чистоты

    const categories = result.map(r => r.category).filter(Boolean);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
