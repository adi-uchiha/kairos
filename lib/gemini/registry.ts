/**
 * Gemini Key Registry — Key Rotation & Retry
 *
 * Manages a pool of Gemini API keys with:
 *   - Round-robin rotation across all active keys
 *   - Automatic cool-down when a key hits 429 (rate limited)
 *   - Automatic skip when a key is fully exhausted (quota)
 *   - Re-enables rate-limited keys after their cool-down window
 *
 * Server-side only. This module is a singleton; state is in-process.
 *
 * COOL-DOWN STRATEGY:
 *   429 (rate limited) → key is paused for RATE_LIMIT_COOLDOWN_MS, then retried
 *   quota exhausted    → key is permanently skipped for this process lifetime
 *   500/503 transient  → key is not penalized; caller should retry with any key
 */

import { GEMINI_KEYS } from './keys';
import type { ManagedKey } from './types';
import { RATE_LIMIT_COOLDOWN_MS } from './config';



class GeminiKeyRegistry {
  private keys: ManagedKey[];
  private currentIndex: number = 0;

  constructor() {
    this.keys = GEMINI_KEYS.map((entry) => ({
      ...entry,
      status: 'active' as const,
      retryAfter: 0,
      failureCount: 0,
    }));
    console.log(`[GeminiRegistry] Loaded ${this.keys.length} API key(s).`);
  }

  /**
   * Returns the next available (active or past-cooldown) key.
   * Throws if all keys are exhausted and none can be recovered.
   */
  acquireKey(): ManagedKey {
    const now = Date.now();

    // First pass: try to find an immediately active key (round-robin)
    for (let attempt = 0; attempt < this.keys.length; attempt++) {
      const idx = (this.currentIndex + attempt) % this.keys.length;
      const key = this.keys[idx];

      // Re-enable rate-limited keys whose cooldown has expired
      if (key.status === 'rate_limited' && now >= key.retryAfter) {
        key.status = 'active';
        key.failureCount = 0;
        console.log(`[GeminiRegistry] Key ${key.label} cooldown expired — re-enabled.`);
      }

      if (key.status === 'active') {
        // Advance the pointer so next call starts after this one (round-robin)
        this.currentIndex = (idx + 1) % this.keys.length;
        return key;
      }
    }

    // No immediately active key — find the rate-limited one with earliest retry
    const recoverableSoon = this.keys
      .filter((k) => k.status === 'rate_limited')
      .sort((a, b) => a.retryAfter - b.retryAfter);

    if (recoverableSoon.length > 0) {
      throw new Error(
        `[GeminiRegistry] All keys are temporarily rate-limited. ` +
          `Earliest recovery in ${Math.ceil((recoverableSoon[0].retryAfter - now) / 1000)}s.`
      );
    }

    throw new Error('[GeminiRegistry] All Gemini API keys are exhausted for today.');
  }

  /**
   * Mark a key as rate-limited (429). It will be retried after cooldown.
   */
  markRateLimited(key: ManagedKey): void {
    key.status = 'rate_limited';
    key.retryAfter = Date.now() + RATE_LIMIT_COOLDOWN_MS;
    key.failureCount++;
    console.warn(
      `[GeminiRegistry] Key ${key.label} rate-limited. Cooling down for ${RATE_LIMIT_COOLDOWN_MS / 60000} min.`
    );
  }

  /**
   * Mark a key as permanently exhausted (daily quota hit).
   */
  markExhausted(key: ManagedKey): void {
    key.status = 'exhausted';
    key.failureCount++;
    console.error(
      `[GeminiRegistry] Key ${key.label} is EXHAUSTED (daily quota). Removed from rotation.`
    );
  }

  /**
   * Returns a summary of the registry state for debugging.
   */
  getSummary() {
    return this.keys.map((k) => ({
      label: k.label,
      status: k.status,
      failureCount: k.failureCount,
      retryAfterMs: k.status === 'rate_limited' ? k.retryAfter - Date.now() : null,
    }));
  }
}

// Singleton — one registry per Next.js server process
export const geminiRegistry = new GeminiKeyRegistry();
