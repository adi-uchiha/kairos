import { ICON_REGISTRY } from '../lib/icon-registry';

const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

function buildIconUrl(source: string, slug: string, variant?: string): string {
  switch (source) {
    case 'devicon':
      const v = variant ?? 'original';
      return `${DEVICON_BASE}/${slug}/${slug}-${v}.svg`;
    case 'simpleicons':
      return `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
    case 'svgl':
      return `https://svgl.app/library/${slug}.svg`;
    case 'selfhst':
      return `https://cdn.jsdelivr.net/gh/selfhst/icons/svg/${slug}.svg`;
    case 'local':
      return slug.startsWith('http') ? slug : '';
    default:
      return '';
  }
}

async function testAll() {
  console.log('Verifying all CDN icon URLs...');
  let failed = 0;
  let succeeded = 0;

  for (const [key, entry] of Object.entries(ICON_REGISTRY)) {
    if (entry.source === 'local' && !entry.slug.startsWith('http')) continue;
    const url = buildIconUrl(entry.source, entry.slug, entry.variant);
    if (!url) continue;

    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.status === 200) {
        console.log(`\x1b[32m✓\x1b[0m ${key} → ${url}`);
        succeeded++;
      } else {
        console.log(`\x1b[31m✗\x1b[0m ${key} → ${url} (Returned ${res.status})`);
        failed++;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`\x1b[31m✗\x1b[0m ${key} → ${url} (Error: ${message})`);
      failed++;
    }
  }

  console.log(`\nVerification Complete!`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`Failed: ${failed}`);
}

testAll();
