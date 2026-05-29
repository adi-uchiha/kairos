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

// Helper to normalize strings for comparison
function clean(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const BRAINSTORMED_TECH = [
  // 1. Languages (Original + Additions)
  { name: 'Zig', terms: ['zig'] },
  { name: 'Elixir', terms: ['elixir'] },
  { name: 'Clojure', terms: ['clojure'] },
  { name: 'Haskell', terms: ['haskell'] },
  { name: 'Scala', terms: ['scala'] },
  { name: 'Kotlin', terms: ['kotlin'] },
  { name: 'Swift', terms: ['swift'] },
  { name: 'PHP', terms: ['php'] },
  { name: 'Ruby', terms: ['ruby'] },
  { name: 'C++', terms: ['cplusplus', 'cpp'] },
  { name: 'C#', terms: ['csharp'] },
  { name: 'Java', terms: ['java'] },
  { name: 'Dart', terms: ['dart'] },
  { name: 'Lua', terms: ['lua'] },
  { name: 'Julia', terms: ['julia'] },
  { name: 'Git', terms: ['git'] },

  // 2. Frameworks & UI Runtimes
  { name: 'Astro', terms: ['astro'] },
  { name: 'SolidJS', terms: ['solidjs', 'solid'] },
  { name: 'Remix', terms: ['remix'] },
  { name: 'Qwik', terms: ['qwik'] },
  { name: 'Angular', terms: ['angular'] },
  { name: 'Laravel', terms: ['laravel'] },
  { name: 'Spring Boot', terms: ['springboot', 'spring'] },
  { name: 'NestJS', terms: ['nestjs'] },
  { name: 'Ruby on Rails', terms: ['rails', 'rubyonrails'] },
  { name: 'Flask', terms: ['flask'] },
  { name: 'Gin', terms: ['gin'] },
  { name: 'Fiber', terms: ['gofiber', 'fiber'] },
  { name: 'Phoenix', terms: ['phoenix'] },
  { name: 'Actix', terms: ['actix'] },
  { name: 'Axum', terms: ['axum'] },
  { name: 'Preact', terms: ['preact'] },
  { name: 'Lit', terms: ['lit'] },
  { name: 'React Native', terms: ['reactnative', 'react'] },
  { name: 'Flutter', terms: ['flutter'] },
  { name: 'Electron', terms: ['electron'] },
  { name: 'Tauri', terms: ['tauri'] },
  { name: 'Expo', terms: ['expo'] },

  // 3. Styling & Components
  { name: 'Sass', terms: ['sass'] },
  { name: 'Bootstrap', terms: ['bootstrap'] },
  { name: 'Framer Motion', terms: ['framer'] },

  // 4. Databases, Vector Stores & Caching
  { name: 'Cassandra', terms: ['cassandra'] },
  { name: 'CockroachDB', terms: ['cockroachdb', 'cockroachlabs'] },
  { name: 'ClickHouse', terms: ['clickhouse'] },
  { name: 'InfluxDB', terms: ['influxdb'] },
  { name: 'TimescaleDB', terms: ['timescaledb', 'timescale'] },
  { name: 'Neo4j', terms: ['neo4j'] },
  { name: 'Typesense', terms: ['typesense'] },
  { name: 'Pinecone', terms: ['pinecone'] },
  { name: 'Milvus', terms: ['milvus'] },
  { name: 'Chroma', terms: ['chromadb', 'chroma'] },
  { name: 'Qdrant', terms: ['qdrant'] },
  { name: 'Weaviate', terms: ['weaviate'] },
  { name: 'Hasura', terms: ['hasura'] },
  { name: 'SurrealDB', terms: ['surrealdb', 'surreal'] },
  { name: 'Snowflake', terms: ['snowflake'] },
  { name: 'Databricks', terms: ['databricks'] },
  { name: 'Apache Spark', terms: ['spark', 'apachespark'] },
  { name: 'OpenSearch', terms: ['opensearch'] },
  { name: 'Memcached', terms: ['memcached'] },

  // 5. Messaging & Queues
  { name: 'RabbitMQ', terms: ['rabbitmq'] },
  { name: 'ActiveMQ', terms: ['activemq'] },
  { name: 'BullMQ', terms: ['bullmq'] },
  { name: 'Celery', terms: ['celery'] },
  { name: 'NATS', terms: ['nats'] },

  // 6. DevOps & Cloud Platform CDNs
  { name: 'Ansible', terms: ['ansible'] },
  { name: 'Terraform', terms: ['terraform'] },
  { name: 'Pulumi', terms: ['pulumi'] },
  { name: 'ArgoCD', terms: ['argocd', 'argo'] },
  { name: 'Jenkins', terms: ['jenkins'] },
  { name: 'GitHub Actions', terms: ['githubactions', 'github-actions'] },
  { name: 'GitLab CI', terms: ['gitlab', 'gitlabci'] },
  { name: 'Nomad', terms: ['nomad'] },
  { name: 'Consul', terms: ['consul'] },
  { name: 'Vault', terms: ['vault'] },
  { name: 'Netlify', terms: ['netlify'] },
  { name: 'DigitalOcean', terms: ['digitalocean'] },
  { name: 'Fastly', terms: ['fastly'] },
  { name: 'Akamai', terms: ['akamai'] },
  { name: 'Linode', terms: ['linode'] },
  { name: 'GitHub', terms: ['github'] },
  { name: 'Bitbucket', terms: ['bitbucket'] },
  { name: 'Minikube', terms: ['minikube'] },
  { name: 'Rancher', terms: ['rancher'] },
  { name: 'OpenShift', terms: ['openshift', 'redhatopenshift'] },
  { name: 'Portainer', terms: ['portainer'] },

  // 7. API Protocols, Gateways & Proxies
  { name: 'gRPC', terms: ['grpc'] },
  { name: 'WebSockets', terms: ['websocket', 'websockets'] },
  { name: 'Kong', terms: ['kong'] },
  { name: 'Traefik', terms: ['traefikproxy', 'traefik'] },
  { name: 'Envoy', terms: ['envoy'] },
  { name: 'HAProxy', terms: ['haproxy'] },
  { name: 'OpenTelemetry', terms: ['opentelemetry', 'otel'] },
  { name: 'Jaeger', terms: ['jaeger'] },
  { name: 'Caddy', terms: ['caddy'] },

  // 8. Auth, Security & Secrets
  { name: 'Better Auth', terms: ['betterauth', 'better-auth'] },
  { name: 'Kinde', terms: ['kinde'] },
  { name: 'Keycloak', terms: ['keycloak'] },
  { name: 'SuperTokens', terms: ['supertokens'] },
  { name: 'Firebase Auth', terms: ['firebase'] },
  { name: 'Okta', terms: ['okta'] },
  { name: 'Bitwarden', terms: ['bitwarden'] },
  { name: 'Authentik', terms: ['authentik'] },
  { name: 'Teleport', terms: ['teleport'] },

  // 9. AI, ML & Vector Frameworks
  { name: 'LangChain', terms: ['langchain'] },
  { name: 'LlamaIndex', terms: ['llamaindex'] },
  { name: 'Hugging Face', terms: ['huggingface'] },
  { name: 'PyTorch', terms: ['pytorch'] },
  { name: 'Ollama', terms: ['ollama'] },
  { name: 'Cohere', terms: ['cohere'] },
  { name: 'Replicate', terms: ['replicate'] },

  // 10. SaaS, Collaboration & Integrations
  { name: 'Slack', terms: ['slack'] },
  { name: 'Discord', terms: ['discord'] },
  { name: 'Telegram', terms: ['telegram'] },
  { name: 'Loops', terms: ['loops'] },
  { name: 'Plaid', terms: ['plaid'] },
  { name: 'PayPal', terms: ['paypal'] },
  { name: 'Shopify', terms: ['shopify'] },
  { name: 'Mailchimp', terms: ['mailchimp'] },
  { name: 'Jira', terms: ['jira'] },
  { name: 'Notion', terms: ['notion'] },
  { name: 'Linear', terms: ['linear'] },
  { name: 'Trello', terms: ['trello'] },
  { name: 'Koa', terms: ['koa'] },
  { name: 'TypeORM', terms: ['typeorm'] },
  { name: 'Sequelize', terms: ['sequelize'] },
  { name: 'Mongoose', terms: ['mongoose'] }
];

async function testUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'GET' });
    return res.status === 200;
  } catch {
    return false;
  }
}

function findBestSvglMatch(name: string, terms: string[]): string | null {
  // Advanced Manual Overrides for Outstanding Aesthetics
  const overrides: Record<string, string> = {
    'React Native': 'react_dark',
    'Framer Motion': 'framer_dark',
    'GitHub': 'github_dark',
    'Astro': 'astro-icon-dark',
    'Remix': 'remix_dark',
    'Tauri': 'tauri',
    'Electron': 'electron',
    'Flutter': 'flutter',
    'Sass': 'sass',
    'Sequelize': 'sequelize',
    'TypeORM': 'typeorm',
    'DigitalOcean': 'digitalocean',
    'Netlify': 'netlify',
    'Notion': 'notion',
    'Linear': 'linear',
    'Trello': 'trello',
    'Bootstrap': 'bootstrap',
    'Git': 'git',
    'Expo': 'expo'
  };

  if (overrides[name]) {
    const slug = overrides[name];
    if (svglFiles.some(f => path.basename(f.path, '.svg') === slug)) {
      return slug;
    }
  }

  for (const term of terms) {
    const cleanTerm = clean(term);
    const candidates = svglFiles.filter(f => {
      const filename = path.basename(f.path, '.svg');
      return clean(filename) === cleanTerm || 
             clean(filename) === `${cleanTerm}dark` || 
             clean(filename) === `${cleanTerm}icon` ||
             clean(filename) === `${cleanTerm}icondark`;
    });
    if (candidates.length > 0) {
      const exact = candidates.find(c => clean(path.basename(c.path, '.svg')) === cleanTerm);
      return exact ? path.basename(exact.path, '.svg') : path.basename(candidates[0].path, '.svg');
    }
  }
  return null;
}

interface ResolvedEntry {
  source: 'svgl' | 'devicon' | 'simpleicons';
  slug: string;
  url: string;
}

async function run() {
  console.log('Resolving and verifying all brainstormed technical stack components...');
  const results: Record<string, ResolvedEntry> = {};

  const registryPath = path.join(__dirname, '../lib/icon-registry.ts');
  let content = fs.readFileSync(registryPath, 'utf8');

  for (const tech of BRAINSTORMED_TECH) {
    // Avoid double mapping if already in registry
    if (content.includes(`'${tech.name}':`)) {
      console.log(`- ${tech.name} is already present in registry.`);
      continue;
    }

    let resolved = false;

    // Stage 1: SVGL
    const svglSlug = findBestSvglMatch(tech.name, tech.terms);
    if (svglSlug) {
      const url = `https://svgl.app/library/${svglSlug}.svg`;
      if (await testUrl(url)) {
        console.log(`\x1b[32m✓\x1b[0m ${tech.name} resolved via SVGL ➔ ${url}`);
        results[tech.name] = { source: 'svgl', slug: svglSlug, url };
        resolved = true;
      }
    }

    // Stage 2: Devicons
    if (!resolved) {
      for (const term of tech.terms) {
        const url = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${term}/${term}-original.svg`;
        if (await testUrl(url)) {
          console.log(`\x1b[32m✓\x1b[0m ${tech.name} resolved via Devicon ➔ ${url}`);
          results[tech.name] = { source: 'devicon', slug: term, url };
          resolved = true;
          break;
        }
      }
    }

    // Stage 3: Simple Icons
    if (!resolved) {
      for (const term of tech.terms) {
        const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${term}.svg`;
        if (await testUrl(url)) {
          console.log(`\x1b[32m✓\x1b[0m ${tech.name} resolved via Simple Icons ➔ ${url}`);
          results[tech.name] = { source: 'simpleicons', slug: term, url };
          resolved = true;
          break;
        }
      }
    }

    if (!resolved) {
      console.log(`\x1b[31m✗\x1b[0m ${tech.name} could not be resolved or verified online.`);
    }
  }

  // Inject resolved entries into the registry
  let insertText = '';
  for (const [name, entry] of Object.entries(results)) {
    insertText += `  '${name}': { source: '${entry.source}', slug: '${entry.slug}' },\n`;
  }

  if (insertText) {
    content = content.replace(
      `// Dev tools (devicon CDN)`,
      `// Dev tools (devicon CDN)\n${insertText}`
    );
    fs.writeFileSync(registryPath, content, 'utf8');
    console.log(`\nSuccessfully registered ${Object.keys(results).length} new technical stack components in lib/icon-registry.ts!`);
  } else {
    console.log('\nNo new technical stack components to register.');
  }
}

run();
