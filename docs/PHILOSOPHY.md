# Kairos — Philosophy

> *"The right tool, at the right scale, for the right builder."*

---

## 1. The Problem We're Solving

Every solo developer, indie hacker, and early-stage founder faces the same paralysis moment: **the blank architecture decision**.

You have an idea. Maybe even a working prototype. But now you need to decide:

- Do I use Next.js or Vite?
- Should I use Postgres or MongoDB?
- Do I need AWS, or will Vercel + PlanetScale get me to v1?
- Is Go overkill for my backend, or will Node.js hold me back?
- When do I actually need Redis? What about a message queue?

These decisions are loaded. They have long-term consequences. They're also deeply **context-dependent** — the right stack for a social app with 10M DAU is catastrophically wrong for a weekend project targeting 200 users.

And yet, most resources online give you the same advice: "it depends." That answer is useless to a solo developer at 2 AM.

**Kairos exists to give a real, reasoned, opinionated answer — tailored to your specific context.**

---

## 2. Core Philosophy

### 2.1 Context Is Everything

A tech stack is not universally good or bad. It is *appropriate* or *inappropriate* given:

- The nature of the product (B2B SaaS, consumer app, internal tool, API, etc.)
- The scale it must handle today and in 6 months
- The team size (solo, 2-person, small team)
- The developer's familiarity and ramp-up cost
- The budget (bootstrapped, funded, free-tier constrained)

Kairos begins every conversation by building this context map. No recommendation is made until this map is sufficiently complete.

### 2.2 Opinionated by Default, Flexible by Design

We don't believe in "you can use anything." That mindset produces analysis paralysis.

Kairos has a **default opinion** — a bias toward modern, proven, composable tools that work well at small-to-medium scale with minimal DevOps overhead. This default opinion is:

- **Frontend:** Vite + React + TanStack Router/Query, or Next.js for SSR-heavy apps
- **Backend:** Go (Fiber/Echo) for performance-critical APIs, Node.js/Hono for quick iteration
- **Database:** Postgres (via Supabase or Neon) as the default; MongoDB only when truly document-native
- **Auth:** Clerk or Supabase Auth — never roll your own
- **Email:** Resend
- **Hosting:** Vercel (frontend), Railway/Render (backend), with cloud (AWS/GCP) reserved for scale
- **Observability:** PostHog for product analytics, Sentry for errors

These opinions can be overridden when the user's context demands it. But they are the *starting point*, not a menu to scroll through.

### 2.3 Scale-Aware Recommendations

The biggest mistake developers make is over-engineering for scale they'll never reach, or under-engineering and hitting a wall at 10,000 users.

Kairos maps recommendations to explicit **scale tiers**:

| Tier | Users | Philosophy |
|------|-------|------------|
| **Nano** | 1–500 | Free-tier everything. Ship fast, validate fast. |
| **Micro** | 500–10K | Managed services. Avoid ops. Pay only for what you use. |
| **Small** | 10K–100K | Introduce caching, queues, CDN. Start thinking about reliability. |
| **Medium** | 100K–1M | Cloud infrastructure justified. Horizontal scaling, monitoring. |
| **Large** | 1M+ | Full cloud-native. Platform engineering, SRE mindset. |

### 2.4 The Solo Dev is the Primary User

Kairos is built for the **one-person team**. This changes everything:

- Recommendations must minimize **operational complexity**. A solo dev cannot maintain a Kubernetes cluster.
- Managed services are almost always preferred over self-hosted.
- DX (Developer Experience) matters as much as performance. A tool that's 20% slower but 3x faster to ship with is often the right choice at Nano/Micro scale.
- **Total Cost of Ownership** includes time. A "free" self-hosted solution that takes 10 hours to configure is not free.

### 2.5 Honest About Trade-offs

Kairos never pretends a recommendation is perfect. Every suggestion comes with:

- **Why this tool** — the specific reasons it fits this context
- **What you give up** — honest trade-offs and limitations
- **When to reconsider** — the trigger signals that mean you've outgrown this choice

This is what a senior engineer would tell you over coffee. Not a sales pitch, not a benchmark comparison. A real conversation.

### 2.6 The Question-First Approach

Kairos never guesses. It asks.

Before any recommendation, Kairos runs a **structured discovery conversation** — open-ended questions that surface the context it needs to reason well. These questions are designed to:

1. **Understand the product** — what it does, who it serves, what makes it special
2. **Understand the scale** — realistic numbers, not aspirational ones
3. **Understand the builder** — experience level, time constraints, budget
4. **Understand the constraints** — deadlines, existing infrastructure, non-negotiables

Only once this map is complete does Kairos generate recommendations.

---

### 2.7 The Diagram is the Deliverable

Most architecture tools give you a list. Kairos gives you a **living, interactive diagram**.

After the conversational discovery phases and the text-based recommendation, Kairos generates a **node-based visual architecture diagram** — rendered in a ReactFlow/n8n-style canvas. This is the crown jewel of the product.

This diagram is not a static image. It is:

- **Explorable** — Pan, zoom, and navigate through every layer of your system
- **Icon-driven** — Each node shows the official logo or icon of the technology (Postgres elephant, Vercel triangle, AWS Lambda bolt, etc.) so the diagram is immediately recognizable
- **Interactive** — Click any node to open a detail panel explaining why that service was chosen, its free tier limits, approximate cost, and the trigger to upgrade or replace it
- **Editable** — Swap any node (e.g., replace Supabase with PlanetScale) and Kairos re-reasons the impact on connected nodes in real time
- **Conversational** — Ask the diagram questions: "What happens if this service goes down?" "What does this arrow represent?" "Show me the data flow for the auth system."

The diagram transforms an architecture decision from a document into a **shared mental model** — something a developer can walk a co-founder, investor, or future hire through without needing to explain from scratch.

This is Kairos's core differentiator. Everything else — the conversation, the context map, the recommendation text — exists to produce this diagram.

---

## 3. What Kairos is NOT

- **Not a framework benchmarking tool.** We don't compare benchmark numbers. We reason about fit.
- **Not a tutorial generator.** We tell you *what* to use and *why*, not *how* to implement it.
- **Not vendor-agnostic to a fault.** We will recommend specific products. Vagueness helps no one.
- **Not a one-size-fits-all oracle.** The discovery phase is non-negotiable. Without context, there are no recommendations.
- **Not a replacement for engineering judgment.** Kairos is a thinking partner, not an authority. Treat its output as a strong starting point, not a final decree.

---

## 4. Design Principles for the AI

### 4.1 Conversational, Not Interrogative

The discovery phase should feel like talking to a smart friend, not filling out a form. Questions should be open-ended, follow the thread of previous answers, and build on what the user has shared.

### 4.2 Layered Depth

Kairos asks first about the big picture (what is this product?), then progressively narrows to specifics (what does the data model look like?). It never front-loads technical questions before understanding the human context.

### 4.3 Progressive Disclosure

The output is structured in layers:
1. **Quick Summary** — the TL;DR stack in one table
2. **Rationale** — why each choice was made
3. **Visual Architecture Diagram** — an interactive, node-based canvas showing the full system
4. **Migration Path** — what to swap out at each scale tier
5. **Free vs. Paid Breakdown** — what costs money and when

### 4.4 No Jargon Without Explanation

If Kairos uses a term (e.g., "edge runtime," "connection pooling," "eventual consistency"), it briefly explains it. We assume the user is smart but not necessarily expert in every domain.

---

## 5. The North Star

The best outcome for a Kairos session is a developer who:

1. **Understands** why each piece of their stack was chosen
2. **Knows** exactly what they're trading away
3. **Can walk someone through** their architecture using the visual diagram — no slides, no whiteboarding
4. **Has a roadmap** for what to change as they grow
5. **Ships faster** because they stopped second-guessing their tools

If the developer leaves the session holding an interactive, editable architecture diagram they actually understand — Kairos has done its job.

---

*Built for builders who want to think clearly, move fast, and scale deliberately.*
