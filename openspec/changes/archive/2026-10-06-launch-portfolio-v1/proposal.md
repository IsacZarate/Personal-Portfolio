# Proposal

## Why

Isac Zarate needs a credible, recruiter-focused portfolio that presents full-stack and SDET strengths through accessible storytelling, verifiable engineering evidence, and a production-oriented delivery pipeline. The repository is currently empty, so this change establishes the complete first version without inheriting legacy behavior or unsupported claims.

## What Changes

- Build a statically generated Astro portfolio with editorial visual design, purposeful client-side interaction, responsive navigation, metadata, and accessible motion behavior.
- Add a content-driven work index and project-detail system with two non-public draft case studies until verified project evidence is available.
- Add an accessible HTML resume fallback and keep PDF download behavior absent until a real resume file is supplied.
- Add automated type, unit, browser, accessibility, content, link, and performance checks that act as delivery gates.
- Define AWS CDK infrastructure for private S3 hosting behind CloudFront, Route 53 and ACM integration, security headers, clean routes, rollback support, and GitHub OIDC deployment.
- Add GitHub Actions for quality checks and a production workflow that cannot deploy without explicitly configured AWS repository variables.
- Document local development, content completion, AWS prerequisites, deployment, and rollback.

## Capabilities

### New Capabilities

- `portfolio-experience`: Public routes, identity, navigation, editorial presentation, metadata, responsive behavior, motion preferences, and resume fallback behavior.
- `project-case-studies`: Validated project content, public work listings, generated project routes, draft exclusion, and honest evidence requirements.
- `quality-and-accessibility`: Automated quality gates, accessibility behavior, content validation, browser coverage, and measurable performance targets.
- `aws-delivery`: Reproducible AWS infrastructure, secure static delivery, custom-domain routing, GitHub OIDC deployment, caching, and rollback behavior.

### Modified Capabilities

None. The repository has no existing capability specifications.

## Impact

- Adds the Astro and TypeScript application, content collections, React islands, shared styling, test suites, automation scripts, and public assets.
- Adds OpenSpec artifacts as the behavioral source of truth for the initial release.
- Adds AWS CDK and GitHub Actions configuration without creating cloud resources or purchasing a domain.
- Establishes `main` as the direct delivery branch for this solo portfolio repository.
- Requires future verified resume, contact, social, and project content before those placeholders can be considered launch-complete.
