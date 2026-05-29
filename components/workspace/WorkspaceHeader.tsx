'use client';

import Link from 'next/link';
import { MaterialIcon } from './MaterialIcon';

interface WorkspaceHeaderProps {
  blueprintName: string;
  isEditingName: boolean;
  editNameInput: string;
  isSavingName: boolean;
  isReadOnly: boolean;
  theme: 'light' | 'dark' | null;
  onEditNameChange: (value: string) => void;
  onSaveName: () => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onToggleTheme: () => void;
  onToggleContextMap: () => void;
}

/** The top header bar with back nav, blueprint name editor, and workspace controls. */
export function WorkspaceHeader({
  blueprintName,
  isEditingName,
  editNameInput,
  isSavingName,
  isReadOnly,
  theme,
  onEditNameChange,
  onSaveName,
  onCancelEdit,
  onStartEdit,
  onToggleTheme,
  onToggleContextMap,
}: WorkspaceHeaderProps) {
  return (
    <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0 relative z-30">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-1 hover:bg-[var(--surface-hover)] transition-all">
          <MaterialIcon name="chevron_left" size={18} />
        </Link>
        <span className="font-mono text-xs text-[#FF5500] uppercase tracking-wider hidden sm:inline">
          [ Workspace ]
        </span>
        {isReadOnly && (
          <span className="font-mono text-[10px] uppercase text-[var(--text-muted)] bg-[var(--surface-hover)] px-2 py-0.5">
            READ ONLY
          </span>
        )}
        {isEditingName ? (
          <div className="flex items-center gap-1.5 border-l border-[var(--border)] pl-3">
            <input
              type="text"
              value={editNameInput}
              onChange={(e) => onEditNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveName();
                if (e.key === 'Escape') onCancelEdit();
              }}
              disabled={isSavingName}
              className="bg-[var(--surface-hover)] border border-[var(--border)] px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-[#FF5500]"
              style={{ borderRadius: 0 }}
              autoFocus
            />
            <button
              onClick={onSaveName}
              disabled={isSavingName}
              className="p-1 hover:text-[#FF5500] transition-colors"
              title="Save name"
            >
              <MaterialIcon name="check" size={14} />
            </button>
            <button
              onClick={onCancelEdit}
              disabled={isSavingName}
              className="p-1 hover:text-red-500 transition-colors"
              title="Cancel"
            >
              <MaterialIcon name="close" size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 border-l border-[var(--border)] pl-3">
            <span className="font-semibold text-sm">{blueprintName}</span>
            {!isReadOnly && (
              <button
                onClick={onStartEdit}
                className="p-1 text-[var(--text-muted)] hover:text-[#FF5500] transition-colors"
                title="Edit name"
              >
                <MaterialIcon name="edit" size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleTheme}
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
          onClick={onToggleContextMap}
          className="flex items-center gap-1.5 px-3 py-1 text-xs border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-all"
          style={{ borderRadius: 0 }}
        >
          <MaterialIcon name="info" size={14} />
          <span>CONTEXT</span>
        </button>
      </div>
    </header>
  );
}
