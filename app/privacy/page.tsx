'use client';

import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export default function PrivacyPolicy() {
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
              Legal // Information Security
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="text-xs text-muted-foreground font-mono">Last Updated: May 28, 2026</p>
          </div>

          {/* Body Content */}
          <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              At <strong className="text-foreground">Kairos</strong> (&ldquo;we,&rdquo;
              &ldquo;our,&rdquo; or &ldquo;us&rdquo;), we are committed to protecting your privacy.
              This Privacy Policy describes how we collect, use, and safeguard the information you
              provide when using our AI System Architect and Tech Stack advisor platform.
            </p>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                1. Information We Collect
              </h2>
              <p>
                To provide precise architecture recommendations, we collect the following categories
                of data:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Account Information:</strong> When you
                  authenticate via Google or GitHub OAuth, we receive your email address, name,
                  profile image URL, and a unique identifier.
                </li>
                <li>
                  <strong className="text-foreground">
                    Conversational & Questionnaire Inputs:
                  </strong>{' '}
                  We collect details about your project categories, product ideas, technical skill
                  profiles, target scaling bounds, timelines, and budget constraints that you submit
                  during discovery.
                </li>
                <li>
                  <strong className="text-foreground">System Blueprints:</strong> We save system
                  recommendations and the configurations of diagram nodes (e.g. customized frontend
                  layers, database providers, and connected links) you edit on the canvas.
                </li>
                <li>
                  <strong className="text-foreground">Usage Telemetry:</strong> We collect
                  non-identifiable usage parameters (such as click triggers, page views, and
                  performance logs) via PostHog to analyze UX interaction and error cases.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                2. How We Use Your Information
              </h2>
              <p>We use the collected information for the following specific purposes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>To generate detailed, opinionated, and customized technology stack reports.</li>
                <li>To render and load your interactive system architecture diagrams.</li>
                <li>To authenticate, save, and restore your design blueprints across sessions.</li>
                <li>
                  To run natural language conversation pipelines and refine our recommendations.
                </li>
                <li>To diagnose application performance bottlenecks and prevent abuse.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                3. Data Sharing & Third-Party Processors
              </h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We share
                your data only with third-party service providers acting on our behalf to deliver
                the core application functionality:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">AI Core Processors:</strong> We transmit your
                  anonymized project constraints and survey details to large language model (LLM)
                  API interfaces (such as Google Gemini, Anthropic, or OpenAI) to compute the
                  architectural recommendations. No personal identifiers (like emails or names) are
                  shared with these LLM providers.
                </li>
                <li>
                  <strong className="text-foreground">Analytics Platforms:</strong> We use PostHog
                  to process anonymous telemetry to track how users interact with the diagram
                  workspace.
                </li>
                <li>
                  <strong className="text-foreground">Authentication Services:</strong> Better Auth
                  handles secure tokens and redirects directly with Google and GitHub.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                4. Data Retention & Deletion
              </h2>
              <p>
                We retain your account details and custom blueprints as long as your account remains
                active. You have full control over your data:
              </p>
              <p>
                You may request complete deletion of your account and all associated architectural
                records at any time by contacting us. Deleted data is permanently purged from our
                database tables and cannot be recovered.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                5. Security Protocols
              </h2>
              <p>
                We secure your databases and session tokens using industry-standard measures. All
                database communication is performed over encrypted TLS connections, and user login
                tokens are stored in secure browser cookies via Better Auth. However, no
                transmission over the internet can be guaranteed as 100% secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-foreground font-mono uppercase tracking-tight">
                6. Contact Information
              </h2>
              <p>
                If you have questions regarding this Privacy Policy or wish to request data
                deletion, please reach out to us at:
              </p>
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
