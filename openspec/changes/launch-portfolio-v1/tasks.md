# Tasks

## 1. Project Foundation

- [x] 1.1 Install the locked pnpm dependencies in the authoritative repository, approve only required package build scripts, and verify `pnpm install --frozen-lockfile` succeeds without modifying the lockfile.
- [x] 1.2 Add Astro, React, MDX, sitemap, TypeScript, Vitest, and Playwright configuration plus shared scripts, and verify Astro starts and the configuration type-checks.
- [x] 1.3 Add repository documentation for local setup, content completion, validation commands, missing-content behavior, and the direct-to-main workflow, and verify every documented command exists in `package.json`.

## 2. Content Model and Publication Safety

- [x] 2.1 Implement typed `SiteConfig` and project content schemas with required evidence, image-alt, publication-state, and optional-link fields, and verify schema fixtures accept valid content and reject missing required fields.
- [x] 2.2 Implement the shared published-project selector and two non-public draft MDX case studies, and verify unit tests prove drafts never appear in published collections or generated route inputs.
- [x] 2.3 Implement public-content validation for placeholder tokens, unverified-claim markers, malformed links, and draft leakage, document the approval marker convention, and verify failing fixtures report their source and field.

## 3. Public Portfolio Experience

- [x] 3.1 Implement the base layout, metadata, structured data, sitemap, robots rules, header, footer, responsive navigation, self-hosted fonts, and editorial design tokens, and verify core layout tests cover canonical metadata and keyboard-visible navigation.
- [x] 3.2 Implement the home, work, about, resume, and not-found pages with truthful empty and HTML-resume fallback states, and verify browser tests confirm all routes work without public projects or a PDF.
- [x] 3.3 Implement the published project-detail template and conditional repository/demo actions, and verify tests cover complete projects plus omission of unavailable optional links.
- [x] 3.4 Add progressive reveal and transition behavior that begins from visible content and respects reduced motion, and verify browser tests show content remains visible with scripts disabled and animation is removed under `prefers-reduced-motion`.

## 4. Quality and Accessibility Gates

- [x] 4.1 Add Vitest coverage for publication filtering, configuration fallbacks, content validation, and interactive React behavior, and verify the unit suite passes with coverage focused on those contracts.
- [x] 4.2 Add Playwright mobile and desktop journeys for navigation, keyboard use, empty work state, resume fallback, draft-route absence, metadata, optional links, and 404 recovery, and verify the browser suite passes at 320-pixel and desktop viewports.
- [x] 4.3 Integrate axe checks and broken-link validation into the browser suite, and verify core routes have no serious or critical automated accessibility violations and no broken internal links.
- [x] 4.4 Configure Lighthouse CI for performance >=90 and accessibility, best-practices, and SEO >=95, document its stable mobile profile, and verify it evaluates the production preview successfully.
- [x] 4.5 Add the GitHub quality workflow for pushes to `main` and pull requests, and verify its jobs invoke strict OpenSpec validation, content checks, type checks, tests, build, browser/axe/link checks, Lighthouse, and CDK synthesis without cloud mutation.

## 5. AWS Infrastructure and Delivery

- [x] 5.1 Implement the CDK stack for the private versioned S3 origin, CloudFront OAC distribution, ACM certificate, Route 53 aliases, security headers, and cache policies, and verify infrastructure assertions cover public-access blocking, versioning, HTTPS redirect, and required headers.
- [x] 5.2 Implement and test the CloudFront Function that redirects `www` to the apex domain and rewrites only extensionless or trailing-slash routes to `index.html`, verifying asset paths and explicit file requests remain unchanged.
- [x] 5.3 Implement the repository-and-main-restricted GitHub OIDC role plus a deployment workflow that validates required variables before authentication, uploads assets and HTML with separate cache rules, records the source revision, and invalidates CloudFront; verify the workflow remains non-deploying when configuration is absent.
- [x] 5.4 Document AWS bootstrap, Route 53 and ACM prerequisites, repository variables, domain safety checks, production smoke tests, rollback by known Git revision, and the rule that deployment requires separate authorization; verify CDK synthesis succeeds with documented placeholder context.

## 6. Integrated Verification and Delivery

- [x] 6.1 Run strict OpenSpec validation, frozen dependency install, content validation, type checks, unit tests, production build, browser/axe/link checks, Lighthouse CI, and CDK synthesis; record and resolve every failure before marking this integration task complete.
- [x] 6.2 Review the production output to confirm no draft title, slug, placeholder claim, PDF action, credential, generated report, or build artifact is tracked or public, and verify `git status` contains only intended source artifacts.
- [ ] 6.3 Commit the complete validated implementation to `main` with a descriptive initial commit and push it to `origin`, verifying the remote `main` revision matches the local commit and no AWS deployment has run.
