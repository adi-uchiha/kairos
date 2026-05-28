'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';


const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'GitHub', href: 'https://github.com/adi-uchiha/kairos', target: '_blank' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const { data: session } = authClient.useSession();


  useEffect(() => {
    // Detect theme on mount
    const isDark = document.documentElement.classList.contains('dark');
    const frame = requestAnimationFrame(() => {
      setTheme(isDark ? 'dark' : 'light');
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--bg)',
        transition: 'background-color 0.2s, border-color 0.2s',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <KairosLogoMark />
          <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
            Kairos
          </span>
        </Link>

        {/* Center nav */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          className="hidden-mobile"
        >
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              target={l.target}
              style={{
                fontSize: 14,
                color: 'var(--text-muted)',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-muted)')}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right CTA & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : theme === 'light' ? <Moon size={18} /> : <div style={{ width: 18, height: 18 }} />}
          </button>

          <Link
            href={session ? '/dashboard' : '/auth'}
            style={{ fontSize: 14, color: 'var(--text-muted)' }}
            className="hidden-mobile"
          >
            {session ? 'Dashboard' : 'Sign In'}
          </Link>
          <Link
            href={session ? '/dashboard' : '/auth'}
            style={{
              fontSize: 13,
              fontWeight: 500,
              background: 'var(--text-primary)',
              color: 'var(--bg)',
              padding: '8px 16px',
              borderRadius: 0,
              letterSpacing: '-0.01em',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = '0.85')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = '1')}
          >
            {session ? 'Dashboard →' : 'Get Started →'}
          </Link>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'none',
            }}
            className="show-mobile"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            background: 'var(--bg)',
          }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              style={{ fontSize: 15, color: 'var(--text-muted)' }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={session ? '/dashboard' : '/auth'}
            style={{ fontSize: 15, color: 'var(--text-muted)' }}
            onClick={() => setOpen(false)}
          >
            {session ? 'Dashboard' : 'Sign In'}
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function KairosLogoMark() {
  return (
    <svg width="24" height="21" viewBox="0 0 1671 1483" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M428.5 0H0L0.5 428L428.5 0Z" fill="#FF5500" />
      <path d="M428.5 1482.5H0L0.5 1054.5L428.5 1482.5Z" fill="#FF5500" />
      <path d="M1671 1H739L0 741L738 1482H1671L933 741L1671 1Z" fill="#FF5500" />
    </svg>
  );
}
