# Quality gates

The portfolio is checked as a production-equivalent static build. `pnpm validate` composes the specification, content, type, unit, build, browser, Lighthouse, and infrastructure checks; none of these commands deploys AWS resources.

## Lighthouse profile

`pnpm test:lighthouse` audits the generated home, work, about, and résumé pages using Lighthouse's simulated mobile throttling at a 390 × 844 CSS-pixel viewport and a device scale factor of 3. The profile uses one run in local and CI environments so the gate remains predictable on a small static site.

The required category scores are:

- performance: 90 or higher
- accessibility: 95 or higher
- best practices: 95 or higher
- SEO: 95 or higher

Raw local results are written under `.lighthouseci/` and are ignored by Git. Playwright separately covers 320px behavior, keyboard operation, axe accessibility rules, reduced motion, draft exclusion, and broken internal links.

Install Chromium with `pnpm test:e2e:install`. The Lighthouse wrapper uses that pinned browser and keeps one browser alive across the four audits, avoiding Windows temporary-profile deletion races. Lighthouse CI still collects, asserts all category budgets, and writes reports; runner failures are never converted to passes. CI installs Chromium's Linux dependencies too.

## Requirement traceability

| OpenSpec capability | Executable evidence |
| --- | --- |
| Portfolio routes, identity, metadata, responsive access, résumé fallback and motion | `tests/e2e/portfolio.spec.ts`, `src/lib/metadata.test.ts`, `src/config/site.test.ts` |
| Valid content, draft exclusion, complete narrative and optional actions | `src/lib/project-schema.test.ts`, `projects.test.ts`, `content-validation.test.ts`, `src/components/ProjectCaseStudy.test.ts` |
| Keyboard operation and stateful interaction | `src/components/QualitySequence.test.tsx`, browser keyboard journeys |
| Accessibility, links and mobile performance | axe/link browser journeys and `lighthouserc.cjs` |
| Private origin, HTTPS, headers, caches, OIDC and no implicit deployment | `infra/tests/portfolio.test.ts`, `edge.test.ts`, `workflows.test.ts` and credential-free CDK synthesis |

Automated axe checks complement manual keyboard and visual inspection; they do not establish complete WCAG conformance. Field INP and real-user Web Vitals require a deployed site and actual usage, and are not claimed from a static Lighthouse audit.
