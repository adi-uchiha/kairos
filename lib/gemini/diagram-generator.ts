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
 *
 * Design philosophy:
 *   A system architecture diagram shows INFRASTRUCTURE and SERVICES — the actual
 *   running components, data stores, external APIs, and the flow of data between them.
 *   It is NOT a dependency tree. Libraries and utility packages are NOT nodes.
 *
 *   Libraries (Zod, TanStack Query, Tailwind CSS, React Hook Form, tRPC client,
 *   Framer Motion, Drizzle ORM, etc.) are implementation details of a service,
 *   NOT separate infrastructure nodes. They belong inside a `libCluster` node
 *   that is attached to their parent service.
 *
 *   Real infrastructure nodes are: servers, runtimes, databases, queues, caches,
 *   CDNs, hosting platforms, auth providers, payment processors, AI model APIs,
 *   email services, object storage, observability platforms.
 */
const DIAGRAM_TOPOLOGY_SYSTEM_PROMPT = `You are an expert system architecture diagram designer.
Your sole job is to produce a JSON topology for a professional system architecture diagram.

════════════════════════════════════════════════════════════════
WHAT BELONGS AS A NODE (infrastructure & services only):
════════════════════════════════════════════════════════════════
✅ YES — these are infrastructure nodes:
  • User / Browser / Mobile Client (category: user)
  • CDN: Cloudflare CDN, CloudFront, Fastly (category: cdn)
  • Hosting/Deploy: Vercel, Railway, Fly.io, Render, AWS ECS, Cloud Run (category: hosting)
  • Edge Runtime: Cloudflare Workers, Lambda@Edge (category: runtime)
  • Server Runtime: Bun, Node.js, Deno, Go Binary, Python runtime (category: runtime)
  • API Gateway / Reverse Proxy: nginx, Kong, Traefik, Caddy, AWS API Gateway (category: gateway)
  • Backend Framework Process: Hono, Fastify, Express, Gin, Axum, FastAPI, NestJS (category: framework)
  • Auth Service: Clerk, Better Auth, Auth0, Supabase Auth (category: auth)
  • OAuth Provider: Google OAuth, GitHub OAuth (category: oauth)
  • Database: PostgreSQL, MySQL, MongoDB, SQLite, CockroachDB, Neon (category: database)
  • Cache: Redis, Upstash, Memcached (category: cache)
  • Object Storage: S3, Cloudflare R2, GCS (category: storage)
  • Search Engine: Algolia, Typesense, Meilisearch (category: search)
  • Message Queue / Job Runner: BullMQ, SQS, RabbitMQ, Kafka, Inngest (category: queue)
  • AI Model API: OpenAI API, Anthropic Claude API, Gemini API (category: ai)
  • Email Service: Resend, Mailgun, SendGrid (category: email)
  • Payment Gateway: Stripe, Lemon Squeezy, Paddle (category: payment)
  • Observability Platform: Sentry, PostHog, Datadog, Grafana (category: observability)
  • Container Orchestration: Docker, Kubernetes, ECS (category: container)
  • CI/CD: GitHub Actions, CircleCI (category: ci)
  • Frontend Framework (the deployed app itself): Next.js, Astro, SvelteKit (category: frontend)

❌ NO — these are NEVER standalone nodes (use libCluster instead):
  • Zod, Yup, Valibot (validation libraries)
  • TanStack Query, SWR, React Query (client data fetching)
  • Tailwind CSS, Windfall CSS, styled-components, shadcn/ui (styling)
  • React Hook Form, Formik (form libraries)
  • Drizzle ORM, Prisma, TypeORM (ORMs — they're just DB drivers inside the server)
  • tRPC client, Axios, ky, got (HTTP client libraries)
  • Framer Motion, GSAP (animation libraries)
  • Zustand, Jotai, Redux (client state libraries)
  • Lodash, date-fns, clsx, cn (utility libraries)
  • TypeScript (it's a language, not a service)
  • React (it's a UI library bundled into the frontend, not a service)

════════════════════════════════════════════════════════════════
libCluster NODES — how to group libraries:
════════════════════════════════════════════════════════════════
Instead of individual library nodes, create ONE libCluster node per logical group.
A libCluster node has type "libCluster" and its data.libs is an array of { id, label }.
Examples:
  • "Frontend Libraries" libCluster inside the Frontend group: [Zod, TanStack Query, Tailwind CSS, React Hook Form]
  • "Server Libraries" libCluster inside the Backend group: [Zod, Drizzle ORM, tRPC]
  • "ORM / Query" libCluster inside Data group: [Drizzle, pg driver]

libCluster nodes appear visually as a compact icon pill grid. They connect to their parent
service via a short edge (e.g. "uses"). They DO NOT connect to databases or external services
directly — those edges go from the backend Framework node instead.

════════════════════════════════════════════════════════════════
GROUP CONTAINERS (swimlanes):
════════════════════════════════════════════════════════════════
Organize nodes into logical swimlane groups using type "group":
  • "Client" — user node(s), browser
  • "Edge & CDN" — CDN, edge runtimes, hosting platform
  • "Frontend App" — frontend framework node + frontend libCluster
  • "API / Backend" — runtime + framework + backend libCluster
  • "Data Layer" — databases, caches, ORM libCluster, search
  • "Platform Services" — auth, email, payment, queue, storage
  • "External APIs" — AI models, OAuth providers, third-party APIs
  • "Observability" — Sentry, PostHog, Datadog (only if used)

Group node children MUST have:
  • "parentId": the group's id
  • "extent": "parent"
  • "position": LOCAL coordinates relative to the group container (not global)

Group nodes MUST have style: { "width": number, "height": number }

════════════════════════════════════════════════════════════════
PREFERRED CANONICAL LABELS (use EXACTLY these for icon matching):
════════════════════════════════════════════════════════════════
Runtimes: Bun, Node.js, Deno, Go, Rust, Python
Frontend: Next.js, React, Astro, SolidJS, Remix, SvelteKit, Qwik, Vue, Svelte
Backend: Hono, Fastify, Express, FastAPI, Elysia, Django, Spring Boot, NestJS, Gin
Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Neon, PlanetScale, Supabase, Turso, Upstash, CockroachDB
Hosting: Vercel, Cloudflare, Cloudflare Workers, Cloudflare R2, Cloudflare CDN, Railway, Fly.io, Render
Auth: Better Auth, Clerk, Auth0, Google OAuth, GitHub OAuth
SaaS: Stripe, Lemon Squeezy, Resend, OpenAI, Anthropic, Mailgun, SendGrid, Twilio
Observability: Sentry, PostHog, Datadog, Grafana, Prometheus

════════════════════════════════════════════════════════════════
EDGE RULES (system architecture data flows):
════════════════════════════════════════════════════════════════
Edges represent data flow / protocol between infrastructure components:
  • Label edges with the protocol or action: "HTTPS", "REST", "gRPC", "SQL", "WebSocket",
    "Pub/Sub", "SMTP", "Webhook", "SDK call", "JWT verify", "OAuth redirect", "uses"
  • Edges always flow left-to-right: Client → CDN → Frontend → Backend → Data/Services
  • Do NOT draw edges from libCluster to databases — draw from the framework node instead
  • Animated: true for real-time/streaming connections (WebSocket, SSE, Pub/Sub)

════════════════════════════════════════════════════════════════
JSON SCHEMA:
════════════════════════════════════════════════════════════════
{
  "nodes": [
    {
      "id": "string (unique snake_case key, e.g. bun_runtime, neon_db)",
      "type": "string ('customNode' | 'group' | 'libCluster')",
      "parentId": "string (optional — only if inside a group)",
      "extent": "'parent' (required if parentId is set)",
      "position": { "x": number, "y": number },
      "style": { "width": number, "height": number } (required for group nodes ONLY),
      "data": {
        "label": "string (canonical display name)",
        "category": "string (one of: user, cdn, hosting, gateway, frontend, auth, oauth, backend, runtime, framework, database, cache, search, storage, email, payment, queue, ai, observability, container, ci, group, library)",
        "why": "",
        "free_tier": "",
        "cost_at_scale": "",
        "upgrade_signal": "",
        "alternatives": [],
        "libs": [{ "id": "string", "label": "string" }]  // ONLY for libCluster type nodes
      }
    }
  ],
  "edges": [
    {
      "id": "string (e.g. e-frontend-backend)",
      "source": "node_id",
      "target": "node_id",
      "label": "string (protocol/action)",
      "animated": boolean,
      "data": { "description": "string (1 sentence describing what flows)" }
    }
  ]
}

Output ONLY valid JSON. No markdown. No explanation. Ensure all group children have local coordinates.`;

/**
 * Pass 2: Metadata Hydration Prompt
 */
const DIAGRAM_HYDRATION_SYSTEM_PROMPT = `You are a system architecture cost and tradeoff analyst.
Your job is to hydrate metadata for infrastructure service nodes in a system architecture diagram.

For each node ID provided, output:
1. "why": 1-2 sentence engineering justification matching their scale, philosophy, and team size.
2. "free_tier": Free tier limits clearly stated (or "Self-hosted, no cost" for OSS).
3. "cost_at_scale": Expected monthly cost at the user's scale tier.
4. "upgrade_signal": Specific metric or event that would trigger a scaling decision.
5. "alternatives": 2-3 alternative tools that could serve the same function.

Output format — a flat JSON map of nodeId → metadata:
{
  "node_id": {
    "why": "string",
    "free_tier": "string",
    "cost_at_scale": "string",
    "upgrade_signal": "string",
    "alternatives": ["string", "string"]
  }
}

Do NOT output nodes, edges, or any other fields. Only output the metadata map.
Skip libCluster nodes (they represent library groups, not priced infrastructure).`;

/**
 * Pass 1.5: Incremental Topology Update Prompt
 */
const DIAGRAM_INCREMENTAL_SYSTEM_PROMPT = `You are a system architecture topology editor.
You apply a precise, minimal change to an existing architecture diagram.

CRITICAL RULES:
1. Keep ALL unmodified nodes EXACTLY as-is — same id, type, position, parentId, extent, data, style.
2. Only add/remove/swap nodes and edges directly related to the user's request.
3. When swapping a node, place the new node at the EXACT same position as the old one.
4. When adding a new infrastructure node, place it near the nodes it connects to.
5. Never convert libCluster nodes to regular nodes or vice versa unless explicitly requested.
6. Output the COMPLETE updated JSON topology — all nodes and edges.

LIBRARY RULE: Libraries (Zod, TanStack Query, Drizzle, Tailwind, etc.) must ALWAYS live inside
a libCluster node. Never add them as standalone customNode or group nodes.

PREFERRED CANONICAL LABELS (exact spelling required for icon matching):
- Runtimes: Bun, Node.js, Deno, Go, Rust, Python
- Frontend: Next.js, React, Astro, SolidJS, Remix, SvelteKit, Vue, Svelte
- Backend: Hono, Fastify, Express, FastAPI, Elysia, Django, Spring Boot, NestJS
- Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Neon, PlanetScale, Supabase, Turso, Upstash
- Hosting: Vercel, Cloudflare, Cloudflare Workers, Cloudflare R2, Railway, Fly.io, Render
- Auth: Better Auth, Clerk, Auth0, Google OAuth, GitHub OAuth
- SaaS: Stripe, Lemon Squeezy, Resend, OpenAI, Anthropic, Mailgun, SendGrid, Twilio
- Observability: Sentry, PostHog, Datadog, Grafana, Prometheus

JSON Schema:
{
  "nodes": [
    {
      "id": "string",
      "type": "'customNode' | 'group' | 'libCluster'",
      "parentId": "string (optional)",
      "extent": "'parent' (if parentId set)",
      "position": { "x": number, "y": number },
      "style": { "width": number, "height": number } (group only),
      "data": {
        "label": "string",
        "category": "string",
        "why": "string (preserve if unmodified)",
        "free_tier": "string (preserve if unmodified)",
        "cost_at_scale": "string (preserve if unmodified)",
        "upgrade_signal": "string (preserve if unmodified)",
        "alternatives": ["string"] (preserve if unmodified),
        "libs": [{ "id": "string", "label": "string" }] (libCluster only)
      }
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "node_id",
      "target": "node_id",
      "label": "string (protocol)",
      "animated": boolean,
      "data": { "description": "string" }
    }
  ]
}

Output ONLY valid JSON. No markdown.`;

// ─── GEMINI INVOCATION WITH ROTATION & RETRY ─────────────────────────────────

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
      console.log(
        `[DiagramGenerator] Invoking model ${DIAGRAM_MODEL} using key ${currentKey.label} (attempt ${attempt})...`
      );
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
  const hasExistingDiagram =
    currentGraph && Array.isArray(currentGraph.nodes) && currentGraph.nodes.length > 0;

  const lastUserMessage =
    blueprint.chatHistory && blueprint.chatHistory.length > 0
      ? [...blueprint.chatHistory]
          .reverse()
          .find((msg) => msg.role === 'user')
          ?.content?.toLowerCase() || ''
      : '';

  const isFullRedesignRequested =
    lastUserMessage.includes('redesign') ||
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
    console.log(
      `[DiagramGenerator] Starting INCREMENTAL Topology Update for blueprint ${blueprintId}`
    );
    const topologyPrompt = `Apply an incremental modification to the existing system architecture diagram.

User's Request: "${lastUserMessage}"

Existing Diagram Graph:
${JSON.stringify(currentGraph, null, 2)}

Context Map:
${contextMapString}

Apply ONLY the requested change. Keep all other nodes and their positions unchanged.
Remember: libraries (Zod, Drizzle, TanStack Query, Tailwind, etc.) must be in libCluster nodes, NOT standalone nodes.
Output the complete updated JSON graph.`;

    const topologyRaw = await generateTextWithRotation(
      DIAGRAM_INCREMENTAL_SYSTEM_PROMPT,
      topologyPrompt
    );
    const cleanTopologyText = topologyRaw
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');

    graph = JSON.parse(cleanTopologyText);
  } else {
    // ─── PASS 1: FULL TOPOLOGY GENERATION ───
    console.log(
      `[DiagramGenerator] Starting PASS 1: Topology Generation for blueprint ${blueprintId}`
    );
    const topologyPrompt = `Generate a professional system architecture diagram for the following project.

Context Map (gathered from user):
${contextMapString}

Architecture Recommendation History:
${chatHistoryString}

IMPORTANT REMINDERS:
- This must look like a proper system architecture diagram — showing infrastructure nodes connected by data flows.
- Libraries (Zod, TanStack Query, Drizzle ORM, Tailwind CSS, React Hook Form, tRPC, etc.) go inside libCluster nodes, NEVER as standalone nodes.
- Group all nodes into logical swimlane containers (Client, Edge & CDN, Frontend App, API/Backend, Data Layer, Platform Services, External APIs).
- Edges show real data flows with protocol labels (HTTPS, REST, SQL, WebSocket, gRPC, JWT, OAuth, Webhook, SDK call).
- Include ALL services mentioned or implied by the context map (auth, database, email, payments, AI, observability, etc.).

Output ONLY the JSON diagram topology. No explanation.`;

    const topologyRaw = await generateTextWithRotation(
      DIAGRAM_TOPOLOGY_SYSTEM_PROMPT,
      topologyPrompt
    );
    const cleanTopologyText = topologyRaw
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');

    graph = JSON.parse(cleanTopologyText);
  }

  if (!graph.nodes || !Array.isArray(graph.nodes)) {
    throw new Error('Invalid topology returned: missing nodes array');
  }

  // ─── PASS 2: METADATA HYDRATION ───
  console.log(
    `[DiagramGenerator] Starting PASS 2: Metadata Hydration for blueprint ${blueprintId}`
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodesToHydrate = graph.nodes.filter((node: any) => {
    // Skip group containers and libCluster nodes (no pricing metadata needed)
    if (node.type === 'group' || node.type === 'libCluster' || node.data?.category === 'group') {
      return false;
    }
    if (isIncremental) {
      return !node.data?.why || !node.data?.free_tier;
    }
    return true;
  });

  if (nodesToHydrate.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedNodes = nodesToHydrate.map((n: any) => ({
      id: n.id,
      label: n.data?.label,
      category: n.data?.category,
    }));

    const hydrationPrompt = `Hydrate metadata for these infrastructure nodes in a system architecture.

Context Map:
${contextMapString}

Architecture Recommendation History (last 4 messages):
${JSON.stringify(blueprint.chatHistory?.slice(-4) ?? [], null, 2)}

Infrastructure nodes to hydrate:
${JSON.stringify(mappedNodes, null, 2)}

Output ONLY the JSON metadata map. No explanation.`;

    try {
      const hydrationRaw = await generateTextWithRotation(
        DIAGRAM_HYDRATION_SYSTEM_PROMPT,
        hydrationPrompt
      );
      const cleanHydrationText = hydrationRaw
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');

      const hydrationMap = JSON.parse(cleanHydrationText);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      graph.nodes = graph.nodes.map((node: any) => {
        if (
          node.type === 'group' ||
          node.type === 'libCluster' ||
          node.data?.category === 'group'
        ) {
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
      console.log(
        `[DiagramGenerator] Successfully completed PASS 2 Hydration for blueprint ${blueprintId}`
      );
    } catch (hydrationError) {
      console.warn(
        `[DiagramGenerator] Pass 2 Hydration failed, using raw topology:`,
        hydrationError
      );
    }
  } else {
    console.log(`[DiagramGenerator] Skipping PASS 2 Hydration (all nodes already have metadata).`);
  }

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
