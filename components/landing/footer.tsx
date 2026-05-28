'use client';

import Link from 'next/link';

const links = [
  { label: 'Docs', href: '/docs' },
  { label: 'Philosophy', href: '/docs/philosophy' },
  { label: 'GitHub', href: 'https://github.com', target: '_blank' },
  { label: 'Changelog', href: '/changelog' },
];

export function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
        {/* Left */}
        <div>
          <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.01em', marginBottom: 6 }}>Kairos</p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
            The right tool, at the right scale.
          </p>
        </div>
        {/* Center links */}
        <div style={{ display: 'flex', gap: 28 }}>
          {links.map((l) => (
            <Link key={l.label} href={l.href} target={l.target}
              style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.15s' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-muted)')}>
              {l.label}
            </Link>
          ))}
        </div>
        {/* Right */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
          Built by a solo dev, for solo devs.
        </p>
      </div>
      <div style={{ maxWidth: 1200, margin: '24px auto 0', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
          © {new Date().getFullYear()} Kairos. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
