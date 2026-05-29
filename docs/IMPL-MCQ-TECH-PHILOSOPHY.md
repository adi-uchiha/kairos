# Kairos — Implementation Plan: MCQ-Hybrid Chat UI + Tech Philosophy Phase

**Status:** Draft  
**Scope:** Two features — (1) MCQ-hybrid discovery UI, (2) New Tech Philosophy phase

---

## 1. Problem Statement

The current QnA phases demand heavy free-text effort from users across all discovery phases. Most questions have well-defined answer sets (budget, team size, DevOps comfort, cloud preference, etc.) that are best served by clickable choices, not an open textarea. Subjective, open-ended questions (product description, workflow, non-negotiables) should retain a rich text input UI. This hybrid approach reduces friction and increases completion rates.

Additionally, Kairos has no explicit mechanism to understand a user's **tech philosophy** — are they GCP-native? Do they prefer bleeding-edge (Hono, Bun, Rust) or legacy-proven (Java Spring, .NET)? This shapes the final recommendation as much as scale and budget do.

---

## 2. Feature Breakdown

### Feature A — MCQ-Hybrid Chat UI

- AI messages containing structured questions render **clickable choice chips** inline in the chat bubble.
- Selecting a choice immediately submits it as the user's message (no textarea required).
- Subjective questions show a **labeled textarea panel** beneath the AI bubble.
- MCQ phases: `tech_philosophy`, `scale_discovery`, `builder_context`, `constraints`.
- Free-text phases: `project_discovery`, `recommendation`, `diagram`, `followup`.

### Feature B — Tech Philosophy Phase

- New phase `tech_philosophy` inserted **between `project_discovery` and `scale_discovery`**.
- Builds a "tech DNA" profile via 5–7 quick MCQ questions + 1–2 subjective ones.
- Results stored in a `tech_philosophy` sub-object inside `contextMap`.
- The recommendation engine uses this to adjust bias (prefer GCP services, avoid Node, suggest Rust, etc.).

---

## 3. Architecture Overview

```
AI message arrives (streaming)
        │
        ▼
  Does message contain a :::mcq or :::subjective block?
  YES ──► Parse block → render McqChoices or SubjectiveInputPanel beneath bubble
  NO  ──► Default floating textarea input bar (current behavior)
```

The AI signals MCQ availability via **fenced JSON blocks** embedded in its response. The frontend parses these and renders the appropriate UI. The conversational text is rendered separately via `MarkdownRenderer`.

---

## 4. Phase State Machine Changes

### Updated Phase Sequence

```
PHASE_IDLE
PHASE_PROJECT_DISCOVERY        ← subjective only (product description)
PHASE_TECH_PHILOSOPHY          ← NEW: MCQ-dominant (tech DNA)
PHASE_SCALE_DISCOVERY          ← MCQ-dominant (user counts, timeline)
PHASE_BUILDER_CONTEXT          ← MCQ-dominant (team size, budget, devops)
PHASE_CONSTRAINTS              ← mixed MCQ + subjective
PHASE_RECOMMENDATION
PHASE_DIAGRAM
PHASE_FOLLOWUP
```

### New Transition Condition

**Tech Philosophy → Scale Discovery when:**

- `tech_philosophy.cloud_preference` is set
- `tech_philosophy.language_era` is set
- `tech_philosophy.stack_style` is set
- `tech_philosophy.devops_philosophy` is set

---

## 5. Data Model Changes

### 5.1 `types/blueprint.ts` — New interface + ContextMap extension

```typescript
export interface TechPhilosophy {
  cloud_preference: 'gcp' | 'aws' | 'azure' | 'cloudflare' | 'multi-cloud' | 'no-preference' | null;
  // 'legacy' = Java/.NET/PHP/Ruby  'modern' = Go/Python/TS  'bleeding-edge' = Rust/Bun/Zig
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

// Add to ContextMap:
tech_philosophy?: Partial<TechPhilosophy>;

// Update WORKSPACE_PHASES — insert after project_discovery:
{ id: 'tech_philosophy', label: 'Tech Philosophy', icon: 'code_blocks' }
```

### 5.2 DB Migration

The `contextMap` field is `jsonb`. No DB migration is required — the new `tech_philosophy` key is added to the existing JSONB column automatically.

---

## 6. MCQ Message Protocol

### 6.1 AI Output Format — MCQ block

```
:::mcq
{
  "type": "mcq",
  "question": "What's your primary cloud preference?",
  "field": "tech_philosophy.cloud_preference",
  "allowMultiple": false,
  "choices": [
    { "label": "GCP (Google Cloud)", "value": "gcp", "icon": "🔵" },
    { "label": "AWS", "value": "aws", "icon": "🟠" },
    { "label": "Azure", "value": "azure", "icon": "🔷" },
    { "label": "Cloudflare Workers/Pages", "value": "cloudflare", "icon": "🟡" },
    { "label": "No strong preference", "value": "no-preference", "icon": "⚪" }
  ]
}
:::
```

### 6.2 AI Output Format — Subjective block

```
:::subjective
{
  "type": "subjective",
  "field": "tech_philosophy.subjective_notes",
  "label": "Any other tech preferences or tools you'd never use again?",
  "placeholder": "e.g. I love open-source tools, hate vendor lock-in, and prefer self-hosting..."
}
:::
```

### 6.3 Rendering Rule

- The `:::mcq` / `:::subjective` blocks are **stripped from the rendered markdown text**.
- Only the conversational text above the block is shown via `MarkdownRenderer`.
- The interactive UI renders **below** the AI message bubble.
- Only the **latest** AI message's blocks are interactive. Previous ones are displayed greyed-out (non-clickable).

---

## 7. New Components

### 7.1 `components/workspace/McqChoices.tsx`

```
Purpose: Renders clickable chip-style choices for an MCQ block.

Props:
  block: McqBlock
  onSelect: (value: string, label: string) => void
  disabled?: boolean
  selected?: string[]       // for greying out after submission

UI Behaviour:
  - allowMultiple=false: single click fires onSelect immediately
  - allowMultiple=true: checkbox mode, shows "Confirm Selection" button
  - Selected chips: border-color #FF5500, bg: var(--orange-wash)
  - Disabled/past chips: opacity 0.5, cursor not-allowed
  - Layout: flex-wrap row of pills
```

### 7.2 `components/workspace/SubjectiveInputPanel.tsx`

```
Purpose: Inline textarea panel for open-ended questions within the chat flow.

Props:
  block: SubjectiveBlock
  onSubmit: (text: string) => void
  disabled?: boolean

UI Behaviour:
  - Renders block.label as a small label above the textarea
  - Uses block.placeholder in the textarea
  - "Send →" button or Enter (without Shift) submits
  - Styling matches existing textarea in ChatPanel
  - Min-height: 80px, max-height: 200px, auto-resize
```

### 7.3 `components/workspace/HybridMessage.tsx`

```
Purpose: Smart AI message wrapper. Delegates to MCQ, Subjective, or Markdown renders.

Props:
  message: ChatMessage
  isLatest: boolean          — only latest message shows interactive UI
  onMcqSelect: (value, label, field) => void
  onSubjectiveSubmit: (text, field) => void
  disabled?: boolean

Render order:
  1. <MarkdownRenderer content={parsedMessage.textContent} />
  2. For each block in parsedMessage.blocks:
     - McqBlock   → <McqChoices block={block} disabled={!isLatest || disabled} />
     - SubjectiveBlock → <SubjectiveInputPanel block={block} disabled={!isLatest || disabled} />
```

---

## 8. Updated `ChatPanel.tsx`

### New props:

```typescript
onMcqSelect: (value: string, label: string, field: string) => void;
onSubjectiveSubmit: (text: string, field: string) => void;
```

### Changes:

1. Replace assistant message render with `<HybridMessage>`.
2. Detect if the latest assistant message has MCQ/subjective blocks.
3. **Hide the floating textarea input bar** when:
   - Latest AI message has `blocks.length > 0` AND
   - Current phase is NOT `project_discovery` / `recommendation` / `diagram` / `followup`
4. Show floating textarea when no MCQ blocks present or in free-text phases.

---

## 9. `app/app/client-page.tsx` Changes

Add two handlers:

```typescript
const handleMcqSelect = useCallback(
  (value: string, label: string, _field: string) => {
    // Send the human-readable label as the user's chat message
    sendMessage(label);
  },
  [sendMessage]
);

const handleSubjectiveSubmit = useCallback(
  (text: string, _field: string) => {
    sendMessage(text);
  },
  [sendMessage]
);
```

Pass both to `<ChatPanel>`.

---

## 10. AI Prompt Changes (`lib/gemini/prompts.ts`)

### Base prompt — add rule 8:

```
8. For structured questions (scale, team size, budget, tech preferences), ALWAYS include
   a :::mcq or :::subjective block at the end of your message. The frontend renders these
   as clickable UI elements — the user will NOT be typing free text for these.
```

### New phase: `tech_philosophy`

```
You are in the TECH PHILOSOPHY phase.
Build a clear map of this developer's technology DNA.

Ask about the following in groups of 2–3 questions at most. Include :::mcq blocks.

Group 1:
- Cloud preference (GCP / AWS / Azure / Cloudflare / No preference)
- Infra philosophy (Fully managed / Container-friendly / Full IaC)

Group 2:
- Language era (Legacy: Java/.NET/PHP | Modern: Go/Python/TS | Bleeding-edge: Rust/Bun/Zig/Elixir)
- Stack architecture (Monolith / Microservices / Serverless / Hybrid)

Group 3:
- ORM stance (Love ORMs / Raw SQL / Query builders like Drizzle)
- Vendor lock-in tolerance (Avoid at all costs / Pragmatic / Fine with it)
- AI tooling openness (Early adopter / Pragmatic / Conservative/skeptical)

Close with one :::subjective block:
"Any strong opinions, tools you'd never use again, or non-negotiable preferences?"

After all fields are gathered, transition naturally to scale_discovery.
Do NOT make technology recommendations yet.
```

### Updated phases with MCQ blocks:

**`scale_discovery`** — add MCQ for launch timeline and scale uncertainty.

**`builder_context`** — add MCQ for team size, budget stage, DevOps comfort (1–5).

**`constraints`** — add MCQ (allowMultiple=true) for compliance requirements and existing tools. Add :::subjective for firm mandates.

### Updated `recommendation` prompt — inject tech philosophy:

```
TECH PHILOSOPHY:
{TECH_PHILOSOPHY_JSON}

Bias your recommendations accordingly:
- cloud_preference "gcp" → prefer Cloud Run, AlloyDB, Pub/Sub, GCS
- language_era "bleeding-edge" → prefer Bun, Hono, Axum, Drizzle
- language_era "legacy" → prefer Java Spring Boot, .NET, or Python Django
- vendor_lock_in "hate-it" → prefer self-hostable, open-source options
- orm_stance "raw-sql" → do NOT recommend Prisma; use pg driver or Drizzle
```

---

## 11. Analyzer Changes (`lib/gemini/analyzer.ts`)

### Add to extraction schema:

```
- tech_philosophy (object or null): {
    cloud_preference, language_era, preferred_languages, stack_style,
    devops_philosophy, orm_stance, ai_tooling_openness,
    vendor_lock_in_tolerance, open_source_priority, subjective_notes
  }
```

### Update phase transition rules:

```
Rule 1.5 (NEW):
  Transition from 'project_discovery' to 'tech_philosophy' when
  product_category and core_user_workflow are known.

Rule 2 (UPDATE):
  Transition from 'tech_philosophy' to 'scale_discovery' when
  tech_philosophy.cloud_preference, language_era, stack_style,
  and devops_philosophy are all set.
```

---

## 12. New Utility: `lib/mcq-parser.ts`

```typescript
export interface McqBlock {
  type: 'mcq';
  question: string;
  field: string;
  allowMultiple: boolean;
  choices: { label: string; value: string; icon?: string }[];
}

export interface SubjectiveBlock {
  type: 'subjective';
  field: string;
  label: string;
  placeholder?: string;
}

export type InteractiveBlock = McqBlock | SubjectiveBlock;

export interface ParsedMessage {
  textContent: string;
  blocks: InteractiveBlock[];
}

export function parseMcqBlocks(content: string): ParsedMessage {
  // 1. Match all :::mcq ... ::: and :::subjective ... ::: blocks
  // 2. Parse each as JSON
  // 3. Strip blocks from textContent
  // 4. Return { textContent, blocks }
  // 5. On JSON parse failure: silently skip block, preserve raw text
}
```

---

## 13. File-by-File Change Map

| File                                            | Change     | Description                                                                                                     |
| ----------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| `types/blueprint.ts`                            | **Modify** | Add `TechPhilosophy` interface, extend `ContextMap`, update `WORKSPACE_PHASES`                                  |
| `lib/mcq-parser.ts`                             | **New**    | `parseMcqBlocks()` utility — standalone, no deps                                                                |
| `components/workspace/McqChoices.tsx`           | **New**    | Clickable MCQ chip component                                                                                    |
| `components/workspace/SubjectiveInputPanel.tsx` | **New**    | Inline textarea panel for open questions                                                                        |
| `components/workspace/HybridMessage.tsx`        | **New**    | Smart AI message wrapper                                                                                        |
| `components/workspace/ChatPanel.tsx`            | **Modify** | Use `HybridMessage`, add MCQ props, conditional input bar                                                       |
| `app/app/client-page.tsx`                       | **Modify** | Add `handleMcqSelect`, `handleSubjectiveSubmit` handlers                                                        |
| `lib/gemini/prompts.ts`                         | **Modify** | Add `tech_philosophy` phase prompt; update all MCQ phases with block instructions; update recommendation prompt |
| `lib/gemini/analyzer.ts`                        | **Modify** | Add `tech_philosophy` extraction fields; add transition rule 1.5                                                |

---

## 14. Styling Notes

All new components follow the existing Kairos design system:

- `borderRadius: 0` — sharp corners everywhere
- MCQ chips: `background: var(--surface)`, `border: 1px solid var(--border)`
- Selected chip: `background: var(--orange-wash)`, `border-color: #FF5500`, `color: #FF5500`
- Hover: `background: var(--surface-hover)`
- MCQ section visually separated from AI text via `border-top: 1px solid var(--border)` with `padding-top: 12px`
- SubjectiveInputPanel matches the existing floating textarea styling

---

## 15. Implementation Sequence

1. `lib/mcq-parser.ts` — standalone utility, write + unit test first
2. `types/blueprint.ts` — add `TechPhilosophy` + update `WORKSPACE_PHASES`
3. `McqChoices.tsx` + `SubjectiveInputPanel.tsx` — pure UI, no business logic
4. `HybridMessage.tsx` — compose the above two + `MarkdownRenderer`
5. `ChatPanel.tsx` — integrate `HybridMessage`, add props, conditional input bar
6. `client-page.tsx` — wire MCQ handlers into `sendMessage`
7. `lib/gemini/prompts.ts` — add tech philosophy prompt + update all phase prompts with MCQ block instructions
8. `lib/gemini/analyzer.ts` — update extraction schema + phase transition rules
9. Manual smoke test: walk through all phases in a fresh blueprint
10. Update `docs/SPEC.md` + `docs/PRD.md` after code is validated

---

## 16. Open Questions

| #   | Question                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------- |
| 1   | Should MCQ selections be **optimistically applied** to the contextMap locally before the AI responds?          |
| 2   | Should the `:::mcq` block format be validated server-side, or parsed client-side only?                         |
| 3   | For `allowMultiple` blocks, single submit (comma-separated) or one message per selection?                      |
| 4   | Should tech philosophy preferences appear in a dedicated section of the **ContextMap sidebar**?                |
| 5   | Should previously answered MCQ questions be visually **greyed-out** in chat history to prevent re-interaction? |
