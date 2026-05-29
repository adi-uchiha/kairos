import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { geminiRegistry } from './registry';
import { DIAGRAM_MODEL } from './config';
import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { eq } from 'drizzle-orm';

const DIAGRAM_SYSTEM_PROMPT = `You are a system architecture layout designer. Your job is to output a structured JSON graph representing a system architecture.
You must return a list of nodes and edges matching the exact ReactFlow-compatible schema below.

AVAILBLE NODE CATEGORIES:
- user: "End Users", "Mobile App", external client/persona nodes
- frontend: React, Next.js, Svelte, SolidJS, Qwik, Astro
- cdn: Cloudflare CDN, CloudFront, Fastly
- hosting: Vercel, Netlify, Railway, Render, Fly.io
- gateway: API Gateway, Kong, nginx, Traefik, Caddy
- backend: Generic backend server
- runtime: Execution engine: Bun, Node.js, Deno, Go, Rust, Python
- framework: Hono, Express, Fastify, Gin, Axum, Fiber, FastAPI, Django
- library: Zod, TanStack Query, tRPC, SWR, React Query — client/server middleware/utility
- database: PostgreSQL, MySQL, MongoDB, SQLite, CockroachDB
- cache: Redis, Memcached, Upstash
- orm: Drizzle, Prisma, TypeORM, SQLAlchemy, GORM
- search: Algolia, Typesense, Meilisearch, OpenSearch
- storage: S3, R2, GCS, Cloudinary, uploadthing
- auth: Better Auth, NextAuth, Clerk, Supabase Auth, Lucia
- oauth: Google OAuth, GitHub OAuth, Discord OAuth (external identity providers)
- email: Resend, Mailgun, SendGrid, SES, Postmark
- payment: Stripe, LemonSqueezy, Paddle
- queue: BullMQ, SQS, RabbitMQ, Kafka, Inngest
- ai: OpenAI, Anthropic, Gemini, Replicate, Hugging Face
- observability: Sentry, PostHog, Datadog, Grafana, Prometheus, Logtail
- container: Docker, Kubernetes, ECS, Cloud Run
- ci: GitHub Actions, CircleCI, Buildkite
- group: Dashed-border structural container box (not a service)

CATEGORY CONNECTIONS & DISAMBIGUATION:
1. A 'runtime' node (Bun, Go) is NOT the same as a 'framework' node (Hono, Express). Show both if relevant: Bun (runtime) -> Hono (framework).
2. 'library' nodes (Zod, TanStack Query, tRPC) bridge client and server. They represent shared data models, validation, or fetching. They do NOT connect to databases directly.
3. 'orm' nodes (Drizzle, Prisma) sit between backend/framework and database. They are a separate layer. e.g. Hono -> Drizzle -> PostgreSQL.
4. 'auth' nodes handle sessions. 'oauth' nodes are external identity providers. Connect: user -> oauth -> auth -> backend.
5. 'group' nodes create visual boundaries. Use them for logical layers (e.g. "Frontend Edge", "Auth Stack", "Backend Stack", "Data Tier").
   - A group node has type: "group" and data.category: "group". Its data.label is its title. Its data.why, data.free_tier, etc. are empty strings.
   - Child nodes placed inside a group MUST have:
     * "parentId": parent_group_id
     * "extent": "parent"
     * "position": relative local coordinates inside the parent's container box (e.g., x: 40, y: 60), NOT global coordinates.
   - Group nodes must have style: { "width": number, "height": number } to properly contain children.

HORIZONTAL SWIMLANE COLUMNS (x coordinates for left-to-right flow):
- Col 1 (x = 100): user / external clients
- Col 2 (x = 300): cdn / hosting / gateway
- Col 3 (x = 500): frontend / auth
- Col 4 (x = 700): backend / runtime / framework
- Col 5 (x = 900): library / orm / queue / cache
- Col 6 (x = 1100): database / storage / search
- Col 7 (x = 1300): observability / email / payment / ai (external cloud services)

Within each column, space nodes out vertically (y coordinates) spaced 160px apart (e.g., y = 100, 260, 420, etc.) to avoid any overlap.

JSON Output Schema:
{
  "nodes": [
    {
      "id": "string (unique key, e.g. hono, postgres)",
      "type": "string ('customNode' or 'group')",
      "parentId": "string (optional parent group id)",
      "extent": "string (optional, set to 'parent' if parentId is defined)",
      "position": { "x": number, "y": number },
      "style": { "width": number, "height": number } (required for group nodes, omit for customNode),
      "data": {
        "label": "string (display name, e.g. Hono, PostgreSQL, AWS Lambda)",
        "category": "string (one of the categories above)",
        "why": "string (1-2 sentences of engineering justification)",
        "free_tier": "string (pricing free tier description)",
        "cost_at_scale": "string (upgrade cost explanation)",
        "upgrade_signal": "string (limit details)",
        "alternatives": ["alternative1", "alternative2"]
      }
    }
  ],
  "edges": [
    {
      "id": "string (unique edge key, e.g. e-hono-postgres)",
      "source": "node_id",
      "target": "node_id",
      "label": "string (connection type, e.g. SQL, gRPC, OAuth)",
      "animated": boolean,
      "data": {
        "description": "string (1 sentence context on what flows)"
      }
    }
  ]
}

Only return clean, valid JSON matching the schema. No markdown formatting except the JSON block. Ensure all nodes are connected logically and edges flow left-to-right.`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateDiagramForBlueprint(blueprintId: string): Promise<any> {
  const result = await db.select().from(blueprints).where(eq(blueprints.id, blueprintId)).limit(1);

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

  const rawText = response.text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  const graph = JSON.parse(rawText);

  // Save the generated graph to the database
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
