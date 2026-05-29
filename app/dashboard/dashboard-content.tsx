'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { MaterialIcon } from '@/components/workspace/MaterialIcon';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Blueprint {
  id: string;
  name: string;
  currentPhase: string;
  createdAt: string;
  chatHistory?: unknown[];
}

interface DashboardContentProps {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
  initialBlueprints: Blueprint[];
}

export function DashboardContent({ user, initialBlueprints }: DashboardContentProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [blueprints, setBlueprints] = useState<Blueprint[]>(initialBlueprints);

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTimeout(() => {
      setTheme(isDark ? 'dark' : 'light');
    }, 0);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

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

  // ── Rename handlers ────────────────────────────────────────────────────────
  const startEdit = (bp: Blueprint, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(bp.id);
    setEditingName(bp.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = async (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    setIsSavingName(true);
    try {
      const res = await fetch('/api/blueprints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: trimmed }),
      });
      if (!res.ok) throw new Error('Failed to rename');
      setBlueprints((prev) =>
        prev.map((bp) => (bp.id === id ? { ...bp, name: trimmed } : bp))
      );
      toast.success('Blueprint renamed');
      setEditingId(null);
    } catch {
      toast.error('Failed to rename blueprint');
    } finally {
      setIsSavingName(false);
    }
  };

  // ── Delete handler ─────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/blueprints?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setBlueprints((prev) => prev.filter((bp) => bp.id !== id));
      toast.success('Blueprint deleted');
    } catch {
      toast.error('Failed to delete blueprint');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--bg)' }}>
      {/* Structural vertical lines */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] border-l border-r border-[var(--border)] pointer-events-none opacity-20 dark:opacity-30" />

      {/* Header */}
      <header
        className="border-b border-[var(--border)] relative z-10"
        style={{ background: 'var(--bg)' }}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="24" height="21" viewBox="0 0 1671 1483" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M428.5 0H0L0.5 428L428.5 0Z" fill="#FF5500" />
              <path d="M428.5 1482.5H0L0.5 1054.5L428.5 1482.5Z" fill="#FF5500" />
              <path d="M1671 1H739L0 741L738 1482H1671L933 741L1671 1Z" fill="#FF5500" />
            </svg>
            <span className="font-semibold text-base tracking-tight text-[var(--text-primary)]">
              Kairos
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline font-mono text-[11px] text-[var(--text-muted)] uppercase">
              [ {user.email} ]
            </span>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex items-center justify-center p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {theme === 'dark' ? (
                <MaterialIcon name="light_mode" size={18} />
              ) : theme === 'light' ? (
                <MaterialIcon name="dark_mode" size={18} />
              ) : (
                <div style={{ width: 18, height: 18 }} />
              )}
            </button>
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="py-1.5 px-3 sm:px-4 text-xs font-semibold uppercase tracking-wider border border-[var(--border)] hover:bg-[var(--surface-hover)] active:opacity-90 transition-all text-[var(--text-primary)]"
              style={{ borderRadius: 0 }}
            >
              {isLoggingOut ? 'SIGNING_OUT...' : 'SIGN OUT'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10 space-y-10">
        {/* Profile / Stats Header */}
        <div className="border border-[var(--border)] p-6 sm:p-8 bg-[var(--surface)] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="font-mono text-[10px] tracking-widest text-[#FF5500] uppercase">
              [ DEVELOPER_PROFILE ]
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Welcome back, {user.name || 'Developer'}
            </h1>
            <p className="text-[var(--text-muted)] text-sm max-w-2xl">
              Access your architecture blueprints, view recommended infrastructure configurations,
              and initiate new AI system designs.
            </p>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6 space-y-2.5">
            <div className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              [ ACCOUNT STATUS ]
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-none" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Developer Plan (Active)
              </span>
            </div>
            <div className="text-xs text-[var(--text-muted)] font-mono">
              BLUEPRINTS: {blueprints.length} / UNLIMITED
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
              className="py-2 px-4 sm:px-5 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-95 transition-all"
              style={{ borderRadius: 0, background: '#FF5500' }}
            >
              + Create Blueprint
            </Link>
          </div>

          {blueprints.length === 0 ? (
            <div className="border border-[var(--border)] p-12 text-center bg-[var(--surface)] space-y-4">
              <div className="w-12 h-12 border border-[var(--border)] flex items-center justify-center mx-auto">
                <MaterialIcon name="schema" size={24} className="text-[var(--text-muted)]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  No Active Blueprints
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  You haven&apos;t generated any architecture layouts yet. Click below to start an
                  interactive chatbot mapping session.
                </p>
              </div>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 py-2 px-5 text-xs font-semibold uppercase tracking-wider border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all text-[var(--text-primary)]"
                style={{ borderRadius: 0 }}
              >
                <MaterialIcon name="add" size={14} />
                Launch Builder
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {blueprints.map((bp) => {
                const isEditing = editingId === bp.id;
                const isDeleting = deletingId === bp.id;

                // Pick a phase icon
                const phaseIconMap: Record<string, string> = {
                  project_discovery: 'explore',
                  recommendation: 'recommend',
                  diagram: 'schema',
                  followup: 'forum',
                  tech_philosophy: 'psychology',
                };
                const phaseIcon = phaseIconMap[bp.currentPhase] ?? 'pending';

                return (
                  <div
                    key={bp.id}
                    className="group border border-[var(--border)] bg-[var(--surface)] hover:border-[#FF5500] transition-all flex flex-col"
                    style={{ borderRadius: 0 }}
                  >
                    {/* Card body */}
                    <div className="p-5 flex-1 space-y-3">
                      {/* Phase badge + date */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <MaterialIcon
                            name={phaseIcon}
                            size={13}
                            className="text-[#FF5500]"
                          />
                          <span className="font-mono text-[10px] text-[#FF5500] uppercase tracking-wider">
                            {bp.currentPhase || 'DISCOVERY'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[var(--text-muted)]">
                          <MaterialIcon name="calendar_today" size={11} />
                          <span className="font-mono text-[9px]">
                            {new Date(bp.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Blueprint name — inline edit or display */}
                      {isEditing ? (
                        <div className="flex gap-1 items-center" onClick={(e) => e.preventDefault()}>
                          <input
                            autoFocus
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(bp.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            disabled={isSavingName}
                            className="flex-1 bg-[var(--bg)] border border-[#FF5500] px-2 py-1 text-sm font-semibold focus:outline-none text-[var(--text-primary)]"
                            style={{ borderRadius: 0 }}
                          />
                          <button
                            onClick={() => saveEdit(bp.id)}
                            disabled={isSavingName}
                            title="Save"
                            className="text-emerald-500 hover:text-emerald-400 transition-colors p-0.5"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            {isSavingName ? (
                              <MaterialIcon name="sync" size={15} className="animate-spin" />
                            ) : (
                              <MaterialIcon name="check" size={15} />
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            title="Cancel"
                            className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-0.5"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <MaterialIcon name="close" size={15} />
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-base font-semibold text-[var(--text-primary)] line-clamp-2 leading-snug">
                          {bp.name}
                        </h3>
                      )}

                      {/* Message count */}
                      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <MaterialIcon name="chat_bubble_outline" size={13} />
                        <span className="font-mono text-[11px]">
                          {bp.chatHistory?.length ?? 0} messages
                        </span>
                      </div>
                    </div>

                    {/* Card footer — always visible action row */}
                    <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)] bg-[var(--surface-hover)]">
                      {/* Edit + Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => startEdit(bp, e)}
                          title="Rename blueprint"
                          className="flex items-center gap-1 px-2 py-1 text-[var(--text-muted)] hover:text-[#FF5500] hover:bg-[var(--surface)] transition-all text-[10px] font-mono uppercase"
                          style={{ borderRadius: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          <MaterialIcon name="edit" size={13} />
                          <span>Rename</span>
                        </button>

                        <AlertDialog>
                          <AlertDialogTrigger render={
                            <button
                              title="Delete blueprint"
                              disabled={isDeleting}
                              className="flex items-center gap-1 px-2 py-1 text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--surface)] transition-all text-[10px] font-mono uppercase disabled:opacity-40"
                              style={{ borderRadius: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isDeleting ? (
                                <MaterialIcon name="sync" size={13} className="animate-spin" />
                              ) : (
                                <MaterialIcon name="delete" size={13} />
                              )}
                              <span>Delete</span>
                            </button>
                          } />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete blueprint?</AlertDialogTitle>
                              <AlertDialogDescription>
                                <strong>&quot;{bp.name}&quot;</strong> will be permanently deleted along
                                with all messages and the generated architecture diagram. This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(bp.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {/* Open Canvas */}
                      <Link
                        href={`/app?id=${bp.id}`}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#FF5500] hover:underline"
                      >
                        <MaterialIcon name="open_in_new" size={13} />
                        Open Canvas
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

