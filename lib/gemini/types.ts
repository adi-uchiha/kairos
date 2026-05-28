/**
 * Gemini LLM Infrastructure — Shared Types
 * All types used across the key registry, client, and API routes.
 */

export type GeminiKeyEntry = {
  key: string;
  label: string;
};

export type KeyStatus = 'active' | 'rate_limited' | 'exhausted';

export type ManagedKey = GeminiKeyEntry & {
  status: KeyStatus;
  // When a rate-limited key can be retried (ms timestamp)
  retryAfter: number;
  // Count of consecutive failures
  failureCount: number;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatRequest = {
  sessionId: string;
  message: string;
  history: ChatMessage[];
};
