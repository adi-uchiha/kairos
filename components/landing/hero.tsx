/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { ReactFlow, Position, Handle } from '@xyflow/react';

interface CustomNodeData {
  label: string;
  category: string;
  icon?: string;
  target?: boolean;
  source?: boolean;
  active?: boolean;
}

// Custom Node Component matching sharp corner/flat aesthetics
function CustomNode({ data }: { data: CustomNodeData }) {
  const isActive = data.active;
  return (
    <div
      style={{
        border: isActive ? '1px solid #ff5500' : '1px solid var(--border)',
        background: isActive ? 'var(--orange-wash)' : 'var(--surface)',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderRadius: 0,
        width: 160,
        textAlign: 'left',
        transition: 'background-color 0.2s, border-color 0.2s',
      }}
    >
      {data.target && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#ff5500', borderRadius: 0, border: 'none', width: 6, height: 6 }}
        />
      )}

      {/* Icon */}
      {data.icon && (
        <img
          src={`/images/tech/${data.icon}`}
          alt={data.label}
          style={{ width: 18, height: 18, flexShrink: 0, objectFit: 'contain' }}
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, width: '100%' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 7,
            color: isActive ? '#ff5500' : 'var(--text-muted)',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {data.category}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {data.label}
        </span>
      </div>

      {data.source && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#ff5500', borderRadius: 0, border: 'none', width: 6, height: 6 }}
        />
      )}
    </div>
  );
}

const initialNodes = [
  {
    id: 'client',
    type: 'custom',
    position: { x: 30, y: 155 },
    data: { label: 'Client Browser', category: 'CLIENT LAYER', icon: 'react.svg', source: true },
  },
  {
    id: 'router',
    type: 'custom',
    position: { x: 250, y: 155 },
    data: {
      label: 'Cloudflare Edge',
      category: 'ROUTING & CDN',
      icon: 'cloudflare.svg',
      target: true,
      source: true,
    },
  },
  {
    id: 'frontend',
    type: 'custom',
    position: { x: 490, y: 60 },
    data: {
      label: 'Next.js App',
      category: 'FRONTEND SPA',
      icon: 'nextdotjs.svg',
      target: true,
      source: true,
    },
  },
  {
    id: 'backend',
    type: 'custom',
    position: { x: 490, y: 250 },
    data: {
      label: 'Hono API (Bun)',
      category: 'BACKEND ENDPOINT',
      icon: 'hono.svg',
      target: true,
      source: true,
    },
  },
  {
    id: 'auth',
    type: 'custom',
    position: { x: 740, y: 20 },
    data: { label: 'Clerk Auth', category: 'COMPLIANCE & AUTH', icon: 'clerk.svg', target: true },
  },
  {
    id: 'database',
    type: 'custom',
    position: { x: 740, y: 155 },
    data: {
      label: 'Supabase DB',
      category: 'RELATIONAL DATABASE',
      icon: 'supabase.svg',
      target: true,
      active: true,
    },
  },
  {
    id: 'redis',
    type: 'custom',
    position: { x: 740, y: 290 },
    data: { label: 'Upstash Redis', category: 'MESSAGE QUEUE', icon: 'redis.svg', target: true },
  },
];

const initialEdges = [
  {
    id: 'e-client-router',
    source: 'client',
    target: 'router',
    animated: true,
    type: 'smoothstep',
    style: { stroke: '#ff5500', strokeWidth: 1.5 },
  },
  {
    id: 'e-router-frontend',
    source: 'router',
    target: 'frontend',
    animated: true,
    type: 'smoothstep',
    style: { stroke: 'var(--border)', strokeWidth: 1.5 },
  },
  {
    id: 'e-router-backend',
    source: 'router',
    target: 'backend',
    animated: true,
    type: 'smoothstep',
    style: { stroke: 'var(--border)', strokeWidth: 1.5 },
  },
  {
    id: 'e-frontend-auth',
    source: 'frontend',
    target: 'auth',
    type: 'smoothstep',
    style: { stroke: 'var(--border)', strokeWidth: 1.5 },
  },
  {
    id: 'e-frontend-backend',
    source: 'frontend',
    target: 'backend',
    type: 'smoothstep',
    style: { stroke: 'var(--border)', strokeWidth: 1.5 },
  },
  {
    id: 'e-backend-db',
    source: 'backend',
    target: 'database',
    animated: true,
    type: 'smoothstep',
    style: { stroke: '#ff5500', strokeWidth: 1.5 },
  },
  {
    id: 'e-backend-redis',
    source: 'backend',
    target: 'redis',
    type: 'smoothstep',
    style: { stroke: 'var(--border)', strokeWidth: 1.5 },
  },
];

export function Hero() {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '140px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 600,
          background: 'radial-gradient(circle, rgba(255,85,0,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid background lines */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 1200,
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            border: '1px solid var(--orange-border)',
            background: 'var(--orange-wash)',
            padding: '4px 10px',
            marginBottom: 28,
            borderRadius: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 500,
              color: '#ff5500',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="#ff5500"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
            </svg>
            Kairos Free Alpha
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            fontSize: 'clamp(44px, 7vw, 76px)',
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            marginBottom: 24,
          }}
        >
          AI System Architect.
          <br />
          <span style={{ color: '#ff5500' }}>Ship with confidence.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            maxWidth: 600,
            margin: '0 auto 40px',
          }}
        >
          Kairos interviews you about your product, your scale, and your skills, then delivers a
          precise, opinionated tech stack with an interactive architecture diagram you can actually
          edit.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 64,
          }}
        >
          <Link
            href="/app"
            style={{
              background: '#ff5500',
              color: '#fff',
              fontWeight: 500,
              fontSize: 14,
              padding: '14px 28px',
              borderRadius: 0,
              letterSpacing: '-0.01em',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          >
            Try AI Architect →
          </Link>
          <Link
            href="#how-it-works"
            style={{
              color: 'var(--text-muted)',
              fontSize: 14,
              border: '1px solid var(--border)',
              padding: '14px 24px',
              borderRadius: 0,
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = 'var(--text-primary)';
              el.style.borderColor = 'var(--text-muted)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = 'var(--text-muted)';
              el.style.borderColor = 'var(--border)';
            }}
          >
            See how it works
          </Link>
        </motion.div>
      </div>

      {/* ReactFlow Interactive Canvas Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        style={{
          width: '100%',
          maxWidth: 1000,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 0,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 0.2s, border-color 0.2s',
        }}
      >
        {/* Section Header */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            padding: '16px 24px',
            background: 'var(--surface-hover)',
            transition: 'background-color 0.2s, border-color 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg
              width="14"
              height="12"
              viewBox="0 0 1671 1483"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M428.5 0H0L0.5 428L428.5 0Z" fill="#FF5500" />
              <path d="M428.5 1482.5H0L0.5 1054.5L428.5 1482.5Z" fill="#FF5500" />
              <path d="M1671 1H739L0 741L738 1482H1671L933 741L1671 1Z" fill="#FF5500" />
            </svg>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: '#ff5500',
                letterSpacing: '0.07em',
              }}
            >
              System Blueprint
            </span>
          </div>
          <span
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}
          >
            SYSTEM GENERATED // VERSION 1.0.4
          </span>
        </div>

        {/* Canvas container */}
        <div
          style={{
            height: 380,
            width: '100%',
            position: 'relative',
            background: 'var(--bg)',
            transition: 'background-color 0.2s',
          }}
        >
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            fitView
            zoomOnScroll={false}
            panOnDrag={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          />

          {/* Overlay state chips - placed safely on the left side to avoid overlapping any nodes */}
          <div style={floatingCardTopLeft}>
            <span style={floatingCardCategory}>ACTIVE STATE</span>
            <span style={floatingCardTitle}>Scale: MICRO</span>
          </div>
          <div style={floatingCardBottomLeft}>
            <span style={{ ...floatingCardCategory, color: '#ff5500' }}>RECOMMENDED</span>
            <span style={floatingCardTitle}>Supabase Postgres DB</span>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border)',
            padding: '16px 24px',
            background: 'var(--surface-hover)',
            transition: 'background-color 0.2s, border-color 0.2s',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {/* Target Profile Switchers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
              }}
            >
              TARGET INFRASTRUCTURE:
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Hobby Profile */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px solid #ff5500',
                  background: 'var(--orange-wash)',
                  padding: '4px 10px',
                  color: '#ff5500',
                  borderRadius: 0,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 500 }}>Managed SaaS</span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <img
                    src="/images/tech/supabase.svg"
                    style={{ width: 10, height: 10, objectFit: 'contain' }}
                    alt="Supabase"
                  />
                  <img
                    src="/images/tech/clerk.svg"
                    style={{ width: 10, height: 10, objectFit: 'contain' }}
                    alt="Clerk"
                  />
                  <img
                    src="/images/tech/redis.svg"
                    style={{ width: 10, height: 10, objectFit: 'contain' }}
                    alt="Redis"
                  />
                </div>
              </div>

              {/* AWS Profile */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  padding: '4px 10px',
                  color: 'var(--text-muted)',
                  borderRadius: 0,
                }}
              >
                <img
                  src="/images/tech/amazonaws.svg"
                  style={{ width: 12, height: 12, objectFit: 'contain' }}
                  alt="AWS"
                />
                <span style={{ fontSize: 11, fontWeight: 500 }}>AWS</span>
              </div>

              {/* GCP Profile */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  padding: '4px 10px',
                  color: 'var(--text-muted)',
                  borderRadius: 0,
                }}
              >
                <img
                  src="/images/tech/googlecloud.svg"
                  style={{ width: 12, height: 12, objectFit: 'contain' }}
                  alt="GCP"
                />
                <span style={{ fontSize: 11, fontWeight: 500 }}>GCP</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <span style={toolbarButtonStyle}>EXPORT JSON</span>
            <span
              style={{
                ...toolbarButtonStyle,
                color: '#ff5500',
                borderColor: 'var(--orange-border)',
              }}
            >
              EXPORT SVG
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

const floatingCardTopLeft: React.CSSProperties = {
  position: 'absolute',
  top: 15,
  left: 15,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  padding: '10px 14px',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  backdropFilter: 'blur(4px)',
  zIndex: 100,
  borderRadius: 0,
  transition: 'background-color 0.2s, border-color 0.2s',
};

const floatingCardBottomLeft: React.CSSProperties = {
  position: 'absolute',
  bottom: 15,
  left: 15,
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  padding: '10px 14px',
  textAlign: 'left',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  backdropFilter: 'blur(4px)',
  zIndex: 100,
  borderRadius: 0,
  transition: 'background-color 0.2s, border-color 0.2s',
};

const floatingCardCategory: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  letterSpacing: '0.08em',
  color: 'var(--text-muted)',
};

const floatingCardTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--text-primary)',
};

const toolbarButtonStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--text-muted)',
  border: '1px solid var(--border)',
  padding: '4px 10px',
  background: 'var(--surface)',
  cursor: 'pointer',
  borderRadius: 0,
  transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
};
