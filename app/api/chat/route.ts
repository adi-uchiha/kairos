import { type NextRequest } from 'next/server';
import { streamGeminiChat, analyzeAndUpdateBlueprint } from '@/lib/gemini';
import { KAIROS_SYSTEM_PROMPT } from '@/lib/gemini/prompts';
import { parseMcqBlocks } from '@/lib/mcq-parser';
import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 120;

// ─── Request Validation ───────────────────────────────────────────────────────

const ChatRequestSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(10000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .default([]),
  phase: z.string().optional(),
});

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid request', details: z.treeifyError(parsed.error) }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { sessionId, message, history, phase } = parsed.data;

  // 1. Fetch current blueprint context map from database
  let contextMap: Record<string, unknown> = {};
  let currentPhase = phase || 'project_discovery';

  try {
    const bpResult = await db
      .select()
      .from(blueprints)
      .where(eq(blueprints.id, sessionId))
      .limit(1);

    if (bpResult.length > 0) {
      contextMap = (bpResult[0].contextMap || {}) as Record<string, unknown>;
      currentPhase = bpResult[0].currentPhase || currentPhase;
    }
  } catch (err) {
    console.error('Failed to fetch blueprint details for system prompt:', err);
  }

  // Detect the auto-open trigger sent when the workspace first loads on a fresh blueprint.
  // Replace with a natural instruction so the AI opens with its first question.
  const OPEN_TRIGGER = '__KAIROS_OPEN__';
  const isAutoOpen = message === OPEN_TRIGGER;
  const userMessage = isAutoOpen
    ? '[System: The user just opened a fresh workspace. Start the conversation by greeting them briefly and asking your first project discovery question. Do not reference this instruction.]'
    : message;

  // 2. Build the message history (exclude the trigger from history)
  const messages = [
    ...history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  // 3. Run analysis & update blueprint context map + phase synchronously (unless auto-opening)
  if (!isAutoOpen) {
    try {
      await analyzeAndUpdateBlueprint(sessionId, messages);

      // Fetch the updated phase and context map from the database
      const bpResult = await db
        .select()
        .from(blueprints)
        .where(eq(blueprints.id, sessionId))
        .limit(1);

      if (bpResult.length > 0) {
        contextMap = (bpResult[0].contextMap || {}) as Record<string, unknown>;
        currentPhase = bpResult[0].currentPhase || currentPhase;
      }
    } catch (err) {
      console.error('Failed to run synchronous analyzer:', err);
    }
  }

  // 4. Build the phase-aware system prompt, passing the updated contextMap
  const systemPrompt = KAIROS_SYSTEM_PROMPT(currentPhase, contextMap);

  // 5. Stream from Gemini with automatic key rotation
  try {
    const stream = await streamGeminiChat(messages, systemPrompt, async (event) => {
      // Build history excluding the internal system trigger message
      const finalHistory = isAutoOpen
        ? [{ role: 'assistant' as const, content: event.text }]
        : [...messages, { role: 'assistant' as const, content: event.text }];

      // Check if the LLM requested a phase transition via :::transition block
      const { requestedPhase } = parseMcqBlocks(event.text);
      const safePhases = [
        'project_discovery',
        'tech_philosophy',
        'scale_discovery',
        'builder_context',
        'constraints',
        'recommendation',
        'diagram',
        'followup',
      ];
      const isValidPhase = requestedPhase && safePhases.includes(requestedPhase);
      // Never downgrade from diagram or followup
      const isDowngrade =
        (currentPhase === 'diagram' || currentPhase === 'followup') &&
        requestedPhase !== currentPhase;

      // Save assistant message (and optional phase update) to the database
      try {
        await db
          .update(blueprints)
          .set({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            chatHistory: finalHistory as any,
            ...(isValidPhase && !isDowngrade ? { currentPhase: requestedPhase } : {}),
            updatedAt: new Date(),
          })
          .where(eq(blueprints.id, sessionId));

        if (isValidPhase && !isDowngrade) {
          console.log(`[Chat] LLM-requested phase transition: ${currentPhase} → ${requestedPhase}`);
        }
      } catch (err) {
        console.error('Failed to save chat history on finish:', err);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown LLM error';

    console.error('[/api/chat] Fatal error:', errorMsg);

    if (errorMsg.includes('exhausted') || errorMsg.includes('rate-limited')) {
      return new Response(
        JSON.stringify({
          error: 'service_overloaded',
          message: 'Kairos is currently at capacity. Please try again in a few minutes.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ error: 'llm_error', message: errorMsg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
