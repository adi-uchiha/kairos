'use client';

import { motion } from 'framer-motion';

const STACK_ROWS = [
  {
    label: 'Frontend',
    arrow: '→',
    value: 'Vite + React + TanStack Router',
    why: 'Fast DX, SPA is fine at Nano scale',
  },
  {
    label: 'Backend',
    arrow: '→',
    value: 'Node.js + Hono',
    why: 'Edge-compatible, TypeScript native',
  },
  {
    label: 'Database',
    arrow: '→',
    value: 'Supabase (Postgres)',
    why: 'Free tier, auth + realtime built-in',
  },
  { label: 'Auth', arrow: '→', value: 'Clerk', why: 'Best DX, generous free tier' },
  { label: 'Email', arrow: '→', value: 'Resend', why: 'Modern API, 100 emails/day free' },
  { label: 'Hosting', arrow: '→', value: 'Vercel + Railway', why: 'Zero-config, instant deploys' },
];

const TIERS = ['NANO', 'MICRO', 'SMALL', 'MEDIUM', 'LARGE'];

export function Features() {
  return (
    <section id="features" style={{ padding: '100px 24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 64 }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#ff5500',
              marginBottom: 16,
            }}
          >
            Features
          </p>
          <h2
            style={{
              fontSize: 'clamp(32px, 4vw, 44px)',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            Everything you need to decide
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            border: '1px solid var(--border)',
          }}
          className="bento-grid"
        >
          {/* Card 1 — Large (spans 2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            style={{
              gridColumn: 'span 2',
              padding: '32px',
              borderRight: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
            className="bento-large"
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}
            >
              Stack at a Glance
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
              Every layer of your architecture in one table. Every choice explained.
            </p>
            {/* Mock table */}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              <div
                style={{
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: 8,
                  marginBottom: 8,
                  display: 'grid',
                  gridTemplateColumns: '100px 16px 1fr 1fr',
                  gap: 12,
                  color: '#3f3f46',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: 11,
                }}
              >
                <span>LAYER</span>
                <span></span>
                <span>TOOL</span>
                <span>WHY</span>
              </div>
              {STACK_ROWS.map((r) => (
                <div
                  key={r.label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 16px 1fr 1fr',
                    gap: 12,
                    paddingBottom: 8,
                    marginBottom: 8,
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ color: '#52525b' }}>{r.label}</span>
                  <span style={{ color: '#ff5500' }}>{r.arrow}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{r.value}</span>
                  <span style={{ color: '#52525b' }}>{r.why}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 2 — Scale Tiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.07 }}
            style={{
              padding: '32px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}
            >
              Scale Tiers
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
              Recommendations locked to your realistic scale from day one.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIERS.map((t, i) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 0,
                      background: i === 0 ? '#ff5500' : 'var(--border)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      letterSpacing: '0.05em',
                      color: i === 0 ? '#ff5500' : '#52525b',
                    }}
                  >
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3 — Trade-offs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{
              padding: '32px',
              borderRight: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 16 }}>⚠</div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}
            >
              Honest Trade-offs
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>
              Every recommendation comes with what you&apos;re giving up. No sugarcoating.
            </p>
          </motion.div>

          {/* Card 4 — Cloud vs Managed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.14 }}
            style={{
              padding: '32px',
              borderRight: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}
            >
              Cloud vs. Managed
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-muted)',
                marginBottom: 24,
                lineHeight: 1.65,
              }}
            >
              Kairos tells you which infrastructure model fits your scale.
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.05em',
              }}
            >
              <span style={{ color: '#ff5500' }}>FREE TIER</span>
              <div
                style={{ flex: 1, height: 1, background: 'var(--border)', position: 'relative' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '25%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 8,
                    height: 8,
                    borderRadius: 0,
                    background: '#ff5500',
                    border: '2px solid var(--bg)',
                  }}
                />
              </div>
              <span style={{ color: '#52525b' }}>AWS / GCP</span>
            </div>
          </motion.div>

          {/* Card 5 — Interactive Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.18 }}
            style={{
              padding: '32px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                marginBottom: 8,
              }}
            >
              Interactive Diagram
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-muted)',
                marginBottom: 24,
                lineHeight: 1.65,
              }}
            >
              Node-based architecture canvas. Click nodes, swap services, export PNG.
            </p>
            {/* Mini diagram mock */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
              }}
            >
              {['Frontend', 'API', 'DB'].map((n, i) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      padding: '4px 10px',
                      border: '1px solid var(--border)',
                      borderRadius: 0,
                      color: 'var(--text-muted)',
                      background: 'var(--surface-hover)',
                    }}
                  >
                    {n}
                  </div>
                  {i < 2 && <span style={{ color: '#ff5500' }}>→</span>}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 6 — Opinionated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.22 }}
            style={{
              padding: '32px',
              gridColumn: 'span 3',
              background: 'var(--surface)',
              borderTop: 'none',
            }}
            className="bento-full"
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary)',
                    marginBottom: 8,
                  }}
                >
                  Opinionated by Default
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 480 }}>
                  Kairos doesn&apos;t show you a menu. It picks. Then explains exactly why, so you
                  can push back if needed.
                </p>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: '#ff5500',
                  letterSpacing: '0.05em',
                  border: '1px solid var(--orange-border)',
                  padding: '8px 16px',
                  borderRadius: 0,
                  background: 'var(--orange-wash)',
                }}
              >
                DECISION · NOT A LIST
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .bento-grid {
            grid-template-columns: 1fr !important;
          }
          .bento-large, .bento-full {
            grid-column: 1 !important;
          }
          .bento-grid > div {
            border-right: none !important;
          }
        }
      `}</style>
    </section>
  );
}
