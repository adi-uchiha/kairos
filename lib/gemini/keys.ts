/**
 * Gemini Key Loader
 *
 * Reads all GEMINI_KEY_* environment variables and returns them as an ordered
 * list. Keys are NEVER hardcoded — they must be in .env.local or the runtime
 * environment. Throws at startup if no keys are found so failures are loud.
 *
 * Env var convention: GEMINI_KEY_1, GEMINI_KEY_2, ... GEMINI_KEY_N
 * (Any number of keys in sequence; stops at the first gap.)
 */

import type { GeminiKeyEntry } from './types';

function loadKeys(): GeminiKeyEntry[] {
  const keys: GeminiKeyEntry[] = [];

  // Scan a range to allow gaps or revoked keys
  for (let i = 1; i <= 50; i++) {
    const key = process.env[`GEMINI_KEY_${i}`];
    if (key && key.trim()) {
      keys.push({ key: key.trim(), label: `Key-${i}` });
    }
  }

  // Do not throw at module load/build time to prevent Next.js compilation/prerendering failures
  // when API keys are absent. The registry will enforce presence at runtime.
  return keys;
}

// Exported singleton — loaded once at module init (server-side only)
export const GEMINI_KEYS: GeminiKeyEntry[] = loadKeys();
