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

// Load SVGL index
const svglData: TreeData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'svgl-tree-data.json'), 'utf8')
);
const svglFiles = svglData.tree.filter(e => 
  e.path.startsWith('static/library/') && e.path.endsWith('.svg')
);

// Load selfhst index
const selfhstData: TreeData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'selfhst-tree-data.json'), 'utf8')
);
const selfhstFiles = selfhstData.tree.filter(e => 
  e.path.startsWith('svg/') && e.path.endsWith('.svg')
);

// Helper to normalize strings for comparison
function clean(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const BRAINSTORMED_TECH = [
  // Languages
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

  // Frameworks & UI Runtimes
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

  // Styling & Components
  { name: 'Sass', terms: ['sass'] },
  { name: 'Bootstrap', terms: ['bootstrap'] },
  { name: 'Framer Motion', terms: ['framer'] },

  // Databases, Vector Stores & Caching
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

  // Messaging & Queues
  { name: 'RabbitMQ', terms: ['rabbitmq'] },
  { name: 'ActiveMQ', terms: ['activemq'] },
  { name: 'BullMQ', terms: ['bullmq'] },
  { name: 'Celery', terms: ['celery'] },
  { name: 'NATS', terms: ['nats'] },

  // DevOps & Cloud Platform CDNs
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

  // API Protocols, Gateways & Proxies
  { name: 'gRPC', terms: ['grpc'] },
  { name: 'WebSockets', terms: ['websocket', 'websockets'] },
  { name: 'Kong', terms: ['kong'] },
  { name: 'Traefik', terms: ['traefik'] },
  { name: 'Envoy', terms: ['envoy'] },
  { name: 'HAProxy', terms: ['haproxy'] },
  { name: 'OpenTelemetry', terms: ['opentelemetry', 'otel'] },
  { name: 'Jaeger', terms: ['jaeger'] },
  { name: 'Caddy', terms: ['caddy'] },

  // Auth, Security & Secrets
  { name: 'Better Auth', terms: ['betterauth', 'better-auth'] },
  { name: 'Kinde', terms: ['kinde'] },
  { name: 'Keycloak', terms: ['keycloak'] },
  { name: 'SuperTokens', terms: ['supertokens'] },
  { name: 'Firebase Auth', terms: ['firebase'] },
  { name: 'Okta', terms: ['okta'] },
  { name: 'Bitwarden', terms: ['bitwarden'] },
  { name: 'Authentik', terms: ['authentik'] },
  { name: 'Teleport', terms: ['teleport'] },

  // AI, ML & Vector Frameworks
  { name: 'LangChain', terms: ['langchain'] },
  { name: 'LlamaIndex', terms: ['llamaindex'] },
  { name: 'Hugging Face', terms: ['huggingface'] },
  { name: 'PyTorch', terms: ['pytorch'] },
  { name: 'Ollama', terms: ['ollama'] },
  { name: 'Cohere', terms: ['cohere'] },
  { name: 'Replicate', terms: ['replicate'] },

  // SaaS, Collaboration & Integrations
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
  { name: 'Mongoose', terms: ['mongoose'] },

  // 11. New Selfhosted Core Stacks
  { name: 'Authelia', terms: ['authelia'] },
  { name: 'MinIO', terms: ['minio'] },
  { name: 'Plausible', terms: ['plausible'] },
  { name: 'Umami', terms: ['umami'] },
  { name: 'Uptime Kuma', terms: ['uptime-kuma'] },
  { name: 'Nextcloud', terms: ['nextcloud'] },
  { name: 'Syncthing', terms: ['syncthing'] },
  { name: 'Dex Auth', terms: ['dex-auth'] },
  { name: 'AdGuard Home', terms: ['adguard-home'] },
  { name: 'Directus', terms: ['directus'] },
  { name: 'Ghostty', terms: ['ghostty'] },
  { name: 'Gitea', terms: ['gitea'] },
  { name: 'Home Assistant', terms: ['home-assistant'] },
  { name: 'Jellyfin', terms: ['jellyfin'] },
  { name: 'Nginx Proxy Manager', terms: ['nginx-proxy-manager'] },
  { name: 'Strapi', terms: ['strapi'] },
  { name: 'Vaultwarden', terms: ['vaultwarden'] },
  { name: 'WordPress', terms: ['wordpress'] },
  { name: 'Appwrite', terms: ['appwrite'] },
  { name: 'Baserow', terms: ['baserow'] },
  { name: 'Flowise', terms: ['flowise'] },
  { name: 'Metabase', terms: ['metabase'] },
  { name: 'n8n', terms: ['n8n'] },
  { name: 'NocoDB', terms: ['nocodb'] },
  { name: 'Open WebUI', terms: ['open-webui'] },
  { name: 'PocketBase', terms: ['pocketbase'] },

  // 12. Linters, Formatters, Bundlers & Testing
  { name: 'Prettier', terms: ['prettier'] },
  { name: 'ESLint', terms: ['eslint'] },
  { name: 'Vitest', terms: ['vitest'] },
  { name: 'Playwright', terms: ['playwright'] },
  { name: 'Cypress', terms: ['cypress'] },
  { name: 'Puppeteer', terms: ['puppeteer'] },
  { name: 'Webpack', terms: ['webpack'] },
  { name: 'Rollup', terms: ['rollup'] },
  { name: 'Babel', terms: ['babel'] },
  { name: 'PostCSS', terms: ['postcss'] },

  // 13. Component Libraries & Design systems
  { name: 'Radix UI', terms: ['radix-ui', 'radix'] },
  { name: 'Chakra UI', terms: ['chakra-ui', 'chakra'] },
  { name: 'Shadcn UI', terms: ['shadcn-ui', 'shadcn'] },
  { name: 'Mantine', terms: ['mantine'] },
  { name: 'Material UI', terms: ['materialui', 'mui'] },

  // 14. CMS & Generators
  { name: 'Webflow', terms: ['webflow'] },
  { name: 'Gatsby', terms: ['gatsby'] },
  { name: 'Hugo', terms: ['hugo'] },
  { name: 'Jekyll', terms: ['jekyll'] },
  { name: 'Eleventy', terms: ['eleventy', '11ty'] },
  { name: 'Nuxt.js', terms: ['nuxt'] },

  // 15. Scanners, DBs & Protocols
  { name: 'Presto', terms: ['presto'] },
  { name: 'Trino', terms: ['trino'] },
  { name: 'ScyllaDB', terms: ['scylladb'] },
  { name: 'ArangoDB', terms: ['arangodb'] },
  { name: 'MQTT', terms: ['mqtt'] },
  { name: 'ZeroMQ', terms: ['zeromq'] },
  { name: 'Crystal', terms: ['crystal'] },
  { name: 'Nim', terms: ['nim'] },
  { name: 'Perl', terms: ['perl'] },
  { name: 'F#', terms: ['fsharp'] },

  // 16. SaaS Platforms
  { name: 'Salesforce', terms: ['salesforce'] },
  { name: 'HubSpot', terms: ['hubspot'] },
  { name: 'Zendesk', terms: ['zendesk'] },
  { name: 'Intercom', terms: ['intercom'] },
  { name: 'Mixpanel', terms: ['mixpanel'] },
  { name: 'Amplitude', terms: ['amplitude'] },
  { name: 'Segment', terms: ['segment'] },
  { name: 'Hotjar', terms: ['hotjar'] },
  { name: 'Apollo GraphQL', terms: ['apollo'] },

  // 17. Edge Databases, Serverless & Knative Stacks
  { name: 'SST', terms: ['sst'] },
  { name: 'Serverless Framework', terms: ['serverless'] },
  { name: 'OpenFaaS', terms: ['openfaas'] },
  { name: 'Knative', terms: ['knative'] },
  { name: 'EdgeDB', terms: ['edgedb'] },
  { name: 'Fauna', terms: ['fauna', 'faunadb'] },

  // 18. Data Pipelines, ETL & Modern Data Lakes
  { name: 'Airbyte', terms: ['airbyte'] },
  { name: 'Fivetran', terms: ['fivetran'] },
  { name: 'dbt', terms: ['dbt'] },
  { name: 'Prefect', terms: ['prefect'] },
  { name: 'Dagster', terms: ['dagster'] },
  { name: 'Apache Airflow', terms: ['airflow', 'apacheairflow'] },
  { name: 'Debezium', terms: ['debezium'] },

  // 19. Identity, Compliance & SSO Gateways
  { name: 'WorkOS', terms: ['workos'] },
  { name: 'Kinde', terms: ['kinde'] },
  { name: 'SuperTokens', terms: ['supertokens'] },
  { name: 'Ory', terms: ['ory'] },
  { name: 'Logto', terms: ['logto'] },

  // 20. Advanced AI, Agentic & Vector Platforms
  { name: 'LlamaIndex', terms: ['llamaindex'] },
  { name: 'Pinecone', terms: ['pinecone'] },
  { name: 'Chroma', terms: ['chroma', 'chromadb'] },

  // 21. Observability, Logging APMs & Collectors
  { name: 'SigNoz', terms: ['signoz'] },
  { name: 'Logstash', terms: ['logstash'] },
  { name: 'Fluentd', terms: ['fluentd'] },
  { name: 'Fluent Bit', terms: ['fluentbit'] },
  { name: 'Graylog', terms: ['graylog'] },
  { name: 'Splunk', terms: ['splunk'] },
  { name: 'New Relic', terms: ['newrelic'] },
  { name: 'Dynatrace', terms: ['dynatrace'] },

  // 22. Service Mesh, Network Proxies & Advanced Brokers
  { name: 'Istio', terms: ['istio'] },
  { name: 'Linkerd', terms: ['linkerd'] },
  { name: 'Apache APISIX', terms: ['apisix', 'apacheapisix'] },
  { name: 'Redpanda', terms: ['redpanda'] },
  { name: 'Apache ActiveMQ', terms: ['activemq', 'apacheactivemq'] },
  { name: 'EMQX', terms: ['emqx'] },
  { name: 'HiveMQ', terms: ['hivemq'] },
  { name: 'Eclipse Mosquitto', terms: ['mosquitto', 'eclipsemosquitto'] },

  // 23. ChatOps & Enterprise Collaboration
  { name: 'Mattermost', terms: ['mattermost'] },
  { name: 'Zulip', terms: ['zulip'] },
  { name: 'Matrix', terms: ['matrix'] },
  { name: 'Microsoft Teams', terms: ['teams', 'microsoftteams'] },

  // 24. Serialization Formats & Structs
  { name: 'Protocol Buffers', terms: ['protobuf', 'protocolbuffers'] },
  { name: 'Apache Avro', terms: ['avro', 'apacheavro'] },
  { name: 'Apache Parquet', terms: ['parquet', 'apacheparquet'] }
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
    'Expo': 'expo',
    'Prettier': 'prettier-icon-dark',
    'ESLint': 'eslint-icon-dark',
    'Radix UI': 'radix-ui_dark',
    'Shadcn UI': 'shadcn-ui_dark'
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

function findBestSelfhstMatch(name: string, terms: string[]): string | null {
  for (const term of terms) {
    const cleanTerm = clean(term);
    const candidates = selfhstFiles.filter(f => {
      const filename = path.basename(f.path, '.svg');
      return clean(filename) === cleanTerm || 
             clean(filename) === `${cleanTerm}-dark` || 
             clean(filename) === `${cleanTerm}-light` || 
             clean(filename) === `${cleanTerm}icon`;
    });
    if (candidates.length > 0) {
      const exact = candidates.find(c => clean(path.basename(c.path, '.svg')) === cleanTerm);
      return exact ? path.basename(exact.path, '.svg') : path.basename(candidates[0].path, '.svg');
    }
  }
  return null;
}

interface ResolvedEntry {
  source: 'svgl' | 'devicon' | 'simpleicons' | 'selfhst';
  slug: string;
  url: string;
}

async function run() {
  console.log('Resolving and verifying all brainstormed technical stack components...');
  const results: Record<string, ResolvedEntry> = {};

  const registryPath = path.join(__dirname, '../lib/icon-registry.ts');
  let content = fs.readFileSync(registryPath, 'utf8');

  for (const tech of BRAINSTORMED_TECH) {
    // Avoid double mapping if already in registry unless it's Traefik (where selfhst is way better)
    if (content.includes(`'${tech.name}':`) && tech.name !== 'Traefik') {
      console.log(`- ${tech.name} is already present in registry.`);
      continue;
    }

    let resolved = false;

    // Stage 1: selfhst CDN
    const selfhstSlug = findBestSelfhstMatch(tech.name, tech.terms);
    if (selfhstSlug) {
      const url = `https://cdn.jsdelivr.net/gh/selfhst/icons/svg/${selfhstSlug}.svg`;
      if (await testUrl(url)) {
        console.log(`\x1b[32m✓\x1b[0m ${tech.name} resolved via selfhst ➔ ${url}`);
        results[tech.name] = { source: 'selfhst', slug: selfhstSlug, url };
        resolved = true;
      }
    }

    // Stage 2: SVGL
    if (!resolved) {
      const svglSlug = findBestSvglMatch(tech.name, tech.terms);
      if (svglSlug) {
        const url = `https://svgl.app/library/${svglSlug}.svg`;
        if (await testUrl(url)) {
          console.log(`\x1b[32m✓\x1b[0m ${tech.name} resolved via SVGL ➔ ${url}`);
          results[tech.name] = { source: 'svgl', slug: svglSlug, url };
          resolved = true;
        }
      }
    }

    // Stage 3: Devicons
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

    // Stage 4: Simple Icons
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
    // If Traefik is already in registry, remove its old line to prevent duplicate keys
    if (name === 'Traefik') {
      content = content.replace(/  'Traefik': \{.*\},\n/g, '');
    }
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
