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
        className="min-h-screen flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-500 animate-fade-in"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-zinc-400 animate-ping rounded-full" />
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
      className="min-h-screen flex items-center justify-center p-4 md:p-8 font-sans relative z-10"
      style={{ background: 'var(--bg)' }}
    >
      {/* Centered Auth Card Split Layout */}
      <div
        className="w-full max-w-[800px] grid grid-cols-1 md:grid-cols-2 border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden"
        style={{ borderRadius: 0 }}
      >
        {/* Left Column: Branding / Testimonial (Desktop Only) */}
        <div className="relative hidden md:flex flex-col justify-between p-8 bg-zinc-900 text-zinc-200 border-r border-zinc-800 dark:bg-zinc-900/40">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-2 text-white">
            <svg width="20" height="18" viewBox="0 0 1671 1483" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
              <path d="M428.5 0H0L0.5 428L428.5 0Z" fill="#FF5500" />
              <path d="M428.5 1482.5H0L0.5 1054.5L428.5 1482.5Z" fill="#FF5500" />
              <path d="M1671 1H739L0 741L738 1482H1671L933 741L1671 1Z" fill="#FF5500" />
            </svg>
            <span className="font-semibold text-base tracking-tight">Kairos</span>
          </Link>

          {/* Testimonial Quote */}
          <blockquote className="space-y-2">
            <p className="text-sm leading-relaxed text-zinc-100">
              &ldquo;Kairos completely removed the decision fatigue of choosing our SaaS tech stack. Within minutes, we had a production-ready blueprint mapped out with clear, actionable scaling recommendations.&rdquo;
            </p>
            <footer className="text-xs font-mono text-zinc-400">
              — Solo Developer, Creator of Kairos
            </footer>
          </blockquote>
        </div>

        {/* Right Column: Form Container */}
        <div className="p-8 flex flex-col justify-between bg-white dark:bg-zinc-950 min-h-[500px]">
          {/* Top Header / Switcher */}
          <div className="flex justify-between items-center md:justify-end mb-4">
            {/* Logo visible only on mobile/tablet */}
            <Link href="/" className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-50 md:hidden">
              <svg width="20" height="18" viewBox="0 0 1671 1483" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M428.5 0H0L0.5 428L428.5 0Z" fill="#FF5500" />
                <path d="M428.5 1482.5H0L0.5 1054.5L428.5 1482.5Z" fill="#FF5500" />
                <path d="M1671 1H739L0 741L738 1482H1671L933 741L1671 1Z" fill="#FF5500" />
              </svg>
              <span className="font-semibold text-sm">Kairos</span>
            </Link>

            <button
              onClick={() => {
                setFormMode(formMode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:underline cursor-pointer bg-transparent border-0"
            >
              {formMode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </div>

          {/* Form Content Area */}
          <div className="space-y-6">
            {/* Title / Subtitle */}
            <div className="flex flex-col gap-1.5 text-center md:text-left">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {formMode === 'signin' ? 'Login to your account' : 'Create an account'}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {formMode === 'signin'
                  ? 'Enter your email below to login to your account'
                  : 'Enter your details below to create your account'}
              </p>
            </div>

            {/* Social Buttons */}
            <div className="grid gap-2">
              <button
                onClick={() => handleSocialSignIn('github')}
                disabled={loading || socialLoading !== null}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 cursor-pointer bg-transparent"
                style={{ borderRadius: 0 }}
              >
                {socialLoading === 'github' ? (
                  <span className="w-3.5 h-3.5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/images/tech/github.svg" className="w-3.5 h-3.5 dark:invert" alt="" />
                )}
                Continue with GitHub
              </button>

              <button
                onClick={() => handleSocialSignIn('google')}
                disabled={loading || socialLoading !== null}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 cursor-pointer bg-transparent"
                style={{ borderRadius: 0 }}
              >
                {socialLoading === 'google' ? (
                  <span className="w-3.5 h-3.5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/images/tech/google.svg" className="w-3.5 h-3.5" alt="" />
                )}
                Continue with Google
              </button>
            </div>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-zinc-950 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div
                  className="p-2.5 border border-red-200 bg-red-50 text-red-600 text-xs dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
                  style={{ borderRadius: 0 }}
                >
                  {error}
                </div>
              )}

              {formMode === 'signup' && (
                <div className="grid gap-1">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-all"
                    style={{ borderRadius: 0 }}
                  />
                </div>
              )}

              <div className="grid gap-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-all"
                  style={{ borderRadius: 0 }}
                />
              </div>

              <div className="grid gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  {formMode === 'signin' && (
                    <a
                      href="#"
                      className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-all"
                  style={{ borderRadius: 0 }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || socialLoading !== null}
                className="w-full py-2 px-4 mt-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ borderRadius: 0 }}
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                ) : formMode === 'signin' ? (
                  'Login'
                ) : (
                  'Sign up'
                )}
              </button>
            </form>

            {/* Mobile Switcher link under form */}
            <div className="text-center pt-1.5">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {formMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setFormMode(formMode === 'signin' ? 'signup' : 'signin');
                    setError('');
                  }}
                  className="font-semibold text-zinc-900 dark:text-zinc-50 hover:underline cursor-pointer bg-transparent border-0 p-0"
                >
                  {formMode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </span>
            </div>
          </div>

          {/* Disclaimer / Consent Footer */}
          <div className="text-center text-[10px] text-zinc-400 dark:text-zinc-500 max-w-[280px] mx-auto pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4 leading-normal">
            By clicking continue, you agree to our{' '}
            <a href="#" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">
              Privacy Policy
            </a>.
          </div>
        </div>
      </div>
    </div>
  );
}
