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
        className="min-h-screen flex flex-col items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-500"
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 font-sans bg-white dark:bg-zinc-950">
      {/* Left panel: Dark sidebar with Branding and Quote */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 bg-zinc-900 text-zinc-200 border-r border-zinc-800 dark:bg-zinc-900/40">
        <div className="absolute inset-0 bg-cover bg-center opacity-5 pointer-events-none" />
        
        {/* Top Logo */}
        <Link href="/" className="flex items-center gap-2 text-white relative z-10">
          <svg width="24" height="21" viewBox="0 0 1671 1483" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
            <path d="M428.5 0H0L0.5 428L428.5 0Z" fill="#FF5500" />
            <path d="M428.5 1482.5H0L0.5 1054.5L428.5 1482.5Z" fill="#FF5500" />
            <path d="M1671 1H739L0 741L738 1482H1671L933 741L1671 1Z" fill="#FF5500" />
          </svg>
          <span className="font-semibold text-lg tracking-tight">Kairos</span>
        </Link>

        {/* Bottom Testimonial */}
        <div className="relative z-10 space-y-4">
          <blockquote className="space-y-2">
            <p className="text-lg leading-relaxed font-normal text-zinc-100">
              &ldquo;Kairos completely removed the decision fatigue of choosing our SaaS tech stack. Within minutes, we had a production-ready blueprint mapped out with clear, actionable scaling recommendations.&rdquo;
            </p>
            <footer className="text-sm font-mono text-zinc-400">
              — Solo Developer, Creator of Kairos
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right panel: Authentication Form */}
      <div className="relative flex items-center justify-center p-6 bg-white dark:bg-zinc-950">
        {/* Toggle Switcher at the top right */}
        <div className="absolute top-8 right-8">
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

        {/* Form Container */}
        <div className="w-full max-w-[340px] space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {formMode === 'signin' ? 'Login to your account' : 'Create an account'}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {formMode === 'signin'
                ? 'Enter your email below to login to your account'
                : 'Enter your details below to create your account'}
            </p>
          </div>

          {/* Social Sign-In buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleSocialSignIn('github')}
              disabled={loading || socialLoading !== null}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-md transition-all text-zinc-900 dark:text-zinc-100 cursor-pointer bg-white dark:bg-zinc-950"
            >
              {socialLoading === 'github' ? (
                <span className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/images/tech/github.svg" className="w-4 h-4 dark:invert" alt="" />
              )}
              Continue with GitHub
            </button>

            <button
              onClick={() => handleSocialSignIn('google')}
              disabled={loading || socialLoading !== null}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-md transition-all text-zinc-900 dark:text-zinc-100 cursor-pointer bg-white dark:bg-zinc-950"
            >
              {socialLoading === 'google' ? (
                <span className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/images/tech/google.svg" className="w-4 h-4" alt="" />
              )}
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <span className="relative px-3 bg-white dark:bg-zinc-950 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Local credential form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 border border-red-200 bg-red-50 text-red-600 rounded-md text-xs dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
                {error}
              </div>
            )}

            {formMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:outline-none transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                {formMode === 'signin' && (
                  <a
                    href="#"
                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:underline"
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
                className="w-full bg-transparent border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm rounded-md text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || socialLoading !== null}
              className="w-full py-2 px-4 mt-2 text-sm font-semibold rounded-md text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
              ) : formMode === 'signin' ? (
                'Login'
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          {/* Toggle switcher link under form */}
          <div className="text-center pt-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setFormMode(formMode === 'signin' ? 'signup' : 'signin');
                  setError('');
                }}
                className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                {formMode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </span>
          </div>

          {/* Consent footer */}
          <div className="text-center text-[10px] text-zinc-400 dark:text-zinc-500 max-w-[280px] mx-auto pt-4 leading-normal">
            By clicking continue, you agree to our{' '}
            <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">
              Privacy Policy
            </a>.
          </div>
        </div>
      </div>
    </div>
  );
}
