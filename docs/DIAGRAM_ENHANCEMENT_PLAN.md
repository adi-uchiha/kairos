# Kairos Diagram Enhancement Plan

## Architecture Diagram v2 — Quality Implementation Roadmap

> **Status:** Planning
> **Scope:** Visual, structural, and AI-intelligence improvements to the Kairos architecture diagram.
> **Goal:** Transform the current basic flowchart into a production-quality, icon-rich, spatially-aware system architecture canvas — comparable to AWS Architecture Center diagrams, Excalidraw, or Miro professional templates.

---

## Table of Contents

1. [Overview & Guiding Principles](#1-overview--guiding-principles)
2. [Priority 1 — Compact Icon-First Node Design](#2-priority-1--compact-icon-first-node-design)
3. [Priority 2 — Icon Registry (Devicons + Simple Icons)](#3-priority-2--icon-registry)
4. [Priority 3 — Dagre Auto-Layout Engine](#4-priority-3--dagre-auto-layout-engine)
5. [Priority 4 — Group & Container Nodes](#5-priority-4--group--container-nodes)
6. [Priority 5 — Expanded AI Prompt Coverage](#6-priority-5--expanded-ai-prompt-coverage)
7. [Priority 6 — AWS & GCP Official Icon Packs](#7-priority-6--aws--gcp-official-icon-packs)
8. [File Change Map](#8-file-change-map)
9. [Dependency Matrix](#9-dependency-matrix)

---

## 1. Overview & Guiding Principles

### What We Are Building

The current diagram renders as a vertical chain of text boxes. The target is a **professional system architecture canvas** with:

- **Icon-first compact nodes** — icon prominent, label short, no body text on the node
- **Horizontal swimlane layout** — left-to-right flow using the Dagre graph algorithm
- **Grouped container nodes** — VPC boundaries, service layers, regions rendered as dashed boxes
- **Rich icon coverage** — every common tech tool, SaaS product, and cloud service has a branded icon
- **Expanded AI understanding** — backend runtimes, ORMs, libraries, OAuth, queues, gateways all modelled

### Guiding Principles

| Principle             | Implication                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| **Modular**           | Each concern lives in its own file. No monolithic components.                                     |
| **Additive**          | New node types/icons extend a registry — no conditionals scattered across the codebase            |
| **AI-driven**         | The diagram output schema is the contract. Better prompt → better diagram. No hardcoding layouts. |
| **Zero runtime cost** | Icons load from CDN or `/public` static assets. No icon library bloat in the JS bundle.           |
| **Maintainable**      | The icon registry is a plain data file. A non-engineer could add a new tool by editing one line.  |

### Architecture Decision: Icon Source Strategy

We use **three distinct icon sources** with a unified resolver:

```
Tool label → lib/icon-registry.ts → resolves to one of:
  ├── Devicons CDN     (dev tools: Next.js, Bun, Go, Rust, Postgres...)
  ├── Simple Icons CDN (SaaS/brands: Vercel, Resend, Stripe, Cloudflare...)
  └── /public/icons/   (cloud providers: AWS services, GCP services, Azure)
```

A single `getIconUrl(label: string): string | null` function is the only public API. The rest of the codebase never directly constructs an icon URL.

---

## 2. Priority 1 — Compact Icon-First Node Design

### Problem

The current `ServiceNode` displays `label`, `category`, `why`, `free_tier`, `cost_at_scale` all on the canvas node itself. This causes:

- Nodes that are 300-400px wide
- Horizontal diagram overflow
- Visual noise — users cannot scan the topology at a glance

### Target Design

```
+----------------+
|   [  ICON  ]   |   <- 44x44 icon, centered
|   Next.js      |   <- bold 13px label, truncated if long
|  . frontend    |   <- 9px monospaced category, accent color dot
+----------------+
      width: 160px fixed
```

**Node width:** fixed `160px`
**Node height:** fixed `~100px` (auto)
**Information on canvas:** icon + name + category only
**Information on click:** full detail drawer (why, cost, free_tier, upgrade_signal, alternatives, Q&A)

### Implementation

#### 2.1 New `ServiceNode.tsx` structure

**File:** `components/workspace/ServiceNode.tsx`

The component responsibilities:

1. Look up icon URL via `getIconUrl(data.label)` from the icon registry
2. Render icon as `<img>` with an `onError` fallback to a `LetterAvatar`
3. Fixed-width 160px card with centered content layout
4. Category accent color applied only as a top 3px bar (subtle)
5. Category shown as lowercase mono pill beneath the label

```tsx
// Pseudocode outline — implemented after icon registry in Priority 2

function ServiceNode({ data }: NodeProps<Node<ServiceNodeData>>) {
  const iconUrl = getIconUrl(data.label); // from lib/icon-registry.ts
  const color = getCategoryColor(data.category); // local helper

  return (
    <div style={{ width: 160, background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Handle type="target" position={Position.Left} />

      {/* Top accent bar */}
      <div style={{ height: 3, background: color }} />

      {/* Icon area */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={data.label}
            width={40}
            height={40}
            style={{ objectFit: 'contain' }}
            onError={(e) => {
              /* swap to LetterAvatar */
            }}
          />
        ) : (
          <LetterAvatar label={data.label} color={color} />
        )}
      </div>

      {/* Label — truncated */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 600,
          padding: '0 8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {data.label}
      </div>

      {/* Category pill */}
      <div style={{ textAlign: 'center', padding: '4px 0 10px' }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {data.category}
        </span>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
```

#### 2.2 LetterAvatar fallback component

When no icon is resolved, render a colored circle with the first character of the label:

```tsx
// Internal to ServiceNode.tsx
function LetterAvatar({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: color + '22', // 13% opacity accent fill
        border: `1.5px solid ${color}44`, // 26% opacity border
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 700,
        color,
      }}
    >
      {label[0]?.toUpperCase() ?? '?'}
    </div>
  );
}
```

#### 2.3 Handle direction change for LR layout

Since Dagre will use `rankdir: 'LR'` (horizontal flow), handles must move:

| Before (TB layout)        | After (LR layout)        |
| ------------------------- | ------------------------ |
| Target: `Position.Top`    | Target: `Position.Left`  |
| Source: `Position.Bottom` | Source: `Position.Right` |

This is a **two-line change** in `ServiceNode.tsx`.

#### 2.4 GroupNode component

Add a second renderer for `type: 'group'` — a transparent dashed-border container node.
ReactFlow renders children inside the parent's coordinate space automatically.

```tsx
// components/workspace/ServiceNode.tsx (exported alongside ServiceNode)
export function GroupNode({ data }: NodeProps<Node<ServiceNodeData>>) {
  return (
    <div
      style={{
        border: '1.5px dashed var(--border)',
        borderRadius: 6,
        background: 'rgba(255,255,255,0.02)',
        minWidth: 200,
        minHeight: 100,
        padding: '8px 12px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {data.label}
      </div>
      {/* ReactFlow positions children inside this container automatically */}
    </div>
  );
}
```

#### 2.5 NODE_TYPES registration update

**File:** `components/workspace/DiagramCanvas.tsx`

```ts
// Stable reference outside component body (never recreated)
const NODE_TYPES = {
  customNode: ServiceNode, // tech service card
  group: GroupNode, // dashed boundary container
};
```

### Acceptance Criteria

- [ ] All nodes render at exactly `160px` width with no overflow
- [ ] Icon renders for at least 20 common tools after Priority 2
- [ ] `LetterAvatar` renders gracefully for every unrecognized tool name
- [ ] Clicking any node still opens the full detail drawer (no regression)
- [ ] Handles are on Left/Right sides (compatible with LR Dagre layout)
- [ ] `GroupNode` renders as a visible dashed container

---

## 3. Priority 2 — Icon Registry

### Problem

There is no mapping between a node's `label` (e.g. `"Next.js"`, `"Amazon S3"`, `"Resend"`) and a displayable icon. The icon source strategy is also fragmented — dev tools live in Devicons CDN, SaaS brands in Simple Icons, and cloud providers need local static assets.

### Architecture

#### 3.1 New file: `lib/icon-registry.ts`

This file is the **only** place in the entire codebase that knows about icon sources and URL patterns. All other code calls `getIconUrl()`.

```
lib/
  icon-registry.ts   ← new — icon map + resolver function
```

#### 3.2 Registry data structure

```ts
// lib/icon-registry.ts

type IconSource = 'devicon' | 'simpleicons' | 'local';

interface IconEntry {
  source: IconSource;
  // For devicon: the devicon slug (e.g. 'nextjs', 'bun')
  // For simpleicons: the simpleicons slug (e.g. 'vercel', 'stripe')
  // For local: path relative to /public (e.g. '/icons/aws/lambda.svg')
  slug: string;
  // Optionally override the variant (devicon only): 'original' | 'plain' | 'line'
  variant?: string;
}

const ICON_REGISTRY: Record<string, IconEntry> = { ... };
```

#### 3.3 URL builder

```ts
const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

function buildIconUrl(entry: IconEntry): string {
  switch (entry.source) {
    case 'devicon':
      const variant = entry.variant ?? 'original';
      return `${DEVICON_BASE}/${entry.slug}/${entry.slug}-${variant}.svg`;

    case 'simpleicons':
      return `https://cdn.simpleicons.org/${entry.slug}`;

    case 'local':
      return entry.slug; // already a full /public path
  }
}
```

#### 3.4 Resolver with alias support

The resolver does **case-insensitive fuzzy matching** so `"nextjs"`, `"Next.js"`, and `"Next JS"` all resolve to the same entry:

```ts
// Normalize: lowercase, strip dots/spaces/hyphens
function normalize(label: string): string {
  return label.toLowerCase().replace(/[\s.\-_]/g, '');
}

// Build a lookup map at module load time (not on every call)
const LOOKUP = new Map<string, IconEntry>();
for (const [key, entry] of Object.entries(ICON_REGISTRY)) {
  LOOKUP.set(normalize(key), entry);
}

export function getIconUrl(label: string): string | null {
  const entry = LOOKUP.get(normalize(label));
  return entry ? buildIconUrl(entry) : null;
}
```

#### 3.5 Full initial registry mapping

**Dev tools (Devicons CDN)**

| Label           | Devicon slug    | Variant                |
| --------------- | --------------- | ---------------------- |
| `Next.js`       | `nextjs`        | `original`             |
| `React`         | `react`         | `original`             |
| `Vue`           | `vuejs`         | `original`             |
| `Svelte`        | `svelte`        | `original`             |
| `Bun`           | `bun`           | `original`             |
| `Node.js`       | `nodejs`        | `original`             |
| `Deno`          | `denojs`        | `original`             |
| `Go`            | `go`            | `original`             |
| `Rust`          | `rust`          | `original`             |
| `Python`        | `python`        | `original`             |
| `TypeScript`    | `typescript`    | `original`             |
| `JavaScript`    | `javascript`    | `original`             |
| `PostgreSQL`    | `postgresql`    | `original`             |
| `MySQL`         | `mysql`         | `original`             |
| `MongoDB`       | `mongodb`       | `original`             |
| `Redis`         | `redis`         | `original`             |
| `SQLite`        | `sqlite`        | `original`             |
| `Docker`        | `docker`        | `original`             |
| `Kubernetes`    | `kubernetes`    | `original`             |
| `Nginx`         | `nginx`         | `original`             |
| `GraphQL`       | `graphql`       | `plain`                |
| `Prisma`        | `prisma`        | `original`             |
| `Vite`          | `vitejs`        | `original`             |
| `Tailwind CSS`  | `tailwindcss`   | `original`             |
| `Hono`          | `hono`          | `original`             |
| `Fastify`       | `fastify`       | `original`             |
| `Express`       | `express`       | `original`             |
| `Elysia`        | —               | simpleicons: `elysia`  |
| `tRPC`          | —               | simpleicons: `trpc`    |
| `Zod`           | —               | simpleicons: `zod`     |
| `Drizzle`       | —               | simpleicons: `drizzle` |
| `Kafka`         | `apachekafka`   | `original`             |
| `Elasticsearch` | `elasticsearch` | `original`             |

**SaaS & cloud brands (Simple Icons CDN)**

| Label                | Simple Icons slug          |
| -------------------- | -------------------------- |
| `Vercel`             | `vercel`                   |
| `Cloudflare`         | `cloudflare`               |
| `Cloudflare Workers` | `cloudflare`               |
| `Cloudflare R2`      | `cloudflare`               |
| `Neon`               | `neon`                     |
| `PlanetScale`        | `planetscale`              |
| `Supabase`           | `supabase`                 |
| `Turso`              | `turso`                    |
| `Upstash`            | `upstash`                  |
| `Stripe`             | `stripe`                   |
| `Resend`             | `resend`                   |
| `Mailgun`            | `mailgun`                  |
| `SendGrid`           | `twilio`                   |
| `Twilio`             | `twilio`                   |
| `GitHub OAuth`       | `github`                   |
| `Google OAuth`       | `google`                   |
| `Clerk`              | `clerk`                    |
| `Auth0`              | `auth0`                    |
| `Better Auth`        | — (letter avatar fallback) |
| `PostHog`            | `posthog`                  |
| `Sentry`             | `sentry`                   |
| `Datadog`            | `datadog`                  |
| `Grafana`            | `grafana`                  |
| `Prometheus`         | `prometheus`               |
| `Railway`            | `railway`                  |
| `Fly.io`             | `flyio`                    |
| `Render`             | `render`                   |
| `Heroku`             | `heroku`                   |
| `Planetscale`        | `planetscale`              |
| `Algolia`            | `algolia`                  |
| `Typesense`          | — (letter avatar)          |
| `OpenAI`             | `openai`                   |
| `Anthropic`          | `anthropic`                |

**Cloud provider services (local `/public/icons/`)**

These come from the official AWS and GCP icon packs (Priority 6). Until that pack is downloaded, they fall back to `LetterAvatar`.

| Label                | Local path                    |
| -------------------- | ----------------------------- |
| `AWS Lambda`         | `/icons/aws/lambda.svg`       |
| `Amazon S3`          | `/icons/aws/s3.svg`           |
| `Amazon RDS`         | `/icons/aws/rds.svg`          |
| `Amazon DynamoDB`    | `/icons/aws/dynamodb.svg`     |
| `Amazon SQS`         | `/icons/aws/sqs.svg`          |
| `Amazon SES`         | `/icons/aws/ses.svg`          |
| `Amazon EC2`         | `/icons/aws/ec2.svg`          |
| `Amazon ECS`         | `/icons/aws/ecs.svg`          |
| `Amazon CloudFront`  | `/icons/aws/cloudfront.svg`   |
| `Amazon API Gateway` | `/icons/aws/apigateway.svg`   |
| `Amazon Cognito`     | `/icons/aws/cognito.svg`      |
| `Amazon Route 53`    | `/icons/aws/route53.svg`      |
| `Amazon ElastiCache` | `/icons/aws/elasticache.svg`  |
| `Amazon EventBridge` | `/icons/aws/eventbridge.svg`  |
| `GCP Cloud Run`      | `/icons/gcp/cloudrun.svg`     |
| `GCP BigQuery`       | `/icons/gcp/bigquery.svg`     |
| `GCP Pub/Sub`        | `/icons/gcp/pubsub.svg`       |
| `GCP Cloud Storage`  | `/icons/gcp/cloudstorage.svg` |
| `GCP Firebase`       | `/icons/gcp/firebase.svg`     |
| `GCP Firestore`      | `/icons/gcp/firestore.svg`    |

#### 3.6 Testing the resolver

A simple unit test file (no test framework needed — just a script) to verify the registry:

```ts
// scripts/test-icon-registry.ts
import { getIconUrl } from '../lib/icon-registry';

const SPOT_CHECK = [
  'Next.js',
  'Bun',
  'Go',
  'Rust',
  'PostgreSQL',
  'Redis',
  'Vercel',
  'Stripe',
  'Resend',
  'Supabase',
  'AWS Lambda',
  'Amazon S3',
];

for (const label of SPOT_CHECK) {
  const url = getIconUrl(label);
  console.log(url ? `✓ ${label} → ${url}` : `✗ ${label} → no icon (fallback)`);
}
```

Run with: `bun run scripts/test-icon-registry.ts`

### Acceptance Criteria

- [ ] `getIconUrl('Next.js')` returns a valid Devicons CDN URL
- [ ] `getIconUrl('NEXT.JS')` returns the same URL (case-insensitive)
- [ ] `getIconUrl('Vercel')` returns a valid Simple Icons CDN URL
- [ ] `getIconUrl('AWS Lambda')` returns `/icons/aws/lambda.svg`
- [ ] `getIconUrl('UnknownTool123')` returns `null` (no crash)
- [ ] The resolver adds zero dependencies to the JS bundle (no `import` of a CDN library)
- [ ] Adding a new tool requires **exactly one line** change to `ICON_REGISTRY`

---

## 4. Priority 3 — Dagre Auto-Layout Engine

### Problem

The current diagram layout comes entirely from AI-generated `position: {x, y}` coordinates. The AI does not reliably produce a clean horizontal swimlane layout. Nodes overlap, edges cross unnecessarily, and the result looks like a vertical flowchart rather than a spatial architecture diagram.

### Solution

Run **Dagre** (directed acyclic graph layout) on the graph **client-side** every time the diagram loads or updates. Dagre computes optimal node positions automatically, producing the clean horizontal-flow look seen in AWS and GCP architecture diagrams.

**Package:** `@dagrejs/dagre` — ~85KB, tree-shakeable, no native dependencies.

```bash
bun add @dagrejs/dagre
bun add -d @types/dagrejs__dagre
```

### Architecture

#### 4.1 New file: `lib/diagram-layout.ts`

This file owns all layout logic. It is a pure function — takes nodes and edges, returns repositioned nodes and edges. Zero UI dependencies.

```
lib/
  diagram-layout.ts   ← new — Dagre layout runner
```

#### 4.2 Core layout function

```ts
// lib/diagram-layout.ts
import Dagre from '@dagrejs/dagre';
import { type Node, type Edge } from '@xyflow/react';
import { type ServiceNodeData } from '@/types/blueprint';

const NODE_WIDTH = 160; // matches ServiceNode fixed width
const NODE_HEIGHT = 100; // matches ServiceNode approximate height

export interface LayoutOptions {
  direction?: 'LR' | 'TB' | 'RL' | 'BT'; // LR = left-to-right (default)
  nodeSep?: number; // horizontal gap between nodes in same rank
  rankSep?: number; // vertical gap between rank levels (swimlane depth)
  edgeSep?: number; // gap between edges
}

export function applyDagreLayout(
  nodes: Node<ServiceNodeData>[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node<ServiceNodeData>[]; edges: Edge[] } {
  const { direction = 'LR', nodeSep = 60, rankSep = 120, edgeSep = 20 } = options;

  // 1. Build Dagre graph
  const g = new Dagre.graphlib.Graph()
    .setDefaultEdgeLabel(() => ({}))
    .setGraph({ rankdir: direction, nodesep: nodeSep, ranksep: rankSep, edgesep: edgeSep });

  // 2. Register nodes (skip group containers — their children define positions)
  for (const node of nodes) {
    if (node.type === 'group') continue; // groups are sized by children
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  // 3. Register edges (skip edges to/from group nodes)
  for (const edge of edges) {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  }

  // 4. Run layout algorithm
  Dagre.layout(g);

  // 5. Map computed positions back to ReactFlow nodes
  const layoutedNodes = nodes.map((node) => {
    if (node.type === 'group') return node; // groups keep AI-generated size/position
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
```

#### 4.3 Where layout is triggered

Layout runs in **two places**:

**A. When diagram graph loads from DB (initial mount)**

In `useBlueprintPolling.ts` — after formatting raw nodes from the API, pass through `applyDagreLayout()` before calling `setNodes`.

```ts
// hooks/useBlueprintPolling.ts
import { applyDagreLayout } from '@/lib/diagram-layout';

// Inside the polling callback when diagramGraph arrives:
const raw = data.diagramGraph.nodes.map(formatDiagramNode);
const { nodes: laid } = applyDagreLayout(raw, data.diagramGraph.edges ?? []);
callbacks.onDiagramUpdate(laid, data.diagramGraph.edges ?? []);
```

**B. When diagram is freshly generated**

In `client-page.tsx` `handleGenerateDiagram()` — same pattern, apply layout before `setNodes`.

```ts
// app/app/client-page.tsx
import { applyDagreLayout } from '@/lib/diagram-layout';

const formatted = data.graph.nodes.map(formatDiagramNode);
const { nodes: laid, edges: laidEdges } = applyDagreLayout(formatted, data.graph.edges ?? []);
setNodes(laid);
setEdges(laidEdges);
```

#### 4.4 Layout direction toggle (UI)

Add a `[ LR | TB ]` toggle button to the diagram toolbar in `DiagramCanvas.tsx`. This lets the user switch between left-to-right (architecture style) and top-to-bottom (flowchart style) on demand.

```tsx
// Inside DiagramCanvas.tsx, in the layer filter toolbar area:
<div className="flex bg-[var(--surface)] border border-[var(--border)] p-0.5">
  {(['LR', 'TB'] as const).map((dir) => (
    <button
      key={dir}
      onClick={() => onLayoutChange(dir)} // new prop
      className={
        layoutDirection === dir
          ? 'bg-[#FF5500] text-white px-2 py-1 text-[10px] font-mono'
          : 'text-[var(--text-muted)] px-2 py-1 text-[10px] font-mono hover:bg-[var(--surface-hover)]'
      }
    >
      {dir === 'LR' ? '→ Horizontal' : '↓ Vertical'}
    </button>
  ))}
</div>
```

When toggled, call `applyDagreLayout(nodes, edges, { direction })` and update ReactFlow state with the result.

#### 4.5 Group node position handling

Group container nodes (`type: 'group'`) are **excluded from Dagre** because:

- Dagre handles flat graphs, not hierarchical subflows
- Group size and position should come from the AI's output or be user-resizable
- Child nodes inside groups get their positions computed by Dagre separately (as if the group doesn't exist), then `parentId` is set post-layout

The group positioning algorithm after Dagre runs:

1. Find all group nodes (type === 'group')
2. Find their children (nodes where `parentId === group.id`)
3. Compute bounding box of children
4. Set group `position` and `style.width`/`style.height` to wrap children with padding

```ts
// In lib/diagram-layout.ts, additional export:
export function fitGroupsToChildren(nodes: Node<ServiceNodeData>[]): Node<ServiceNodeData>[] {
  const PADDING = 24;
  const groups = nodes.filter((n) => n.type === 'group');

  return nodes.map((node) => {
    if (node.type !== 'group') return node;

    const children = nodes.filter((n) => n.parentId === node.id);
    if (children.length === 0) return node;

    const minX = Math.min(...children.map((c) => c.position.x));
    const minY = Math.min(...children.map((c) => c.position.y));
    const maxX = Math.max(...children.map((c) => c.position.x + NODE_WIDTH));
    const maxY = Math.max(...children.map((c) => c.position.y + NODE_HEIGHT));

    return {
      ...node,
      position: { x: minX - PADDING, y: minY - PADDING },
      style: {
        ...node.style,
        width: maxX - minX + PADDING * 2,
        height: maxY - minY + PADDING * 2,
      },
    };
  });
}
```

### Acceptance Criteria

- [ ] After diagram loads, all nodes are positioned with no overlap
- [ ] Default layout direction is left-to-right (horizontal flow)
- [ ] Layout toggle button switches between `LR` and `TB` without page reload
- [ ] Group container nodes auto-size to wrap their children after layout
- [ ] Edges route cleanly with no excessive crossing
- [ ] Layout runs in < 50ms for graphs up to 50 nodes
- [ ] No `@dagrejs/dagre` import reaches the browser before the diagram tab is opened (lazy load if needed)

---

## 5. Priority 4 — Group & Container Nodes

### Problem

Real architecture diagrams group related services into logical boundaries: a VPC contains EC2 + RDS; a "Auth Layer" groups Clerk + OAuth; a "CDN Edge" groups Cloudflare + CDN nodes. The current diagram has no concept of spatial grouping — every node floats independently.

### ReactFlow Subflow Support

ReactFlow has native first-class support for parent-child node relationships via:

```ts
interface Node {
  id: string;
  parentId?: string;    // optional — makes this node a child of another
  extent?: 'parent';   // constrains dragging within parent bounds
  ...
}
```

A node with `type: 'group'` renders as a container. Child nodes positioned inside a group use coordinates **relative to the parent**, so the group can be moved and all children move with it.

### Schema Changes

#### 5.1 AI output schema update

The `DIAGRAM_SYSTEM_PROMPT` must be updated to output the extended node schema:

```json
{
  "nodes": [
    {
      "id": "group-backend",
      "type": "group",
      "position": { "x": 400, "y": 100 },
      "data": {
        "label": "Backend Layer",
        "category": "group",
        "why": "",
        "free_tier": "",
        "cost_at_scale": ""
      },
      "style": { "width": 400, "height": 250 }
    },
    {
      "id": "hono",
      "type": "customNode",
      "parentId": "group-backend",
      "extent": "parent",
      "position": { "x": 40, "y": 60 },
      "data": {
        "label": "Hono",
        "category": "framework",
        "why": "Lightweight, edge-first API framework for Bun/Cloudflare Workers.",
        "free_tier": "Serverless pricing — free at low usage",
        "cost_at_scale": "$0.50 per million requests on CF Workers",
        "alternatives": ["Express", "Fastify", "Axum"]
      }
    }
  ]
}
```

#### 5.2 Type system update

**File:** `types/blueprint.ts` — extend `RawDiagramNode` to include parent/group fields:

```ts
export interface RawDiagramNode {
  id: string;
  type?: string; // 'customNode' | 'group' (AI outputs this)
  position?: { x: number; y: number };
  parentId?: string; // new — for child nodes inside groups
  extent?: 'parent'; // new — constrains dragging to parent bounds
  style?: {
    // new — used by group nodes for width/height
    width?: number;
    height?: number;
  };
  data: ServiceNodeData;
}
```

#### 5.3 `formatDiagramNode` update

**File:** `app/app/client-page.tsx` — the helper that converts raw DB data to ReactFlow nodes must pass through the new fields:

```ts
function formatDiagramNode(node: RawDiagramNode): Node<ServiceNodeData> {
  return {
    id: node.id,
    type: node.type ?? 'customNode', // default to customNode
    position: node.position ?? { x: 0, y: 0 },
    parentId: node.parentId, // pass through if present
    extent: node.extent, // pass through if present
    style: node.style, // pass through if present (group dimensions)
    data: node.data,
  };
}
```

#### 5.4 NodeData for group type

The `ServiceNodeData` interface already works for group nodes since it extends `Record<string, unknown>`. The group node's `data.label` is its display name (e.g. `"Backend Layer"`), and other fields are empty strings.

The `GroupNode` component (from Priority 1) only renders `data.label` — it ignores `why`, `free_tier`, etc. This is correct behavior.

#### 5.5 Clicking a group node

Group nodes should NOT open the detail drawer when clicked (they have no service details). Add a guard in the `onNodeClick` handler in `client-page.tsx`:

```ts
// client-page.tsx
onNodeClick={(_e, node) => {
  if (node.type === 'group') return; // groups are not clickable for detail
  setSelectedNode(node as Node<ServiceNodeData>);
}}
```

#### 5.6 Layer filter compatibility

The layer filter in `DiagramCanvas.tsx` filters nodes by `data.category`. Group nodes should always be shown if any of their children are visible:

```ts
// In DiagramCanvas.tsx filteredNodes memo:
const filteredNodes = useMemo(() => {
  if (selectedLayer === 'all') return nodes;

  const matchingIds = new Set(
    nodes
      .filter((n) => n.type !== 'group' && matchesLayer(n.data.category, selectedLayer))
      .map((n) => n.id)
  );

  // Include group nodes if any child is visible
  return nodes.filter((n) => {
    if (n.type === 'group') {
      return nodes.some((child) => child.parentId === n.id && matchingIds.has(child.id));
    }
    return matchingIds.has(n.id);
  });
}, [nodes, selectedLayer]);
```

#### 5.7 Group colors

Different group types get different dashed border colors to visually distinguish layers:

```ts
// In GroupNode component
function getGroupColor(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('backend') || l.includes('api')) return '#ff5500';
  if (l.includes('frontend') || l.includes('cdn')) return '#0070f3';
  if (l.includes('database') || l.includes('data')) return '#10b981';
  if (l.includes('auth')) return '#8b5cf6';
  if (l.includes('region') || l.includes('vpc')) return '#71717a';
  return 'var(--border)'; // default
}
```

### Acceptance Criteria

- [ ] Group nodes render as labeled dashed-border containers
- [ ] Child nodes are rendered spatially inside their parent group
- [ ] Dragging a group node moves all its children together (ReactFlow native)
- [ ] Clicking a group node does NOT open the service detail drawer
- [ ] Layer filter correctly shows/hides group containers based on their children's visibility
- [ ] AI-generated group nodes preserve `parentId` and `extent` through the format pipeline
- [ ] Groups have distinct border colors based on their label type

---

## 6. Priority 5 — Expanded AI Prompt Coverage

### Problem

The current AI system prompt for diagram generation (`lib/gemini/diagram-generator.ts`) only recognises 10 node categories:
`frontend | backend | database | auth | email | storage | hosting | observability | queue | cdn`

This misses:

- Backend runtimes: Bun, Node.js, Deno, Go, Rust
- Frameworks: Hono, Express, Fastify, Gin, Axum, Fiber
- Libraries: Zod, TanStack Query, tRPC, SWR
- ORMs: Drizzle, Prisma, TypeORM
- OAuth providers: Google, GitHub, Discord, Apple
- Payment: Stripe, LemonSqueezy, Paddle
- Search: Algolia, Typesense, OpenSearch
- AI/ML services: OpenAI, Anthropic, Replicate, Hugging Face
- API gateways: Kong, Traefik, nginx, AWS API Gateway

It also does not understand:

- Group container nodes (type: 'group')
- Library/middleware nodes that sit between frontend and backend
- Unconnected standalone nodes (legend items, external systems)

### Implementation

#### 6.1 Expanded category taxonomy

**File:** `types/blueprint.ts`

```ts
export type NodeCategory =
  // User-facing layers
  | 'user' // "End Users", "Mobile App", external persona nodes
  | 'frontend' // React, Next.js, Svelte, SolidJS, Qwik, Astro
  | 'cdn' // Cloudflare CDN, CloudFront, Fastly, Akamai
  | 'hosting' // Vercel, Netlify, Railway, Render, Fly.io

  // Backend
  | 'gateway' // API Gateway, Kong, nginx, Traefik, Caddy
  | 'backend' // Generic backend server
  | 'runtime' // The actual execution engine: Bun, Node.js, Deno
  | 'framework' // Hono, Express, Fastify, Gin, Axum, Fiber, Django, FastAPI
  | 'library' // Zod, TanStack, tRPC, SWR, React Query — middleware/utility

  // Data
  | 'database' // PostgreSQL, MySQL, MongoDB, SQLite, CockroachDB
  | 'cache' // Redis, Memcached, Upstash
  | 'orm' // Drizzle, Prisma, TypeORM, SQLAlchemy, GORM
  | 'search' // Algolia, Typesense, Meilisearch, OpenSearch
  | 'storage' // S3, R2, GCS, Cloudinary, uploadthing

  // Platform services
  | 'auth' // Better Auth, NextAuth, Clerk, Supabase Auth, Lucia
  | 'oauth' // Google OAuth, GitHub OAuth, Discord OAuth (identity providers)
  | 'email' // Resend, Mailgun, SendGrid, SES, Postmark
  | 'payment' // Stripe, LemonSqueezy, Paddle, Razorpay
  | 'queue' // BullMQ, SQS, RabbitMQ, Kafka, Inngest
  | 'ai' // OpenAI, Anthropic, Gemini, Replicate, Hugging Face
  | 'observability' // Sentry, PostHog, Datadog, Grafana, Prometheus, Logtail

  // Infrastructure
  | 'container' // Docker, Kubernetes, ECS, Cloud Run
  | 'ci' // GitHub Actions, CircleCI, Buildkite, Jenkins

  // Structural
  | 'group'; // Dashed-border container node — NOT a service
```

#### 6.2 Updated diagram system prompt

**File:** `lib/gemini/diagram-generator.ts` — replace `DIAGRAM_SYSTEM_PROMPT`:

The new prompt must communicate:

1. **All available categories** (the full taxonomy above)
2. **Group node schema** — how to create container boundaries
3. **Library/ORM nodes** — these float between layers without direct DB connections
4. **Runtime disambiguation** — "Node.js" is a `runtime`, "Express" is a `framework` running on Node.js
5. **Position hints** — x swimlane columns by concern (User → CDN → Gateway → Backend → Services → Data → External)
6. **Unconnected nodes** — external systems or legend boxes at the periphery are valid

Key new additions to the system prompt:

```
CATEGORY RULES:
- A 'runtime' node (Bun, Node.js, Go) is NOT the same as a 'framework' node.
  Show both if relevant: Bun (runtime) → Hono (framework).
- 'library' nodes (Zod, TanStack Query, tRPC) connect client → server and
  represent shared data contracts. They do NOT connect to databases.
- 'orm' nodes (Drizzle, Prisma) connect backend → database.
  They are a separate layer between 'framework' and 'database'.
- 'auth' nodes handle session/token logic. 'oauth' nodes are external
  identity providers (Google, GitHub). They connect: user → oauth → auth → backend.
- 'group' nodes create visual boundaries. Use them for:
    * Service layers (Backend Layer, Data Layer, CDN Edge)
    * Cloud regions (us-east-1, eu-west-1)
    * Infrastructure groups (VPC, Kubernetes Cluster)
  Group nodes have type: "group" and children set parentId to the group's id.

HORIZONTAL SWIMLANE COLUMNS (x positions for LR layout):
  Col 1 (x: ~100):   user / external systems
  Col 2 (x: ~300):   cdn / hosting / gateway
  Col 3 (x: ~500):   frontend / auth
  Col 4 (x: ~700):   backend / runtime / framework
  Col 5 (x: ~900):   library / orm / queue / cache
  Col 6 (x: ~1100):  database / storage / search
  Col 7 (x: ~1300):  observability / email / payment / ai (external services)

Space nodes vertically (y positions) within their column based on data flow order.
Nodes in the same column should be spaced 160px apart vertically.
```

#### 6.3 Q&A prompt expansion

**File:** `lib/gemini/prompts.ts` — the `PHASE_PROMPTS` for `recommendation` and `followup` phases need to explicitly mention the expanded categories so the AI considers them:

Add to the recommendation phase prompt context:

```
When analysing tech stacks, consider ALL layers:
- User-facing: web frameworks, mobile, PWA
- Runtime: Bun, Node.js, Deno, Go, Rust, Python — the execution engine
- Framework: Hono, Express, Fastify, Gin, Axum, Fiber, FastAPI, Django
- Schema/validation: Zod, Valibot, Yup
- Data fetching: TanStack Query, SWR, tRPC, GraphQL
- ORM/query builder: Drizzle, Prisma, TypeORM, Kysley, GORM, SQLAlchemy
- Auth strategy: Better Auth, NextAuth.js v5, Lucia, Clerk, Supabase Auth
- OAuth providers: Google, GitHub, Discord, Apple, Microsoft
- Queues & background jobs: BullMQ, Inngest, Trigger.dev, SQS, Kafka
- Email: Resend, Mailgun, SendGrid, SES, Postmark
- Payment: Stripe, LemonSqueezy, Paddle
- Search: Algolia, Typesense, Meilisearch, OpenSearch
- AI/ML: OpenAI, Anthropic, Google Gemini, Replicate, Vercel AI SDK
- Observability: Sentry, PostHog, Datadog, Grafana + Prometheus, Logtail, Axiom
```

#### 6.4 Context map field expansion

**File:** `types/blueprint.ts` — add new fields to `ContextMap` to track the richer information:

```ts
export interface ContextMap {
  // ... existing fields ...

  // New fields for richer context
  backend_runtime?: string | null; // 'node' | 'bun' | 'deno' | 'go' | 'rust' | 'python'
  backend_framework?: string | null; // 'hono' | 'express' | 'fastify' | 'gin' | 'axum'
  auth_strategy?: string | null; // 'jwt' | 'sessions' | 'oauth-only' | 'passkeys'
  auth_provider?: string | null; // 'better-auth' | 'clerk' | 'supabase' | 'nextauth'
  orm_preference?: string | null; // 'drizzle' | 'prisma' | 'raw-sql' | 'none'
  deployment_target?: string | null; // 'vercel' | 'aws' | 'gcp' | 'railway' | 'fly' | 'vps'
  needs_background_jobs?: boolean | null;
  needs_websockets?: boolean | null;
  needs_search?: boolean | null;
  needs_payments?: boolean | null;
  needs_email?: boolean | null;
  needs_ai_features?: boolean | null;
}
```

#### 6.5 Discovery phase prompt updates

The discovery conversation must now ask about:

- **Runtime preference** (new question in scale_discovery or builder_context phase)
- **Authentication approach** (does the app need OAuth? passkeys? magic links?)
- **Background processing** (cron jobs, webhooks, queues, workers?)
- **Third-party integrations** (payments, email, search, AI?)

These answers populate the new `ContextMap` fields above and feed into better diagram generation.

### Acceptance Criteria

- [ ] Diagram generator prompt outputs `framework` and `runtime` as separate nodes when both are relevant
- [ ] ORM layer is shown as a distinct node between framework and database nodes
- [ ] OAuth providers appear as `oauth` category nodes connecting to the auth service
- [ ] Library nodes (Zod, TanStack) render with correct category and icon
- [ ] Discovery conversation asks about backend runtime preference
- [ ] `ContextMap` stores `backend_runtime` and `auth_provider` from conversation
- [ ] Q&A assistant correctly references the runtime/framework split when answering scaling questions

---

## 7. Priority 6 — AWS & GCP Official Icon Packs

### Problem

AWS and GCP have hundreds of named services (Lambda, DynamoDB, Cloud Run, BigQuery…), each with an official, branded SVG icon that users instantly recognise. Devicons and Simple Icons only cover a small subset. Using letter avatars for `"AWS Lambda"` or `"Amazon S3"` on a professional architecture diagram is unacceptable.

### Solution: Download Once, Serve Statically

Both providers distribute free, official icon sets as zip archives. We download them once, extract the relevant SVGs, and put them in `/public/icons/`. Next.js serves these as static assets with zero bundle cost.

### Step-by-Step Setup

#### 7.1 Download sources

| Provider  | URL                                                   | Format           | Size   |
| --------- | ----------------------------------------------------- | ---------------- | ------ |
| **AWS**   | `aws.amazon.com/architecture/icons` → "Asset Package" | ZIP of SVG + PNG | ~180MB |
| **GCP**   | `cloud.google.com/icons` → "Google Cloud icons"       | ZIP of SVG       | ~50MB  |
| **Azure** | `azure.microsoft.com/en-us/patterns/icons`            | ZIP of SVG       | ~30MB  |

Download all three into a local folder, extract, and then run the setup script below.

#### 7.2 Setup script: `scripts/setup-cloud-icons.sh`

This script extracts and normalises icon filenames into a consistent `/public/icons/{provider}/` structure:

```bash
#!/usr/bin/env bash
# scripts/setup-cloud-icons.sh
# Run once after downloading the icon zips.
# Usage: bash scripts/setup-cloud-icons.sh

set -e

PUBLIC_ICONS="public/icons"
mkdir -p "$PUBLIC_ICONS/aws" "$PUBLIC_ICONS/gcp" "$PUBLIC_ICONS/azure"

echo "==> Extracting AWS icons..."
# AWS icons are nested: Architecture-Service-Icons/.../{ServiceName}/.../{Name}_64.svg
# We flatten to: public/icons/aws/{normalised-name}.svg

find ./downloads/aws -name "*_64.svg" | while read f; do
  # Extract base name, strip size suffix and whitespace
  base=$(basename "$f" | sed 's/_64\.svg$//' | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  # Remove "arch-" prefix that AWS uses
  clean=$(echo "$base" | sed 's/^arch-//')
  cp "$f" "$PUBLIC_ICONS/aws/${clean}.svg"
done

echo "==> Extracting GCP icons..."
# GCP icons: flat SVGs named like "cloud_run.svg", "bigquery.svg"
find ./downloads/gcp -name "*.svg" | while read f; do
  base=$(basename "$f" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  cp "$f" "$PUBLIC_ICONS/gcp/${base}"
done

echo "==> Done. Icons written to $PUBLIC_ICONS/"
echo "    Run: bun run scripts/audit-icon-registry.ts to check coverage."
```

#### 7.3 Icon registry update for cloud services

After running the setup script, update `lib/icon-registry.ts` with the correct filenames.
The naming convention after normalisation is: `{service-name}.svg` all lowercase with hyphens.

**AWS services added to registry (examples — full list in the file):**

```ts
// lib/icon-registry.ts
'AWS Lambda':            { source: 'local', slug: '/icons/aws/lambda.svg' },
'Amazon S3':             { source: 'local', slug: '/icons/aws/simple-storage-service.svg' },
'Amazon RDS':            { source: 'local', slug: '/icons/aws/rds.svg' },
'Amazon DynamoDB':       { source: 'local', slug: '/icons/aws/dynamodb.svg' },
'Amazon SQS':            { source: 'local', slug: '/icons/aws/simple-queue-service.svg' },
'Amazon SES':            { source: 'local', slug: '/icons/aws/simple-email-service.svg' },
'Amazon EC2':            { source: 'local', slug: '/icons/aws/ec2.svg' },
'Amazon ECS':            { source: 'local', slug: '/icons/aws/elastic-container-service.svg' },
'Amazon EKS':            { source: 'local', slug: '/icons/aws/elastic-kubernetes-service.svg' },
'Amazon CloudFront':     { source: 'local', slug: '/icons/aws/cloudfront.svg' },
'Amazon API Gateway':    { source: 'local', slug: '/icons/aws/api-gateway.svg' },
'Amazon Cognito':        { source: 'local', slug: '/icons/aws/cognito.svg' },
'Amazon Route 53':       { source: 'local', slug: '/icons/aws/route-53.svg' },
'Amazon ElastiCache':    { source: 'local', slug: '/icons/aws/elasticache.svg' },
'Amazon EventBridge':    { source: 'local', slug: '/icons/aws/eventbridge.svg' },
'Amazon SNS':            { source: 'local', slug: '/icons/aws/simple-notification-service.svg' },
'Amazon Kinesis':        { source: 'local', slug: '/icons/aws/kinesis.svg' },
'AWS Step Functions':    { source: 'local', slug: '/icons/aws/step-functions.svg' },
'AWS Fargate':           { source: 'local', slug: '/icons/aws/fargate.svg' },
'Amazon Aurora':         { source: 'local', slug: '/icons/aws/aurora.svg' },
'AWS Secrets Manager':   { source: 'local', slug: '/icons/aws/secrets-manager.svg' },
'AWS WAF':               { source: 'local', slug: '/icons/aws/waf.svg' },
'Amazon VPC':            { source: 'local', slug: '/icons/aws/vpc.svg' },
'AWS IAM':               { source: 'local', slug: '/icons/aws/iam.svg' },
'Amazon CloudWatch':     { source: 'local', slug: '/icons/aws/cloudwatch.svg' },
'Amazon Athena':         { source: 'local', slug: '/icons/aws/athena.svg' },
'Amazon Redshift':       { source: 'local', slug: '/icons/aws/redshift.svg' },
'Amazon Bedrock':        { source: 'local', slug: '/icons/aws/bedrock.svg' },
```

**GCP services added to registry (examples):**

```ts
'GCP Cloud Run':         { source: 'local', slug: '/icons/gcp/cloud-run.svg' },
'GCP Cloud Functions':   { source: 'local', slug: '/icons/gcp/cloud-functions.svg' },
'GCP BigQuery':          { source: 'local', slug: '/icons/gcp/bigquery.svg' },
'GCP Pub/Sub':           { source: 'local', slug: '/icons/gcp/pubsub.svg' },
'GCP Cloud Storage':     { source: 'local', slug: '/icons/gcp/cloud-storage.svg' },
'GCP Firebase':          { source: 'local', slug: '/icons/gcp/firebase.svg' },
'GCP Firestore':         { source: 'local', slug: '/icons/gcp/firestore.svg' },
'GCP Cloud SQL':         { source: 'local', slug: '/icons/gcp/cloud-sql.svg' },
'GCP Vertex AI':         { source: 'local', slug: '/icons/gcp/vertex-ai.svg' },
'GCP GKE':               { source: 'local', slug: '/icons/gcp/google-kubernetes-engine.svg' },
'GCP Cloud Armor':       { source: 'local', slug: '/icons/gcp/cloud-armor.svg' },
'GCP Load Balancer':     { source: 'local', slug: '/icons/gcp/cloud-load-balancing.svg' },
'GCP Memorystore':       { source: 'local', slug: '/icons/gcp/memorystore.svg' },
'GCP Spanner':           { source: 'local', slug: '/icons/gcp/cloud-spanner.svg' },
'GCP Secret Manager':    { source: 'local', slug: '/icons/gcp/secret-manager.svg' },
```

#### 7.4 Audit script: `scripts/audit-icon-registry.ts`

After setting up icons, run this to detect any gaps (services in registry pointing to missing files):

```ts
// scripts/audit-icon-registry.ts
import { existsSync } from 'fs';
import { join } from 'path';
import { ICON_REGISTRY } from '../lib/icon-registry';

const PUBLIC_DIR = join(process.cwd(), 'public');
let missing = 0;

for (const [label, entry] of Object.entries(ICON_REGISTRY)) {
  if (entry.source === 'local') {
    const filePath = join(PUBLIC_DIR, entry.slug);
    if (!existsSync(filePath)) {
      console.warn(`✗ MISSING: ${label} → ${entry.slug}`);
      missing++;
    }
  }
}

if (missing === 0) {
  console.log('✓ All local icons present');
} else {
  console.error(`\n${missing} icons missing. Run setup-cloud-icons.sh to fix.`);
  process.exit(1);
}
```

Run with: `bun run scripts/audit-icon-registry.ts`

#### 7.5 `.gitignore` for downloaded packs

The raw downloaded zip files should NOT be committed. The extracted `/public/icons/` SVGs SHOULD be committed (they are static assets needed at runtime):

```gitignore
# .gitignore additions
/downloads/          # raw zip downloads — never commit
```

The `/public/icons/aws/` and `/public/icons/gcp/` directories are committed as-is.

#### 7.6 Next.js image optimization note

SVG files in `/public/` are served as-is (no Next.js Image optimization for SVG). This is correct — SVGs are already optimal vector files. Do NOT wrap them in `<Image>` from `next/image`. Use plain `<img>` tags as specified in the `ServiceNode` component.

### Acceptance Criteria

- [ ] `setup-cloud-icons.sh` runs without errors after placing AWS/GCP zips in `/downloads/`
- [ ] `/public/icons/aws/` contains at least 30 service icons
- [ ] `/public/icons/gcp/` contains at least 20 service icons
- [ ] `audit-icon-registry.ts` reports 0 missing local icons after setup
- [ ] `getIconUrl('AWS Lambda')` returns a URL that resolves to an existing SVG file in `/public`
- [ ] `getIconUrl('GCP Cloud Run')` returns a URL that resolves to an existing SVG file in `/public`
- [ ] Icons display correctly in `ServiceNode` at 40×40px
- [ ] No SVG renders above 10KB in size (large icons should be manually simplified)

---

## 8. File Change Map

Summary of every file that needs to be created or modified, organized by priority.

### New Files

| File                             | Priority | Purpose                               |
| -------------------------------- | -------- | ------------------------------------- |
| `lib/icon-registry.ts`           | P2       | Single icon resolver for all sources  |
| `lib/diagram-layout.ts`          | P3       | Dagre layout runner (pure function)   |
| `public/icons/aws/*.svg`         | P6       | Official AWS service icons (static)   |
| `public/icons/gcp/*.svg`         | P6       | Official GCP service icons (static)   |
| `scripts/setup-cloud-icons.sh`   | P6       | Extracts + normalises cloud icon zips |
| `scripts/audit-icon-registry.ts` | P6       | Verifies all local icon paths exist   |
| `scripts/test-icon-registry.ts`  | P2       | Spot-checks resolver output           |

### Modified Files

| File                                     | Priority   | Change                                                                                              |
| ---------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| `components/workspace/ServiceNode.tsx`   | P1         | Compact design, icon-first, Left/Right handles, LetterAvatar, GroupNode                             |
| `components/workspace/DiagramCanvas.tsx` | P1, P3, P4 | NODE_TYPES update, layout toggle, group-aware layer filter                                          |
| `types/blueprint.ts`                     | P4, P5     | RawDiagramNode with parentId/extent/style; NodeCategory type; ContextMap expansion                  |
| `app/app/client-page.tsx`                | P3, P4     | applyDagreLayout in handleGenerateDiagram; formatDiagramNode passes group fields; group click guard |
| `hooks/useBlueprintPolling.ts`           | P3         | applyDagreLayout applied to polled diagram data                                                     |
| `lib/gemini/diagram-generator.ts`        | P5         | Expanded DIAGRAM_SYSTEM_PROMPT with new categories, group schema, swimlane hints                    |
| `lib/gemini/prompts.ts`                  | P5         | Expanded PHASE_PROMPTS with runtime/framework/ORM/library awareness                                 |

### Unchanged Files (for reference)

| File                                         | Reason                                               |
| -------------------------------------------- | ---------------------------------------------------- |
| `components/workspace/ChatPanel.tsx`         | No diagram concerns                                  |
| `components/workspace/WorkspaceHeader.tsx`   | No diagram concerns                                  |
| `components/workspace/WorkspaceSidebar.tsx`  | No diagram concerns                                  |
| `components/workspace/SwapModal.tsx`         | No changes needed — works with new categories        |
| `components/workspace/ContextMapSidebar.tsx` | Picks up new ContextMap fields automatically         |
| `hooks/useDiagramQA.ts`                      | No structural changes; benefits from better diagrams |
| `app/api/blueprints/diagram/route.ts`        | No changes                                           |
| `app/api/blueprints/route.ts`                | No changes                                           |

---

## 9. Dependency Matrix

### New npm Dependencies

| Package                 | Version  | Priority | Bundle impact       | Why                        |
| ----------------------- | -------- | -------- | ------------------- | -------------------------- |
| `@dagrejs/dagre`        | `^1.0.4` | P3       | ~85KB (tree-shaken) | Graph layout algorithm     |
| `@types/dagrejs__dagre` | `^1.0.4` | P3       | Dev-only            | TypeScript types for dagre |

> **No other new dependencies.** Devicons and Simple Icons are loaded from CDN at runtime as `<img src>` — they add zero bytes to the JS bundle. AWS/GCP icons are static files served from `/public/`.

### Internal Dependencies Between Priorities

```
P1 (Compact Nodes)
  └── depends on: P2 (icon registry) to actually render icons
      └── depends on: P6 (cloud icon files) for AWS/GCP icons to load

P3 (Dagre Layout)
  └── depends on: P1 (node dimensions must be fixed/known for Dagre to compute correctly)

P4 (Group Nodes)
  └── depends on: P1 (GroupNode component)
  └── depends on: P3 (Dagre skips group nodes — requires layout to be aware of groups)
  └── depends on: P5 (AI must output group nodes for this to be useful)

P5 (AI Prompt)
  └── depends on: nothing — can be done in parallel with P1–P4
  └── feeds into: P4 (AI must use group schema for groups to appear)
```

### Recommended Implementation Order

```
Week 1:
  Day 1: P2 — icon-registry.ts (data only, no UI)
  Day 2: P1 — ServiceNode redesign (compact, icon-first, LetterAvatar)
  Day 3: P3 — diagram-layout.ts + apply in client-page + polling hook
  Day 4: P1+P3 polish — layout toggle button, handle direction QA

Week 2:
  Day 1: P5 — expanded diagram system prompt + prompts.ts
  Day 2: P5 — ContextMap field expansion + discovery question updates
  Day 3: P4 — GroupNode + type system + formatDiagramNode + click guard
  Day 4: P4 — layer filter compatibility + group color system

Week 3:
  Day 1-2: P6 — download icon packs, run setup script, fill in registry
  Day 3: P6 — audit script, verify all icons, commit /public/icons/
  Day 4: Full regression test — generate 3 different project diagrams,
          verify icons, layout, groups, Q&A all work correctly
```

### Risk Register

| Risk                                     | Likelihood | Mitigation                                                                                                                            |
| ---------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Devicons CDN is down                     | Low        | `LetterAvatar` fallback always renders. Add a local fallback copy of the 10 most common icons in `/public/icons/dev/`                 |
| AI ignores group node schema             | Medium     | Provide concrete JSON examples in the system prompt. Add a post-processing step that groups nodes by category if AI outputs no groups |
| Dagre overlaps nodes with parentId       | Medium     | Exclude all child nodes (those with parentId) from Dagre; layout only top-level nodes                                                 |
| AWS icon filename normalisation mismatch | Medium     | Run audit script on every PR; registry key must match exactly                                                                         |
| Simple Icons slug not found (404)        | Low        | Wrap `<img>` in error boundary; fallback to `LetterAvatar` on 404                                                                     |

---

_Last updated: 2026-05-29_
_Owner: Kairos Engineering_
