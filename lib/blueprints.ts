import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { eq, desc } from 'drizzle-orm';
import { createHash } from 'crypto';
import { DEFAULT_BLUEPRINT_TEMPLATE } from '@/lib/default-blueprint';

function getDeterministicUuid(userId: string): string {
  const hash = createHash('sha256').update(`default-blueprint-${userId}`).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32),
  ].join('-');
}

export async function getOrCreateUserBlueprints(userId: string) {
  let userBlueprints = await db
    .select()
    .from(blueprints)
    .where(eq(blueprints.userId, userId))
    .orderBy(desc(blueprints.createdAt));

  if (userBlueprints.length === 0) {
    const blueprintId = getDeterministicUuid(userId);
    const newBlueprint = {
      id: blueprintId,
      userId: userId,
      name: DEFAULT_BLUEPRINT_TEMPLATE.name,
      currentPhase: DEFAULT_BLUEPRINT_TEMPLATE.currentPhase,
      chatHistory: DEFAULT_BLUEPRINT_TEMPLATE.chatHistory as any,
      contextMap: DEFAULT_BLUEPRINT_TEMPLATE.contextMap as any,
      diagramGraph: DEFAULT_BLUEPRINT_TEMPLATE.diagramGraph as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await db.insert(blueprints).values(newBlueprint);
      userBlueprints = [newBlueprint as any];
    } catch (insertError) {
      console.error('Error auto-seeding default blueprint:', insertError);
      // Retrieve again in case of concurrent insert
      userBlueprints = await db
        .select()
        .from(blueprints)
        .where(eq(blueprints.userId, userId))
        .orderBy(desc(blueprints.createdAt));
    }
  }

  return userBlueprints;
}
