import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { geminiRegistry } from './registry';
import { ANALYZER_MODEL } from './config';
import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { eq } from 'drizzle-orm';
import { generateDiagramForBlueprint } from './diagram-generator';

const EXTRACTION_SYSTEM_PROMPT = `You are a system context extractor for an AI architecture advisor.
Your job is to read a conversation between a developer and an AI architect, extract every piece of technical context that has been revealed, and output an updated context map in JSON.

EXTRACTION RULES:
- Extract ONLY from what the user has stated. Do not guess or invent values.
- If a field is not mentioned, keep its current value from the existing context map (passed to you).
- Infer scale_tier from user count numbers if explicit tier wasn't stated.
- Convert boolean signals: "I need real-time" → has_realtime_requirement: true; "I'm using AI" → has_ai_ml_component: true.

FIELDS TO EXTRACT:

Core product:
- product_category (string): SaaS, consumer app, marketplace, tool, API, etc.
- core_user_workflow (string): the critical path a user takes in the product
- primary_user_persona (string): who the primary user is
- data_model_nature (string[]): any of "relational", "document", "real-time", "time-series", "file-heavy", "graph"
- has_realtime_requirement (boolean)
- has_ai_ml_component (boolean)

Scale:
- expected_users_month_1 (string): nano/micro/small/medium/large or a number
- expected_users_month_6 (string): same
- launch_timeline_weeks (number)
- scale_tier (string): "nano" | "micro" | "small" | "medium" | "large"

Team:
- team_size (string): "solo", "2-people", "3-5-people", "5-plus"
- primary_language (string): e.g. "typescript", "go", "python", "rust"
- familiar_frameworks (string[]): frameworks they know well
- budget_constraint (string): "bootstrapped" | "pre-revenue" | "funded" | "enterprise"
- devops_tolerance (number): 1 to 5

Stack preferences (these map directly to diagram nodes):
- backend_runtime (string): "bun" | "node" | "deno" | "go" | "rust" | "python"
- backend_framework (string): "hono" | "express" | "fastify" | "gin" | "axum" | "fastapi" | etc.
- auth_provider (string): "clerk" | "better-auth" | "auth0" | "supabase" | etc.
- orm_preference (string): "drizzle" | "prisma" | "typeorm" | "raw-sql" | etc.
- deployment_target (string): "vercel" | "railway" | "aws" | "gcp" | "cloudflare" | "vps" | etc.

Service needs (each maps to a diagram node):
- needs_payments (boolean)
- needs_email (boolean)
- needs_background_jobs (boolean)
- needs_websockets (boolean)
- needs_search (boolean)
- needs_ai_features (boolean)

Constraints:
- existing_tools (string[])
- compliance_requirements (string[]): "gdpr", "hipaa", "soc2", "pci-dss"
- non_negotiables (string[])

Tech philosophy (nested object):
- tech_philosophy.cloud_preference: "gcp" | "aws" | "azure" | "cloudflare" | "multi-cloud" | "no-preference"
- tech_philosophy.language_era: "legacy" | "modern" | "bleeding-edge"
- tech_philosophy.preferred_languages: string[]
- tech_philosophy.stack_style: "monolith" | "microservices" | "serverless" | "hybrid"
- tech_philosophy.devops_philosophy: "managed-only" | "container-friendly" | "infra-as-code"
- tech_philosophy.orm_stance: "love-orm" | "raw-sql" | "query-builder"
- tech_philosophy.ai_tooling_openness: "early-adopter" | "pragmatic" | "conservative"
- tech_philosophy.vendor_lock_in_tolerance: "hate-it" | "pragmatic" | "fine-with-it"
- tech_philosophy.open_source_priority: "always" | "preferred" | "indifferent"
- tech_philosophy.subjective_notes: string

PHASE TRANSITION RULES (suggest the phase the conversation should be in):
1. idle → project_discovery: immediately on first user message
2. project_discovery → tech_philosophy: when product_category, core_user_workflow, primary_user_persona, data_model_nature, has_realtime_requirement, has_ai_ml_component are all known
3. tech_philosophy → scale_discovery: when cloud_preference, language_era, stack_style, devops_philosophy, backend_runtime, orm_stance, vendor_lock_in_tolerance are all known
4. scale_discovery → builder_context: when scale_tier, launch_timeline_weeks are known
5. builder_context → constraints: when team_size, primary_language, budget_constraint, devops_tolerance are known
6. constraints → recommendation: when service needs, deployment_target, compliance_requirements, non_negotiables are known (even if empty)
7. recommendation → diagram: when the user explicitly agrees to or requests generating the diagram
8. diagram / followup: never downgrade from these phases

DIAGRAM REGENERATION:
Set "regenerateDiagram": true if the latest user message or AI response contains a request to add, remove, swap, modify, or visually update any service, component, or connection in the architecture diagram.

OUTPUT SCHEMA (JSON only, no markdown):
{
  "contextMap": { ...all extracted fields merged with existing... },
  "suggestedPhase": "phase_name",
  "regenerateDiagram": boolean
}`;


export async function analyzeAndUpdateBlueprint(
  blueprintId: string,
  fullHistory: { role: string; content: string }[]
) {
  try {
    // 1. Fetch current blueprint state
    const result = await db
      .select()
      .from(blueprints)
      .where(eq(blueprints.id, blueprintId))
      .limit(1);

    if (result.length === 0) return;
    const blueprint = result[0];

    // 2. Prepare chat transcript for LLM
    const transcript = fullHistory
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    const prompt = `Here is the current context map for reference:
${JSON.stringify(blueprint.contextMap, null, 2)}

Here is the full conversation history:
${transcript}

Analyze the history and return the updated context map, the suggested next phase, and whether to regenerate the diagram.`;

    // 3. Call LLM using registry keys (safe rotation)
    const currentKey = geminiRegistry.acquireKey();
    const google = createGoogleGenerativeAI({ apiKey: currentKey.key });

    const response = await generateText({
      model: google(ANALYZER_MODEL),
      system: EXTRACTION_SYSTEM_PROMPT,
      prompt,
    });

    // Strip markdown code fences if the model wrapped the JSON in ```json ... ```
    const rawText = response.text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');
    const data = JSON.parse(rawText);

    if (data.contextMap && data.suggestedPhase) {
      // Prevent downgrading the phase once the user has entered diagram/followup mode
      let nextPhase = data.suggestedPhase;
      if (blueprint.currentPhase === 'diagram' || blueprint.currentPhase === 'followup') {
        nextPhase = blueprint.currentPhase;
      }

      await db
        .update(blueprints)
        .set({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          contextMap: data.contextMap as any,
          currentPhase: nextPhase,
          chatHistory: fullHistory as never,
          updatedAt: new Date(),
        })
        .where(eq(blueprints.id, blueprintId));

      console.log(`[Analyzer] Updated blueprint ${blueprintId}: phase=${nextPhase}`);

      if (
        data.regenerateDiagram &&
        (blueprint.currentPhase === 'diagram' || blueprint.currentPhase === 'followup')
      ) {
        console.log(`[Analyzer] Detected diagram change request, regenerating diagram graph...`);
        try {
          await generateDiagramForBlueprint(blueprintId);
          console.log(`[Analyzer] Successfully regenerated diagram graph for ${blueprintId}`);
        } catch (diagError) {
          console.error('[Analyzer] Failed to regenerate diagram graph:', diagError);
        }
      }
    }
  } catch (error) {
    console.error(`[Analyzer] Failed to analyze blueprint ${blueprintId}:`, error);
  }
}
