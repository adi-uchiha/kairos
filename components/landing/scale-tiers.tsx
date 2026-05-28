'use client';

import { motion } from 'framer-motion';

const TIERS = [
  {
    name: 'NANO',
    users: '1 – 500',
    approach: 'Free tier everything. Ship fast, validate fast.',
    example: 'Vercel · Supabase · Clerk · Resend',
  },
  {
    name: 'MICRO',
    users: '500 – 10K',
    approach: 'Managed services. Zero ops. Pay only for what you use.',
    example: 'Railway · Neon · Better Auth · Resend',
  },
  {
    name: 'SMALL',
    users: '10K – 100K',
    approach: 'Introduce caching, queues, CDN. Start thinking about reliability.',
    example: 'Fly.io · RDS · Cloudflare · Inngest',
  },
  {
    name: 'MEDIUM',
    users: '100K – 1M',
    approach: 'Cloud infrastructure justified. Horizontal scaling, monitoring.',
    example: 'Cloud Run · AlloyDB · GCP · Sentry',
  },
  {
    name: 'LARGE',
    users: '1M+',
    approach: 'Full cloud-native. Platform engineering, SRE mindset.',
    example: 'EKS · RDS · CloudFront · Datadog',
  },
];

export function ScaleTiers() {
  return (
    <section style={{ padding: '100px 24px', borderTop: '1px solid var(--border)' }}>
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
            Scale Tiers
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
            Built for every stage of growth
          </h2>
        </motion.div>

        {/* Table */}
        <div style={{ border: '1px solid var(--border)' }}>
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 140px 1fr 1fr',
              borderBottom: '1px solid var(--border)',
              padding: '12px 24px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              background: 'var(--surface-hover)',
            }}
            className="tier-row"
          >
            <span>Tier</span>
            <span>Users</span>
            <span>Approach</span>
            <span>Example Stack</span>
          </div>

          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 140px 1fr 1fr',
                padding: '20px 24px',
                borderBottom: i < TIERS.length - 1 ? '1px solid var(--border)' : 'none',
                background: 'var(--surface)',
                alignItems: 'center',
                gap: 12,
                transition: 'background-color 0.15s',
              }}
              className="tier-row"
              whileHover={{ backgroundColor: 'var(--surface-hover)' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  letterSpacing: '0.06em',
                  color: i === 0 ? '#ff5500' : '#a1a1aa',
                  fontWeight: i === 0 ? 500 : 400,
                }}
              >
                {tier.name}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#52525b' }}>
                {tier.users}
              </span>
              <span style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.5 }}>
                {tier.approach}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: '#52525b',
                  letterSpacing: '0.02em',
                }}
              >
                {tier.example}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .tier-row {
            grid-template-columns: 80px 1fr !important;
          }
          .tier-row > span:nth-child(3),
          .tier-row > span:nth-child(4) {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
