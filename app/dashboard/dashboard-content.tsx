'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

interface DashboardContentProps {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialBlueprints: any[];
}

export function DashboardContent({ user, initialBlueprints }: DashboardContentProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push('/auth');
    } catch (err) {
      console.error('Logout failed:', err);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--bg)' }}>
      {/* Structural vertical lines */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] border-l border-r border-[var(--border)] pointer-events-none opacity-20 dark:opacity-30" />

      {/* Header */}
      <header className="border-b border-[var(--border)] relative z-10" style={{ background: 'var(--bg)' }}>
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="24" height="21" viewBox="0 0 1671 1483" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M428.5 0H0L0.5 428L428.5 0Z" fill="#FF5500" />
              <path d="M428.5 1482.5H0L0.5 1054.5L428.5 1482.5Z" fill="#FF5500" />
              <path d="M1671 1H739L0 741L738 1482H1671L933 741L1671 1Z" fill="#FF5500" />
            </svg>
            <span className="font-semibold text-base tracking-tight text-[var(--text-primary)]">Kairos</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline font-mono text-[11px] text-[var(--text-muted)] uppercase">
              [ {user.email} ]
            </span>
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="py-1.5 px-4 text-xs font-semibold uppercase tracking-wider border border-[var(--border)] hover:bg-[var(--surface-hover)] active:opacity-90 transition-all text-[var(--text-primary)]"
              style={{ borderRadius: 0 }}
            >
              {isLoggingOut ? 'SIGNING_OUT...' : 'SIGN OUT'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12 relative z-10 space-y-10">
        {/* Profile / Stats Header */}
        <div className="border border-[var(--border)] p-8 bg-[var(--surface)] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="font-mono text-[10px] tracking-widest text-[#FF5500] uppercase">
              [ DEVELOPER_PROFILE ]
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Welcome back, {user.name || 'Developer'}
            </h1>
            <p className="text-[var(--text-muted)] text-sm max-w-2xl">
              Access your architecture blueprints, view recommended infrastructure configurations, and initiate new AI system designs.
            </p>
          </div>

          <div className="border-l border-[var(--border)] pl-6 hidden md:block space-y-2.5">
            <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              [ ACCOUNT STATUS ]
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-none" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">Developer Plan (Active)</span>
            </div>
            <div className="text-xs text-[var(--text-muted)] font-mono">
              BLUEPRINTS: {initialBlueprints.length} / UNLIMITED
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              System Blueprints
            </h2>
            <Link
              href="/app"
              className="py-2 px-5 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-95 transition-all"
              style={{ borderRadius: 0, background: '#FF5500' }}
            >
              + Create Blueprint
            </Link>
          </div>

          {initialBlueprints.length === 0 ? (
            <div className="border border-[var(--border)] p-12 text-center bg-[var(--surface)] space-y-4">
              <div className="w-12 h-12 border border-[var(--border)] flex items-center justify-center mx-auto text-xl font-mono text-[var(--text-muted)]">
                !
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">No Active Blueprints</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  You haven&apos;t generated any architecture layouts yet. Click below to start an interactive chatbot mapping session.
                </p>
              </div>
              <Link
                href="/app"
                className="inline-block py-2 px-5 text-xs font-semibold uppercase tracking-wider border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all text-[var(--text-primary)]"
                style={{ borderRadius: 0 }}
              >
                Launch Builder
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialBlueprints.map((bp) => (
                <div
                  key={bp.id}
                  className="border border-[var(--border)] p-6 bg-[var(--surface)] hover:border-[#FF5500] hover:bg-[var(--surface-hover)] transition-all flex flex-col justify-between h-[180px]"
                  style={{ borderRadius: 0 }}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] text-[#FF5500] uppercase tracking-wider">
                        {bp.currentPhase || 'DISCOVERY'}
                      </span>
                      <span className="font-mono text-[9px] text-[var(--text-muted)]">
                        {new Date(bp.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] line-clamp-1">
                      {bp.name}
                    </h3>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-[var(--border)] mt-4">
                    <span className="text-xs text-[var(--text-muted)] font-mono">
                      {bp.chatHistory?.length || 0} messages
                    </span>
                    <Link
                      href={`/app?id=${bp.id}`}
                      className="text-xs font-semibold text-[#FF5500] hover:underline"
                    >
                      Open Canvas →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
