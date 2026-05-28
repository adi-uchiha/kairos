import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import * as schema from '@/db/schema';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || 'kairos_secret_random_key_9876543210',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || 'dummy_github_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_github_secret',
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_google_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_secret',
    },
  },
});
