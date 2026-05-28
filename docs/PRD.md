# Kairos — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Draft  
**Owner:** Aditya  
**Last Updated:** 2026-05-28

---

## 1. Product Overview

### 1.1 Product Name
**Kairos** — AI System Architect & Tech Stack Advisor

### 1.2 One-Line Description
An AI-powered conversational tool that asks the right questions and gives opinionated, context-aware tech stack and system architecture recommendations for solo developers and small teams.

### 1.3 Problem Statement
Solo developers and early-stage founders consistently struggle with tech stack paralysis. Generic advice online (blog posts, YouTube comparisons, Reddit threads) is either too abstract ("it depends"), too biased (vendor marketing), or too outdated to reflect the current ecosystem. There is no tool that:

- Asks about your *specific* product context before answering
- Maps recommendations to your *actual* scale expectations
- Distinguishes between what you need *now* vs. what you'll need *later*
- Gives an honest opinion instead of listing every option

### 1.4 Target Users

| Persona | Description |
|---------|-------------|
| **The Indie Hacker** | Solo developer building a SaaS product, often bootstrapped, time-constrained, budget-conscious |
| **The Weekend Builder** | Developer exploring a new idea, wants to validate fast with minimal overhead |
| **The First-Time Founder** | Technical co-founder or solo founder evaluating their first serious architecture |
| **The Junior-to-Mid Dev** | Developer who can code but lacks experience making architectural decisions |
| **The Pivoting Engineer** | Experienced dev moving from one domain (e.g., mobile) to full-stack web |

### 1.5 Success Metrics

| Metric | Target |
|--------|--------|
| User completes full conversation flow | >70% completion rate |
| User copies/saves the final recommendation | >50% of completed sessions |
| NPS / satisfaction rating | >8/10 |
| Time from first message to final recommendation | <10 minutes |
| Return usage (same user, new project) | >30% within 30 days |

---

## 2. Core User Journey

```
User opens Kairos
        ↓
Phase 1: Project Discovery
  AI asks open-ended questions about the product idea
  (What are you building? Who is it for? What's the core workflow?)
        ↓
Phase 2: Scale & Timeline Discovery
  AI asks about expected users, growth horizon, launch timeline
  (How many users in month 1? Month 6? Is this a side project or a company?)
        ↓
Phase 3: Builder Context
  AI asks about team size, technical background, budget constraints
  (Solo? Co-founder? What's your strongest language?)
        ↓
Phase 4: Constraints & Non-Negotiables
  AI asks if there are existing tools, legacy systems, or firm requirements
  (Already using X? Must comply with Y? Employer has Z?)
        ↓
Phase 5: Recommendation Generation
  AI generates a complete, reasoned tech stack + architecture recommendation
  Includes: Frontend, Backend, Database, Auth, Email, Hosting, Observability
  Includes: Free-tier vs. paid breakdown
  Includes: Scale migration roadmap
        ↓
Phase 6: Visual Architecture Diagram
  AI generates an interactive, node-based diagram of the full system
  User can explore, click nodes for details, edit/swap services,
  and ask the AI questions directly on the diagram
        ↓
Phase 7: Follow-up / Deep Dive
  User can ask clarifying questions, challenge recommendations,
  or ask for alternatives ("what if I hate TypeScript?")
```

---

## 3. Feature Requirements

### 3.1 Phase 1 — Conversational Discovery (P0)

**Goal:** Build a complete context map before making any recommendation.

**Requirements:**
- FR-01: The AI MUST ask open-ended questions about the product idea as the very first interaction. No generic greetings. No immediate recommendations.
- FR-02: The AI MUST follow the thread of the user's answer — if they mention "e-commerce," the next question should reference that context, not be a generic template question.
- FR-03: The discovery phase MUST cover at minimum:
  - Product category (SaaS, consumer app, internal tool, API, marketplace, etc.)
  - Core user workflow (what does a user actually *do* in this product?)
  - Primary user persona (who are the users? Are they technical?)
  - Data model sketch (is the data relational? documents? time-series? real-time?)
  - Real-time requirements (does the product need live updates, sockets, etc.)
- FR-04: The AI MUST NOT ask more than 3–4 questions at a time. Questions should be grouped naturally, not fired as a list.
- FR-05: The AI MUST acknowledge and briefly reflect on the user's answer before asking the next set of questions. This makes the conversation feel human.

### 3.2 Phase 2 — Scale & Timeline Discovery (P0)

**Goal:** Assign the project to a scale tier to anchor recommendations appropriately.

**Requirements:**
- FR-06: The AI MUST ask for concrete user numbers, not vague terms like "small" or "big." If the user says "small," the AI MUST ask for an estimate.
  - "How many users do you expect in the first month after launch?"
  - "What's your 6-month target if things go reasonably well?"
  - "Is there a scenario where you'd have 10x that number? What would cause it?"
- FR-07: The AI MUST ask about the launch timeline — "Are you trying to ship in 2 weeks, 3 months, or 1 year?"
- FR-08: The AI MUST map the user's answers to one of the defined scale tiers (Nano, Micro, Small, Medium, Large) and use that tier to constrain recommendations.
- FR-09: If the user says "I don't know" for scale, the AI MUST default to **Nano** assumptions and clearly state that it has done so and why.

### 3.3 Phase 3 — Builder Context (P0)

**Requirements:**
- FR-10: The AI MUST ask about team size. Recommendations for a solo dev are different from a 3-person team.
- FR-11: The AI MUST ask about the user's strongest language/framework. Recommending Go to someone who only knows Python is not helpful.
- FR-12: The AI MUST ask about budget constraints — are they bootstrapped, pre-revenue, or funded?
- FR-13: The AI MUST ask about how much DevOps/infrastructure management the user is comfortable with. (Scale of 1–5 is fine.)

### 3.4 Phase 4 — Constraints Discovery (P1)

**Requirements:**
- FR-14: The AI MUST ask if there are any non-negotiable technology decisions already made (e.g., "we already use Firebase," "it has to be on AWS because of compliance").
- FR-15: The AI MUST ask if there are legal/compliance requirements (GDPR, HIPAA, SOC2) that would affect hosting or data storage choices.
- FR-16: If existing tools are mentioned, the AI MUST incorporate them into the recommendation rather than ignoring them.

### 3.5 Phase 5 — Recommendation Generation (P0)

**Goal:** Generate a complete, structured, opinionated tech stack and architecture recommendation.

**Requirements:**

#### 3.5.1 Stack Coverage
The recommendation MUST include a concrete decision for each of the following categories:

| Category | Examples of Output |
|----------|--------------------|
| **Frontend** | Vite + React + TanStack Router, or Next.js |
| **Styling** | Tailwind CSS, CSS Modules, shadcn/ui |
| **State Management** | TanStack Query, Zustand, Jotai |
| **Backend** | Go + Fiber, Node.js + Hono, Python + FastAPI |
| **Database** | Postgres (Neon/Supabase), MongoDB Atlas, SQLite (Turso) |
| **Auth** | Clerk, Supabase Auth, Better Auth |
| **Email** | Resend, Postmark |
| **File Storage** | Cloudflare R2, AWS S3, Supabase Storage |
| **Hosting — Frontend** | Vercel, Cloudflare Pages |
| **Hosting — Backend** | Railway, Render, Fly.io, Cloud Run |
| **Observability** | PostHog, Sentry, Axiom (logs) |
| **Payments** | Stripe, Lemon Squeezy |
| **Search (if needed)** | Algolia, Meilisearch, Postgres FTS |
| **Queue/Jobs (if needed)** | Inngest, BullMQ, Trigger.dev |

#### 3.5.2 Cloud vs. Managed Services Decision
- FR-17: The AI MUST explicitly decide whether the user should use **cloud infrastructure** (AWS, GCP, Azure) or **managed/composable services** (Vercel, Railway, Supabase, Resend, etc.).
- FR-18: This decision MUST be tied directly to the scale tier:
  - Nano/Micro → Default to managed services (free tiers, minimal ops)
  - Small → Managed services + evaluate cloud storage/CDN
  - Medium → Introduce cloud infrastructure for critical path components
  - Large → Full cloud-native architecture justified
- FR-19: The AI MUST give an explicit reason for the cloud vs. managed decision, referencing the user's stated scale and ops tolerance.

#### 3.5.3 Output Structure
FR-20: The recommendation output MUST follow this structure:

```
## 🎯 Your Stack at a Glance
[One table with all categories and chosen tools]

## 🧠 Why This Stack
[2–4 sentence rationale for the overall approach]

### Frontend
[Chosen tool + why]

### Backend
[Chosen tool + why]

### Database
[Chosen tool + why]

### Auth, Email, Storage, Hosting
[Chosen tools + brief rationale]

## 💰 Cost Breakdown
[Table: Tool | Free Tier | Paid Tier Starts At | Your Expected Cost at Scale]

## 🗺️ Your Migration Roadmap
[What changes at each scale tier — what to swap and why]

## ⚠️ Trade-offs You're Accepting
[Honest list of what you're giving up with these choices]
```

#### 3.5.4 Visual Architecture Diagram (P0 — Core Feature)
- FR-21: After the text recommendation is complete, Kairos MUST generate a structured JSON graph representing the full system architecture. This graph is rendered as an interactive, node-based diagram using a ReactFlow-style canvas.
- FR-22: Every node in the diagram MUST represent a single service, tool, or layer from the recommendation (e.g., one node for Vercel, one for Supabase, one for Resend, one for the Next.js frontend).
- FR-23: Nodes MUST display the official logo/icon of the technology where available. Cloud service nodes (AWS Lambda, GCP Cloud Run) MUST display the official cloud provider service icon.
- FR-24: Edges (arrows) between nodes MUST represent data flow direction (e.g., Frontend → Backend API → Database). Edge labels MUST describe the relationship (e.g., "REST API", "SQL queries", "WebSocket", "SMTP").
- FR-25: Clicking any node MUST open an inline detail panel showing: why this service was chosen, its free tier limits, approximate monthly cost at the user's scale tier, and the signal to swap/upgrade.

### 3.6 Phase 6 — Diagram Interaction (P0)

**Goal:** Allow the user to explore, interrogate, and modify the generated architecture diagram conversationally.

**Requirements:**
- FR-26: The user MUST be able to swap any node (e.g., "Replace Supabase with PlanetScale") directly from the diagram. Kairos MUST re-reason the impact on all connected nodes and update the diagram and text recommendation accordingly.
- FR-27: The user MUST be able to select any node and ask the AI a contextual question about it (e.g., "What happens if this goes down?" or "Is there a cheaper alternative?").
- FR-28: The user MUST be able to pan, zoom, and rearrange nodes on the canvas without affecting the underlying data.
- FR-29: The diagram MUST support a "layers" view toggle: show all layers simultaneously, or filter to one layer at a time (Frontend, Backend, Data, Infrastructure).
- FR-30: The diagram MUST be exportable as a PNG image or a shareable URL.
- FR-31: The diagram data structure (the node/edge JSON) MUST be exportable so users can import it into other diagramming tools (e.g., Miro, Figma, draw.io) via a standard format.

### 3.7 Phase 7 — Follow-up Interaction (P1)

**Requirements:**
- FR-32: After generating the recommendation and diagram, the AI MUST explicitly invite follow-up questions.
- FR-33: The AI MUST be able to handle challenges like "why not X instead of Y?" and respond with a direct, honest comparison in context.
- FR-34: The AI MUST be able to regenerate specific sections if the user changes a constraint (e.g., "actually I do have funding, how does that change things?").
- FR-35: The AI MUST be able to answer "what if I already know Go?" type questions and adjust the recommendation accordingly.

---

## 4. Non-Functional Requirements

### 4.1 Tone & Voice
- **NFR-01:** Conversational, direct, opinionated. Like a senior engineer over coffee — not a consultant, not a textbook.
- **NFR-02:** No hedging language like "it depends" without immediately saying what it depends on.
- **NFR-03:** No jargon without inline explanation on first use.
- **NFR-04:** Recommendations must feel like they come from someone who has actually shipped production systems, not from a Wikipedia article.

### 4.2 Response Quality
- **NFR-05:** Every recommendation must include a "why" — not just the tool name.
- **NFR-06:** Every recommendation must include a trade-off — what the user is giving up.
- **NFR-07:** The AI must not recommend deprecated, sunset, or niche-without-justification tools.
- **NFR-08:** Default recommendations must reflect the current ecosystem (2025/2026 tooling), not tools that were popular in 2019.

### 4.3 Conversation Flow
- **NFR-09:** The discovery phase MUST NOT be skippable. If a user tries to get a recommendation without answering discovery questions, the AI MUST redirect.
- **NFR-10:** The AI MUST gracefully handle ambiguous or short answers by asking a gentle follow-up rather than making assumptions.
- **NFR-11:** The AI MUST NOT overwhelm the user with a wall of text. Responses should be appropriately sized for the conversation phase.

---

## 5. Out of Scope (v1)

The following are explicitly NOT in scope for the first version:

- ❌ Implementation tutorials or code generation
- ❌ Pricing calculators (beyond rough estimates)
- ❌ CI/CD pipeline recommendations (may be added in v2)
- ❌ Security audit or threat modeling
- ❌ Database schema design
- ❌ Mobile-native stack recommendations (iOS, Android)
- ❌ AI/ML infrastructure recommendations
- ❌ Multi-region/global CDN strategy

---

## 6. Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Should Kairos support session saving/sharing (share a link to your recommendation)? | Open |
| 2 | Should the tool allow the user to specify "I already use X" at the start, before discovery? | Open |
| 3 | Should there be a "quick mode" that skips to scale tier selection? | Open |
| 4 | What is the primary deployment target — web app, CLI, or embedded chat widget? | Open |
| 5 | Should Kairos track what stacks it recommends most, to improve over time? | Open |

---

## 7. Dependencies & Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Tool landscape changes faster than the system prompt | High | Medium | Versioned recommendation templates, periodic reviews |
| Users skip discovery and demand immediate answers | High | High | Enforce discovery gate; redirect with explanation |
| Recommendations feel too generic despite discovery | Medium | High | Fine-tune system prompt with real user conversation examples |
| Users have wildly unrealistic scale expectations | Medium | Medium | Anchor expectations with comparative benchmarks in the prompt |
| AI confidently recommends wrong tool for edge cases | Medium | High | Add explicit uncertainty signals when context is unusual |
