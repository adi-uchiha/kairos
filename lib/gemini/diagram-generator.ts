import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { geminiRegistry } from './registry';
import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { eq } from 'drizzle-orm';

const DIAGRAM_MODEL = 'gemini-2.5-flash';

const DIAGRAM_SYSTEM_PROMPT = `You are a system architecture layout designer. Your job is to output a structured JSON graph representing the system architecture.
You must return a list of nodes and edges matching the exact ReactFlow-compatible schema below.

Node positions should map to these horizontal rows (y-values) to form logical swimlanes:
- Row 1 (CDN / Hosting): y = 100
- Row 2 (Frontend): y = 250
- Row 3 (Backend / API): y = 400
- Row 4 (Services / Auth / Queue): y = 550
- Row 5 (Persistence / Database / Storage): y = 700
- Row 6 (Outbound / Email / Observability): y = 850

Calculate x positions to space nodes out evenly (e.g., x = 200, 400, 600, etc. based on how many nodes are in that row).

Node categories are limited to: 'frontend' | 'backend' | 'database' | 'auth' | 'email' | 'storage' | 'hosting' | 'observability' | 'queue' | 'cdn'.

JSON Output Schema:
{
  "nodes": [
    {
      "id": "string",
      "type": "service",
      "position": { "x": number, "y": number },
      "data": {
        "label": "string (e.g. Next.js, Supabase)",
        "category": "string",
        "icon_url": "string (logo name or simple icon label)",
        "why": "string (1-2 sentences)",
        "free_tier": "string",
        "cost_at_scale": "string",
        "upgrade_signal": "string",
        "alternatives": ["array", "of", "alternative", "tools"],
        "swap_locked": false
      }
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "node_id",
      "target": "node_id",
      "label": "string (e.g. SQL, REST API, SMTP)",
      "animated": boolean,
      "data": {
        "description": "string"
      }
    }
  ]
}

Ensure all nodes are properly connected. Edges must flow logically (e.g. CDN -> Frontend -> Backend -> Database).`;

export async function generateDiagramForBlueprint(blueprintId: string): Promise<any> {
  const result = await db
    .select()
    .from(blueprints)
    .where(eq(blueprints.id, blueprintId))
    .limit(1);

  if (result.length === 0) throw new Error('Blueprint not found');
  const blueprint = result[0];

  const prompt = `Based on the context map and recommendation history below, generate the visual diagram.

Context Map:
${JSON.stringify(blueprint.contextMap, null, 2)}

Chat history:
${JSON.stringify(blueprint.chatHistory.slice(-4), null, 2)}

Generate a clean architecture graph following the system prompt rules. Output JSON only.`;

  const currentKey = geminiRegistry.acquireKey();
  const google = createGoogleGenerativeAI({ apiKey: currentKey.key });

  const response = await generateText({
    model: google(DIAGRAM_MODEL),
    system: DIAGRAM_SYSTEM_PROMPT,
    prompt,
  });

  const graph = JSON.parse(response.text);

  // Save the generated graph to the database
  await db
    .update(blueprints)
    .set({
      diagramGraph: graph as any,
      currentPhase: 'diagram',
      updatedAt: new Date(),
    })
    .where(eq(blueprints.id, blueprintId));

  return graph;
}
