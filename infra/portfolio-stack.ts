import { readFileSync } from 'node:fs';
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';
import type { InfrastructureConfig } from './config';

export class PortfolioStack extends Stack {
  constructor(scope: Construct, id: string, config: InfrastructureConfig, props?: StackProps) {
    super(scope, id, { ...props, env: { account: config.account, region: config.region } });
    const zone = route53.HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId: config.hostedZoneId, zoneName: config.domain,
    });
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: config.domain, subjectAlternativeNames: [`www.${config.domain}`],
      validation: acm.CertificateValidation.fromDns(zone),
    });
    const bucket = new s3.Bucket(this, 'Site', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true, enforceSSL: true, encryption: s3.BucketEncryption.S3_MANAGED,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      removalPolicy: RemovalPolicy.RETAIN, autoDeleteObjects: false,
      lifecycleRules: [{ abortIncompleteMultipartUploadAfter: Duration.days(7) }],
    });
    const headers = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
      securityHeadersBehavior: {
        strictTransportSecurity: { accessControlMaxAge: Duration.days(365), includeSubdomains: true, override: true },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.NO_REFERRER, override: true },
        // Astro emits page-specific script/style hashes in the HTML CSP. This header
        // adds directives that cannot be expressed by a CSP meta element.
        contentSecurityPolicy: { contentSecurityPolicy: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests", override: true },
      },
      customHeadersBehavior: { customHeaders: [{ header: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()', override: true }] },
    });
    const htmlCache = new cloudfront.CachePolicy(this, 'HtmlCache', {
      minTtl: Duration.seconds(0), defaultTtl: Duration.seconds(60), maxTtl: Duration.minutes(5),
      enableAcceptEncodingBrotli: true, enableAcceptEncodingGzip: true,
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
    });
    const assetCache = new cloudfront.CachePolicy(this, 'AssetCache', {
      minTtl: Duration.seconds(0), defaultTtl: Duration.days(365), maxTtl: Duration.days(365),
      enableAcceptEncodingBrotli: true, enableAcceptEncodingGzip: true,
    });
    const router = new cloudfront.Function(this, 'Routes', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(readFileSync(new URL('./edge.js', import.meta.url), 'utf8').replace('__DOMAIN__', config.domain)),
    });
    const origin = origins.S3BucketOrigin.withOriginAccessControl(bucket);
    const sharedBehavior = {
      origin, viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      compress: true, responseHeadersPolicy: headers,
      functionAssociations: [{ function: router, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST }],
    };
    const distribution = new cloudfront.Distribution(this, 'Cdn', {
      certificate, domainNames: [config.domain, `www.${config.domain}`],
      defaultRootObject: 'index.html', minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: { ...sharedBehavior, cachePolicy: htmlCache },
      additionalBehaviors: { '_astro/*': { ...sharedBehavior, cachePolicy: assetCache } },
      errorResponses: [403, 404].map((httpStatus) => ({ httpStatus, responseHttpStatus: 404, responsePagePath: '/404.html', ttl: Duration.seconds(0) })),
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });
    // Build archives can be read by the release role, never by the website origin.
    bucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.DENY, principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
      actions: ['s3:GetObject'], resources: [bucket.arnForObjects('_releases/*')],
    }));
    for (const [label, name] of [['Apex', config.domain], ['Www', `www.${config.domain}`]]) {
      const target = route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution));
      new route53.ARecord(this, `${label}A`, { zone, recordName: name, target });
      new route53.AaaaRecord(this, `${label}AAAA`, { zone, recordName: name, target });
    }
    const providerArn = config.oidcProviderArn ?? new iam.CfnOIDCProvider(this, 'GitHubProvider', {
      url: 'https://token.actions.githubusercontent.com', clientIdList: ['sts.amazonaws.com'],
    }).attrArn;
    const role = new iam.Role(this, 'DeployRole', {
      assumedBy: new iam.WebIdentityPrincipal(providerArn, { StringEquals: {
        'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        'token.actions.githubusercontent.com:sub': config.githubSubject,
      } }),
      maxSessionDuration: Duration.hours(1),
      description: `Static release uploads from ${config.repository} main only`,
    });
    role.addToPolicy(new iam.PolicyStatement({ actions: ['s3:ListBucket'], resources: [bucket.bucketArn] }));
    role.addToPolicy(new iam.PolicyStatement({ actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'], resources: [bucket.arnForObjects('*')] }));
    role.addToPolicy(new iam.PolicyStatement({ actions: ['cloudfront:CreateInvalidation', 'cloudfront:GetInvalidation'], resources: [distribution.distributionArn] }));
    new CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new CfnOutput(this, 'DeploymentRoleArn', { value: role.roleArn });
    new CfnOutput(this, 'SiteUrl', { value: `https://${config.domain}` });
  }
}
