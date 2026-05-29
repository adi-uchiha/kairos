type IconSource = 'devicon' | 'simpleicons' | 'local' | 'svgl';

interface IconEntry {
  source: IconSource;
  slug: string;
  variant?: string;
}

export const ICON_REGISTRY: Record<string, IconEntry> = {
  // Dev tools (devicon CDN)
  'FastAPI': { source: 'svgl', slug: 'fastapi' },
  'MetaMask': { source: 'svgl', slug: 'metamask' },
  'Next.js': { source: 'svgl', slug: 'nextjs_icon_dark' },
  'React': { source: 'svgl', slug: 'react_dark' },
  'Vue': { source: 'svgl', slug: 'vue' },
  'Svelte': { source: 'svgl', slug: 'svelte' },
  'Bun': { source: 'svgl', slug: 'bun' },
  'Node.js': { source: 'svgl', slug: 'nodejs' },
  'Deno': { source: 'svgl', slug: 'deno' },
  'Go': { source: 'devicon', slug: 'go' },
  'Rust': { source: 'svgl', slug: 'rust' },
  'Python': { source: 'svgl', slug: 'python' },
  'TypeScript': { source: 'svgl', slug: 'typescript' },
  'JavaScript': { source: 'svgl', slug: 'javascript' },
  'PostgreSQL': { source: 'svgl', slug: 'postgresql' },
  'MySQL': { source: 'svgl', slug: 'mysql-icon-dark' },
  'MongoDB': { source: 'svgl', slug: 'mongodb-icon-dark' },
  'Redis': { source: 'svgl', slug: 'redis' },
  'SQLite': { source: 'svgl', slug: 'sqlite' },
  'Docker': { source: 'svgl', slug: 'docker' },
  'Kubernetes': { source: 'svgl', slug: 'kubernetes' },
  'Nginx': { source: 'svgl', slug: 'nginx' },
  'GraphQL': { source: 'svgl', slug: 'graphql' },
  'Prisma': { source: 'svgl', slug: 'prisma' },
  'Vite': { source: 'svgl', slug: 'vite' },
  'Tailwind CSS': { source: 'svgl', slug: 'tailwindcss' },
  'Hono': { source: 'svgl', slug: 'hono' },
  'Fastify': { source: 'svgl', slug: 'fastify' },
  'Express': { source: 'devicon', slug: 'express' },
  'Kafka': { source: 'devicon', slug: 'apachekafka' },
  'Elasticsearch': { source: 'devicon', slug: 'elasticsearch' },

  // Simple Icons
  'Elysia': { source: 'devicon', slug: 'bun' },
  'tRPC': { source: 'svgl', slug: 'trpc' },
  'Zod': { source: 'svgl', slug: 'zod' },
  'Drizzle': { source: 'simpleicons', slug: 'drizzle' },
  'Vercel': { source: 'svgl', slug: 'vercel_dark' },
  'Cloudflare': { source: 'svgl', slug: 'cloudflare' },
  'Cloudflare Workers': { source: 'svgl', slug: 'cloudflare-workers' },
  'Cloudflare R2': { source: 'simpleicons', slug: 'cloudflare' },
  'Cloudflare CDN': { source: 'simpleicons', slug: 'cloudflare' },
  'Neon': { source: 'svgl', slug: 'neon' },
  'PlanetScale': { source: 'svgl', slug: 'planetscale' },
  'Supabase': { source: 'svgl', slug: 'supabase' },
  'Supabase PostgreSQL': { source: 'svgl', slug: 'supabase' },
  'Turso': { source: 'svgl', slug: 'turso-dark' },
  'Upstash': { source: 'svgl', slug: 'upstash' },
  'Stripe': { source: 'svgl', slug: 'stripe' },
  'Resend': { source: 'svgl', slug: 'resend-icon-black' },
  'Mailgun': { source: 'simpleicons', slug: 'mailgun' },
  'SendGrid': { source: 'simpleicons', slug: 'twilio' },
  'Twilio': { source: 'svgl', slug: 'twilio' },
  'GitHub OAuth': { source: 'simpleicons', slug: 'github' },
  'Google OAuth': { source: 'svgl', slug: 'google' },
  'Clerk': { source: 'svgl', slug: 'clerk-icon-dark' },
  'Auth0': { source: 'svgl', slug: 'auth0' },
  'PostHog': { source: 'svgl', slug: 'posthog' },
  'Sentry': { source: 'svgl', slug: 'sentry' },
  'Datadog': { source: 'svgl', slug: 'datadog' },
  'Grafana': { source: 'svgl', slug: 'grafana' },
  'Prometheus': { source: 'simpleicons', slug: 'prometheus' },
  'Railway': { source: 'svgl', slug: 'railway' },
  'Fly.io': { source: 'simpleicons', slug: 'flydotio' },
  'Render': { source: 'simpleicons', slug: 'render' },
  'Heroku': { source: 'svgl', slug: 'heroku' },
  'Algolia': { source: 'svgl', slug: 'algolia' },
  'OpenAI': { source: 'svgl', slug: 'openai_dark' },
  'Anthropic': { source: 'svgl', slug: 'anthropic_black' },
  'Meilisearch': { source: 'simpleicons', slug: 'meilisearch' },
  'Django': { source: 'svgl', slug: 'django' },
  'postgres': { source: 'svgl', slug: 'postgresql' },
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
    case 'svgl':
      return `https://svgl.app/library/${entry.slug}.svg`;
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
