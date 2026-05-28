import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { blueprints } from '@/db/schema/blueprints';
import { eq } from 'drizzle-orm';
import { ClientAppPage } from './client-page';

export const metadata = {
  title: 'Workspace | Kairos',
  description: 'Interactive system architect workspace.',
};

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth');
  }

  const { id } = await searchParams;

  let redirectUrl: string | null = null;

  // If no blueprint ID is passed, create a default one and redirect
  if (!id) {
    const newId = crypto.randomUUID();
    try {
      await db.insert(blueprints).values({
        id: newId,
        userId: session.user.id,
        name: 'Untitled Blueprint',
        currentPhase: 'project_discovery',
        chatHistory: [] as any,
        contextMap: {
          product_category: null,
          core_user_workflow: null,
          primary_user_persona: null,
          data_model_nature: [],
          has_realtime_requirement: null,
          has_ai_ml_component: null,
          expected_users_month_1: null,
          expected_users_month_6: null,
          launch_timeline_weeks: null,
          scale_tier: null,
          team_size: null,
          primary_language: null,
          familiar_frameworks: [],
          budget_constraint: null,
          devops_tolerance: null,
          existing_tools: [],
          compliance_requirements: [],
          non_negotiables: [],
        } as any,
        diagramGraph: { nodes: [], edges: [] } as any,
      });
      redirectUrl = `/app?id=${newId}`;
    } catch (error) {
      console.error('Failed to auto-create blueprint:', error);
      redirectUrl = '/dashboard';
    }
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  // Fetch target blueprint
  const bpResult = await db
    .select()
    .from(blueprints)
    .where(eq(blueprints.id, id as string))
    .limit(1);

  if (bpResult.length === 0 || bpResult[0].userId !== session.user.id) {
    redirect('/dashboard');
  }

  return <ClientAppPage blueprint={bpResult[0]} user={session.user} />;
}
