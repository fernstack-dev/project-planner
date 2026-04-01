import { db } from '@/db/db';
import { projects } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const all = await db.select().from(projects);
    return NextResponse.json({ count: all.length });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}