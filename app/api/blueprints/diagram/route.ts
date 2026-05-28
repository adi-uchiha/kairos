import { type NextRequest, NextResponse } from 'next/server';
import { generateDiagramForBlueprint } from '@/lib/gemini';
import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

// POST: Triggers diagram generation for a blueprint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { blueprintId } = body;

    if (!blueprintId) {
      return NextResponse.json({ error: 'Missing blueprintId' }, { status: 400 });
    }

    const graph = await generateDiagramForBlueprint(blueprintId);
    return NextResponse.json({ graph });
  } catch (error) {
    console.error('Error generating diagram:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
