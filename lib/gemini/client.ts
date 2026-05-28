/**
 * Gemini Streaming Client — Direct REST Implementation
 *
 * Bypasses the Vercel AI SDK entirely for streaming to get full, reliable
 * control over key rotation.
 *
 * WHY NOT THE VERCEL AI SDK:
 *   streamText() lazily starts the fetch. By the time a 429 is detectable
 *   (via fullStream error events), we have already committed a 200 response
 *   to the client and Next.js throws "failed to pipe response".
 *
 * HOW THIS WORKS:
 *   fetch() resolves with HTTP headers (incl. status code) BEFORE the body
 *   is read. So response.status === 429 is checked synchronously, before we
 *   return any stream to the caller. On 429 → mark key → retry with next key.
 *   On 200 → pipe the SSE body, parsing text chunks and forwarding them.
 *
 * MODEL: gemini-3.1-pro-preview (Gemini 3.1 High)
 *
 * RETRY LOGIC:
 *   429 / quota  → marks current key rate-limited, acquires next, retries immediately
 *   500/503      → brief backoff, retry without penalising key
 *   Max attempts → MAX_RETRIES (10)
 */

import { geminiRegistry } from './registry';
import type { ManagedKey } from './types';

// Local message type
type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const MODEL = 'gemini-3.1-pro-preview';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`;
const MAX_RETRIES = 10;

function errorToString(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

function isTransientError(error: unknown): boolean {
  const msg = errorToString(error).toLowerCase();
  return msg.includes('500') || msg.includes('503') || msg.includes('overloaded') || msg.includes('network');
}

/**
 * Streams a Gemini response using the direct REST API with automatic key rotation.
 *
 * @param messages  Full conversation history
 * @param systemPrompt  Phase-aware system prompt
 * @param onFinish  Optional callback fired with the full accumulated text when streaming ends
 * @returns  A ReadableStream<string> of text chunks
 */
export async function streamGeminiChat(
  messages: ChatMessage[],
  systemPrompt: string,
  onFinish?: (event: { text: string }) => void | Promise<void>
): Promise<ReadableStream<string>> {
  let attempt = 0;
  let lastKey: ManagedKey | null = null;

  while (attempt < MAX_RETRIES) {
    attempt++;
    let currentKey: ManagedKey;

    try {
      currentKey = geminiRegistry.acquireKey();
    } catch (registryError) {
      // All keys exhausted — surface immediately
      throw registryError;
    }

    lastKey = currentKey;

    try {
      const url = `${BASE_URL}&key=${encodeURIComponent(currentKey.key)}`;

      // Build the Google AI REST request body.
      // System prompt goes in systemInstruction, not the contents array.
      const requestBody = {
        contents: messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        ...(systemPrompt && {
          systemInstruction: { parts: [{ text: systemPrompt }] },
        }),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      };

      // ── FETCH ────────────────────────────────────────────────────────────
      // fetch() resolves when HTTP HEADERS arrive — before the body is read.
      // This means response.status is available NOW, not after streaming starts.
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      // ── 429 CHECK — before returning anything to the caller ───────────────
      if (response.status === 429) {
        // Consume body to free the connection
        await response.text().catch(() => {});
        geminiRegistry.markRateLimited(currentKey);
        console.warn(
          `[GeminiClient] Key ${currentKey.label} rate-limited (attempt ${attempt}). Rotating to next key...`
        );
        continue; // back to top of while loop — acquires a new key
      }

      if (!response.ok) {
        const bodyText = await response.text().catch(() => `HTTP ${response.status}`);
        throw new Error(`Google AI API error ${response.status}: ${bodyText}`);
      }

      console.log(
        `[GeminiClient] Streaming started with key ${currentKey.label} (attempt ${attempt})`
      );

      // ── SSE PIPE ─────────────────────────────────────────────────────────
      // Parse the Server-Sent Events body and emit text chunks.
      const responseBody = response.body!;
      let fullText = '';

      return new ReadableStream<string>({
        async start(controller) {
          const reader = responseBody.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          function processLine(line: string) {
            if (!line.startsWith('data: ')) return;
            const data = line.slice(6).trim();
            if (!data || data === '[DONE]') return;

            try {
              const json = JSON.parse(data);
              // Google AI response structure:
              // { candidates: [{ content: { parts: [{ text: "..." }] } }] }
              const text: string | undefined =
                json?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                fullText += text;
                controller.enqueue(text);
              }
            } catch {
              // Skip malformed SSE chunks (e.g. keep-alive comments)
            }
          }

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() ?? ''; // keep the incomplete trailing line

              for (const line of lines) {
                processLine(line);
              }
            }

            // Flush any remaining buffer content
            if (buffer) processLine(buffer);

            controller.close();

            // Fire onFinish with the complete accumulated text
            if (onFinish) {
              try {
                await onFinish({ text: fullText });
              } catch (finishErr) {
                console.error('[GeminiClient] onFinish error:', finishErr);
              }
            }
          } catch (streamErr) {
            controller.error(streamErr);
          } finally {
            reader.releaseLock();
          }
        },
      });
    } catch (error) {
      console.error(
        `[GeminiClient] Error on key ${lastKey?.label} (attempt ${attempt}):`,
        errorToString(error)
      );

      if (isTransientError(error)) {
        const delayMs = 1000 * attempt;
        console.warn(`[GeminiClient] Transient error. Backing off ${delayMs}ms before retry...`);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      // Unknown / unrecoverable error — rethrow
      throw error;
    }
  }

  throw new Error(
    `[GeminiClient] All ${MAX_RETRIES} attempts failed. All Gemini keys may be exhausted or rate-limited.`
  );
}
