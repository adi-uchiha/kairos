import { Pool } from '@neondatabase/serverless';
import fs from 'fs';
import { createHash } from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Load default blueprint template
const templatePath = 'scripts/default-blueprint.json';
if (!fs.existsSync(templatePath)) {
  console.error(`Template not found at ${templatePath}`);
  process.exit(1);
}

const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not defined');
  process.exit(1);
}

// Generate a deterministic UUID based on userId
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

const pool = new Pool({ connectionString: databaseUrl });

async function seed() {
  console.log('Connecting to database...');
  try {
    const usersRes = await pool.query('SELECT id, email FROM users');
    console.log(`Found ${usersRes.rows.length} users.`);

    for (const user of usersRes.rows) {
      const userId = user.id;
      const blueprintId = getDeterministicUuid(userId);

      // Check if this default blueprint already exists
      const existing = await pool.query('SELECT id FROM blueprints WHERE id = $1', [blueprintId]);
      if (existing.rows.length > 0) {
        console.log(
          `Default blueprint already exists for user ${user.email} (${userId}), skipping.`
        );
        continue;
      }

      console.log(`Seeding default blueprint for user ${user.email} (${userId})...`);

      await pool.query(
        `INSERT INTO blueprints (id, user_id, name, current_phase, chat_history, context_map, diagram_graph, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          blueprintId,
          userId,
          template.name || 'Enterprise Ecommerce',
          template.current_phase || 'diagram',
          JSON.stringify(template.chat_history || []),
          JSON.stringify(template.context_map || {}),
          JSON.stringify(template.diagram_graph || { nodes: [], edges: [] }),
        ]
      );
    }
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
