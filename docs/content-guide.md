# Content publishing guide

Public portfolio content must be factual, reviewable, and supported by evidence. Draft project files may use working notes because they are excluded from every public consumer by the shared publication selector.

## Project approval convention

A project is publishable only when all of these frontmatter markers are present:

- `draft: false`
- `verification.reviewed: true`
- `verification.reviewedAt` contains the review date
- every `testing` and `outcomes` entry has `verified: true`

Setting these markers means the associated claim has been checked against a repository, test report, screenshot, deployment, or other reproducible source. Each published testing/outcome item must also provide a supporting HTTPS `source` URL, which is shown in the case study. A marker is not permission to estimate or improve a result. The checker enforces structure and review markers; a person must verify the truth of prose and evidence.

Do not use `TODO`, `TBD`, `FIXME`, `[[PLACEHOLDER]]`, `[[UNVERIFIED]]`, `[[DRAFT CLAIM]]`, `lorem ipsum`, or example URLs in public data. External public URLs must use HTTPS. The content check reports the source and field for every violation.

## Publishing a case study

1. Replace private drafting notes with verified context, responsibilities, architecture, challenges, testing, results, retrospective, and next steps.
   The `context`, `challenges`, `retrospective`, and `improvements` frontmatter fields are required when publishing. MDX below the frontmatter can add further detail.
2. Add descriptive alternative text for each public image.
3. Add repository and demo URLs only when visitors are allowed to open them.
4. Set each evidence marker to `verified: true` only after reviewing its source.
5. Complete the project-level review markers and run `pnpm lint:content`, `pnpm test`, and `pnpm build`.
6. Inspect the generated `dist` output and confirm no other draft title or slug appears.

The resume PDF, email, LinkedIn URL, and case-study metrics remain absent until real values are supplied. Omission is the supported fallback; placeholder public values are not.

Drafts are excluded from the website, not secret from repository readers. Keep sensitive research outside the repository. The sample illustrations live in `docs/drafts/`, outside public assets. Move approved images into `public/images/` and update their paths before publishing. Prefer compressed WebP/AVIF with intrinsic dimensions. A configured résumé path must point to an existing PDF in `public/`; the build rejects absent or non-PDF files.
