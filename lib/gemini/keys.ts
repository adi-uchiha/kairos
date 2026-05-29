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
  let i = 1;

  while (true) {
    const key = process.env[`GEMINI_KEY_${i}`];
    if (!key) break; // Stop at first missing index
    keys.push({ key, label: `Key-${i}` });
    i++;
  }

  // Do not throw at module load/build time to prevent Next.js compilation/prerendering failures
  // when API keys are absent. The registry will enforce presence at runtime.
  return keys;
}

// Exported singleton — loaded once at module init (server-side only)
export const GEMINI_KEYS: GeminiKeyEntry[] = loadKeys();
