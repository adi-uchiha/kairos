import { pgTable, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ContextMap {
  techStack?: string[];
  scalability?: string;
  userCount?: string;
  deployment?: string;
  otherRequirements?: Record<string, unknown>;
}

export interface DiagramGraph {
  nodes: unknown[];
  edges: unknown[];
  viewport?: { x: number; y: number; zoom: number };
}

export const blueprints = pgTable(
  'blueprints',
  {
    id: text('id').primaryKey(), // using nanoid or similar
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull().default('Untitled Blueprint'),
    currentPhase: text('current_phase').notNull().default('discovery'),
    chatHistory: jsonb('chat_history').$type<ChatMessage[]>().notNull().default([]),
    contextMap: jsonb('context_map').$type<ContextMap>().notNull().default({}),
    diagramGraph: jsonb('diagram_graph')
      .$type<DiagramGraph>()
      .notNull()
      .default({ nodes: [], edges: [] }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => {
    return [index('blueprints_user_id_idx').on(table.userId)];
  }
);
