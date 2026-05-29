type IconSource = 'devicon' | 'simpleicons' | 'local';

interface IconEntry {
  source: IconSource;
  slug: string;
  variant?: string;
}

export const ICON_REGISTRY: Record<string, IconEntry> = {
  // Dev tools (devicon CDN)
  'Next.js': { source: 'devicon', slug: 'nextjs' },
  'React': { source: 'devicon', slug: 'react' },
  'Vue': { source: 'devicon', slug: 'vuejs' },
  'Svelte': { source: 'devicon', slug: 'svelte' },
  'Bun': { source: 'devicon', slug: 'bun' },
  'Node.js': { source: 'devicon', slug: 'nodejs' },
  'Deno': { source: 'devicon', slug: 'denojs' },
  'Go': { source: 'devicon', slug: 'go' },
  'Rust': { source: 'devicon', slug: 'rust' },
  'Python': { source: 'devicon', slug: 'python' },
  'TypeScript': { source: 'devicon', slug: 'typescript' },
  'JavaScript': { source: 'devicon', slug: 'javascript' },
  'PostgreSQL': { source: 'devicon', slug: 'postgresql' },
  'MySQL': { source: 'devicon', slug: 'mysql' },
  'MongoDB': { source: 'devicon', slug: 'mongodb' },
  'Redis': { source: 'devicon', slug: 'redis' },
  'SQLite': { source: 'devicon', slug: 'sqlite' },
  'Docker': { source: 'devicon', slug: 'docker' },
  'Kubernetes': { source: 'devicon', slug: 'kubernetes' },
  'Nginx': { source: 'devicon', slug: 'nginx' },
  'GraphQL': { source: 'devicon', slug: 'graphql', variant: 'plain' },
  'Prisma': { source: 'devicon', slug: 'prisma' },
  'Vite': { source: 'devicon', slug: 'vitejs' },
  'Tailwind CSS': { source: 'devicon', slug: 'tailwindcss' },
  'Hono': { source: 'simpleicons', slug: 'hono' },
  'Fastify': { source: 'devicon', slug: 'fastify' },
  'Express': { source: 'devicon', slug: 'express' },
  'Kafka': { source: 'devicon', slug: 'apachekafka' },
  'Elasticsearch': { source: 'devicon', slug: 'elasticsearch' },

  // Simple Icons
  'Elysia': { source: 'devicon', slug: 'bun' },
  'tRPC': { source: 'simpleicons', slug: 'trpc' },
  'Zod': { source: 'simpleicons', slug: 'zod' },
  'Drizzle': { source: 'simpleicons', slug: 'drizzle' },
  'Vercel': { source: 'simpleicons', slug: 'vercel' },
  'Cloudflare': { source: 'simpleicons', slug: 'cloudflare' },
  'Cloudflare Workers': { source: 'simpleicons', slug: 'cloudflare' },
  'Cloudflare R2': { source: 'simpleicons', slug: 'cloudflare' },
  'Cloudflare CDN': { source: 'simpleicons', slug: 'cloudflare' },
  'Neon': { source: 'simpleicons', slug: 'neon' },
  'PlanetScale': { source: 'simpleicons', slug: 'planetscale' },
  'Supabase': { source: 'simpleicons', slug: 'supabase' },
  'Supabase PostgreSQL': { source: 'simpleicons', slug: 'supabase' },
  'Turso': { source: 'simpleicons', slug: 'turso' },
  'Upstash': { source: 'simpleicons', slug: 'upstash' },
  'Stripe': { source: 'simpleicons', slug: 'stripe' },
  'Resend': { source: 'simpleicons', slug: 'resend' },
  'Mailgun': { source: 'simpleicons', slug: 'mailgun' },
  'SendGrid': { source: 'simpleicons', slug: 'twilio' },
  'Twilio': { source: 'simpleicons', slug: 'twilio' },
  'GitHub OAuth': { source: 'simpleicons', slug: 'github' },
  'Google OAuth': { source: 'simpleicons', slug: 'google' },
  'Clerk': { source: 'simpleicons', slug: 'clerk' },
  'Auth0': { source: 'simpleicons', slug: 'auth0' },
  'PostHog': { source: 'simpleicons', slug: 'posthog' },
  'Sentry': { source: 'simpleicons', slug: 'sentry' },
  'Datadog': { source: 'simpleicons', slug: 'datadog' },
  'Grafana': { source: 'simpleicons', slug: 'grafana' },
  'Prometheus': { source: 'simpleicons', slug: 'prometheus' },
  'Railway': { source: 'simpleicons', slug: 'railway' },
  'Fly.io': { source: 'simpleicons', slug: 'flydotio' },
  'Render': { source: 'simpleicons', slug: 'render' },
  'Heroku': { source: 'simpleicons', slug: 'heroku' },
  'Algolia': { source: 'simpleicons', slug: 'algolia' },
  'OpenAI': { source: 'simpleicons', slug: 'openai' },
  'Anthropic': { source: 'simpleicons', slug: 'anthropic' },
  'Meilisearch': { source: 'simpleicons', slug: 'meilisearch' },
  'Django': { source: 'devicon', slug: 'django' },
  'postgres': { source: 'devicon', slug: 'postgresql' },
  'AI Service (Python)': { source: 'devicon', slug: 'python' },
  'AWS S3': { source: 'simpleicons', slug: 'amazons3' },

  // AWS Services
  'AWS Lambda': { source: 'simpleicons', slug: 'awslambda' },
  'Amazon S3': { source: 'simpleicons', slug: 'amazons3' },
  'Amazon RDS': { source: 'simpleicons', slug: 'amazonrds' },
  'Amazon DynamoDB': { source: 'simpleicons', slug: 'amazondynamodb' },
  'Amazon SQS': { source: 'simpleicons', slug: 'amazonsqs' },
  'Amazon SES': { source: 'simpleicons', slug: 'amazonsimpleemailservice' },
  'Amazon EC2': { source: 'simpleicons', slug: 'amazonec2' },
  'Amazon ECS': { source: 'simpleicons', slug: 'amazonecs' },
  'Amazon EKS': { source: 'simpleicons', slug: 'amazoneks' },
  'Amazon CloudFront': { source: 'simpleicons', slug: 'amazonwebservices' },
  'Amazon API Gateway': { source: 'simpleicons', slug: 'amazonapigateway' },
  'Amazon Cognito': { source: 'simpleicons', slug: 'amazoncognito' },
  'Amazon Route 53': { source: 'simpleicons', slug: 'amazonroute53' },
  'Amazon ElastiCache': { source: 'devicon', slug: 'redis' },
  'Amazon EventBridge': { source: 'simpleicons', slug: 'amazonwebservices' },
  'Amazon SNS': { source: 'simpleicons', slug: 'amazonwebservices' },
  'Amazon Kinesis': { source: 'simpleicons', slug: 'amazonwebservices' },
  'AWS Step Functions': { source: 'simpleicons', slug: 'awslambda' },
  'AWS Fargate': { source: 'simpleicons', slug: 'amazonecs' },
  'Amazon Aurora': { source: 'simpleicons', slug: 'amazonrds' },
  'AWS Secrets Manager': { source: 'simpleicons', slug: 'amazonwebservices' },
  'AWS WAF': { source: 'simpleicons', slug: 'amazonwebservices' },
  'Amazon VPC': { source: 'simpleicons', slug: 'amazonwebservices' },
  'AWS IAM': { source: 'simpleicons', slug: 'amazonwebservices' },
  'Amazon CloudWatch': { source: 'simpleicons', slug: 'amazoncloudwatch' },
  'Amazon Athena': { source: 'simpleicons', slug: 'amazonwebservices' },
  'Amazon Redshift': { source: 'simpleicons', slug: 'amazonredshift' },
  'Amazon Bedrock': { source: 'simpleicons', slug: 'amazonwebservices' },

  // GCP Services
  'GCP Cloud Run': { source: 'simpleicons', slug: 'googlecloud' },
  'GCP Cloud Functions': { source: 'simpleicons', slug: 'googlecloud' },
  'GCP BigQuery': { source: 'simpleicons', slug: 'googlecloud' },
  'GCP Pub/Sub': { source: 'simpleicons', slug: 'googlecloud' },
  'GCP Cloud Storage': { source: 'simpleicons', slug: 'googlecloud' },
  'GCP Firebase': { source: 'simpleicons', slug: 'firebase' },
  'GCP Firestore': { source: 'simpleicons', slug: 'firebase' },
  'GCP Cloud SQL': { source: 'simpleicons', slug: 'googlecloud' },
  'GCP Vertex AI': { source: 'simpleicons', slug: 'googlecloud' },
  'GCP GKE': { source: 'simpleicons', slug: 'kubernetes' },
  'GCP Cloud Armor': { source: 'simpleicons', slug: 'googlecloud' },
  'GCP Load Balancer': { source: 'simpleicons', slug: 'googlecloud' },
  'GCP Memorystore': { source: 'devicon', slug: 'redis' },
  'GCP Spanner': { source: 'simpleicons', slug: 'googlecloud' },
  'GCP Secret Manager': { source: 'simpleicons', slug: 'googlecloud' }
};

const DEVICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

function buildIconUrl(entry: IconEntry): string {
  switch (entry.source) {
    case 'devicon':
      const variant = entry.variant ?? 'original';
      return `${DEVICON_BASE}/${entry.slug}/${entry.slug}-${variant}.svg`;
    case 'simpleicons':
      return `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${entry.slug}.svg`;
    case 'local':
      return entry.slug; // static public path
  }
}

function normalize(label: string): string {
  return label.toLowerCase().replace(/[\s.\-_]/g, '');
}

const LOOKUP = new Map<string, IconEntry>();
for (const [key, entry] of Object.entries(ICON_REGISTRY)) {
  LOOKUP.set(normalize(key), entry);
}

export function getIconUrl(label: string): string | null {
  const entry = LOOKUP.get(normalize(label));
  return entry ? buildIconUrl(entry) : null;
}
