/**
 * Kairos System Prompt Builder
 *
 * Assembles the full phase-aware system prompt from the base agent
 * instructions and the current phase brief. The FULL context map is
 * injected into the phase prompt so the LLM knows exactly what it
 * already knows and can make precise decisions about what to ask next.
 *
 * Export surface: KAIROS_SYSTEM_PROMPT(phase, contextMap)
 */

import { BASE_PROMPT } from './base';
import { PHASE_PROMPTS } from './phases';

/**
 * Builds the complete system prompt for the current phase.
 *
 * @param phase - Current workflow phase key (e.g. 'project_discovery')
 * @param contextMap - Full live context map from the database
 * @returns Complete system prompt string to pass to the LLM
 */
export function KAIROS_SYSTEM_PROMPT(
  phase?: string,
  contextMap?: Record<string, unknown>
): string {
  const phaseKey = phase ?? 'idle';
  let phaseInstruction = PHASE_PROMPTS[phaseKey] ?? PHASE_PROMPTS['idle'];

  // Inject the FULL context map JSON — the LLM needs the complete picture
  // to decide which question to ask next and whether to transition phases.
  const fullJson = contextMap ? JSON.stringify(contextMap, null, 2) : '{}';
  phaseInstruction = phaseInstruction.replace(/{FULL_CONTEXT_MAP_JSON}/g, fullJson);

  return `${BASE_PROMPT}\n${phaseInstruction}`;
}
