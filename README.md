# Isac Zarate — Personal Portfolio

A static developer portfolio for **Isac Zarate / TheDevIsacZ**, headed **Backend Engineer / SDET**. The site uses a dark purple visual system, is built with Astro and TypeScript, and is designed to deploy to a private S3 origin behind CloudFront. See the [design notes](docs/design.md) for the selected reference, original artwork, and responsive behavior.

## Current content state

The public content uses supplied résumé facts:

- The two project case studies are drafts and cannot appear on public routes.
- `/work/` shows an honest empty state until a case study is verified and published.
- `/resume/` provides experience, education, skills, languages, a short ClassSeek overview, and an approved PDF for viewing and download.
- Email is the public contact method. Phone and postal address are excluded; LinkedIn remains unset.
- The sanitized editable résumé and PDF share the website's public data. See [résumé maintenance](docs/resume/README.md) for regeneration and verification.

See [`docs/content-guide.md`](docs/content-guide.md) before publishing personal or project content.

## Local setup

Requirements: Node.js 24+ and pnpm 11.19.0.

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

The development site is available at `http://localhost:4321`.

## Validation

```powershell
pnpm openspec:validate
pnpm lint:content
pnpm check
pnpm test
pnpm test:coverage
pnpm build
pnpm test:e2e:install
pnpm test:e2e
pnpm test:lighthouse
pnpm infra:test
pnpm infra:synth
pnpm validate
```

`pnpm infra:synth` produces a CloudFormation template only. It does not deploy infrastructure, register a domain, or change DNS.

## Repository workflow

This is a solo repository using direct delivery to `main`:

1. Update the active OpenSpec change.
2. Implement and test locally.
3. Run `pnpm validate`.
4. Review `git status` for secrets, build output, reports, draft leakage, and unsupported claims.
5. Commit and push to `main` only after all checks pass.

The GitHub deployment workflow remains gated until the documented AWS repository variables exist. AWS deployment and domain registration require separate authorization.

See [AWS delivery and rollback](docs/aws-delivery.md) for the manual launch prerequisites and [quality gates](docs/quality.md) for the audit profile and requirement-to-test mapping. Pushing source starts quality checks only; production uploads require a separately authorized manual workflow.

The [initial verification record](docs/verification.md) documents the local test results and the remaining launch-only checks.

## Project structure

```text
src/                 Astro pages, components, content, and styles
tests/e2e/           Playwright, axe, and link-integrity journeys
infra/               AWS CDK stack and infrastructure tests
openspec/            Behavioral specifications and change history
.github/workflows/   Quality and gated deployment workflows
docs/                Content and AWS operating guides
```
