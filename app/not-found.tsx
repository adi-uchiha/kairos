import Link from 'next/link';

export const metadata = {
  title: '404 — Page Not Found | Kairos',
  description: 'This page does not exist.',
};

const hoverStyle = `
  .not-found-link:hover {
    border-color: var(--orange) !important;
    color: var(--orange) !important;
  }
`;

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        padding: '24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{hoverStyle}</style>
      {/* Subtle grid background */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />

      {/* Orange accent top line */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '2px',
          background: 'var(--orange)',
        }}
      />

      <div style={{ position: 'relative', maxWidth: '480px' }}>
        {/* 404 number */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(72px, 15vw, 128px)',
            fontWeight: 500,
            lineHeight: 1,
            color: 'var(--border)',
            letterSpacing: '-4px',
            userSelect: 'none',
          }}
        >
          404
        </p>

        {/* Divider */}
        <div
          style={{
            width: '32px',
            height: '2px',
            background: 'var(--orange)',
            margin: '24px auto',
          }}
        />

        {/* Heading */}
        <h1
          style={{
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: 600,
            letterSpacing: '-0.5px',
            marginBottom: '12px',
          }}
        >
          Page not found
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '36px',
          }}
        >
          This route doesn&apos;t exist. The architecture you&apos;re looking for lives somewhere
          else.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="not-found-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
            textDecoration: 'none',
          }}
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
