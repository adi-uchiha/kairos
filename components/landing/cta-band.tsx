'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function CtaBand() {
  return (
    <section style={{ padding: '120px 24px', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(255,85,0,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 600, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1.0, marginBottom: 24 }}>
          Your decisive<br />moment is now.
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontSize: 17, color: 'var(--text-muted)', marginBottom: 48, lineHeight: 1.65 }}>
          The right tool, at the right scale, for the right builder.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Link href="/app"
            style={{ display: 'inline-block', background: '#ff5500', color: '#fff', fontWeight: 500, fontSize: 15, padding: '14px 32px', borderRadius: 0, letterSpacing: '-0.01em', transition: 'opacity 0.15s' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}>
            Try AI Architect →
          </Link>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3f3f46', marginTop: 20 }}>
            Free · No account needed · 5 min
          </p>
        </motion.div>
      </div>
    </section>
  );
}
