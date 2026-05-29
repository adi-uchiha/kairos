'use client';

import { type Phase } from '@/types/blueprint';
import { MaterialIcon } from './MaterialIcon';

interface WorkspaceSidebarProps {
  phases: Phase[];
  activeTab: string;
  currentPhase: string;
  userName: string;
  onTabChange: (phaseId: string) => void;
}

/** Left sidebar showing the design-phase progress steps for the workspace. */
export function WorkspaceSidebar({
  phases,
  activeTab,
  currentPhase,
  userName,
  onTabChange,
}: WorkspaceSidebarProps) {
  return (
    <aside className="w-56 border-r border-[var(--border)] flex flex-col justify-between p-4 shrink-0 bg-[var(--surface)] hidden md:flex">
      <div className="space-y-4">
        <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-6">
          [ Design Steps ]
        </div>
        <nav className="flex flex-col gap-1">
          {phases.map((p, idx) => {
            const isCurrent = activeTab === p.id;
            const isUnlocked = (() => {
              if (currentPhase === 'diagram' || currentPhase === 'followup') return true;
              const currentPhaseIdx = phases.findIndex((ph) => ph.id === currentPhase);
              return idx <= currentPhaseIdx;
            })();

            return (
              <button
                key={p.id}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onTabChange(p.id)}
                className={`flex items-center gap-3 px-3 py-2 text-sm transition-all text-left w-full border-none bg-transparent ${
                  isCurrent
                    ? 'bg-[var(--orange-wash)] text-[#FF5500] border-l-2 border-[#FF5500] font-semibold'
                    : isUnlocked
                      ? 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer font-medium'
                      : 'text-[var(--text-muted)] cursor-not-allowed opacity-50 font-normal'
                }`}
                style={{ borderRadius: 0 }}
              >
                <MaterialIcon
                  name={p.icon}
                  size={16}
                  className={isCurrent ? 'text-[#FF5500]' : 'text-[var(--text-muted)]'}
                />
                <span>{p.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[var(--border)] pt-4 font-mono text-[10px] text-[var(--text-muted)]">
        USER: {userName}
      </div>
    </aside>
  );
}
