'use client';

import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react';

import {
  type ServiceNodeData,
  type QAPair,
  AI_THINKING_PLACEHOLDER,
} from '@/types/blueprint';
import { ServiceNode, GroupNode, LibClusterNode } from './ServiceNode';
import { MaterialIcon } from './MaterialIcon';

// ─── NODE TYPES (stable reference outside component) ─────────────────────────
const NODE_TYPES = {
  customNode: ServiceNode,
  group: GroupNode,
  libCluster: LibClusterNode,
};

// ─── NODE DETAIL FIELD ───────────────────────────────────────────────────────

function NodeField({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <span className="text-[var(--text-muted)] font-mono uppercase text-[9px]">{label}</span>
      <p className="leading-relaxed">{value}</p>
    </div>
  );
}

// ─── Q&A ENTRY ───────────────────────────────────────────────────────────────

function QAEntry({ qa }: { qa: QAPair }) {
  const isPending = qa.a === AI_THINKING_PLACEHOLDER;
  return (
    <div className="space-y-1 text-[11px] border-b border-[var(--border)] pb-2 last:border-0">
      <div className="font-bold text-[var(--text)]">Q: {qa.q}</div>
      <div className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line bg-[var(--surface-hover)] p-2 border-l border-[#FF5500]">
        {isPending ? (
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-bounce" />
            <span>Reasoning component context...</span>
          </span>
        ) : (
          qa.a
        )}
      </div>
    </div>
  );
}

// ─── COMPONENT PROPS ─────────────────────────────────────────────────────────

interface DiagramCanvasProps {
  nodes: Node<ServiceNodeData>[];
  edges: Edge[];
  selectedNode: Node<ServiceNodeData> | null;
  showGeneralAskPanel: boolean;
  nodeQuestions: Record<string, QAPair[]>;
  nodeInput: string;
  generalQuestions: QAPair[];
  inputMessage: string;
  isAskingNode: boolean;
  isReadOnly: boolean;
  theme: 'light' | 'dark' | null;
  layoutDirection: 'LR' | 'TB';
  onNodesChange: ReturnType<typeof useNodesState<Node<ServiceNodeData>>>[2];
  onEdgesChange: ReturnType<typeof useEdgesState<Edge>>[2];
  onNodeClick: NodeMouseHandler<Node<ServiceNodeData>>;
  onLayoutDirectionChange: (dir: 'LR' | 'TB') => void;
  onCloseNode: () => void;
  onOpenSwapModal: () => void;
  onNodeInputChange: (value: string) => void;
  onAskNode: (e: React.FormEvent) => void;
  onCloseGeneralPanel: () => void;
  onInputMessageChange: (value: string) => void;
  onAskGeneral: (question: string) => void;
  onResetLayout?: () => void;
  onSaveLayout?: () => void;
  onAutoLayout?: () => void;
}

function ViewportFitter({
  nodesCount,
  direction,
  consoleOpen,
}: {
  nodesCount: number;
  direction: string;
  consoleOpen: boolean;
}) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.15, duration: 250 });
    }, 100);
    return () => clearTimeout(timer);
  }, [nodesCount, direction, consoleOpen, fitView]);

  return null;
}

export function DiagramCanvas(props: DiagramCanvasProps) {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner {...props} />
    </ReactFlowProvider>
  );
}

function DiagramCanvasInner({
  nodes,
  edges,
  selectedNode,
  showGeneralAskPanel,
  nodeQuestions,
  nodeInput,
  generalQuestions,
  isAskingNode,
  isReadOnly,
  theme,
  layoutDirection,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onLayoutDirectionChange,
  onCloseNode,
  onOpenSwapModal,
  onNodeInputChange,
  onAskNode,
  onCloseGeneralPanel,
  onResetLayout,
  onSaveLayout,
  onAutoLayout,
}: DiagramCanvasProps) {


  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    animated: false,
    style: {
      strokeWidth: 2,
      stroke: theme === 'dark' ? '#3f3f46' : '#cbd5e1',
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
      color: theme === 'dark' ? '#3f3f46' : '#cbd5e1',
    },
  }), [theme]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <style>{`
        .react-flow__controls {
          box-shadow: none !important;
          border: 1px solid var(--border) !important;
          border-radius: 0px !important;
          overflow: hidden !important;
        }
        .react-flow__controls-button {
          background: var(--surface) !important;
          border: none !important;
          border-bottom: 1px solid var(--border) !important;
          color: var(--text) !important;
          fill: var(--text) !important;
          transition: background 0.15s ease !important;
        }
        .react-flow__controls-button:last-child {
          border-bottom: none !important;
        }
        .react-flow__controls-button:hover {
          background: var(--surface-hover) !important;
        }
        .react-flow__controls-button svg {
          fill: var(--text) !important;
          color: var(--text) !important;
        }
        .react-flow__controls-button svg path {
          fill: currentColor !important;
          stroke: currentColor !important;
        }
        .react-flow__edge-label {
          font-family: var(--font-mono);
          font-size: 9px !important;
          font-weight: 600;
          color: var(--text-muted) !important;
          background: var(--surface) !important;
          border: 1px solid var(--border) !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        .react-flow__edge-path {
          transition: stroke 0.15s ease, stroke-width 0.15s ease;
        }
        .react-flow__edge:hover .react-flow__edge-path {
          stroke: #ff5500 !important;
          stroke-width: 2.5px !important;
        }
        .react-flow__edge:hover marker path {
          fill: #ff5500 !important;
        }
      `}</style>

      {/* ReactFlow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={NODE_TYPES}
          defaultEdgeOptions={defaultEdgeOptions}
          proOptions={{ hideAttribution: true }}
          fitView
        >
          <ViewportFitter
            nodesCount={nodes.length}
            direction={layoutDirection}
            consoleOpen={showGeneralAskPanel || !!selectedNode}
          />
          <Background color="var(--border)" gap={16} size={1} />
          <Controls
            style={{
              borderRadius: 0,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          />
        </ReactFlow>

        {/* ── Layout Toolbar (top-left) ── */}
        <div className="absolute top-2 md:top-4 left-2 md:left-4 flex gap-1.5 md:gap-2 z-10 flex-wrap">
          <div
            className="flex bg-[var(--surface)] border border-[var(--border)] p-0.5"
            style={{ borderRadius: 0 }}
          >
            {(['LR', 'TB'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => onLayoutDirectionChange(dir)}
                className={`px-2 md:px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  layoutDirection === dir
                    ? 'bg-[#FF5500] text-white font-bold'
                    : 'hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
                style={{ borderRadius: 0 }}
                title={dir === 'LR' ? 'Horizontal layout' : 'Vertical layout'}
              >
                <span className="hidden md:inline">{dir === 'LR' ? '→ Horizontal' : '↓ Vertical'}</span>
                <span className="md:hidden">{dir === 'LR' ? '→' : '↓'}</span>
              </button>
            ))}
          </div>

          {onSaveLayout && !isReadOnly && (
            <button
              onClick={onSaveLayout}
              className="px-2 md:px-2.5 py-1 border border-[#FF5500] bg-[var(--surface)] hover:bg-[#FF5500] hover:text-white text-[#FF5500] transition-all flex items-center gap-1 md:gap-1.5 text-[10px] font-bold font-mono uppercase tracking-wider cursor-pointer"
              style={{ borderRadius: 0 }}
              title="Save custom node coordinates"
            >
              <MaterialIcon name="save" size={12} />
              <span className="hidden md:inline">Save Layout</span>
            </button>
          )}

          {onResetLayout && (
            <button
              onClick={onResetLayout}
              className="px-2 md:px-2.5 py-1 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] text-[var(--text-muted)] transition-all flex items-center gap-1 md:gap-1.5 text-[10px] font-mono uppercase tracking-wider cursor-pointer"
              style={{ borderRadius: 0 }}
              title="Revert to last saved layout"
            >
              <MaterialIcon name="refresh" size={12} />
              <span className="hidden md:inline">Reset Layout</span>
            </button>
          )}

          {onAutoLayout && (
            <button
              onClick={onAutoLayout}
              className="px-2 md:px-2.5 py-1 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] text-[var(--text-muted)] transition-all flex items-center gap-1 md:gap-1.5 text-[10px] font-mono uppercase tracking-wider cursor-pointer"
              style={{ borderRadius: 0 }}
              title="Recalculate automatic layout using Dagre"
            >
              <MaterialIcon name="bolt" size={12} />
              <span className="hidden md:inline">Auto Layout</span>
            </button>
          )}
        </div>


        {/* ── Node Detail Drawer ── */}
        {selectedNode && (
          <div
            className="absolute top-0 right-0 bottom-0 w-full sm:w-80 border-l border-[var(--border)] p-4 md:p-6 bg-[var(--surface)] z-20 flex flex-col justify-between overflow-y-auto"
            style={{ boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.08)' }}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
                <span className="font-mono text-[9px] text-[#FF5500] uppercase tracking-wider">
                  [ Service Details ]
                </span>
                <button onClick={onCloseNode} className="p-1 hover:bg-[var(--surface-hover)]">
                  <MaterialIcon name="close" size={15} />
                </button>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{selectedNode.data.label}</h3>
                <span className="text-[10px] uppercase font-mono bg-[var(--border)] px-2 py-0.5 inline-block">
                  {selectedNode.data.category}
                </span>
              </div>

              {/* Fields */}
              <div className="space-y-4 text-xs">
                <NodeField label="Why Chosen" value={selectedNode.data.why} />
                <NodeField
                  label="Free Tier Limits"
                  value={selectedNode.data.free_tier || 'None / Not Applicable'}
                />
                <NodeField label="Cost at Scale" value={selectedNode.data.cost_at_scale || 'N/A'} />
                <NodeField
                  label="Upgrade Trigger"
                  value={selectedNode.data.upgrade_signal || 'Grow past free limits'}
                />
              </div>

              {/* Node Q&A section */}
              <div className="border-t border-[var(--border)] pt-4 space-y-4">
                <span className="text-[var(--text-muted)] font-mono uppercase text-[9px] block">
                  Architect AI Assistant
                </span>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {(nodeQuestions[selectedNode.id] || []).length === 0 ? (
                    <p className="text-[11px] text-[var(--text-muted)] italic">
                      Ask questions about scaling, latency, pricing, or alternatives for this
                      service component.
                    </p>
                  ) : (
                    (nodeQuestions[selectedNode.id] || []).map((qa, idx) => (
                      <QAEntry key={idx} qa={qa} />
                    ))
                  )}
                </div>
                <form onSubmit={onAskNode} className="flex gap-1.5">
                  <input
                    type="text"
                    value={nodeInput}
                    onChange={(e) => onNodeInputChange(e.target.value)}
                    placeholder="Ask about this component..."
                    className="flex-1 bg-[var(--surface-hover)] border border-[var(--border)] px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#FF5500]"
                    style={{ borderRadius: 0 }}
                    disabled={isAskingNode}
                  />
                  <button
                    type="submit"
                    disabled={isAskingNode || !nodeInput.trim()}
                    className="px-3 border border-[var(--border)] bg-[var(--surface-hover)] hover:border-[#FF5500] hover:text-[#FF5500] transition-all flex items-center justify-center disabled:opacity-50"
                    style={{ borderRadius: 0, cursor: 'pointer' }}
                  >
                    {isAskingNode ? (
                      <MaterialIcon name="sync" size={12} className="animate-spin" />
                    ) : (
                      <MaterialIcon name="send" size={12} />
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Footer: Swap or Read-Only indicator */}
            <div className="pt-4 border-t border-[var(--border)] mt-6">
              {isReadOnly ? (
                <div className="text-[10px] uppercase font-mono text-[var(--text-muted)] text-center py-2 bg-[var(--surface-hover)]">
                  [ Read-Only Mode ]
                </div>
              ) : (
                <button
                  onClick={onOpenSwapModal}
                  className="w-full py-2 px-4 border border-[#FF5500] text-[#FF5500] hover:bg-[#FF5500] hover:text-white transition-all text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  style={{ borderRadius: 0 }}
                >
                  Swap Service
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── General Architecture Analysis Console ── */}
      {showGeneralAskPanel && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4 max-h-60 overflow-y-auto relative z-10 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-2">
            <span className="font-mono text-[9px] text-[#FF5500] uppercase tracking-wider">
              [ Architecture Analysis Console ]
            </span>
            <button onClick={onCloseGeneralPanel} className="p-1 hover:bg-[var(--surface-hover)]">
              <MaterialIcon name="close" size={13} />
            </button>
          </div>
          <div className="space-y-3">
            {generalQuestions.map((qa, idx) => {
              const isPending = qa.a === AI_THINKING_PLACEHOLDER;
              return (
                <div
                  key={idx}
                  className="space-y-1 text-xs border-b border-[var(--border)] pb-2.5 last:border-0"
                >
                  <div className="font-bold text-[var(--text)]">Question: {qa.q}</div>
                  <div className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line bg-[var(--surface-hover)] p-3 border-l border-[#FF5500]">
                    {isPending ? (
                      <span className="flex items-center gap-1.5 text-[#FF5500]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-bounce" />
                        <span>Architect is analyzing the system topology...</span>
                      </span>
                    ) : (
                      qa.a
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
