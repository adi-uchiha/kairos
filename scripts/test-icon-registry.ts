import { getIconUrl } from '../lib/icon-registry';

const SPOT_CHECK = [
  'Next.js', 'Bun', 'Go', 'Rust', 'PostgreSQL', 'Redis',
  'Vercel', 'Stripe', 'Resend', 'Supabase',
  'AWS Lambda', 'Amazon S3',
];

for (const label of SPOT_CHECK) {
  const url = getIconUrl(label);
  console.log(url ? `✓ ${label} → ${url}` : `✗ ${label} → no icon (fallback)`);
}
