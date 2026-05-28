'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    title: 'Describe Your Product',
    body: 'Tell Kairos what you\'re building, who it\'s for, and what the core workflow looks like. Open-ended questions, no forms to fill.',
  },
  {
    num: '02',
    title: 'Define Your Scale',
    body: 'Share realistic user numbers. Kairos assigns a scale tier — Nano, Micro, Small, Medium, or Large — and anchors every decision to it.',
  },
  {
    num: '03',
    title: 'Share Your Context',
    body: 'Your strongest language, team size, budget, and DevOps comfort level. Five questions, two minutes.',
  },
  {
    num: '04',
    title: 'Get Your Diagram',
    body: 'A complete opinionated stack recommendation plus an interactive, node-based architecture diagram you can explore, edit, and share.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '100px 24px', borderTop: '1px solid var(--border)' }}>
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
            The Process
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
            How Kairos works
          </h2>
        </motion.div>

        {/* Steps grid — shared borders */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            border: '1px solid var(--border)',
          }}
          className="steps-grid"
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              style={{
                padding: '32px 28px',
                borderRight: i < STEPS.length - 1 ? '1px solid var(--border)' : 'none',
                background: 'var(--surface)',
                transition: 'background-color 0.15s',
                cursor: 'default',
              }}
              whileHover={{ backgroundColor: 'var(--surface-hover)' }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  color: '#ff5500',
                  marginBottom: 20,
                }}
              >
                {step.num}
              </p>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                  marginBottom: 12,
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-muted)' }}>
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .steps-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .steps-grid > div {
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
        }
        @media (max-width: 560px) {
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
