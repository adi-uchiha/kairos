/**
 * Gemini Streaming Client
 *
 * Wraps the Vercel AI SDK's `streamText` with key rotation + automatic retry.
 *
 * MODEL: gemini-3.1-pro-preview (Gemini 3.1 High)
 *
 * RETRY LOGIC:
 *   On 429 or quota errors  → marks current key, acquires next, retries immediately
 *   On 500/503 transient    → retries with any key (no penalty)
 *   Max retries             → MAX_RETRIES (defaults to total key count + 1)
 *
 * STREAMING:
 *   Returns a `ReadableStream` compatible with Next.js App Router streaming
 *   responses via `StreamingTextResponse` or `toTextStreamResponse()`.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { geminiRegistry } from './registry';
import type { ManagedKey } from './types';

// Local message type — structurally compatible with streamText's CoreMessage
type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// The model we always use: Gemini 3.1 High (Pro preview)
const MODEL = 'gemini-3.1-pro-preview';

// Maximum total attempts across all keys before giving up
const MAX_RETRIES = 10;

/**
 * Determine if an error is a rate-limit / quota error (429 / RESOURCE_EXHAUSTED).
 */
function isRateLimitError(error: unknown): boolean {
  const msg = errorToString(error);
  return (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('rate limit')
  );
}

/**
 * Determine if an error indicates the key's daily quota is fully used.
 */
function isQuotaExhaustedError(error: unknown): boolean {
  const msg = errorToString(error);
  // Daily quota errors typically include "quota" + "exceeded" or "RESOURCE_EXHAUSTED"
  return (
    (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota exceeded')) &&
    !msg.includes('per-minute')
  );
}

/**
 * Determine if an error is a transient server error (retry without penalizing key).
 */
function isTransientError(error: unknown): boolean {
  const msg = errorToString(error);
  return (
    msg.includes('500') ||
    msg.includes('503') ||
    msg.includes('Service Unavailable') ||
    msg.includes('overloaded')
  );
}

function errorToString(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message + ' ' + String(error);
  return JSON.stringify(error);
}

/**
 * Streams a chat response from Gemini 3.1 High with automatic key rotation.
 *
 * @param messages - Full conversation history in AI SDK CoreMessage format
 * @param systemPrompt - The phase-aware system prompt to inject
 * @returns A ReadableStream of text chunks (SSE-compatible)
 */
export async function streamGeminiChat(
  messages: ChatMessage[],
  systemPrompt: string,
  onFinish?: (event: any) => void | Promise<void>
): Promise<ReturnType<typeof streamText>> {
  let attempt = 0;
  let lastKey: ManagedKey | null = null;

  while (attempt < MAX_RETRIES) {
    attempt++;
    let currentKey: ManagedKey;

    try {
      currentKey = geminiRegistry.acquireKey();
    } catch (registryError) {
      // All keys exhausted/rate-limited — surface immediately
      throw registryError;
    }

    lastKey = currentKey;

    try {
      // Create a per-request Google provider instance with this key
      const google = createGoogleGenerativeAI({
        apiKey: currentKey.key,
      });

      const result = streamText({
        model: google(MODEL),
        system: systemPrompt,
        messages,
        // Reasonable defaults for a conversational AI
        maxOutputTokens: 8192,
        temperature: 0.7,
        onFinish,
      });

      // If we get here, streaming started successfully
      console.log(
        `[GeminiClient] Streaming started with key ${currentKey.label} (attempt ${attempt})`
      );
      return result;
    } catch (error) {
      console.error(
        `[GeminiClient] Error on key ${lastKey.label} (attempt ${attempt}):`,
        errorToString(error)
      );

      if (isQuotaExhaustedError(error)) {
        geminiRegistry.markExhausted(lastKey);
        // Immediately retry with next key
        continue;
      }

      if (isRateLimitError(error)) {
        geminiRegistry.markRateLimited(lastKey);
        // Immediately retry with next key
        continue;
      }

      if (isTransientError(error)) {
        // Don't penalize the key; just retry
        console.warn(`[GeminiClient] Transient error on ${lastKey.label}. Retrying...`);
        await new Promise((r) => setTimeout(r, 1000 * attempt)); // brief backoff
        continue;
      }

      // Unknown error — rethrow immediately
      throw error;
    }
  }

  throw new Error(
    `[GeminiClient] Failed after ${MAX_RETRIES} attempts. All keys may be exhausted or rate-limited.`
  );
}
