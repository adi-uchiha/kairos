# Kairos — Technical Specification

**Version:** 1.0  
**Status:** Draft  
**Companion Documents:** [PHILOSOPHY.md](./PHILOSOPHY.md) · [PRD.md](./PRD.md)  
**Last Updated:** 2026-05-28

---

## 1. System Architecture Overview

Kairos is a **conversational AI application** built around a structured, multi-phase dialogue engine. At its core, it is a carefully prompt-engineered LLM interface with a deterministic conversation state machine guiding the interaction.

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│          (Chat UI — web app or embeddable widget)               │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP / WebSocket
┌─────────────────────────▼───────────────────────────────────────┐
│                     Kairos API Layer                         │
│   - Session management                                          │
│   - Conversation state machine                                  │
│   - Phase tracking & gate enforcement                           │
│   - Context map accumulation                                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    LLM Orchestration Layer                       │
│   - System prompt injection (phase-aware)                       │
│   - Context map serialization into prompt                       │
│   - Response parsing & structured output extraction             │
│   - Fallback handling                                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                       LLM Provider                              │
│             (Claude 3.5 Sonnet / GPT-4o)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Conversation State Machine

The session has six discrete phases. The system enforces progression — a phase cannot be skipped.

```
PHASE_IDLE
    │
    ▼  (user sends first message)
PHASE_PROJECT_DISCOVERY
    │
    ▼  (AI determines sufficient context)
PHASE_SCALE_DISCOVERY
    │
    ▼
PHASE_BUILDER_CONTEXT
    │
    ▼
PHASE_CONSTRAINTS
    │
    ▼
PHASE_RECOMMENDATION  ◄─── (re-enterable if user changes constraints)
    │
    ▼
PHASE_DIAGRAM         ◄─── (diagram generated; re-runs on node swap)
    │
    ▼
PHASE_FOLLOWUP  ◄─── (loops on user questions; can re-enter PHASE_DIAGRAM)
```

### Phase Transition Logic

A phase is considered **complete** when the context map fields for that phase are populated with non-empty, non-trivial values. The LLM evaluates this after each user message.

**Project Discovery complete when:**

- `product_category` is identified
- `core_user_workflow` is described
- `primary_user_persona` is identified
- `data_model_nature` has at least one signal (relational, document, time-series, real-time)

**Scale Discovery complete when:**

- `expected_users_month_1` has a numeric estimate (even a rough one)
- `expected_users_month_6` has a numeric estimate
- `launch_timeline` is identified
- `scale_tier` is assigned (Nano / Micro / Small / Medium / Large)

**Builder Context complete when:**

- `team_size` is known
- `primary_language_or_framework` is identified
- `budget_constraint` is classified (bootstrapped / pre-revenue / funded / enterprise)
- `devops_tolerance` is rated (1–5)

**Constraints complete when:**

- `existing_tools` is populated (empty list is valid if user says "none")
- `compliance_requirements` is populated (empty list is valid)

---

## 3. Context Map Schema

The context map is the internal data structure that accumulates information from the conversation. It is serialized into the LLM prompt during the recommendation phase.

```typescript
interface ContextMap {
  // Phase 1: Project Discovery
  product_category: string | null; // e.g. "B2B SaaS", "consumer app", "internal tool"
  core_user_workflow: string | null; // e.g. "users upload files, AI processes them, results are emailed"
  primary_user_persona: string | null; // e.g. "non-technical small business owners"
  data_model_nature: DataModelNature[]; // ["relational", "document", "real-time", "time-series", "file-heavy"]
  has_realtime_requirement: boolean | null;
  has_ai_ml_component: boolean | null;

  // Phase 2: Scale & Timeline
  expected_users_month_1: number | null;
  expected_users_month_6: number | null;
  launch_timeline_weeks: number | null; // e.g. 8 = "2 months"
  scale_tier: ScaleTier | null; // "nano" | "micro" | "small" | "medium" | "large"

  // Phase 3: Builder Context
  team_size: number | null; // 1 = solo
  primary_language: string | null; // e.g. "TypeScript", "Python", "Go"
  familiar_frameworks: string[]; // e.g. ["React", "Next.js"]
  budget_constraint: BudgetConstraint | null; // "bootstrapped" | "pre-revenue" | "funded" | "enterprise"
  devops_tolerance: number | null; // 1 (hates infra) to 5 (comfortable with cloud)

  // Phase 4: Constraints
  existing_tools: string[]; // e.g. ["Firebase", "Stripe"]
  compliance_requirements: string[]; // e.g. ["GDPR", "HIPAA"]
  non_negotiables: string[]; // e.g. ["must use AWS", "no vendor lock-in"]

  // Phase 5: Diagram Output
  diagram_graph: ArchitectureDiagramGraph | null; // Structured node/edge JSON generated after recommendation

  // Metadata
  session_id: string;
  current_phase: ConversationPhase;
  created_at: string; // ISO timestamp
  last_updated_at: string; // ISO timestamp
}

type ScaleTier = 'nano' | 'micro' | 'small' | 'medium' | 'large';
type BudgetConstraint = 'bootstrapped' | 'pre-revenue' | 'funded' | 'enterprise';
type DataModelNature =
  | 'relational'
  | 'document'
  | 'real-time'
  | 'time-series'
  | 'file-heavy'
  | 'graph';
type ConversationPhase =
  | 'idle'
  | 'project_discovery'
  | 'scale_discovery'
  | 'builder_context'
  | 'constraints'
  | 'recommendation'
  | 'diagram'
  | 'followup';
```

---

## 4. Scale Tier Decision Logic

The AI maps user-stated scale expectations to a tier using this decision table:

| Month-1 Users | Month-6 Users  | Assigned Tier |
| ------------- | -------------- | ------------- |
| 0–50          | 0–500          | **Nano**      |
| 50–500        | 500–5,000      | **Micro**     |
| 500–5,000     | 5,000–50,000   | **Small**     |
| 5,000–50,000  | 50,000–500,000 | **Medium**    |
| 50,000+       | 500,000+       | **Large**     |

**Special rules:**

- If user mentions investor backing or viral potential, bump tier one level up.
- If user is explicitly building an MVP to validate, default to **Nano** regardless of stated scale.
- If user says "I don't know," assign **Nano** and state why.

---

## 5. Recommendation Engine Logic

### 5.1 Decision Tree: Cloud vs. Managed Services

```
Is scale_tier "nano" or "micro"?
    YES → Managed services only (Vercel, Railway, Supabase, Resend, etc.)
    NO ↓

Is devops_tolerance ≤ 2?
    YES → Managed services with cloud storage (R2/S3) and CDN only
    NO ↓

Is scale_tier "small"?
    YES → Managed services + cloud for storage/CDN + consider cloud DB (RDS)
    NO ↓

Is scale_tier "medium"?
    YES → Cloud-native for backend + DB; managed for frontend and email
    NO ↓

Is scale_tier "large"?
    YES → Full cloud-native (AWS or GCP). Kubernetes or Cloud Run. Managed DB (RDS/AlloyDB).
```

### 5.2 Frontend Decision Tree

```
Does the product need SSR/SEO?
    YES → Next.js (App Router)
    NO ↓

Is it a dashboard/internal tool/SPA?
    YES → Vite + React + TanStack Router
    NO ↓

Is it highly interactive with complex state?
    YES → Vite + React + TanStack Query + Zustand
    NO → Vite + React (minimal)
```

### 5.3 Backend Decision Tree

```
Is primary_language "Go" or is devops_tolerance ≥ 3?
    YES → Go + Fiber (high performance, low memory)
    NO ↓

Is primary_language "Python"?
    YES → FastAPI + Pydantic (async, type-safe)
    NO ↓

Is the team JavaScript-only?
    YES → Node.js + Hono (fast, modern, edge-compatible)
    NO ↓

Default → Node.js + Hono (lowest ramp-up for web devs)
```

### 5.4 Database Decision Tree

```
Does data have a natural document structure (e.g., user profiles with nested arrays)?
    YES, AND no relational queries needed → MongoDB Atlas
    NO ↓

Is there a real-time requirement (live data, presence, notifications)?
    YES → Supabase (Postgres + Realtime) or Firebase (if fully document-based)
    NO ↓

Is scale_tier "nano" or "micro"?
    YES → Supabase (Postgres, generous free tier) or Neon (serverless Postgres)
    NO ↓

Is scale_tier "small" or above?
    YES → Neon or PlanetScale (MySQL) for serverless; RDS on cloud if medium+
    NO → Supabase Postgres
```

### 5.5 Auth Decision Tree

```
Does the product require advanced auth (SSO, SAML, MFA, enterprise)?
    YES → Clerk (enterprise tier) or Auth0
    NO ↓

Is the product already using Supabase?
    YES → Supabase Auth (free, built-in)
    NO ↓

Default → Clerk (excellent DX, generous free tier, pre-built components)
```

### 5.6 Hosting Decision Tree

```
Frontend:
    Is scale_tier "medium" or "large"?
        YES → Cloudflare Pages + Workers (global edge)
        NO → Vercel (best DX, free tier)

Backend:
    Is scale_tier "nano" or "micro"?
        YES → Railway or Render (free tier / ~$5/mo)
        NO (small) → Fly.io or Railway Pro
        NO (medium) → Cloud Run (GCP) or ECS Fargate (AWS)
        NO (large) → Kubernetes on GKE or EKS
```

---

## 6. System Prompt Architecture

The LLM is controlled via a **layered system prompt** that changes based on the current conversation phase.

### 6.1 Base System Prompt (always present)

```
You are Kairos, an AI System Architect and Tech Stack Advisor.
Your purpose is to help solo developers and small teams make confident,
context-aware decisions about their technology stack and system architecture.

You are opinionated, direct, and honest. You give real answers, not menus.
You think like a senior engineer who has shipped production systems — not a
consultant, not a textbook author.

Key rules you MUST always follow:
1. NEVER make recommendations before completing the discovery phases.
2. ALWAYS acknowledge the user's answer before asking the next question.
3. NEVER overwhelm the user with more than 3–4 questions at once.
4. ALWAYS include a "why" and a "trade-off" for every recommendation.
5. ALWAYS tie your cloud vs. managed decision to the user's stated scale.
6. If a user asks to skip discovery, redirect warmly but firmly.

Current date: {CURRENT_DATE}
Current session phase: {CURRENT_PHASE}
```

### 6.2 Phase-Specific Prompt Injections

Each phase appends a specific instruction block:

**PHASE_PROJECT_DISCOVERY injection:**

```
You are currently in the PROJECT DISCOVERY phase.
Your goal is to understand what this product does, who it serves, and how
the data flows through it.

Ask warm, open-ended questions. Do not ask more than 3–4 at once.
Follow up on what the user has said. Make them feel heard.

Do NOT ask about scale, team size, or budget yet.
Do NOT make any technology recommendations yet.

When you believe you have enough context to fill these fields:
product_category, core_user_workflow, primary_user_persona,
data_model_nature, has_realtime_requirement
...transition to the SCALE_DISCOVERY phase naturally.
```

**PHASE_SCALE_DISCOVERY injection:**

```
You are currently in the SCALE DISCOVERY phase.
You now know: {CONTEXT_MAP_SUMMARY}

Your goal is to understand the realistic scale this product needs to handle.
Ask for concrete numbers. If they say "small," ask what small means numerically.
Cover: users in month 1, users in month 6, launch timeline.

Do NOT make any technology recommendations yet.

When complete, assign a scale tier (nano/micro/small/medium/large) and
briefly explain to the user which tier you've assigned them and why.
Then transition to BUILDER_CONTEXT.
```

**PHASE_BUILDER_CONTEXT injection:**

```
You are currently in the BUILDER CONTEXT phase.
You know: {CONTEXT_MAP_SUMMARY}

Your goal is to understand who is building this and what they're comfortable with.
Cover: team size, strongest language/framework, budget stage, devops comfort (1–5).

Do NOT make technology recommendations yet.
```

**PHASE_CONSTRAINTS injection:**

```
You are currently in the CONSTRAINTS phase.
You know: {CONTEXT_MAP_SUMMARY}

Ask if there are any non-negotiables: existing tools already in use,
compliance requirements (GDPR, HIPAA), or firm technology mandates.
If none, that's fine — just note it.
```

**PHASE_RECOMMENDATION injection:**

```
You are now in the RECOMMENDATION phase.
Here is the complete context map for this user:

{FULL_CONTEXT_MAP_JSON}

Generate a complete tech stack and architecture recommendation using the
decision trees in your training. Follow the output structure exactly:
1. Stack at a Glance (table)
2. Why This Stack (brief rationale)
3. Per-category rationale (Frontend, Backend, Database, Auth, Email, Storage, Hosting, Observability)
4. Cost Breakdown (table)
5. Migration Roadmap (what changes at each scale tier)
6. Trade-offs You're Accepting

Be specific. Name exact products. Give real reasons. Be honest about trade-offs.
End by inviting follow-up questions.
```

---

## 7. API Specification

### 7.1 Endpoints

#### POST `/api/session`

Creates a new Kairos session.

**Request:**

```json
{}
```

**Response:**

```json
{
  "session_id": "sess_abc123",
  "phase": "idle",
  "created_at": "2026-05-28T12:00:00Z"
}
```

---

#### POST `/api/chat`

Sends a user message and receives an AI response.

**Request:**

```json
{
  "session_id": "sess_abc123",
  "message": "I'm building a document signing tool for small law firms."
}
```

**Response:**

```json
{
  "session_id": "sess_abc123",
  "phase": "project_discovery",
  "response": "That's a great space to be working in...",
  "context_map_updated": true,
  "phase_changed": false
}
```

---

#### GET `/api/session/:session_id`

Retrieves the current state of a session, including the context map and conversation history.

**Response:**

```json
{
  "session_id": "sess_abc123",
  "phase": "recommendation",
  "context_map": { ... },
  "history": [
    { "role": "user", "content": "...", "timestamp": "..." },
    { "role": "assistant", "content": "...", "timestamp": "..." }
  ]
}
```

---

#### POST `/api/session/:session_id/export`

Exports the final recommendation as a structured JSON or Markdown document.

**Request:**

```json
{
  "format": "markdown" // or "json"
}
```

**Response:**

```json
{
  "content": "# Your Kairos Recommendation\n\n..."
}
```

---

## 8. Frontend Specification

### 8.1 Tech Stack (for the Kairos UI itself)

| Layer     | Choice                                                                   | Rationale                              |
| --------- | ------------------------------------------------------------------------ | -------------------------------------- |
| Framework | **Vite + React**                                                         | Fast, lightweight, ideal for a chat UI |
| Routing   | **TanStack Router**                                                      | Type-safe, file-based                  |
| Styling   | **CSS Modules + custom tokens**                                          | No utility class bloat for this scale  |
| Icons     | **Phosphor Icons** (`@phosphor-icons/react`, suffixed versions only)     | Consistent, beautiful                  |
| Fonts     | **Inter** (Google Fonts)                                                 | Clean, modern, readable                |
| State     | **TanStack Query** for server state, **Zustand** for local session state | Clean separation                       |

### 8.2 UI Screens

#### Screen 1: Landing / Session Start

- Full-screen hero with product name and one-liner
- Single CTA: "Start Building Your Stack →"
- Brief 3-step explainer (Discover → Analyze → Recommend)

#### Screen 2: Chat Interface

- Left panel: Conversation progress indicator (phases as steps)
- Center: Chat messages (user right-aligned, AI left-aligned with avatar)
- Bottom: Input field with send button
- Right panel (collapsed by default): Live context map view (shows what the AI has learned so far)

#### Screen 3: Recommendation View

- Rendered in the chat stream, but also available as a full-screen formatted document
- Exportable as Markdown
- Share button (copies URL to recommendation if session sharing is enabled)

#### Screen 4: Visual Architecture Diagram

- Full-screen canvas, black background, replaces the chat UI once generated
- ReactFlow-powered node graph, pannable and zoomable
- Floating toolbar: Export PNG, Export JSON, Share URL, Layers toggle
- Node click opens a right-side drawer with: service name, logo, why chosen, free tier, cost at scale, swap alternatives
- AI chat input bar at the bottom persists, allowing conversational diagram edits
- "Swap" button on each node opens a palette of alternative services in the same category

### 8.3 Design Tokens

```css
:root {
  /* Colors */
  --color-bg-primary: #0d0d0f;
  --color-bg-surface: #151518;
  --color-bg-elevated: #1c1c21;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-text-primary: #f0f0f3;
  --color-text-secondary: #8b8b9a;
  --color-text-muted: #4a4a5a;
  --color-accent: #7c6af7; /* Purple — AI/intelligence */
  --color-accent-glow: rgba(124, 106, 247, 0.15);
  --color-success: #4ade80;
  --color-warning: #fbbf24;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-glow: 0 0 40px rgba(124, 106, 247, 0.08);
}
```

---

## 9. Tooling & Service Choices (for Kairos itself)

Dogfooding the product's own philosophy at **Micro scale** (solo project):

| Category     | Choice               | Why                                               |
| ------------ | -------------------- | ------------------------------------------------- |
| Frontend     | Vite + React         | Fast DX, SPA is fine for this                     |
| Hosting (FE) | Vercel               | Free tier, instant deploys                        |
| Backend      | Node.js + Hono       | Fast, edge-compatible, TypeScript native          |
| Hosting (BE) | Railway              | Simple, ~$5/mo, no Docker complexity              |
| LLM          | Anthropic Claude API | Best conversational reasoning                     |
| Sessions     | Redis (Upstash)      | Serverless, free tier, session KV store           |
| Auth         | Clerk                | Optional; only needed if saving sessions per user |
| Email        | Resend               | For session export emails if desired              |
| Analytics    | PostHog              | Free tier, self-hostable                          |

---

## 10. Testing Strategy

### 10.1 Conversation Flow Tests (Critical Path)

Test scenarios that MUST pass:

| Scenario                                      | Expected Behavior                              |
| --------------------------------------------- | ---------------------------------------------- |
| User tries to get recommendation immediately  | AI redirects to discovery warmly               |
| User says "I don't know" for scale            | AI assigns Nano, explains why                  |
| User mentions existing tools (e.g., Firebase) | Final recommendation incorporates Firebase     |
| User has HIPAA compliance requirement         | Recommendation excludes non-compliant services |
| User is solo with low devops tolerance        | No Kubernetes, no self-hosted anything         |
| User says Go is their primary language        | Backend recommendation uses Go                 |
| User is funded and expects 100K users         | Recommendation uses cloud infrastructure       |
| User asks "why not X?" post-recommendation    | AI gives direct, contextual comparison         |

### 10.2 Output Quality Tests

- The recommendation output MUST contain all required sections (Stack Table, Rationale, Cost Breakdown, Migration Roadmap, Trade-offs)
- No tool older than 2022 should appear in defaults without explicit justification
- No tool that has been sunset or deprecated should appear

---

## 11. Future Considerations (v2+)

| Feature              | Description                                                       | Priority |
| -------------------- | ----------------------------------------------------------------- | -------- |
| **Session Sharing**  | Generate a shareable URL for a recommendation                     | High     |
| **Saved Sessions**   | User accounts to save and revisit past recommendations            | Medium   |
| **CI/CD Module**     | Extend recommendations to include CI/CD pipeline suggestions      | Medium   |
| **"Quick Mode"**     | Skip to scale tier selection with a form, bypass full chat        | Low      |
| **Comparison Mode**  | "Compare Go vs. Node for my use case" — head-to-head analysis     | Medium   |
| **Team Mode**        | Allow multiple collaborators to build context map together        | Low      |
| **Changelog Alerts** | Notify users when a recommended tool changes pricing or is sunset | High     |
| **Embedding API**    | Allow Kairos to be embedded in other developer tools              | Low      |

---

## 12. Diagram Engine Specification

The Visual Architecture Diagram is the primary output artifact of Kairos. It is built on top of `@xyflow/react` (ReactFlow v12+).

### 12.1 Graph Data Schema

```typescript
interface ArchitectureDiagramGraph {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  metadata: {
    scale_tier: ScaleTier;
    generated_at: string;
    version: number; // increments on each swap/edit
  };
}

interface DiagramNode {
  id: string; // e.g. "node_supabase"
  type: 'service'; // ReactFlow node type
  position: { x: number; y: number };
  data: {
    label: string; // e.g. "Supabase"
    category: NodeCategory; // "frontend" | "backend" | "database" | "auth" | "email" | "storage" | "hosting" | "observability" | "queue" | "cdn"
    icon_url: string; // URL to official logo SVG/PNG
    why: string; // 1-2 sentence rationale
    free_tier: string; // e.g. "500MB DB, 50K auth users/mo"
    cost_at_scale: string; // e.g. "~$25/mo at Micro tier"
    upgrade_signal: string; // e.g. "Upgrade when you exceed 500MB or need row-level security at scale"
    alternatives: string[]; // e.g. ["Neon", "PlanetScale", "Railway Postgres"]
    swap_locked: boolean; // true if user has explicitly locked this node
  };
}

interface DiagramEdge {
  id: string;
  source: string; // node id
  target: string; // node id
  label: string; // e.g. "REST API", "SQL", "SMTP", "WebSocket"
  animated: boolean; // true for real-time data flows
  data: {
    description: string; // longer description of what flows across this edge
  };
}

type NodeCategory =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'auth'
  | 'email'
  | 'storage'
  | 'hosting'
  | 'observability'
  | 'queue'
  | 'cdn';
```

### 12.2 Node Layout Strategy

Nodes are arranged in horizontal swimlanes by category, top-to-bottom:

```
[CDN / Hosting]     ─────────── Row 1 (Client layer)
[Frontend]          ─────────── Row 2
[Backend / API]     ─────────── Row 3
[Auth]  [Queue]     ─────────── Row 4 (Services layer)
[Database][Storage] ─────────── Row 5 (Persistence layer)
[Email][Observ.]    ─────────── Row 6 (Outbound/monitoring)
```

Initial positions are calculated programmatically. Users can drag nodes freely after generation.

### 12.3 AI Graph Generation API

#### POST `/api/session/:session_id/diagram`

Triggers diagram generation from the current recommendation context map.

**Response:**

```json
{
  "graph": {
    "nodes": [...],
    "edges": [...],
    "metadata": {
      "scale_tier": "nano",
      "generated_at": "2026-05-28T12:00:00Z",
      "version": 1
    }
  }
}
```

#### POST `/api/session/:session_id/diagram/swap`

Swaps a single node. Kairos re-reasons connected edges and may update adjacent nodes.

**Request:**

```json
{
  "node_id": "node_supabase",
  "replacement": "PlanetScale"
}
```

**Response:** Updated full `ArchitectureDiagramGraph` with `version` incremented.

#### POST `/api/session/:session_id/diagram/ask`

Ask the AI a question about a specific node or the diagram as a whole.

**Request:**

```json
{
  "node_id": "node_supabase", // null if asking about the full diagram
  "question": "What happens if this goes down?"
}
```

**Response:** Streamed AI text answer.

### 12.4 Diagram Export Formats

| Format        | Method                                             | Use case                        |
| ------------- | -------------------------------------------------- | ------------------------------- |
| PNG           | `html-to-image` or ReactFlow's built-in screenshot | Sharing, embedding in docs      |
| JSON          | Raw `ArchitectureDiagramGraph`                     | Import into other tools         |
| SVG           | Via html-to-image                                  | High-quality print/presentation |
| Shareable URL | Session ID embedded in URL                         | Sharing with collaborators      |

### 12.5 Technology Choices

| Component      | Choice                                                            | Why                                                           |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| Canvas library | `@xyflow/react` v12                                               | Industry standard, excellent TS support, handles large graphs |
| Node icons     | `simple-icons` + custom SVG set                                   | Comprehensive coverage of dev tools and cloud services        |
| PNG export     | `@xyflow/react` built-in `getViewportForBounds` + `html-to-image` | Reliable cross-browser capture                                |
| Graph layout   | Custom row-based algorithm (not ELK/Dagre)                        | Simpler, more predictable for this use case                   |
