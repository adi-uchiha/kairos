import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getOrCreateUserBlueprints } from '@/lib/blueprints';
import { DashboardContent } from './dashboard-content';

export const metadata = {
  title: 'Dashboard | Kairos',
  description: 'Manage your active system blueprints and architecture graphs.',
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/auth');
  }

  // Fetch actual blueprints for the authenticated user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userBlueprints: any[] = [];
  try {
    userBlueprints = await getOrCreateUserBlueprints(session.user.id);
  } catch (error) {
    console.error('Failed to fetch blueprints:', error);
    // Fall back to empty array if table migrations aren't pushed yet
    userBlueprints = [];
  }

  return <DashboardContent user={session.user} initialBlueprints={userBlueprints} />;
}
