import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

// GET: Fetch all blueprints for user
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const result = await db.select().from(blueprints).where(eq(blueprints.id, id)).limit(1);

      if (result.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      // Check ownership
      if (result[0].userId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      return NextResponse.json(result[0]);
    }

    const userBlueprints = await db
      .select()
      .from(blueprints)
      .where(eq(blueprints.userId, session.user.id))
      .orderBy(desc(blueprints.createdAt));

    return NextResponse.json(userBlueprints);
  } catch (error) {
    console.error('Error fetching blueprints:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new blueprint
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const name = body.name || 'Untitled Blueprint';
    const id = randomUUID(); // Generate secure UUID

    const newBlueprint = {
      id,
      userId: session.user.id,
      name,
      currentPhase: 'project_discovery',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chatHistory: [] as any,
      contextMap: {
        product_category: null,
        core_user_workflow: null,
        primary_user_persona: null,
        data_model_nature: [],
        has_realtime_requirement: null,
        has_ai_ml_component: null,
        expected_users_month_1: null,
        expected_users_month_6: null,
        launch_timeline_weeks: null,
        scale_tier: null,
        team_size: null,
        primary_language: null,
        familiar_frameworks: [],
        budget_constraint: null,
        devops_tolerance: null,
        existing_tools: [],
        compliance_requirements: [],
        non_negotiables: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      diagramGraph: { nodes: [], edges: [] } as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(blueprints).values(newBlueprint);

    return NextResponse.json(newBlueprint);
  } catch (error) {
    console.error('Error creating blueprint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update an existing blueprint
export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, currentPhase, chatHistory, contextMap, diagramGraph } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    // Verify ownership
    const existing = await db.select().from(blueprints).where(eq(blueprints.id, id)).limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing[0].userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updateData: Partial<typeof blueprints.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (currentPhase !== undefined) updateData.currentPhase = currentPhase;
    if (chatHistory !== undefined) updateData.chatHistory = chatHistory;
    if (contextMap !== undefined) updateData.contextMap = contextMap;
    if (diagramGraph !== undefined) updateData.diagramGraph = diagramGraph;

    await db.update(blueprints).set(updateData).where(eq(blueprints.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating blueprint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a blueprint
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  try {
    // Verify ownership
    const existing = await db.select().from(blueprints).where(eq(blueprints.id, id)).limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (existing[0].userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await db.delete(blueprints).where(eq(blueprints.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blueprint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
