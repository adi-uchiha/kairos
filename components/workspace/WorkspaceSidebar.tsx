'use client';

import { type Phase } from '@/types/blueprint';
import { MaterialIcon } from './MaterialIcon';

interface WorkspaceSidebarProps {
  phases: Phase[];
  currentPhase: string;
  userName: string;
}

/** Left sidebar showing the design-phase progress steps for the workspace as a static timeline. */
export function WorkspaceSidebar({ phases, currentPhase, userName }: WorkspaceSidebarProps) {
  return (
    <aside className="w-56 border-r border-[var(--border)] flex flex-col justify-between p-4 shrink-0 bg-[var(--surface)] hidden md:flex">
      <div className="space-y-4">
        <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-6">
          [ Design Steps ]
        </div>
        <nav className="flex flex-col gap-1">
          {phases.map((p, idx) => {
            const currentPhaseIdx = phases.findIndex((ph) => ph.id === currentPhase);
            const isCompleted = idx < currentPhaseIdx;
            const isCurrent = p.id === currentPhase;

            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all text-left w-full border-none bg-transparent select-none ${
                  isCurrent
                    ? 'bg-[var(--orange-wash)] text-[#FF5500] border-l-2 border-[#FF5500] font-semibold'
                    : isCompleted
                      ? 'text-[var(--text-primary)] font-medium opacity-85'
                      : 'text-[var(--text-muted)] opacity-50 font-normal'
                }`}
              >
                <div className="flex items-center justify-center shrink-0">
                  {isCompleted ? (
                    <MaterialIcon name="check_circle" size={16} className="text-emerald-500" />
                  ) : (
                    <MaterialIcon
                      name={p.icon}
                      size={16}
                      className={isCurrent ? 'text-[#FF5500]' : 'text-[var(--text-muted)]'}
                    />
                  )}
                </div>
                <span>{p.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[var(--border)] pt-4 font-mono text-[10px] text-[var(--text-muted)] select-none">
        USER: {userName}
      </div>
    </aside>
  );
}
