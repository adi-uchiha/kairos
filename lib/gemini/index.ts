/**
 * Gemini LLM Infrastructure — Public API
 *
 * Import from here, not from individual files:
 *   import { streamGeminiChat } from '@/lib/gemini';
 */

export { streamGeminiChat } from './client';
export { geminiRegistry } from './registry';
export { analyzeAndUpdateBlueprint } from './analyzer';
export { generateDiagramForBlueprint } from './diagram-generator';
export type { ChatMessage, ChatRequest } from './types';
