import { pathToFileURL } from 'node:url';

export function validateDeploymentConfig(env) {
  if (env.GITHUB_REF !== 'refs/heads/main') throw new Error('Production is restricted to main.');
  if (env.DEPLOY_AUTHORIZED !== 'true' || env.AWS_DEPLOYMENT_ENABLED !== 'true') throw new Error('Production deployment has not been explicitly enabled and authorized.');
  const required = ['AWS_ACCOUNT_ID', 'AWS_REGION', 'AWS_DEPLOY_ROLE_ARN', 'AWS_SITE_BUCKET', 'AWS_DISTRIBUTION_ID'];
  for (const key of required) if (!env[key]) throw new Error(`Required repository variable is missing: ${key}`);
  if (!/^\d{12}$/.test(env.AWS_ACCOUNT_ID) || env.AWS_ACCOUNT_ID === '111111111111') throw new Error('A real AWS account ID is required.');
  if (env.AWS_REGION !== 'us-east-1') throw new Error('Expected us-east-1.');
  if (!env.AWS_DEPLOY_ROLE_ARN.startsWith(`arn:aws:iam::${env.AWS_ACCOUNT_ID}:role/`)) throw new Error('Deployment role must belong to the configured account.');
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(env.AWS_SITE_BUCKET)) throw new Error('Invalid site bucket.');
  if (!/^[A-Z0-9]+$/.test(env.AWS_DISTRIBUTION_ID)) throw new Error('Invalid distribution ID.');
  return true;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  validateDeploymentConfig(process.env);
  console.log('Deployment prerequisites validated; no AWS credentials requested.');
}
