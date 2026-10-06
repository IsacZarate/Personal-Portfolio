# AWS delivery and recovery

This repository defines infrastructure; local validation and the quality workflow do not create resources. Domain purchase, AWS bootstrap, stack deployment, DNS changes, and the first production upload each wait for explicit authorization. No cloud deployment was performed as part of implementation.

## Validate without AWS credentials

Run `pnpm infra:test` and `pnpm infra:synth`. The latter passes `-c validation=true --lookups=false` and uses account `111111111111`, region `us-east-1`, hosted zone `Z000000000VALIDATION`, and the repository's main-branch subject. These values exist only to exercise synthesis. Never deploy the validation template in `cdk.out/`.

## Prerequisites for a later authorized launch

1. Confirm domain availability and the actual annual registration price for `isaczarate.com` immediately before purchase. Confirm account ownership, billing alerts, MFA, privacy protection, renewal settings, and transfer lock. Domain registration is deliberately outside CDK.
2. Register the domain through the chosen registrar after purchase approval. Record the authoritative Route 53 hosted zone ID and verify the registrar delegates to that zone's name servers. The stack imports an existing zone and creates apex/www aliases; it does not register a domain or create a second zone.
3. Choose the AWS account, ensure `us-east-1` is enabled, and authorize CDK bootstrap for that account/region. The ACM certificate must be in `us-east-1` for CloudFront. DNS validation records are created by the authorized stack deployment.
4. Confirm the exact GitHub OIDC subject format. New repositories can include immutable owner/repository IDs: `repo:IsacZarate@OWNER_ID/Personal-Portfolio@REPOSITORY_ID:ref:refs/heads/main`. Older repositories use `repo:IsacZarate/Personal-Portfolio:ref:refs/heads/main`. Supply the exact repository setting as `GITHUB_OIDC_SUBJECT`; do not use wildcards or an environment subject. See [GitHub's AWS OIDC guidance](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws).
5. If the account already has the GitHub identity provider, set `GITHUB_OIDC_PROVIDER_ARN` so the stack imports it. Otherwise the stack defines it. The role allows object uploads/deletes in only the site bucket, listing that bucket, and invalidating only its distribution. It cannot deploy infrastructure or delete prior object versions.
6. Protect `main` using a repository ruleset with the quality check required for future changes. Repository settings are a separate manual prerequisite and are not modified by this project. The initial source delivery uses the explicitly chosen direct-to-main workflow.

After separate authorization, set these environment variables in your authenticated shell (a local `.env` is not loaded automatically): `AWS_ACCOUNT_ID`, `AWS_REGION=us-east-1`, `HOSTED_ZONE_ID`, `GITHUB_OIDC_SUBJECT`, and optional `GITHUB_OIDC_PROVIDER_ARN`. Then an authorized operator can run `pnpm exec cdk bootstrap aws://ACCOUNT/us-east-1`, inspect `pnpm infra:diff`, and deploy with `pnpm infra:deploy`. Do not pass validation context to these commands. Placeholder values are rejected by the real configuration loader.

## Repository variables for site uploads

| Variable | Value |
| --- | --- |
| `AWS_DEPLOYMENT_ENABLED` | `true` only after launch authorization |
| `AWS_ACCOUNT_ID` | Real 12-digit account ID |
| `AWS_REGION` | `us-east-1` |
| `AWS_DEPLOY_ROLE_ARN` | Stack's `DeploymentRoleArn` output |
| `AWS_SITE_BUCKET` | Stack's `BucketName` output |
| `AWS_DISTRIBUTION_ID` | Stack's `DistributionId` output |

These are non-secret identifiers. Do not store long-lived AWS keys in GitHub. The deployment workflow uses OIDC's short-lived credentials and requires the account to match.

## Deployment flow

The production workflow runs only through **Run workflow** on `main`. The operator must enable deployment through the repository variable, select `main` or a known main-branch commit SHA, and explicitly select the authorization checkbox. Missing configuration fails before the OIDC job. The selected commit must be an ancestor of main. The reusable quality workflow builds and validates that commit, then hands its exact artifact and source revision to the upload job.

Hashed `_astro/` assets receive `public, max-age=31536000, immutable` and are uploaded first. HTML and non-fingerprinted public files receive `public, max-age=60, must-revalidate`. Stale non-hashed files are removed by the release sync. The CloudFront HTML cache defaults to 60 seconds and caps at five minutes. A wildcard invalidation clears clean URL aliases, removed pages, and cached 404s. It is intentionally broader than a changed-page list to avoid stale aliases. Old hashed assets remain available to cached pages.

S3 is private, encrypted, versioned, and retained if the stack is removed. CloudFront uses [Origin Access Control](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront_origins.S3BucketOrigin.html). Both apex and www use HTTPS, and the viewer function redirects www while preserving the path and query. Extensionless paths map to directory `index.html` objects. Missing S3 keys return the branded page with HTTP 404, not a soft 200.

Astro emits per-page CSP script/style hashes. The CloudFront response policy adds frame-ancestor protection, HSTS, content-type protection, referrer and permissions policies. This split keeps the content policy tied to each build without requiring an infrastructure update for new script hashes.

## Production review

`scripts/smoke-production.mjs` checks HTTPS routes, www and HTTP redirects, security headers, short HTML caching, real 404s, and the deployed revision after invalidation completes. An operator must also review the real site at mobile/desktop widths, tab through navigation, enable reduced motion, inspect asset cache headers, and verify certificate/domain ownership. No local test proves actual AWS DNS, certificate, IAM or edge behavior; those checks happen only after an authorized deployment.

## Rollback

Record the last successful workflow's full Git SHA before every release. Each upload stores a private bundle at `_releases/SHA/site.tar.gz`; prior S3 object versions and old hashed assets remain available. CloudFront is explicitly denied access to release archives.

If production checks fail, the workflow fails visibly. Run the manual deployment workflow from current `main` with the last successful SHA as `revision`. It revalidates that revision, uploads the resulting artifact, removes stale non-hashed pages, and invalidates CloudFront again. Confirm `release.json` and the smoke checks match the restored SHA. The workflow does not silently roll back without operator selection.

If rebuilding is unavailable, an authorized operator can retrieve the archived bundle using AWS CLI, extract it into a clean directory, verify its `release.json`, then apply the same upload/cache/invalidation sequence. S3 object-version recovery is a final fallback. Retained versions, bundles, and old assets consume storage; decide a retention window after real traffic and recovery needs are known.
