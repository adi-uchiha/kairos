'use client';

import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export default function TermsOfService() {
  return (
    <main style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />

      {/* Side lines matching landing page */}
      <div className="aesthetic-side-lines" />

      {/* Subtle radial glow matching landing page */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 600,
          background: 'radial-gradient(circle, rgba(255,85,0,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid background lines matching landing page */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 1200,
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      <div className="max-w-[800px] mx-auto px-6 py-28 relative z-10 text-foreground">
        <div className="space-y-8 font-sans">
          {/* Header */}
          <div className="space-y-3 pb-8 border-b border-border">
            <span className="font-mono text-[10px] text-primary uppercase tracking-widest font-semibold">
              Legal // Terms of Use
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Terms of Service
            </h1>
            <p className="text-xs text-muted-foreground font-mono">Last Updated: May 28, 2026</p>
          </div>

          {/* Body Content */}
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              Welcome to <strong className="text-foreground">Kairos</strong>. By accessing our
              platform, website, or using our AI system architecture recommendation tools, you agree
              to comply with and be bound by the following Terms of Service. Please read them
              carefully.
            </p>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                1. Acceptance of Terms
              </h2>
              <p>
                By signing in, generating blueprints, or using any feature on Kairos, you accept and
                agree to these Terms of Service. If you do not agree to these terms, you are
                prohibited from using this website or its services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                2. User Account Registration
              </h2>
              <p>
                To access saved projects and interactive system diagrams, you must register and
                authenticate using Google or GitHub OAuth credentials. You agree that:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You are responsible for keeping your credentials secure.</li>
                <li>
                  You will notify us immediately if you suspect any unauthorized access or breach of
                  security.
                </li>
                <li>You represent that all details linked to your OAuth identity are accurate.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                3. Service License & Permitted Use
              </h2>
              <p>
                Subject to these terms, Kairos grants you a limited, non-exclusive,
                non-transferable, and revocable license to access the platform, generate
                architectural stacks, configure interactive blueprints, and export generated JSON
                and image blueprints for personal and commercial usage.
              </p>
              <p>You agree not to use the platform to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Interfere with, disable, or circumvent any security features.</li>
                <li>DDoS, scrape, or systematically index the platform API endpoints.</li>
                <li>Abuse LLM token interfaces or trigger automated conversational attacks.</li>
              </ul>
            </section>

            <section className="space-y-3 bg-orange-wash/40 border border-orange-border/30 p-4 rounded-none">
              <h2 className="text-base font-bold text-[#ff5500] font-mono uppercase tracking-tight">
                4. AI Disclaimer (No Professional Warranty)
              </h2>
              <p className="text-zinc-800 dark:text-zinc-300">
                <strong>IMPORTANT:</strong> Kairos uses artificial intelligence algorithms and large
                language models to construct architectural blueprints and tech stack advice. These
                suggestions are strictly for <strong>educational and informational purposes</strong>
                .
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-800 dark:text-zinc-300">
                <li>
                  We do not guarantee the completeness, accuracy, security, or production-readiness
                  of the recommended stack configurations.
                </li>
                <li>
                  We are not responsible for any security vulnerabilities, database corruptions,
                  server downtimes, or financial expenses incurred by implementing recommended
                  third-party cloud services.
                </li>
                <li>
                  You are solely responsible for conducting code reviews, assessing hosting
                  requirements, and verifying all cost tiers before building production software.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                5. Limitation of Liability
              </h2>
              <p>
                In no event shall Kairos, its creators, or affiliates be liable for any damages
                (including, without limitation, damages for loss of data or profit, or due to
                business interruption) arising out of the use or inability to use the
                recommendations, systems, or codebases linked to the platform, even if notified
                orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                6. Service Modifications
              </h2>
              <p>
                We reserve the right to temporarily or permanently modify, suspend, or terminate the
                services, feature sets, database states, and interface tools on Kairos at any time,
                with or without prior notice.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                7. Contact Support
              </h2>
              <p>For questions concerning these Terms of Service, please contact us at:</p>
              <p className="font-mono text-xs text-foreground bg-surface border border-border p-3">
                aditya@adixcode.com
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
