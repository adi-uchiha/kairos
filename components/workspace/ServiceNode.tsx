'use client';

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import { User } from 'lucide-react';
import { Handle, Position, NodeResizer, type NodeProps, type Node } from '@xyflow/react';
import { type ServiceNodeData } from '@/types/blueprint';
import { getIconUrl } from '@/lib/icon-registry';

/** Maps a service category to its accent color in the diagram. */
function getCategoryColor(category: string): string {
  switch (category?.toLowerCase()) {
    case 'frontend':
    case 'hosting':
    case 'cdn':
      return '#0070f3';
    case 'backend':
    case 'framework':
    case 'runtime':
    case 'gateway':
      return '#ff5500';
    case 'database':
    case 'storage':
    case 'cache':
    case 'orm':
      return '#10b981';
    case 'auth':
    case 'oauth':
      return '#8b5cf6';
    default:
      return '#71717a';
  }
}

/** Fallback letter avatar when no icon is found or fails to load. */
function LetterAvatar({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: color + '22', // 13% opacity accent fill
        border: `1.5px solid ${color}44`, // 26% opacity border
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 700,
        color,
      }}
    >
      {label[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

/**
 * ReactFlow custom node for rendering a service component on the architecture canvas.
 * Fixed 160px width, centered icon-first layout, Left/Right handles.
 */
export function ServiceNode({ data }: NodeProps<Node<ServiceNodeData>>) {
  const iconUrl = getIconUrl(data.label);
  const color = getCategoryColor(data.category);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      style={{
        width: 160,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        color: 'var(--text)',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'var(--border)', width: 8, height: 8 }}
      />

      {/* Icon area */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
        {(() => {
          const labelLower = data.label.toLowerCase();
          const isUser = labelLower.includes('user') || data.category?.toLowerCase() === 'user';
          if (isUser) {
            return (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--surface-hover)',
                  border: `1.5px solid ${color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color,
                }}
              >
                <User size={20} />
              </div>
            );
          }
          if (iconUrl && !imageError) {
            return (
              <img
                src={iconUrl}
                alt={data.label}
                width={40}
                height={40}
                style={{ objectFit: 'contain' }}
                onError={() => setImageError(true)}
              />
            );
          }
          return <LetterAvatar label={data.label} color={color} />;
        })()}
      </div>

      {/* Label — truncated if long */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 600,
          padding: '0 8px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={data.label}
      >
        {data.label}
      </div>

      {/* Category pill */}
      <div style={{ textAlign: 'center', padding: '4px 0 10px' }}>
        <span
          style={{
            fontSize: 9,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textTransform: 'lowercase',
          }}
        >
          {data.category}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: 'var(--border)', width: 8, height: 8 }}
      />
    </div>
  );
}

/** Determines dashed border color for Group nodes based on label contents. */
function getGroupColor(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('backend') || l.includes('api')) return '#ff5500';
  if (l.includes('frontend') || l.includes('cdn')) return '#0070f3';
  if (l.includes('database') || l.includes('data')) return '#10b981';
  if (l.includes('auth')) return '#8b5cf6';
  if (l.includes('region') || l.includes('vpc')) return '#71717a';
  return 'var(--border)'; // default
}

/**
 * Transparent dashed-border container node for ReactFlow.
 * Sizes and contains subflow child nodes.
 */
export function GroupNode({ data, selected }: NodeProps<Node<ServiceNodeData>>) {
  const groupColor = getGroupColor(data.label);
  return (
    <>
      <NodeResizer
        minWidth={150}
        minHeight={80}
        isVisible={!!selected}
        lineStyle={{ border: `1.5px dashed ${groupColor}`, borderRadius: 8 }}
        handleStyle={{
          width: 8,
          height: 8,
          background: 'var(--surface)',
          border: `2px solid ${groupColor}`,
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          border: `1.5px dashed ${groupColor}`,
          borderRadius: 8,
          background: 'var(--group-bg)',
          width: '100%',
          height: '100%',
          padding: '8px 12px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: groupColor,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            userSelect: 'none',
          }}
        >
          {data.label}
        </div>
      </div>
    </>
  );
}
