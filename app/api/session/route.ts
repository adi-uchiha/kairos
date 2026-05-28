/**
 * POST /api/session
 *
 * Creates a new Kairos conversation session.
 * Returns a session ID and initial phase.
 *
 * This is a lightweight endpoint — no DB write yet (sessions are managed
 * client-side for now; extend with DB persistence when needed).
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export async function POST() {
  const sessionId = randomUUID();

  return NextResponse.json({
    sessionId,
    phase: 'idle',
    createdAt: new Date().toISOString(),
  });
}
