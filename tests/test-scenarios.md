# Kairos Test Scenario

## Scenario: Real-time AI-powered B2B SaaS Platform on AWS

**Use this scenario to drive a full Kairos session end-to-end.**

---

### The Pitch

> "I'm building a B2B SaaS platform for e-commerce brands. Brands connect their Shopify/WooCommerce stores, and our AI automatically generates and A/B tests product descriptions, ad copy, and email campaigns using their historical sales data and customer segments. We have a real-time analytics dashboard showing live campaign performance. Brands pay per seat with a usage-based overage for AI tokens consumed. We're targeting mid-market e-commerce (stores doing $1M–$50M/yr in revenue). I'm a solo TypeScript developer, I want to launch an MVP in 6–8 weeks, and I've already got an AWS account set up."

---

### Expected Context Map (for validation)

After the full discovery flow, Kairos should have captured:

| Field | Expected Value |
|---|---|
| `product_category` | B2B SaaS / AI Content Platform |
| `primary_user_persona` | E-commerce brand managers |
| `has_realtime_requirement` | `true` (live dashboard) |
| `has_ai_ml_component` | `true` (LLM copy generation + A/B testing) |
| `needs_payments` | `true` (seat-based + usage-based billing) |
| `needs_email` | `true` (campaign sending + transactional) |
| `needs_background_jobs` | `true` (AI generation, data sync jobs) |
| `needs_search` | `true` (product catalog search) |
| `needs_websockets` | `true` (real-time dashboard) |
| `deployment_target` | `aws` |
| `backend_runtime` | `bun` or `node` |
| `tech_philosophy.cloud_preference` | `aws` |
| `tech_philosophy.stack_style` | `hybrid` or `microservices` |
| `scale_tier` | `micro` → `small` |
| `team_size` | `solo` |
| `budget_constraint` | `pre-revenue` |
| `compliance_requirements` | `[]` (no HIPAA/GDPR mentioned) |

---

### Expected Architecture Diagram Nodes

The generated diagram **must** include at minimum:

**AWS Infrastructure:**
- AWS ECS / Fargate or Lambda (compute)
- Amazon RDS PostgreSQL or Aurora (primary DB)
- Amazon S3 (asset storage)
- Amazon SQS or EventBridge (job queue)
- Amazon ElastiCache Redis (caching, pub/sub for websockets)
- Amazon CloudFront (CDN)
- AWS API Gateway (optional, if serverless)

**Application Layer:**
- Next.js (frontend)
- Bun or Node.js runtime
- Hono or Fastify (backend API)
- WebSocket server (real-time dashboard)

**Platform Services:**
- OpenAI API or Anthropic Claude (AI copy generation)
- Stripe (seat billing + metered usage)
- Resend or SES (transactional + campaign email)
- Clerk or Better Auth (multi-tenant auth)
- Typesense or Algolia (product catalog search)
- Sentry (error observability)
- PostHog or Datadog (product analytics + APM)

**libCluster Nodes (NOT standalone nodes):**
- Frontend cluster: Zod, TanStack Query, Tailwind CSS, React Hook Form
- Backend cluster: Drizzle ORM, Zod, Bull/BullMQ client, tRPC

---

### What to Verify in the Diagram

1. **No library is a standalone node** — Zod, Drizzle, TanStack Query, Tailwind must all be inside `libCluster` nodes
2. **AWS services appear as proper infrastructure nodes** with correct categories
3. **Edges use protocol labels**: REST, WebSocket, SQL, SQS, S3 SDK, SMTP, Stripe Webhook, JWT
4. **Real-time path is clear**: Client → CloudFront → Next.js → WebSocket Server → ElastiCache Redis → (pub/sub) → Backend
5. **AI generation path is clear**: SQS Job → Bun Worker → OpenAI API → S3 (store output) → RDS (update record)
6. **Billing path is clear**: Stripe Webhook → API → RDS (update seat/usage counters)
7. **Swimlanes are correct**: Client, Edge/CDN, Frontend App, API/Backend, Data Layer, Platform Services, External APIs
