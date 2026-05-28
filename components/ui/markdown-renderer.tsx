'use client';

/**
 * MarkdownRenderer
 *
 * Reusable, design-system-aware markdown renderer for Kairos AI responses.
 * Built on react-markdown + remark-gfm (tables, strikethrough, task lists).
 *
 * Usage:
 *   <MarkdownRenderer content={message.content} />
 *   <MarkdownRenderer content={text} variant="compact" />
 *
 * Variants:
 *   "default"  — full spacing, used in AI chat bubbles
 *   "compact"  — tighter spacing, used in inline/sidebar contexts
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  variant?: 'default' | 'compact';
  className?: string;
}

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
// All values map to CSS variables defined in globals.css
const ORANGE = '#FF5500';
const MONO_FONT = 'var(--font-mono, "JetBrains Mono", monospace)';
const SANS_FONT = 'var(--font-sans, "Inter", sans-serif)';

// ─── COMPONENT MAP ───────────────────────────────────────────────────────────
// Each HTML element rendered by react-markdown is replaced with a
// design-system-consistent equivalent. No Tailwind — inline styles only,
// consistent with the rest of the workspace codebase.

function buildComponents(compact: boolean): Components {
  const gap = compact ? '6px' : '12px';
  const headingBase: React.CSSProperties = {
    fontFamily: SANS_FONT,
    fontWeight: 600,
    letterSpacing: '-0.3px',
    color: 'var(--text-primary)',
    marginTop: compact ? '12px' : '20px',
    marginBottom: gap,
    lineHeight: 1.3,
  };

  return {
    // ── Headings ──────────────────────────────────────────────────────────
    h1: ({ children }) => (
      <h1 style={{ ...headingBase, fontSize: compact ? '16px' : '18px', marginTop: 0 }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{ ...headingBase, fontSize: compact ? '14px' : '16px' }}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ ...headingBase, fontSize: compact ? '13px' : '14px' }}>{children}</h3>
    ),

    // ── Paragraph ─────────────────────────────────────────────────────────
    p: ({ children }) => (
      <p
        style={{
          fontFamily: SANS_FONT,
          fontSize: compact ? '13px' : '14px',
          lineHeight: 1.65,
          color: 'var(--text-primary)',
          margin: `0 0 ${gap} 0`,
        }}
      >
        {children}
      </p>
    ),

    // ── Inline code ───────────────────────────────────────────────────────
    code: ({ children, className }) => {
      // Block code is handled by `pre` below; this catches inline `code`
      const isBlock = !!className;
      if (isBlock) return <code className={className}>{children}</code>;
      return (
        <code
          style={{
            fontFamily: MONO_FONT,
            fontSize: '12px',
            background: 'var(--surface-hover)',
            border: '1px solid var(--border)',
            padding: '1px 5px',
            color: ORANGE,
            borderRadius: '2px',
          }}
        >
          {children}
        </code>
      );
    },

    // ── Code blocks ───────────────────────────────────────────────────────
    pre: ({ children }) => (
      <pre
        style={{
          fontFamily: MONO_FONT,
          fontSize: '12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeft: `2px solid ${ORANGE}`,
          padding: compact ? '10px 14px' : '14px 18px',
          overflowX: 'auto',
          margin: `${gap} 0`,
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          borderRadius: 0,
        }}
      >
        {children}
      </pre>
    ),

    // ── Lists ─────────────────────────────────────────────────────────────
    ul: ({ children }) => (
      <ul
        style={{
          paddingLeft: '20px',
          margin: `0 0 ${gap} 0`,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        style={{
          paddingLeft: '20px',
          margin: `0 0 ${gap} 0`,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li
        style={{
          fontFamily: SANS_FONT,
          fontSize: compact ? '13px' : '14px',
          lineHeight: 1.55,
          color: 'var(--text-primary)',
        }}
      >
        {children}
      </li>
    ),

    // ── Bold / Italic / Strikethrough ─────────────────────────────────────
    strong: ({ children }) => (
      <strong style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{children}</strong>
    ),
    em: ({ children }) => (
      <em style={{ fontStyle: 'italic', color: 'var(--text-secondary, var(--text-muted))' }}>
        {children}
      </em>
    ),
    del: ({ children }) => (
      <del style={{ textDecoration: 'line-through', opacity: 0.55 }}>{children}</del>
    ),

    // ── Blockquote ────────────────────────────────────────────────────────
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: `2px solid ${ORANGE}`,
          margin: `${gap} 0`,
          padding: '8px 14px',
          background: 'var(--orange-wash, rgba(255, 85, 0, 0.05))',
          color: 'var(--text-muted)',
          fontSize: compact ? '13px' : '14px',
          fontStyle: 'italic',
        }}
      >
        {children}
      </blockquote>
    ),

    // ── Horizontal Rule ───────────────────────────────────────────────────
    hr: () => (
      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--border)',
          margin: `${compact ? '10px' : '16px'} 0`,
        }}
      />
    ),

    // ── Table (remark-gfm) ────────────────────────────────────────────────
    table: ({ children }) => (
      <div style={{ overflowX: 'auto', margin: `${gap} 0` }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: SANS_FONT,
            fontSize: '13px',
          }}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead style={{ borderBottom: `1px solid ${ORANGE}` }}>{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr style={{ borderBottom: '1px solid var(--border)' }}>{children}</tr>,
    th: ({ children }) => (
      <th
        style={{
          padding: '6px 12px',
          textAlign: 'left',
          fontWeight: 600,
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td
        style={{
          padding: '6px 12px',
          color: 'var(--text-primary)',
          verticalAlign: 'top',
        }}
      >
        {children}
      </td>
    ),

    // ── Link ──────────────────────────────────────────────────────────────
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: ORANGE,
          textDecoration: 'underline',
          textUnderlineOffset: '3px',
        }}
      >
        {children}
      </a>
    ),
  };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function MarkdownRenderer({
  content,
  variant = 'default',
  className,
}: MarkdownRendererProps) {
  const compact = variant === 'compact';
  const components = buildComponents(compact);

  return (
    <div
      className={className}
      style={{
        // Reset so parent bubble styles don't bleed in
        lineHeight: 'normal',
        // Remove bottom margin from last child to avoid double padding
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
