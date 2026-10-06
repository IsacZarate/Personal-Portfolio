# Design

## Context

The authoritative `Personal-Portfolio` repository is a new Git repository on `main` with no application history. OpenSpec and the package manifest have been initialized, but application source does not yet exist. See `proposal.md` for motivation and the four capability specs for required behavior. Verified project details, public contact links, and a resume PDF are not yet available, so the design must remain truthful and buildable without them.

## Goals / Non-Goals

**Goals:**

- Produce a fast static portfolio with a distinctive editorial presentation and minimal client JavaScript.
- Make content publication explicit and schema-driven so drafts cannot leak.
- Demonstrate SDET discipline through visible quality practices and executable delivery gates.
- Keep AWS infrastructure reproducible while ensuring normal development and CI are non-mutating.
- Make missing resume and project assets an honest supported state rather than broken content.

**Non-Goals:**

- Server rendering, a CMS, authentication, analytics, a contact form, a database, or a public API.
- Domain purchase, AWS bootstrapping, infrastructure deployment, or repository settings changes during implementation.
- Fabricating experience, project results, social links, or resume details.
- Maintaining the earlier `Portfolio Website` directory as a second working copy.

## Decisions

### Static Astro architecture with selective React islands

Astro will own routing, layouts, content collections, metadata, sitemap generation, and static output. React will be added only for an interaction that needs persistent client state; navigation and visual reveals will use semantic HTML, CSS, and small browser scripts. This keeps pages resilient and limits JavaScript while retaining a familiar component model. A full React SPA was rejected because it would add routing and hydration cost without benefiting static portfolio content.

### Typed content and publication state

`SiteConfig` will centralize public identity, canonical domain, resume state, and optional social/contact links. A content collection will validate `Project` fields and expose a required `draft` boolean plus structured evidence. Production queries and static route generation will share one `getPublishedProjects` helper that filters drafts before any consumer can list or route them. Two draft MDX files will exercise the schema but contain no public claims.

### Truthful missing-content behavior

The work index will show a designed empty state while all projects are drafts. The resume route will provide an accessible structure with explicit completion markers and no PDF action. A PDF link becomes data-driven only after a real file and configuration value exist. This avoids dead links and is preferable to publishing fictional examples.

### Editorial design system

Self-hosted Newsreader and DM Sans define display and interface typography. CSS custom properties provide warm neutral surfaces, near-black text, cobalt accents, spacing, radii, focus styling, and motion timing. Layout uses fluid type and container-based grids. Reveal behavior starts from fully visible markup and is enhanced only after JavaScript loads; reduced-motion media queries remove transforms and smooth scrolling.

### Quality architecture

Vitest covers pure content filters and React behavior. Playwright covers routes, navigation, small and large viewports, reduced motion, draft exclusion, resume fallback, metadata, not-found recovery, and optional links. Axe runs within browser journeys. A content script scans only public content for forbidden placeholder and verification markers. Lighthouse CI runs against the built preview with score assertions. A single CI workflow composes these checks, while deployment depends on that workflow succeeding.

### AWS CDK topology

One CDK app in `us-east-1` references an existing Route 53 hosted zone ID supplied through context or environment. It defines a private versioned S3 bucket, CloudFront distribution with Origin Access Control, ACM certificate, Route 53 alias records, response-header and cache policies, a CloudFront Function that combines `www` redirection with clean-route rewriting, and a branch-restricted GitHub OIDC deployment role. The CDK app synthesizes with placeholder context for validation but deployment documentation requires real values.

### Deployment and rollback

GitHub Actions uses OIDC rather than static AWS keys. The deploy job validates required repository variables before assuming the role, uploads hashed assets with immutable caching and HTML with short caching, records the source revision, and invalidates changed paths. S3 versioning and redeployment of a known Git revision provide rollback. Direct pushes to `main` are the chosen solo workflow; the push and deploy workflows still enforce the same checks.

## Risks / Trade-offs

- **[Missing real content weakens the public portfolio]** -> Keep drafts private, make the empty state polished, and document the exact content checklist required for publication.
- **[Direct-to-main delivery has less review isolation]** -> Require the complete local suite before the initial push and make deployment depend on repeatable CI checks.
- **[A strict CSP can block future embeds or assets]** -> Self-host fonts and images in v1 and document CSP updates as a future OpenSpec change.
- **[CloudFront clean-route rewriting can mishandle file requests]** -> Rewrite only extensionless or trailing-slash paths and cover representative assets and routes in infrastructure tests.
- **[Lighthouse scores vary by runtime]** -> Pin the CI profile and use category thresholds rather than exact timing assertions.
- **[AWS synthesis differs from deployment reality]** -> Test synthesized resources and document account bootstrap, certificate validation, variables, smoke checks, and rollback before any deployment is authorized.

## Migration Plan

1. Install the locked dependencies in the authoritative repository and approve only required package build scripts.
2. Implement the static site, content model, fallback states, and tests while completing OpenSpec tasks in order.
3. Synthesize the CDK stack with documented placeholder context; do not deploy it.
4. Run strict OpenSpec validation, content checks, type checks, unit tests, production build, browser/axe tests, Lighthouse CI, link validation, and CDK synthesis.
5. Commit the validated repository to `main` and push to the configured `origin`.
6. After verified content is supplied, publish it through a separate reviewed change; after AWS and domain details are supplied, authorize deployment separately.

Rollback before cloud launch is a normal Git revert and rebuild. After cloud launch, redeploy the last known-good Git revision and invalidate CloudFront while S3 versions remain available for recovery.
