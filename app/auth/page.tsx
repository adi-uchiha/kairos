'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

type FormMode = 'signin' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const [formMode, setFormMode] = useState<FormMode>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'github' | 'google' | null>(null);

  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (formMode === 'signup') {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: '/dashboard',
        });

        if (signUpError) {
          setError(signUpError.message || 'Registration failed. Please try again.');
          setLoading(false);
        } else {
          router.push('/dashboard');
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: '/dashboard',
        });

        if (signInError) {
          setError(signInError.message || 'Invalid email or password.');
          setLoading(false);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error('Auth action error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'github' | 'google') => {
    setError('');
    setSocialLoading(provider);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: '/dashboard',
      });
    } catch (err) {
      console.error(`${provider} sign-in failed:`, err);
      setError(`Failed to sign in with ${provider}.`);
      setSocialLoading(null);
    }
  };

  if (isPending) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#FF5500] animate-ping" />
          <span>Authenticating...</span>
        </div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 font-sans"
      style={{ background: 'var(--bg)' }}
    >
      {/* Structural visual lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-30">
        <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-full border-l border-r border-[var(--border)]" />
      </div>

      <div className="w-full max-w-[380px] relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex items-center gap-2.5 mx-auto">
            <svg width="24" height="21" viewBox="0 0 1671 1483" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M428.5 0H0L0.5 428L428.5 0Z" fill="#FF5500" />
              <path d="M428.5 1482.5H0L0.5 1054.5L428.5 1482.5Z" fill="#FF5500" />
              <path d="M1671 1H739L0 741L738 1482H1671L933 741L1671 1Z" fill="#FF5500" />
            </svg>
            <span className="font-semibold text-lg tracking-tight text-[var(--text-primary)]">Kairos</span>
          </Link>
          <div className="font-mono text-[9px] tracking-widest text-[var(--text-muted)] uppercase">
            [ Developer Portal ]
          </div>
        </div>

        {/* Card */}
        <div
          className="border border-[var(--border)] p-6 bg-[var(--surface)] relative space-y-6"
          style={{ borderRadius: 0 }}
        >
          {/* Tab Switcher */}
          <div className="flex border-b border-[var(--border)]">
            <button
              onClick={() => {
                setFormMode('signin');
                setError('');
              }}
              className={`flex-1 pb-2 text-[11px] font-mono tracking-wider uppercase border-b-2 text-center transition-all cursor-pointer ${
                formMode === 'signin'
                  ? 'border-[#FF5500] text-[var(--text-primary)] font-semibold'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setFormMode('signup');
                setError('');
              }}
              className={`flex-1 pb-2 text-[11px] font-mono tracking-wider uppercase border-b-2 text-center transition-all cursor-pointer ${
                formMode === 'signup'
                  ? 'border-[#FF5500] text-[var(--text-primary)] font-semibold'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Social Sign-In */}
          <div className="space-y-2">
            <button
              onClick={() => handleSocialSignIn('github')}
              disabled={loading || socialLoading !== null}
              className="w-full flex items-center justify-center gap-2.5 py-2 px-3 text-xs font-mono uppercase tracking-wider border border-[var(--border)] hover:bg-[var(--surface-hover)] active:opacity-90 transition-all text-[var(--text-primary)] cursor-pointer bg-[var(--bg)]"
              style={{ borderRadius: 0 }}
            >
              {socialLoading === 'github' ? (
                <span className="w-3.5 h-3.5 border-2 border-t-transparent border-[var(--text-primary)] rounded-full animate-spin" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/images/tech/github.svg" className="w-3.5 h-3.5 dark:invert" alt="" />
              )}
              Continue with GitHub
            </button>

            <button
              onClick={() => handleSocialSignIn('google')}
              disabled={loading || socialLoading !== null}
              className="w-full flex items-center justify-center gap-2.5 py-2 px-3 text-xs font-mono uppercase tracking-wider border border-[var(--border)] hover:bg-[var(--surface-hover)] active:opacity-90 transition-all text-[var(--text-primary)] cursor-pointer bg-[var(--bg)]"
              style={{ borderRadius: 0 }}
            >
              {socialLoading === 'google' ? (
                <span className="w-3.5 h-3.5 border-2 border-t-transparent border-[var(--text-primary)] rounded-full animate-spin" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/images/tech/google.svg" className="w-3.5 h-3.5" alt="" />
              )}
              Continue with Google
            </button>
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 bg-[var(--border)]" />
            <span className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider">OR</span>
            <div className="h-[1px] flex-1 bg-[var(--border)]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 border border-[rgba(255,85,0,0.4)] bg-[rgba(255,85,0,0.05)] text-[#FF5500] text-xs font-mono">
                {error}
              </div>
            )}

            {formMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#FF5500] focus:outline-none transition-all"
                  style={{ borderRadius: 0 }}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#FF5500] focus:outline-none transition-all"
                style={{ borderRadius: 0 }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[#FF5500] focus:outline-none transition-all"
                style={{ borderRadius: 0 }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || socialLoading !== null}
              className="w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-95 active:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              style={{ borderRadius: 0, background: '#FF5500' }}
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : formMode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Back to Landing
          </Link>
        </div>
      </div>
    </div>
  );
}
