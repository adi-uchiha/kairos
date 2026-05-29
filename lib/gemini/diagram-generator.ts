import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { geminiRegistry } from './registry';
import { DIAGRAM_MODEL } from './config';
import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { eq } from 'drizzle-orm';

// ─── SYSTEM PROMPTS ──────────────────────────────────────────────────────────

/**
 * Pass 1: Topology Generation Prompt
 * Instructs the AI to build a highly detailed visual architecture topology (nodes & edges)
 * without any text/metadata (why, cost, free_tier, alternatives).
 * Mandates fine-grained libraries, tools, frameworks, and runtimes.
 */
const DIAGRAM_TOPOLOGY_SYSTEM_PROMPT = `You are a system architecture topology designer.
Your job is to output a detailed JSON graph representing a system architecture topology.
Do NOT include metadata details like "why", "free_tier", "cost_at_scale", "upgrade_signal", or "alternatives" in this step (set them to empty strings or empty arrays).
You must focus entirely on mapping the granular tools, frameworks, libraries, databases, and servers.

PREFERRED NODE LABELS FOR ICON MATCHING:
Always name node data.label EXACTLY as listed below if using these technologies (this guarantees the correct SVG logo matches):
- Runtimes/SDKs: Bun, Node.js, Deno, Go, Rust, Python, TypeScript
- Frontend/Frameworks: Next.js, React, Astro, SolidJS, Remix, Qwik, Vue, Svelte
- Backend/Frameworks: Hono, Fastify, Express, FastAPI, Elysia, Django, Spring Boot, NestJS
- Libraries: Zod, TanStack Query, React Hook Form, Tailwind CSS, tRPC, Framer Motion
- ORMs/Drivers: Drizzle, Prisma, TypeORM, pg
- Databases/Caches: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Neon, PlanetScale, Supabase, Turso, Upstash, CockroachDB
- Hosting/CDN: Vercel, Cloudflare, Cloudflare Workers, Cloudflare R2, Cloudflare CDN, Railway, Fly.io, Render, Heroku
- Auth/OAuth: Better Auth, Clerk, Auth0, Google OAuth, GitHub OAuth
- SaaS/APIs: Stripe, Resend, OpenAI, Anthropic, Mailgun, SendGrid, Twilio, Google Analytics
- Observability: Sentry, PostHog, Datadog, Grafana, Prometheus

GRANULAR NODE RULES:
1. Represent all components at a fine-grained level. DO NOT abstract them into single generic boxes.
2. Include specific developer libraries and tools in their correct locations:
   - Client/Server Validation: Zod (category: 'library')
   - Client Data Fetching: TanStack Query / React Query / tRPC (category: 'library')
   - CSS/Styling: Tailwind CSS (category: 'library')
   - Forms: React Hook Form (category: 'library')
   - Backend Runtime: Bun, Node.js, Deno, Go Binary (category: 'runtime')
   - Backend Framework: Hono, Express, Fastify, Gin, Axum, FastAPI (category: 'framework')
   - Database ORM/Drivers: Drizzle, Prisma, TypeORM, GORM, sqlx, pg driver (category: 'orm')
3. Show correct stack sequencing:
   - e.g. User -> Cloudflare CDN -> Vercel (hosting) -> Next.js (frontend) -> TanStack Query -> Bun (runtime) -> Hono (framework) -> Zod (validation) -> Drizzle (orm) -> PostgreSQL (database).
4. Group container boxes ('group' category) must be used to group logical segments (e.g., "Edge & Client", "Frontend Layer", "Application Services", "Data Store").
   - Child nodes placed inside a group MUST have:
     * "parentId": parent_group_id
     * "extent": "parent"
     * "position": relative local coordinates inside the parent's container box (e.g., x: 40, y: 60), NOT global coordinates.
   - Group nodes must have style: { "width": number, "height": number } to properly contain children.

SPATIAL LAYOUT RULES:
- Even though auto-layout runs on the client, you MUST set initial horizontal columns (x coordinates) and space nodes vertically (y coordinates spaced 160px apart, e.g., y = 100, 260, 420...) to avoid overlapping.
- Group containers should be large enough to hold all their children comfortably (e.g., if a group has 3 children spaced vertically, it needs a width of 240 and height of 500).

HORIZONTAL SWIMLANE COLUMNS (x coordinates for left-to-right flow):
- Col 1 (x = 100): user / external clients
- Col 2 (x = 300): cdn / hosting / gateway
- Col 3 (x = 500): frontend / auth
- Col 4 (x = 700): backend / runtime / framework
- Col 5 (x = 900): library / orm / queue / cache
- Col 6 (x = 1100): database / storage / search
- Col 7 (x = 1300): observability / email / payment / ai (external cloud services)

JSON Topology Schema to output:
{
  "nodes": [
    {
      "id": "string (unique key, e.g. hono, postgres, zod)",
      "type": "string ('customNode' or 'group')",
      "parentId": "string (optional parent group id)",
      "extent": "string (optional, set to 'parent' if parentId is defined)",
      "position": { "x": number, "y": number },
      "style": { "width": number, "height": number } (required for group nodes, omit for customNode),
      "data": {
        "label": "string (display name, e.g. Hono, Zod, PostgreSQL)",
        "category": "string (one of the categories: user, cdn, hosting, gateway, frontend, library, auth, oauth, backend, runtime, framework, orm, database, cache, search, storage, email, payment, queue, ai, observability, container, ci, group)",
        "why": "",
        "free_tier": "",
        "cost_at_scale": "",
        "upgrade_signal": "",
        "alternatives": []
      }
    }
  ],
  "edges": [
    {
      "id": "string (unique edge key, e.g. e-zod-hono)",
      "source": "node_id",
      "target": "node_id",
      "label": "string (connection type, e.g. Validates, Fetches, SQL, gRPC)",
      "animated": boolean,
      "data": {
        "description": "string (1 sentence context on what flows)"
      }
    }
  ]
}

Only return clean, valid JSON matching the schema. No markdown formatting except the JSON block. Ensure all nodes are connected logically and edges flow left-to-right.`;

/**
 * Pass 2: Metadata Hydration Prompt
 * Given the context map, history, and generated topology, this prompt fills in
 * the engineering justification, pricing details, and alternatives for each node.
 */
const DIAGRAM_HYDRATION_SYSTEM_PROMPT = `You are a system architecture details hydrator.
Your job is to read a technology stack context and a system architecture topology, and write detailed metadata properties for each node ID.

For each node ID present in the topology, you must provide:
1. "why": A 1-2 sentence engineering justification. How does this fit their scale, team skills, and tech philosophy?
2. "free_tier": Clear description of its free tier (or "Self-hosted Free" if open source).
3. "cost_at_scale": Expected cost at their specific scale tier (nano, micro, small, medium, large).
4. "upgrade_signal": Limits or triggers that would force scaling or migrating this component.
5. "alternatives": A list of 2-3 alternative tools or services.

You must output a JSON object mapping each node's "id" directly to its metadata:
{
  "nodeId": {
    "why": "string",
    "free_tier": "string",
    "cost_at_scale": "string",
    "upgrade_signal": "string",
    "alternatives": ["alternative1", "alternative2"]
  }
}

Do NOT output nodes array, edges array, coordinates, groups, or connectives. Output ONLY the JSON map matching this schema.`;

/**
 * Pass 1.5: Incremental Topology Update Prompt
 * Used when the user requests a minor modification/swap.
 * Instructs the model to preserve unmodified nodes and their coordinates.
 */
const DIAGRAM_INCREMENTAL_SYSTEM_PROMPT = `You are a system architecture topology incremental editor.
Your job is to apply a specific modification request to an existing system architecture topology.

CRITICAL RULES:
1. Maintain continuity: Keep all unmodified nodes EXACTLY as they are (same id, same type, same position coordinates x/y, same parentId, same data.label, same data.category, and same metadata like why/free_tier/etc.).
2. Precise changes: Only add, remove, or swap nodes and edges that are directly related to the user's latest request. Do NOT touch any other nodes.
3. Coordinate Preservation: Do NOT re-calculate or change the coordinates of unmodified nodes.
   - If swapping a node (e.g. Stripe for Lemon Squeezy), place the new node at the EXACT same coordinates (position x and y) as the old one.
   - If adding a new node, place it at a coordinate close to the node(s) it connects to.
4. Schema validation: Output the complete updated JSON topology containing all nodes (both modified and unmodified) and edges.

PREFERRED NODE LABELS FOR ICON MATCHING:
Always name node data.label EXACTLY as listed below if using these technologies (this guarantees the correct SVG logo matches):
- Runtimes/SDKs: Bun, Node.js, Deno, Go, Rust, Python, TypeScript
- Frontend/Frameworks: Next.js, React, Astro, SolidJS, Remix, Qwik, Vue, Svelte
- Backend/Frameworks: Hono, Fastify, Express, FastAPI, Elysia, Django, Spring Boot, NestJS
- Libraries: Zod, TanStack Query, React Hook Form, Tailwind CSS, tRPC, Framer Motion
- ORMs/Drivers: Drizzle, Prisma, TypeORM, pg
- Databases/Caches: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Neon, PlanetScale, Supabase, Turso, Upstash, CockroachDB
- Hosting/CDN: Vercel, Cloudflare, Cloudflare Workers, Cloudflare R2, Cloudflare CDN, Railway, Fly.io, Render, Heroku
- Auth/OAuth: Better Auth, Clerk, Auth0, Google OAuth, GitHub OAuth
- SaaS/APIs: Stripe, Lemon Squeezy, Resend, OpenAI, Anthropic, Mailgun, SendGrid, Twilio, Google Analytics
- Observability: Sentry, PostHog, Datadog, Grafana, Prometheus

JSON Topology Schema to output:
{
  "nodes": [
    {
      "id": "string (unique key)",
      "type": "string ('customNode' or 'group')",
      "parentId": "string (optional parent group id)",
      "extent": "string (optional, set to 'parent' if parentId is defined)",
      "position": { "x": number, "y": number },
      "style": { "width": number, "height": number } (required for group nodes, omit for customNode),
      "data": {
        "label": "string (display name)",
        "category": "string",
        "why": "string (preserve existing value if unmodified)",
        "free_tier": "string (preserve existing value if unmodified)",
        "cost_at_scale": "string (preserve existing value if unmodified)",
        "upgrade_signal": "string (preserve existing value if unmodified)",
        "alternatives": ["string"] (preserve existing value if unmodified)
      }
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "node_id",
      "target": "node_id",
      "label": "string (connection type, e.g. Validates, Fetches, SQL, gRPC)",
      "animated": boolean,
      "data": {
        "description": "string (1 sentence context on what flows)"
      }
    }
  ]
}

Only return clean, valid JSON matching the schema. No markdown formatting except the JSON block. Ensure all nodes are connected logically and edges flow left-to-right.`;

// ─── GEMINI INVOCATION WITH ROTATION & RETRY ─────────────────────────────────

/**
 * Calls Gemini with key rotation and retry logic.
 * Resilient against transient 503 and rate limit 429 errors.
 */
async function generateTextWithRotation(system: string, prompt: string): Promise<string> {
  let attempt = 0;
  const maxAttempts = 8;

  while (attempt < maxAttempts) {
    attempt++;
    let currentKey;

    try {
      currentKey = geminiRegistry.acquireKey();
    } catch (registryErr) {
      console.error('[DiagramGenerator] Key registry exhausted:', registryErr);
      throw registryErr;
    }

    try {
      console.log(`[DiagramGenerator] Invoking model ${DIAGRAM_MODEL} using key ${currentKey.label} (attempt ${attempt})...`);
      const google = createGoogleGenerativeAI({ apiKey: currentKey.key });
      const response = await generateText({
        model: google(DIAGRAM_MODEL),
        system,
        prompt,
      });

      return response.text;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.warn(`[DiagramGenerator] Key ${currentKey.label} failed: ${errorMsg}`);

      if (errorMsg.includes('429')) {
        geminiRegistry.markRateLimited(currentKey);
      }

      // Briefly wait and try next rotated key
      const backoffMs = 400 * attempt;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw new Error('Failed to generate diagram component after multiple key rotation attempts.');
}

// ─── MAIN DIAGRAM GENERATOR ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateDiagramForBlueprint(blueprintId: string): Promise<any> {
  const result = await db.select().from(blueprints).where(eq(blueprints.id, blueprintId)).limit(1);

  if (result.length === 0) throw new Error('Blueprint not found');
  const blueprint = result[0];

  const contextMapString = JSON.stringify(blueprint.contextMap, null, 2);
  const chatHistoryString = JSON.stringify(blueprint.chatHistory, null, 2);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentGraph = blueprint.diagramGraph as any;
  const hasExistingDiagram = currentGraph && Array.isArray(currentGraph.nodes) && currentGraph.nodes.length > 0;

  // Detect if the user is asking for a full layout redesign / regeneration
  const lastUserMessage = blueprint.chatHistory && blueprint.chatHistory.length > 0
    ? [...blueprint.chatHistory].reverse().find(msg => msg.role === 'user')?.content?.toLowerCase() || ''
    : '';

  const isFullRedesignRequested = lastUserMessage.includes('redesign') ||
    lastUserMessage.includes('regenerate the entire') ||
    lastUserMessage.includes('full rebuild') ||
    lastUserMessage.includes('reorganize') ||
    lastUserMessage.includes('better layout') ||
    lastUserMessage.includes('generate from scratch') ||
    lastUserMessage.includes('re-layout') ||
    lastUserMessage.includes('reset layout') ||
    lastUserMessage.includes('fresh layout');

  const isIncremental = hasExistingDiagram && !isFullRedesignRequested;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let graph: any;

  if (isIncremental) {
    console.log(`[DiagramGenerator] Starting INCREMENTAL Topology Update for blueprint ${blueprintId}`);
    const topologyPrompt = `You are applying an incremental edit to the existing diagram topology.
User's Latest Request: "${lastUserMessage}"

Existing Diagram Graph (Nodes and Edges):
${JSON.stringify(currentGraph, null, 2)}

Context Map:
${contextMapString}

Apply the requested modification (e.g. swapping Stripe for Lemon Squeezy, adding/removing a database, etc.) to the existing graph. Keep all other nodes and edges exactly as they are with the same coordinates. Output the complete updated JSON graph.`;

    const topologyRaw = await generateTextWithRotation(DIAGRAM_INCREMENTAL_SYSTEM_PROMPT, topologyPrompt);
    const cleanTopologyText = topologyRaw
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');
    
    graph = JSON.parse(cleanTopologyText);
  } else {
    // ─── PASS 1: GENERATE TOPOLOGY (Full/Initial) ───
    console.log(`[DiagramGenerator] Starting PASS 1: Topology Generation (Full/Initial) for blueprint ${blueprintId}`);
    const topologyPrompt = `Based on the context map and recommendation history below, generate the visual diagram topology.
Follow the rules in the system prompt. Draw all granular libraries, drivers, validators, servers, and external services.

Context Map:
${contextMapString}

Chat history:
${chatHistoryString}

Generate the detailed architecture nodes and edges. Output JSON only.`;

    const topologyRaw = await generateTextWithRotation(DIAGRAM_TOPOLOGY_SYSTEM_PROMPT, topologyPrompt);
    const cleanTopologyText = topologyRaw
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');
    
    graph = JSON.parse(cleanTopologyText);
  }

  // Validate basic graph schema
  if (!graph.nodes || !Array.isArray(graph.nodes)) {
    throw new Error('Invalid topology returned: missing nodes array');
  }

  // ─── PASS 2: METADATA HYDRATION ───
  console.log(`[DiagramGenerator] Starting PASS 2: Metadata Hydration for blueprint ${blueprintId}`);
  
  // Hydrate only new/modified nodes or all if it's a full generation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodesToHydrate = graph.nodes.filter((node: any) => {
    if (node.type === 'group' || node.data?.category === 'group') {
      return false;
    }
    // If incremental, only hydrate if metadata is empty or missing
    if (isIncremental) {
      return !node.data?.why || !node.data?.free_tier;
    }
    return true;
  });

  if (nodesToHydrate.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedNodes = nodesToHydrate.map((n: any) => ({ id: n.id, label: n.data?.label, category: n.data?.category }));

    const hydrationPrompt = `Based on the context map and recommendation history, populate details for these new/updated nodes in the topology.

Context Map:
${contextMapString}

Chat history:
${chatHistoryString}

Topology Nodes to Hydrate:
${JSON.stringify(mappedNodes, null, 2)}

Provide the detailed metadata (why, free_tier, cost_at_scale, upgrade_signal, alternatives) for each of these node IDs. Output JSON only.`;

    try {
      const hydrationRaw = await generateTextWithRotation(DIAGRAM_HYDRATION_SYSTEM_PROMPT, hydrationPrompt);
      const cleanHydrationText = hydrationRaw
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');
      
      const hydrationMap = JSON.parse(cleanHydrationText);

      // Merge metadata back into topology nodes
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      graph.nodes = graph.nodes.map((node: any) => {
        // Group nodes don't need details
        if (node.type === 'group' || node.data?.category === 'group') {
          return node;
        }

        const meta = hydrationMap[node.id];
        if (meta) {
          return {
            ...node,
            data: {
              ...node.data,
              why: meta.why || '',
              free_tier: meta.free_tier || '',
              cost_at_scale: meta.cost_at_scale || '',
              upgrade_signal: meta.upgrade_signal || '',
              alternatives: Array.isArray(meta.alternatives) ? meta.alternatives : [],
            },
          };
        }
        return node;
      });
      console.log(`[DiagramGenerator] Successfully completed PASS 2 Hydration for blueprint ${blueprintId}`);
    } catch (hydrationError) {
      console.warn(`[DiagramGenerator] Pass 2 Hydration failed. Falling back to raw topology:`, hydrationError);
    }
  } else {
    console.log(`[DiagramGenerator] Skipping PASS 2 Hydration (all nodes already have metadata).`);
  }

  // Save the complete diagram graph to the database
  const nextPhase = blueprint.currentPhase === 'followup' ? 'followup' : 'diagram';

  await db
    .update(blueprints)
    .set({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      diagramGraph: graph as any,
      currentPhase: nextPhase,
      updatedAt: new Date(),
    })
    .where(eq(blueprints.id, blueprintId));

  return graph;
}
