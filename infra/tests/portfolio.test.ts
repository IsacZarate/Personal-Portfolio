// @vitest-environment node
import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { describe, expect, it } from 'vitest';
import { realConfig, validationConfig } from '../config';
import { PortfolioStack } from '../portfolio-stack';

const template = Template.fromStack(new PortfolioStack(new App(), 'TestPortfolio', validationConfig));
describe('AWS delivery definition', () => {
  it('retains a private, versioned bucket and uses OAC', () => {
    template.hasResource('AWS::S3::Bucket', { DeletionPolicy: 'Retain', Properties: Match.objectLike({
      PublicAccessBlockConfiguration: { BlockPublicAcls: true, BlockPublicPolicy: true, IgnorePublicAcls: true, RestrictPublicBuckets: true },
      VersioningConfiguration: { Status: 'Enabled' },
    }) });
    template.resourceCountIs('AWS::CloudFront::OriginAccessControl', 1);
    template.hasResourceProperties('AWS::S3::BucketPolicy', { PolicyDocument: { Statement: Match.arrayWith([
      Match.objectLike({ Effect: 'Deny', Condition: { Bool: { 'aws:SecureTransport': 'false' } } }),
      Match.objectLike({ Effect: 'Allow', Principal: { Service: 'cloudfront.amazonaws.com' }, Condition: Match.objectLike({ StringEquals: { 'AWS:SourceArn': Match.anyValue() } }) }),
    ]) } });
  });
  it('defines HTTPS, clean routes, aliases and a real 404 response', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', { DistributionConfig: Match.objectLike({
      Aliases: ['isaczarate.com', 'www.isaczarate.com'],
      DefaultCacheBehavior: Match.objectLike({ ViewerProtocolPolicy: 'redirect-to-https', FunctionAssociations: Match.anyValue() }),
      CustomErrorResponses: Match.arrayWith([Match.objectLike({ ErrorCode: 403, ResponseCode: 404, ResponsePagePath: '/404.html' })]),
    }) });
    template.resourceCountIs('AWS::Route53::RecordSet', 4);
    template.hasResourceProperties('AWS::CertificateManager::Certificate', { DomainName: 'isaczarate.com', ValidationMethod: 'DNS' });
  });
  it('applies security headers and separate asset/HTML TTLs', () => {
    template.hasResourceProperties('AWS::CloudFront::ResponseHeadersPolicy', { ResponseHeadersPolicyConfig: Match.objectLike({ SecurityHeadersConfig: Match.objectLike({
      ContentTypeOptions: { Override: true },
      StrictTransportSecurity: Match.objectLike({ AccessControlMaxAgeSec: 31536000, Override: true }),
      ContentSecurityPolicy: Match.objectLike({ ContentSecurityPolicy: Match.stringLikeRegexp("frame-ancestors 'none'") }),
      ReferrerPolicy: { Override: true, ReferrerPolicy: 'no-referrer' },
    }) }) });
    for (const ttl of [60, 31536000]) template.hasResourceProperties('AWS::CloudFront::CachePolicy', { CachePolicyConfig: Match.objectLike({ DefaultTTL: ttl }) });
  });
  it('restricts OIDC to the exact repository branch and audience', () => {
    template.hasResourceProperties('AWS::IAM::Role', { AssumeRolePolicyDocument: Match.objectLike({ Statement: Match.arrayWith([
      Match.objectLike({ Action: 'sts:AssumeRoleWithWebIdentity', Condition: { StringEquals: {
        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        'token.actions.githubusercontent.com:sub': validationConfig.githubSubject,
      } } }),
    ]) }) });
    expect(JSON.stringify(template.toJSON())).not.toContain('s3:DeleteObjectVersion');
  });
  it('refuses real deployment settings when prerequisites are absent', () => {
    expect(() => realConfig({})).toThrow('Missing AWS_ACCOUNT_ID');
    expect(() => realConfig({ AWS_ACCOUNT_ID: '222222222222', AWS_REGION: 'us-west-2', HOSTED_ZONE_ID: 'ZREAL', GITHUB_OIDC_SUBJECT: validationConfig.githubSubject })).toThrow('us-east-1');
  });
});
