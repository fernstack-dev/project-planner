import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/db";
import { projects } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get distinct, non-null categories from user's projects
    const result = await db
      .select({ category: projects.category })
      .from(projects)
      .where(eq(projects.ownerId, session.user.id))
      .where(sql`${projects.category} IS NOT NULL`);

    const categories = [...new Set(result.map(r => r.category))];
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}