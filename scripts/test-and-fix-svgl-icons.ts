import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TreeEntry {
  path: string;
  type: string;
}

interface TreeData {
  tree: TreeEntry[];
}

const svglData: TreeData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'svgl-tree-data.json'), 'utf8')
);

const svglFiles = svglData.tree.filter(e => 
  e.path.startsWith('static/library/') && e.path.endsWith('.svg')
);

function clean(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findBestSvglMatch(key: string): string | null {
  const cleanKey = clean(key);
  
  // High-fidelity manual mappings for premium tech branding
  const manualMappings: Record<string, string> = {
    'Next.js': 'nextjs_icon_dark',
    'React': 'react_dark',
    'Vue': 'vue',
    'Node.js': 'nodejs',
    'TypeScript': 'typescript',
    'JavaScript': 'javascript',
    'PostgreSQL': 'postgresql',
    'postgres': 'postgresql',
    'MySQL': 'mysql',
    'MongoDB': 'mongodb',
    'Redis': 'redis',
    'Docker': 'docker',
    'Kubernetes': 'kubernetes',
    'GraphQL': 'graphql',
    'Prisma': 'prisma',
    'Tailwind CSS': 'tailwindcss',
    'Express': 'express',
    'Supabase': 'supabase',
    'Supabase PostgreSQL': 'supabase',
    'Vercel': 'vercel_dark',
    'Clerk': 'clerk-icon-dark',
    'GitHub OAuth': 'github',
    'Google OAuth': 'google',
    'OpenAI': 'openai_dark',
    'Anthropic': 'anthropic_black',
    'Stripe': 'stripe',
    'Resend': 'resend-icon-black',
    'Sentry': 'sentry',
    'Datadog': 'datadog',
    'Grafana': 'grafana',
    'Prometheus': 'prometheus',
    'FastAPI': 'fastapi',
    'Metamask': 'metamask',
    'Fastify': 'fastify',
  };

  if (manualMappings[key]) {
    const slug = manualMappings[key];
    const exists = svglFiles.some(f => path.basename(f.path, '.svg') === slug);
    if (exists) return slug;
  }

  // Automatic search
  const candidates = svglFiles.filter(f => {
    const filename = path.basename(f.path, '.svg');
    return clean(filename) === cleanKey || 
           clean(filename) === `${cleanKey}dark` || 
           clean(filename) === `${cleanKey}icon` ||
           clean(filename) === `${cleanKey}icondark`;
  });

  if (candidates.length === 0) return null;

  // Prefer exact clean match
  const exact = candidates.find(c => clean(path.basename(c.path, '.svg')) === cleanKey);
  if (exact) return path.basename(exact.path, '.svg');

  return path.basename(candidates[0].path, '.svg');
}

async function testUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'GET' });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function run() {
  console.log('Searching and migrating eligible technical icons to premium SVGL equivalents...');
  
  const registryPath = path.join(__dirname, '../lib/icon-registry.ts');
  let content = fs.readFileSync(registryPath, 'utf8');

  // Parse keys in ICON_REGISTRY
  // Format: 'Next.js': { source: 'devicon', slug: 'nextjs' }
  const regex = /'([^']+)':\s*\{\s*source:\s*'([^']+)',\s*slug:\s*'([^']+)'(?:,\s*variant:\s*'([^']+)')?\s*\},?/g;
  let match;
  const matches: { key: string; source: string; slug: string; variant?: string }[] = [];

  while ((match = regex.exec(content)) !== null) {
    const [, key, source, slug, variant] = match;
    matches.push({ key, source, slug, variant });
  }

  let migratedCount = 0;

  for (const m of matches) {
    // Only migrate devicon/simpleicons, don't migrate local official cloud packs
    if (m.source === 'local') continue;

    const svglSlug = findBestSvglMatch(m.key);
    if (!svglSlug) continue;

    const svglUrl = `https://svgl.app/library/${svglSlug}.svg`;
    const isValid = await testUrl(svglUrl);

    if (isValid) {
      console.log(`\x1b[32m✓\x1b[0m Migrating ${m.key} ➔ SVGL: ${svglSlug} (${svglUrl})`);
      
      // Replace in the file content
      const entryRegex = new RegExp(`'${m.key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}':\\s*\\{[^\\}]*\\},?`, 'g');
      const replacement = `'${m.key}': { source: 'svgl', slug: '${svglSlug}' },`;
      content = content.replace(entryRegex, replacement);
      migratedCount++;
    }
  }

  // Also support adding MetaMask and FastAPI explicitly if they aren't in the registry
  const extraTech = [
    { key: 'MetaMask', slug: 'metamask' },
    { key: 'FastAPI', slug: 'fastapi' }
  ];

  for (const tech of extraTech) {
    if (!content.includes(`'${tech.key}':`)) {
      const svglUrl = `https://svgl.app/library/${tech.slug}.svg`;
      const isValid = await testUrl(svglUrl);
      if (isValid) {
        // Insert after first comment or section
        content = content.replace(
          `// Dev tools (devicon CDN)`,
          `// Dev tools (devicon CDN)\n  '${tech.key}': { source: 'svgl', slug: '${tech.slug}' },`
        );
        console.log(`\x1b[32m✓\x1b[0m Added extra premium tech: ${tech.key} ➔ SVGL: ${tech.slug} (${svglUrl})`);
      }
    }
  }

  fs.writeFileSync(registryPath, content, 'utf8');
  console.log(`\nMigration completed! Migrated ${migratedCount} tech stack icons to premium SVGL SVGs.`);
}

run();
