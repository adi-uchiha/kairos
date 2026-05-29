'use client';

import { type Node, type Edge } from '@xyflow/react';
import { type ServiceNodeData } from '@/types/blueprint';
import { MaterialIcon } from './MaterialIcon';

interface SwapModalProps {
  selectedNode: Node<ServiceNodeData>;
  isSwapping: boolean;
  onSwap: (replacement: string) => void;
  onClose: () => void;
}

/** Modal for swapping a service node with one of its predefined alternatives. */
export function SwapModal({ selectedNode, isSwapping, onSwap, onClose }: SwapModalProps) {
  const { label, alternatives = [] } = selectedNode.data;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border border-[var(--border)] p-6 bg-[var(--surface)] space-y-6"
        style={{ borderRadius: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider">Swap {label}</h4>
          <button onClick={onClose} className="p-1 hover:bg-[var(--surface-hover)]">
            <MaterialIcon name="close" size={15} />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Select an alternative service to substitute for {label}. The system will automatically
            re-reason connected database, client pipelines, and outbound triggers.
          </p>

          {alternatives.length === 0 ? (
            <div className="text-xs text-[var(--text-muted)] text-center py-4">
              No predefined alternatives listed. Type a custom replacement below.
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {alternatives.map((alt) => (
                <button
                  key={alt}
                  onClick={() => onSwap(alt)}
                  disabled={isSwapping}
                  className="w-full py-2.5 px-4 text-left text-xs font-medium border border-[var(--border)] hover:border-[#FF5500] hover:text-[#FF5500] bg-[var(--bg)] transition-all flex items-center justify-between"
                  style={{ borderRadius: 0 }}
                >
                  <span>{alt}</span>
                  <MaterialIcon name="chevron_right" size={12} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Re-export Edge type to avoid unused import warning in consuming files
export type { Edge };
