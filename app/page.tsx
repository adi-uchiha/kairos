import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Features } from '@/components/landing/features';
import { ScaleTiers } from '@/components/landing/scale-tiers';
import { Pricing } from '@/components/landing/pricing';
import { CtaBand } from '@/components/landing/cta-band';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <main style={{ position: 'relative', overflowX: 'hidden' }}>
      <Navbar />
      <div className="aesthetic-side-lines" />
      <Hero />
      <HowItWorks />
      <Features />
      <ScaleTiers />
      <Pricing />
      <CtaBand />
      <Footer />
    </main>
  );
}
