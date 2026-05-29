import { type NextRequest, NextResponse } from 'next/server';
import { generateDiagramForBlueprint } from '@/lib/gemini';
import { rateLimit, getClientIp, createRateLimitResponse } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// POST: Triggers diagram generation for a blueprint
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limitRes = await rateLimit(ip, 'diagram_generate', 3, 600);
  if (!limitRes.success) {
    return createRateLimitResponse(limitRes.reset);
  }

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
