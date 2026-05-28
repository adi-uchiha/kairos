import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// IMPORTANT NOTE FOR AI (DO NOT REMOVE)
// Whenever you change anything in this schema, it must be changed at `lib/auth.ts` for betterAuth compatibility.
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
