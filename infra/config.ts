export interface InfrastructureConfig {
  account: string;
  region: string;
  domain: string;
  hostedZoneId: string;
  repository: string;
  githubSubject: string;
  oidcProviderArn?: string;
}

export const validationConfig: InfrastructureConfig = {
  account: '111111111111', region: 'us-east-1', domain: 'isaczarate.com',
  hostedZoneId: 'Z000000000VALIDATION', repository: 'IsacZarate/Personal-Portfolio',
  githubSubject: 'repo:IsacZarate/Personal-Portfolio:ref:refs/heads/main',
};

export function realConfig(env: NodeJS.ProcessEnv): InfrastructureConfig {
  const keys = ['AWS_ACCOUNT_ID', 'AWS_REGION', 'HOSTED_ZONE_ID', 'GITHUB_OIDC_SUBJECT'] as const;
  for (const key of keys) if (!env[key]) throw new Error(`Missing ${key}. Use infra:synth for credential-free validation.`);
  if (!/^\d{12}$/.test(env.AWS_ACCOUNT_ID!) || env.AWS_ACCOUNT_ID === validationConfig.account) throw new Error('A real AWS account is required.');
  if (env.AWS_REGION !== 'us-east-1') throw new Error('The CloudFront certificate stack must be in us-east-1.');
  if (env.HOSTED_ZONE_ID === validationConfig.hostedZoneId) throw new Error('Validation zone cannot be deployed.');
  if (!/^repo:IsacZarate(?:@\d+)?\/Personal-Portfolio(?:@\d+)?:ref:refs\/heads\/main$/.test(env.GITHUB_OIDC_SUBJECT!)) throw new Error('OIDC subject must identify this repository and main branch exactly.');
  return {
    ...validationConfig, account: env.AWS_ACCOUNT_ID!, region: env.AWS_REGION!,
    hostedZoneId: env.HOSTED_ZONE_ID!, githubSubject: env.GITHUB_OIDC_SUBJECT!,
    oidcProviderArn: env.GITHUB_OIDC_PROVIDER_ARN,
  };
}
