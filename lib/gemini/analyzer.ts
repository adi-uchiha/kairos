import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { geminiRegistry } from './registry';
import { ANALYZER_MODEL } from './config';
import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { eq } from 'drizzle-orm';
import { generateDiagramForBlueprint } from './diagram-generator';

const EXTRACTION_SYSTEM_PROMPT = `You are a system context extractor. Your job is to read a chat history between a user and an architect, and output an updated context map in JSON format.
You must update the fields based on what the user has revealed so far. Do not guess or make up details not present in the text.

Fields to update:
- product_category (string or null): SaaS, consumer app, etc.
- core_user_workflow (string or null): e.g. "upload image, process with AI, send email"
- primary_user_persona (string or null): who uses it
- data_model_nature (array of strings): "relational", "document", "real-time", "time-series", "file-heavy", "graph"
- has_realtime_requirement (boolean or null)
- has_ai_ml_component (boolean or null)
- expected_users_month_1 (number or null)
- expected_users_month_6 (number or null)
- launch_timeline_weeks (number or null)
- scale_tier (string or null): "nano" | "micro" | "small" | "medium" | "large"
- team_size (number or null)
- primary_language (string or null)
- familiar_frameworks (array of strings)
- budget_constraint (string or null): "bootstrapped" | "pre-revenue" | "funded" | "enterprise"
- devops_tolerance (number or null): 1 to 5
- existing_tools (array of strings)
- compliance_requirements (array of strings)
- non_negotiables (array of strings)
- tech_philosophy (object or null): {
    cloud_preference: string or null ("gcp", "aws", "azure", "cloudflare", "multi-cloud", "no-preference"),
    language_era: string or null ("legacy", "modern", "bleeding-edge"),
    preferred_languages: array of strings,
    stack_style: string or null ("monolith", "microservices", "serverless", "hybrid"),
    devops_philosophy: string or null ("managed-only", "container-friendly", "infra-as-code"),
    orm_stance: string or null ("love-orm", "raw-sql", "query-builder"),
    ai_tooling_openness: string or null ("early-adopter", "pragmatic", "conservative"),
    vendor_lock_in_tolerance: string or null ("hate-it", "pragmatic", "fine-with-it"),
    open_source_priority: string or null ("always", "preferred", "indifferent"),
    subjective_notes: string or null
  }

Also recommend the next phase.
Rules for Phase Transition:
1. Transition from 'project_discovery' to 'tech_philosophy' when product_category and core_user_workflow are known.
1.5. Transition from 'tech_philosophy' to 'scale_discovery' when tech_philosophy.cloud_preference, language_era, stack_style, and devops_philosophy are known.
2. Transition from 'scale_discovery' to 'builder_context' when expected_users_month_1, expected_users_month_6, and launch_timeline_weeks are known (or defaults assigned).
3. Transition from 'builder_context' to 'constraints' when team_size, primary_language, budget_constraint, and devops_tolerance are known.
4. Transition from 'constraints' to 'recommendation' when constraints are known (even if none).
5. Transition from 'recommendation' to 'diagram' when the user asks to generate the diagram.

Determine if the visual diagram needs to be updated or regenerated. 
Set "regenerateDiagram" to true if the latest messages contain a request from the user (or agreement from the architect) to add, remove, swap, connect, or modify any tools, components, services, or architecture connections in the visual diagram graph. Otherwise, set it to false.

Your output must be JSON only matching this schema:
{
  "contextMap": { ... },
  "suggestedPhase": "current_or_next_phase_name",
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
