# Design

## Context

The Astro site already has optional email and PDF configuration and validates real PDF assets before build. Its resume and About routes contain placeholders, and existing browser tests assume no PDF. See proposal.md for motivation. The original Word document remains in Downloads and is private source material.

## Goals / Non-Goals

**Goals:** Share one sanitized factual content source across the site and document generator, retain static routes, and produce an accessible public PDF.

**Non-Goals:** Publish a ClassSeek case study, change infrastructure, add a runtime API, or deploy to AWS.

## Decisions

- Store only approved public facts in a JSON resume source and validate it with Zod for Astro consumers. The Word builder reads the same source to reduce drift. Do not import or copy the private original into the repository.
- Create a fresh one-column Letter-size public Word document with semantic heading/list styles, readable typography, email contact, and descriptive portfolio links. Export with installed Microsoft Word using document structure tags, then inspect the PDF and DOCX. Use Word as the export fallback if the packaged LibreOffice renderer is unavailable on Windows.
- Serve the approved static PDF from `/resume/isac-zarate-resume.pdf` and preserve the existing configured/unconfigured PDF behavior. Fill existing SiteConfig fields rather than adding an API.
- Lead with Backend Engineer / SDET across the homepage, About, resume, and metadata. Describe full-stack development as a sourced skill. ClassSeek remains a resume-only summary with no claim about personal contribution or results.

## Risks / Trade-offs

- Document export can expose inherited metadata → generate a fresh document, clear private properties, and inspect PDF metadata and source XML.
- Future HTML and PDF versions can diverge → use shared data, document regeneration, and verify representative facts in both formats.
- A supplied resume is self-reported evidence, not independent proof of outcomes → publish its factual statements without adding metrics or publishing a detailed case study.

## Migration Plan

Generate and inspect the public assets, update site content and tests, run the delivery checks, then archive the change and push the completed source to main. AWS deployment stays manual. A future correction uses a new commit and regenerated document; the original private file remains untouched.
