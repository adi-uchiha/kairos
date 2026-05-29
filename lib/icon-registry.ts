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
  'AWS S3': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Storage/64/Amazon-Simple-Storage-Service.svg' },

  // AWS Services
  'AWS Lambda': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Compute/64/AWS-Lambda.svg' },
  'Amazon S3': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Storage/64/Amazon-Simple-Storage-Service.svg' },
  'Amazon RDS': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Database/64/Amazon-RDS.svg' },
  'Amazon DynamoDB': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Database/64/Amazon-DynamoDB.svg' },
  'Amazon SQS': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/App-Integration/64/Amazon-Simple-Queue-Service.svg' },
  'Amazon SES': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Business-Applications/64/Amazon-Simple-Email-Service.svg' },
  'Amazon EC2': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Compute/64/Amazon-EC2.svg' },
  'Amazon ECS': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Containers/64/Amazon-Elastic-Container-Service.svg' },
  'Amazon EKS': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Containers/64/Amazon-Elastic-Kubernetes-Service.svg' },
  'Amazon CloudFront': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Networking-Content-Delivery/64/Amazon-CloudFront.svg' },
  'Amazon API Gateway': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/App-Integration/64/Amazon-API-Gateway.svg' },
  'Amazon Cognito': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Security-Identity-Compliance/64/Amazon-Cognito.svg' },
  'Amazon Route 53': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Networking-Content-Delivery/64/Amazon-Route-53.svg' },
  'Amazon ElastiCache': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Database/64/Amazon-ElastiCache.svg' },
  'Amazon EventBridge': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/App-Integration/64/Amazon-EventBridge.svg' },
  'Amazon SNS': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/App-Integration/64/Amazon-Simple-Notification-Service.svg' },
  'Amazon Kinesis': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Analytics/64/Amazon-Kinesis.svg' },
  'AWS Step Functions': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/App-Integration/64/AWS-Step-Functions.svg' },
  'AWS Fargate': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Containers/64/AWS-Fargate.svg' },
  'Amazon Aurora': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Database/64/Amazon-Aurora.svg' },
  'AWS Secrets Manager': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Security-Identity-Compliance/64/AWS-Secrets-Manager.svg' },
  'AWS WAF': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Security-Identity-Compliance/64/AWS-WAF.svg' },
  'Amazon VPC': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Networking-Content-Delivery/64/Amazon-Virtual-Private-Cloud.svg' },
  'AWS IAM': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Security-Identity-Compliance/64/AWS-Identity-and-Access-Management.svg' },
  'Amazon CloudWatch': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Management-Governance/64/Amazon-CloudWatch.svg' },
  'Amazon Athena': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Analytics/64/Amazon-Athena.svg' },
  'Amazon Redshift': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/aws/service/Analytics/64/Amazon-Redshift.svg' },
  'Amazon Bedrock': { source: 'local', slug: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonwebservices.svg' },

  // GCP Services
  'GCP Cloud Run': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/cloud_run/cloud_run.svg' },
  'GCP Cloud Functions': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/cloud_functions/cloud_functions.svg' },
  'GCP BigQuery': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/bigquery/bigquery.svg' },
  'GCP Pub/Sub': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/pubsub/pubsub.svg' },
  'GCP Cloud Storage': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/cloud_storage/cloud_storage.svg' },
  'GCP Firebase': { source: 'local', slug: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/firebase.svg' },
  'GCP Firestore': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/firestore/firestore.svg' },
  'GCP Cloud SQL': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/cloud_sql/cloud_sql.svg' },
  'GCP Vertex AI': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/vertexai/vertexai.svg' },
  'GCP GKE': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/google_kubernetes_engine/google_kubernetes_engine.svg' },
  'GCP Cloud Armor': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/cloud_armor/cloud_armor.svg' },
  'GCP Load Balancer': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/cloud_load_balancing/cloud_load_balancing.svg' },
  'GCP Memorystore': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/memorystore/memorystore.svg' },
  'GCP Spanner': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/cloud_spanner/cloud_spanner.svg' },
  'GCP Secret Manager': { source: 'local', slug: 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main/gcp/secret_manager/secret_manager.svg' },
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
