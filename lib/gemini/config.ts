/**
 * Gemini Module Config
 *
 * Single source of truth for all model names and tunable constants.
 * Change models here — all callers (client, analyzer, diagram-generator) pick it up.
 *
 * gemini-2.5-flash  → Fast, free-tier, streaming ✅
 * gemini-2.5-pro    → High quality, requires paid plan
 * gemini-3.1-pro-preview → Free-tier limit = 0 (paid only)
 */

/** Primary chat streaming model — must be available on free tier */
export const CHAT_MODEL = 'gemini-2.5-flash';

/** Background JSON extraction — fast is fine */
export const ANALYZER_MODEL = 'gemini-2.5-flash';

/** Diagram generation — needs reasoning capability */
export const DIAGRAM_MODEL = 'gemini-3.5-flash';

/** Max streaming retry attempts before giving up */
export const MAX_RETRIES = 10;

/** Rate-limit cooldown in ms (5 minutes) */
export const RATE_LIMIT_COOLDOWN_MS = 5 * 60 * 1000;
