/**
 * Kairos — Shared Domain Types
 *
 * All types used across client components, hooks, and API handlers.
 * This is the single source of truth for the blueprint data model.
 */

// ─── CHAT ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
  timestamp?: string;
}

// ─── CONTEXT MAP ──────────────────────────────────────────────────────────────

export type ContextMapValue = string | string[] | boolean | number | null | undefined;

export interface TechPhilosophy {
  cloud_preference: 'gcp' | 'aws' | 'azure' | 'cloudflare' | 'multi-cloud' | 'no-preference' | null;
  language_era: 'legacy' | 'modern' | 'bleeding-edge' | null;
  preferred_languages: string[];
  stack_style: 'monolith' | 'microservices' | 'serverless' | 'hybrid' | null;
  devops_philosophy: 'managed-only' | 'container-friendly' | 'infra-as-code' | null;
  orm_stance: 'love-orm' | 'raw-sql' | 'query-builder' | null;
  ai_tooling_openness: 'early-adopter' | 'pragmatic' | 'conservative' | null;
  vendor_lock_in_tolerance: 'hate-it' | 'pragmatic' | 'fine-with-it' | null;
  open_source_priority: 'always' | 'preferred' | 'indifferent' | null;
  subjective_notes: string | null;
}

export interface ContextMap {
  product_category?: string | null;
  core_user_workflow?: string | null;
  primary_user_persona?: string | null;
  data_model_nature?: string[];
  has_realtime_requirement?: boolean | null;
  has_ai_ml_component?: boolean | null;
  expected_users_month_1?: string | null;
  expected_users_month_6?: string | null;
  launch_timeline_weeks?: string | null;
  scale_tier?: string | null;
  team_size?: string | null;
  primary_language?: string | null;
  familiar_frameworks?: string[];
  budget_constraint?: string | null;
  devops_tolerance?: string | null;
  existing_tools?: string[];
  compliance_requirements?: string[];
  non_negotiables?: string[];
  
  // New discovery & architecture fields
  backend_runtime?: string | null;     // 'node' | 'bun' | 'deno' | 'go' | 'rust' | 'python'
  backend_framework?: string | null;   // 'hono' | 'express' | 'fastify' | 'gin' | 'axum'
  auth_strategy?: string | null;       // 'jwt' | 'sessions' | 'oauth-only' | 'passkeys'
  auth_provider?: string | null;       // 'better-auth' | 'clerk' | 'supabase' | 'nextauth'
  orm_preference?: string | null;      // 'drizzle' | 'prisma' | 'raw-sql' | 'none'
  deployment_target?: string | null;   // 'vercel' | 'aws' | 'gcp' | 'railway' | 'fly' | 'vps'
  needs_background_jobs?: boolean | null;
  needs_websockets?: boolean | null;
  needs_search?: boolean | null;
  needs_payments?: boolean | null;
  needs_email?: boolean | null;
  needs_ai_features?: boolean | null;
  
  tech_philosophy?: Partial<TechPhilosophy>;
  
  [key: string]: ContextMapValue | Partial<TechPhilosophy>;
}

// ─── DIAGRAM ──────────────────────────────────────────────────────────────────

export type NodeCategory =
  // User-facing layers
  | 'user'            // "End Users", "Mobile App", external persona nodes
  | 'frontend'        // React, Next.js, Svelte, SolidJS, Qwik, Astro
  | 'cdn'             // Cloudflare CDN, CloudFront, Fastly, Akamai
  | 'hosting'         // Vercel, Netlify, Railway, Render, Fly.io
  // Backend
  | 'gateway'         // API Gateway, Kong, nginx, Traefik, Caddy
  | 'backend'         // Generic backend server
  | 'runtime'         // The actual execution engine: Bun, Node.js, Deno
  | 'framework'       // Hono, Express, Fastify, Gin, Axum, Fiber, Django, FastAPI
  | 'library'         // Zod, TanStack, tRPC, SWR, React Query — middleware/utility
  // Data
  | 'database'        // PostgreSQL, MySQL, MongoDB, SQLite, CockroachDB
  | 'cache'           // Redis, Memcached, Upstash
  | 'orm'             // Drizzle, Prisma, TypeORM, SQLAlchemy, GORM
  | 'search'          // Algolia, Typesense, Meilisearch, OpenSearch
  | 'storage'         // S3, R2, GCS, Cloudinary, uploadthing
  // Platform services
  | 'auth'            // Better Auth, NextAuth, Clerk, Supabase Auth, Lucia
  | 'oauth'           // Google OAuth, GitHub OAuth, Discord OAuth (identity providers)
  | 'email'           // Resend, Mailgun, SendGrid, SES, Postmark
  | 'payment'         // Stripe, LemonSqueezy, Paddle, Razorpay
  | 'queue'           // BullMQ, SQS, RabbitMQ, Kafka, Inngest
  | 'ai'              // OpenAI, Anthropic, Gemini, Replicate, Hugging Face
  | 'observability'   // Sentry, PostHog, Datadog, Grafana, Prometheus, Logtail
  // Infrastructure
  | 'container'       // Docker, Kubernetes, ECS, Cloud Run
  | 'ci'              // GitHub Actions, CircleCI, Buildkite, Jenkins
  // Structural
  | 'group';          // Dashed-border container node — NOT a service

/**
 * Matches the shape stored in blueprint.diagramGraph.nodes[n].data.
 * Extends Record<string, unknown> so it satisfies the ReactFlow NodeData
 * constraint while remaining fully typed.
 */
export interface LibEntry {
  id: string;
  label: string;
}

export interface ServiceNodeData extends Record<string, unknown> {
  label: string;
  category: string;
  why: string;
  free_tier?: string;
  cost_at_scale?: string;
  upgrade_signal?: string;
  alternatives?: string[];
  /** For libCluster nodes: the list of libraries to render as icon pills */
  libs?: LibEntry[];
}

export interface RawDiagramNode {
  id: string;
  type?: string;          // 'customNode' | 'group'
  position?: { x: number; y: number };
  parentId?: string;      // child nodes inside groups
  extent?: 'parent';      // restricts dragging to parent
  style?: {               // group width/height
    width?: number;
    height?: number;
  };
  data: ServiceNodeData;
}

export interface RawDiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: Record<string, unknown>;
}

export interface DiagramGraph {
  nodes: RawDiagramNode[];
  edges: RawDiagramEdge[];
}

// ─── BLUEPRINT ────────────────────────────────────────────────────────────────

export interface Blueprint {
  id: string;
  name: string;
  currentPhase: string;
  chatHistory: ChatMessage[];
  contextMap: ContextMap;
  diagramGraph: DiagramGraph;
}

export interface BlueprintUser {
  id: string;
  email: string;
  name: string;
}

// ─── WORKSPACE PHASES ─────────────────────────────────────────────────────────

export interface Phase {
  id: string;
  label: string;
  icon: string;
}

export const WORKSPACE_PHASES: Phase[] = [
  { id: 'project_discovery', label: 'Discovery', icon: 'explore' },
  { id: 'tech_philosophy', label: 'Tech Philosophy', icon: 'code' },
  { id: 'scale_discovery', label: 'Scale & Growth', icon: 'storage' },
  { id: 'builder_context', label: 'Builder Context', icon: 'terminal' },
  { id: 'constraints', label: 'Constraints', icon: 'settings' },
  { id: 'recommendation', label: 'Recommendation', icon: 'description' },
  { id: 'diagram', label: 'Visual Diagram', icon: 'layers' },
  { id: 'followup', label: 'Follow-up', icon: 'help' },
];

// ─── LAYER FILTER ─────────────────────────────────────────────────────────────

export type DiagramLayer = 'all' | 'frontend' | 'backend' | 'database' | 'services';

export const DIAGRAM_LAYERS: DiagramLayer[] = [
  'all',
  'frontend',
  'backend',
  'database',
  'services',
];

// ─── Q&A ──────────────────────────────────────────────────────────────────────

export interface QAPair {
  q: string;
  a: string;
}

export const AI_THINKING_PLACEHOLDER = 'AI is thinking...';
