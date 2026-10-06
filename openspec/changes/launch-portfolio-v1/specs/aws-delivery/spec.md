# Spec Delta

## Purpose

Defines a reproducible and secure AWS delivery path for the static portfolio without provisioning resources before account and domain approval.

## ADDED Requirements

### Requirement: Private static origin
The infrastructure definition SHALL use a versioned S3 bucket with public access blocked and make site objects readable only through CloudFront Origin Access Control.

#### Scenario: Visitor attempts direct bucket access
- **WHEN** an unauthenticated visitor requests a site object through the S3 endpoint
- **THEN** S3 denies the request while CloudFront can retrieve and serve the object

### Requirement: HTTPS custom-domain delivery
The infrastructure definition SHALL support `isaczarate.com` and `www.isaczarate.com` with an ACM certificate in `us-east-1`, redirect HTTP to HTTPS, and redirect `www` permanently to the apex domain.

#### Scenario: Visitor uses the www hostname
- **WHEN** a visitor requests a valid path on `www.isaczarate.com`
- **THEN** the visitor receives a permanent redirect to the same path on `https://isaczarate.com`

### Requirement: Clean static routes
CloudFront SHALL map extensionless and directory-style requests to generated `index.html` objects while preserving asset and file requests.

#### Scenario: Visitor opens a nested page directly
- **WHEN** a visitor requests `/about`, `/work`, or a published project path
- **THEN** CloudFront serves the corresponding generated HTML instead of returning an S3 key error

### Requirement: Security and cache policy
CloudFront SHALL apply HSTS, content type protection, a restrictive referrer policy, an explicit content security policy, long immutable caching for fingerprinted assets, and short caching for HTML.

#### Scenario: Browser receives a public page
- **WHEN** CloudFront serves HTML over HTTPS
- **THEN** the configured security headers and HTML cache policy are present

### Requirement: Credentialless GitHub deployment
The production workflow SHALL use GitHub OIDC with a role restricted to the configured repository and `main` branch, and SHALL require explicit AWS account, region, role, bucket, and distribution configuration.

#### Scenario: AWS configuration is absent
- **WHEN** the production workflow runs without all required repository variables
- **THEN** it stops before requesting credentials or changing AWS resources

### Requirement: Recoverable releases
Deployments SHALL retain S3 object versions and identify the deployed source revision so a previous successful build can be restored and CloudFront invalidated.

#### Scenario: Production smoke test fails
- **WHEN** post-deployment checks fail after upload
- **THEN** maintainers can redeploy a known successful revision without rebuilding infrastructure

### Requirement: No implicit cloud mutation
Local validation and continuous integration SHALL synthesize infrastructure without deploying it, purchasing a domain, or modifying DNS.

#### Scenario: Contributor runs the standard validation suite
- **WHEN** the full local or CI quality command completes
- **THEN** no AWS resource, domain registration, or DNS record has been created or changed
