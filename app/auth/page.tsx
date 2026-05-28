'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      <Card
        className="w-full max-w-[800px] grid grid-cols-1 md:grid-cols-2 p-0 gap-0 border border-border bg-card shadow-2xl overflow-hidden rounded-none ring-0"
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
        <div className="p-8 flex flex-col justify-between bg-card text-card-foreground min-h-[500px]">
          {/* Top Header / Switcher */}
          <div className="flex justify-between items-center md:justify-end mb-4">
            {/* Logo visible only on mobile/tablet */}
            <Link href="/" className="flex items-center gap-2 font-medium text-foreground md:hidden">
              <svg width="20" height="18" viewBox="0 0 1671 1483" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M428.5 0H0L0.5 428L428.5 0Z" fill="#FF5500" />
                <path d="M428.5 1482.5H0L0.5 1054.5L428.5 1482.5Z" fill="#FF5500" />
                <path d="M1671 1H739L0 741L738 1482H1671L933 741L1671 1Z" fill="#FF5500" />
              </svg>
              <span className="font-semibold text-sm">Kairos</span>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFormMode(formMode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {formMode === 'signin' ? 'Create an account' : 'Sign in'}
            </Button>
          </div>

          {/* Form Content Area */}
          <div className="space-y-6">
            {/* Title / Subtitle */}
            <div className="flex flex-col gap-1.5 text-center md:text-left">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {formMode === 'signin' ? 'Login to your account' : 'Create an account'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {formMode === 'signin'
                  ? 'Enter your email below to login to your account'
                  : 'Enter your details below to create your account'}
              </p>
            </div>

            {/* Social Buttons */}
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={() => handleSocialSignIn('github')}
                disabled={loading || socialLoading !== null}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium cursor-pointer"
              >
                {socialLoading === 'github' ? (
                  <span className="w-3.5 h-3.5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/images/tech/github.svg" className="w-3.5 h-3.5 dark:invert" alt="" />
                )}
                Continue with GitHub
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSocialSignIn('google')}
                disabled={loading || socialLoading !== null}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium cursor-pointer"
              >
                {socialLoading === 'google' ? (
                  <span className="w-3.5 h-3.5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src="/images/tech/google.svg" className="w-3.5 h-3.5" alt="" />
                )}
                Continue with Google
              </Button>
            </div>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative px-3 bg-card text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div
                  className="p-2.5 border border-destructive/20 bg-destructive/10 text-destructive text-xs rounded-none"
                >
                  {error}
                </div>
              )}

              {formMode === 'signup' && (
                <div className="grid gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Name
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-none bg-transparent"
                  />
                </div>
              )}

              <div className="grid gap-1">
                <Label className="text-xs font-semibold text-foreground">
                  Email
                </Label>
                <Input
                  type="email"
                  required
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-none bg-transparent"
                />
              </div>

              <div className="grid gap-1">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-foreground">
                    Password
                  </Label>
                  {formMode === 'signin' && (
                    <a
                      href="#"
                      className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
                    >
                      Forgot your password?
                    </a>
                  )}
                </div>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-none bg-transparent"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || socialLoading !== null}
                className="w-full mt-2 text-xs font-semibold cursor-pointer"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                ) : formMode === 'signin' ? (
                  'Login'
                ) : (
                  'Sign up'
                )}
              </Button>
            </form>

            {/* Mobile Switcher link under form */}
            <div className="text-center pt-1.5">
              <span className="text-xs text-muted-foreground">
                {formMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <Button
                  variant="link"
                  size="xs"
                  onClick={() => {
                    setFormMode(formMode === 'signin' ? 'signup' : 'signin');
                    setError('');
                  }}
                  className="font-semibold text-foreground hover:underline cursor-pointer p-0 h-auto"
                >
                  {formMode === 'signin' ? 'Sign up' : 'Sign in'}
                </Button>
              </span>
            </div>
          </div>

          {/* Disclaimer / Consent Footer */}
          <div className="text-center text-[10px] text-muted-foreground max-w-[280px] mx-auto pt-4 border-t border-border mt-4 leading-normal">
            By clicking continue, you agree to our{' '}
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>.
          </div>
        </div>
      </Card>
    </div>
  );
}
