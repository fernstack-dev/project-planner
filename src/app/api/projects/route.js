import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db/db";
import { projects, kanbanBoards, kanbanColumns, kanbanCards } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch all projects
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, session.user.id));

    // 2. Count distinct tasks per project
    const taskCounts = await db
      .select({
        projectId: projects.id,
        tasks: sql`count(distinct ${kanbanCards.id})`.as('tasks'),
      })
      .from(projects)
      .leftJoin(kanbanBoards, eq(projects.id, kanbanBoards.projectId))
      .leftJoin(kanbanColumns, eq(kanbanBoards.id, kanbanColumns.boardId))
      .leftJoin(kanbanCards, eq(kanbanColumns.id, kanbanCards.columnId))
      .where(eq(projects.ownerId, session.user.id))
      .groupBy(projects.id);

    // 3. Merge counts (convert to Number)
    const taskMap = new Map(
      taskCounts.map(tc => [tc.projectId, Number(tc.tasks)])
    );

    const projectsWithTasks = userProjects.map(project => ({
      ...project,
      tasks: taskMap.get(project.id) ?? 0,
      members: 1, // default for list view
    }));

    return NextResponse.json(projectsWithTasks);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST remains unchanged
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { name, description, category, color } = await request.json();

    // Insert the project
    const [newProject] = await db.insert(projects).values({
      name,
      description,
      category,
      color,
      ownerId: session.user.id,
      pinned: false,
      status: "active",
    }).returning();

    // Create a default kanban board for the new project
    await db.insert(kanbanBoards).values({
      projectId: newProject.id,
      name: 'Канбан-доска',
      position: 0,
    });

    return NextResponse.json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}