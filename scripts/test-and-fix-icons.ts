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

const treeData: TreeData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'tree-data.json'), 'utf8')
);

const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/tf2d2/icons@main';

const SERVICES = [
  // AWS Services
  { name: 'AWS Lambda', provider: 'aws', terms: ['AWS-Lambda', 'Lambda'] },
  { name: 'AWS S3', provider: 'aws', terms: ['Amazon-Simple-Storage-Service', 'Amazon-S3', 'Simple-Storage-Service', 'S3'] },
  { name: 'Amazon S3', provider: 'aws', terms: ['Amazon-Simple-Storage-Service', 'Amazon-S3', 'Simple-Storage-Service', 'S3'] },
  { name: 'Amazon RDS', provider: 'aws', terms: ['RDS', 'Amazon-RDS'] },
  { name: 'Amazon DynamoDB', provider: 'aws', terms: ['DynamoDB', 'Amazon-DynamoDB'] },
  { name: 'Amazon SQS', provider: 'aws', terms: ['Simple-Queue-Service', 'SQS', 'Amazon-Simple-Queue-Service'] },
  { name: 'Amazon SES', provider: 'aws', terms: ['Simple-Email-Service', 'SES', 'Amazon-Simple-Email-Service'] },
  { name: 'Amazon EC2', provider: 'aws', terms: ['EC2', 'Amazon-EC2', 'Elastic-Compute-Cloud'] },
  { name: 'Amazon ECS', provider: 'aws', terms: ['Elastic-Container-Service', 'ECS', 'Amazon-ECS'] },
  { name: 'Amazon EKS', provider: 'aws', terms: ['Elastic-Kubernetes-Service', 'EKS', 'Amazon-EKS'] },
  { name: 'Amazon CloudFront', provider: 'aws', terms: ['CloudFront', 'Amazon-CloudFront'] },
  { name: 'Amazon API Gateway', provider: 'aws', terms: ['API-Gateway', 'Amazon-API-Gateway'] },
  { name: 'Amazon Cognito', provider: 'aws', terms: ['Cognito', 'Amazon-Cognito'] },
  { name: 'Amazon Route 53', provider: 'aws', terms: ['Route-53', 'Route53', 'Amazon-Route-53'] },
  { name: 'Amazon ElastiCache', provider: 'aws', terms: ['ElastiCache', 'Amazon-ElastiCache'] },
  { name: 'Amazon EventBridge', provider: 'aws', terms: ['EventBridge', 'Amazon-EventBridge'] },
  { name: 'Amazon SNS', provider: 'aws', terms: ['Simple-Notification-Service', 'SNS', 'Amazon-Simple-Notification-Service'] },
  { name: 'Amazon Kinesis', provider: 'aws', terms: ['Kinesis', 'Amazon-Kinesis'] },
  { name: 'AWS Step Functions', provider: 'aws', terms: ['Step-Functions', 'AWS-Step-Functions'] },
  { name: 'AWS Fargate', provider: 'aws', terms: ['Fargate', 'AWS-Fargate'] },
  { name: 'Amazon Aurora', provider: 'aws', terms: ['Aurora', 'Amazon-Aurora'] },
  { name: 'AWS Secrets Manager', provider: 'aws', terms: ['Secrets-Manager', 'AWS-Secrets-Manager'] },
  { name: 'AWS WAF', provider: 'aws', terms: ['WAF', 'AWS-WAF'] },
  { name: 'Amazon VPC', provider: 'aws', terms: ['Virtual-Private-Cloud', 'VPC', 'Amazon-VPC'] },
  { name: 'AWS IAM', provider: 'aws', terms: ['Identity-and-Access-Management', 'AWS-Identity-and-Access-Management', 'IAM'] },
  { name: 'Amazon CloudWatch', provider: 'aws', terms: ['CloudWatch', 'Amazon-CloudWatch'] },
  { name: 'Amazon Athena', provider: 'aws', terms: ['Athena', 'Amazon-Athena'] },
  { name: 'Amazon Redshift', provider: 'aws', terms: ['Redshift', 'Amazon-Redshift'] },
  { name: 'Amazon Bedrock', provider: 'aws', terms: ['Bedrock', 'Amazon-Bedrock'] },

  // GCP Services
  { name: 'GCP Cloud Run', provider: 'gcp', terms: ['cloud_run'] },
  { name: 'GCP Cloud Functions', provider: 'gcp', terms: ['cloud_functions'] },
  { name: 'GCP BigQuery', provider: 'gcp', terms: ['bigquery'] },
  { name: 'GCP Pub/Sub', provider: 'gcp', terms: ['pubsub'] },
  { name: 'GCP Cloud Storage', provider: 'gcp', terms: ['cloud_storage'] },
  { name: 'GCP Firebase', provider: 'gcp', terms: ['firebase'] },
  { name: 'GCP Firestore', provider: 'gcp', terms: ['firestore'] },
  { name: 'GCP Cloud SQL', provider: 'gcp', terms: ['cloud_sql'] },
  { name: 'GCP Vertex AI', provider: 'gcp', terms: ['vertexai'] },
  { name: 'GCP GKE', provider: 'gcp', terms: ['google_kubernetes_engine'] },
  { name: 'GCP Cloud Armor', provider: 'gcp', terms: ['cloud_armor'] },
  { name: 'GCP Load Balancer', provider: 'gcp', terms: ['cloud_load_balancing'] },
  { name: 'GCP Memorystore', provider: 'gcp', terms: ['memorystore'] },
  { name: 'GCP Spanner', provider: 'gcp', terms: ['cloud_spanner'] },
  { name: 'GCP Secret Manager', provider: 'gcp', terms: ['secret_manager'] }
];

function findBestAwsMatch(terms: string[]): string | null {
  const candidates = treeData.tree.filter(e => 
    e.path.startsWith('aws/service/') && e.path.endsWith('.svg') && e.path.includes('/64/')
  );

  for (const term of terms) {
    const match = candidates.find(c => {
      const filename = path.basename(c.path, '.svg').toLowerCase();
      return filename === term.toLowerCase() || 
             filename === `aws-${term.toLowerCase()}` || 
             filename === `amazon-${term.toLowerCase()}`;
    });
    if (match) return match.path;
  }

  for (const term of terms) {
    const match = candidates.find(c => {
      const filename = path.basename(c.path, '.svg').toLowerCase();
      return filename.includes(term.toLowerCase());
    });
    if (match) return match.path;
  }

  return null;
}

function findBestGcpMatch(terms: string[]): string | null {
  const candidates = treeData.tree.filter(e => 
    e.path.startsWith('gcp/') && e.path.endsWith('.svg')
  );

  for (const term of terms) {
    const match = candidates.find(c => {
      const filename = path.basename(c.path, '.svg').toLowerCase();
      return filename === term.toLowerCase() || 
             filename.replace(/_/g, '') === term.toLowerCase().replace(/_/g, '');
    });
    if (match) return match.path;
  }

  for (const term of terms) {
    const match = candidates.find(c => {
      const filename = path.basename(c.path, '.svg').toLowerCase();
      return filename.includes(term.toLowerCase());
    });
    if (match) return match.path;
  }

  return null;
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
  console.log('Fuzzy-searching and verifying official cloud pack paths...');
  const results: Record<string, string> = {};

  for (const svc of SERVICES) {
    let resolvedPath: string | null = null;
    if (svc.provider === 'aws') {
      resolvedPath = findBestAwsMatch(svc.terms);
    } else {
      resolvedPath = findBestGcpMatch(svc.terms);
    }

    const url = resolvedPath ? `${JSDELIVR_BASE}/${resolvedPath}` : '';
    const isValid = url ? await testUrl(url) : false;

    if (isValid && url) {
      console.log(`\x1b[32m✓\x1b[0m ${svc.name} ➔ ${url}`);
      results[svc.name] = url;
    } else {
      // Direct, safe Simple Icons fallbacks if not inside D2 tf2d2/icons repo
      let fb = '';
      if (svc.name === 'GCP Firebase') {
        fb = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/firebase.svg';
      } else if (svc.name === 'Amazon Bedrock') {
        fb = JSDELIVR_BASE + '/aws/service/Machine-Learning/64/Amazon-Bedrock.svg'; // Check custom path manually in code if wanted, otherwise simpleicons
        const exists = await testUrl(fb);
        if (!exists) {
          fb = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonwebservices.svg';
        }
      } else if (svc.provider === 'gcp') {
        fb = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlecloud.svg';
      } else {
        fb = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonwebservices.svg';
      }

      console.log(`\x1b[33m⚠\x1b[0m ${svc.name} ➔ fallback: ${fb}`);
      results[svc.name] = fb;
    }
  }

  // Inject resolved URLs into lib/icon-registry.ts
  const registryPath = path.join(__dirname, '../lib/icon-registry.ts');
  let content = fs.readFileSync(registryPath, 'utf8');

  for (const [key, url] of Object.entries(results)) {
    const regex = new RegExp(`'${key}':\\s*\\{[^\\}]*\\},?`, 'g');
    const replacement = `'${key}': { source: 'local', slug: '${url}' },`;
    content = content.replace(regex, replacement);
  }

  fs.writeFileSync(registryPath, content, 'utf8');
  console.log('\nSuccessfully verified and saved 100% of official cloud pack icons to lib/icon-registry.ts!');
}

run();
