import { type NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { geminiRegistry } from '@/lib/gemini';
import { DIAGRAM_MODEL } from '@/lib/gemini/config';
import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

const SWAP_SYSTEM_PROMPT = `You are a system architecture layout designer.
The user wants to swap one service in their architecture diagram for an alternative.
You must update the nodes and edges JSON to reflect this change.

Task:
- Replace the target node with the replacement tool.
- Update its label, description, logo name, why it's chosen, cost, and free tier.
- Analyze connected edges: if the replacement changes the communication protocol or data flow, update the edge labels and descriptions.
- Keep other nodes intact. Keep positions consistent.

Output JSON only in the identical graph schema:
{
  "nodes": [...],
  "edges": [...]
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { blueprintId, nodeId, replacement } = body;

    if (!blueprintId || !nodeId || !replacement) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const result = await db
      .select()
      .from(blueprints)
      .where(eq(blueprints.id, blueprintId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }

    const blueprint = result[0];
    const currentGraph = blueprint.diagramGraph;

    const prompt = `Target Node to swap: ${nodeId}
Replacement Tool: ${replacement}

Here is the current Diagram Graph JSON:
${JSON.stringify(currentGraph, null, 2)}

Context Map:
${JSON.stringify(blueprint.contextMap, null, 2)}

Please perform the swap and output the updated JSON.`;

    let attempt = 0;
    let responseText = '';
    while (attempt < 5) {
      attempt++;
      const currentKey = geminiRegistry.acquireKey();
      try {
        const google = createGoogleGenerativeAI({ apiKey: currentKey.key });
        const response = await generateText({
          model: google(DIAGRAM_MODEL),
          system: SWAP_SYSTEM_PROMPT,
          prompt,
        });
        responseText = response.text;
        break;
      } catch (err) {
        console.warn(`[Swap API] Key ${currentKey.label} failed on attempt ${attempt}:`, err);
        if (attempt === 5) throw err;
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
      }
    }

    const rawText = responseText
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');
    const updatedGraph = JSON.parse(rawText);

    // Save back to DB
    await db
      .update(blueprints)
      .set({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        diagramGraph: updatedGraph as any,
        updatedAt: new Date(),
      })
      .where(eq(blueprints.id, blueprintId));

    return NextResponse.json({ graph: updatedGraph });
  } catch (error) {
    console.error('Error swapping node:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
