'use client';

import { type ContextMap } from '@/types/blueprint';
import { MaterialIcon } from './MaterialIcon';

interface ContextMapSidebarProps {
  contextMap: ContextMap;
  onClose: () => void;
}

/** Collapsible right sidebar displaying the live project context map extracted by AI. */
export function ContextMapSidebar({ contextMap, onClose }: ContextMapSidebarProps) {
  return (
    <aside className="w-80 border-l border-[var(--border)] p-6 bg-[var(--surface)] overflow-y-auto relative shrink-0 flex flex-col">
      <div className="flex justify-between items-center pb-4 border-b border-[var(--border)] mb-6">
        <span className="font-mono text-[10px] text-[#FF5500] uppercase tracking-widest font-semibold">
          [ Live Context Map ]
        </span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[var(--surface-hover)] text-[var(--text-muted)]"
        >
          <MaterialIcon name="close" size={16} />
        </button>
      </div>

      <div className="space-y-5 text-xs flex-1">
        {Object.entries(contextMap).map(([key, value]) => {
          if (value === null || value === undefined || (Array.isArray(value) && value.length === 0))
            return null;

          const formattedKey = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());

          return (
            <div key={key} className="space-y-1 border-b border-[var(--border)] pb-2.5">
              <span className="text-[var(--text-muted)] font-mono text-[9px] uppercase">
                {formattedKey}
              </span>
              <div className="font-semibold text-[13px] leading-relaxed">
                {Array.isArray(value)
                  ? value.join(', ')
                  : typeof value === 'boolean'
                    ? value
                      ? 'Yes'
                      : 'No'
                    : String(value)}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
