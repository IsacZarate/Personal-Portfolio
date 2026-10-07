# Design

## Context

See proposal.md for motivation. The current Astro static site shares global CSS, header, footer, and layout across six route types. Resume facts already live in a validated data module; two MDX case studies are unpublished. React is used only for the keyboard-operable quality sequence. Existing tests cover 320px and desktop layouts, no-script behavior, PDF access, axe, link integrity, metadata, and draft exclusion.

Reference inspection: https://figma-portfolio-ten.vercel.app/ and https://github.com/ibrahimmemonn/Figma-Portfolio. The supplied Figma URL did not return readable content through the web tool; the deployed reference is the visual baseline. The author's README asks for a remix and does not authorize wholesale publication. No reference source or personal imagery will be copied.

## Goals / Non-Goals

**Goals:** A coherent reference-inspired composition with readable, responsive purple styling, original lightweight illustrations, and existing recruiter actions.

**Non-Goals:** Migrating from Astro, changing infrastructure, adding analytics/booking, inventing project evidence, or changing the approved resume PDF.

## Decisions

1. Replace the existing CSS visual tokens and typography with locally hosted Poppins (400, 500, 600, 700), a #11071f canvas, lavender text accents, purple bordered surfaces, and CSS radial gradients. A CSS theme and shared components keep all routes consistent; importing the reference's Next.js/Tailwind application would duplicate the site's architecture.
2. Center content in an approximately 1080px column. Keep a compact persistent header with Home, About, Work, and Resume routes. Use a native details menu on small screens with Escape handling, visible focus, and enough scroll margin for the header.
3. Use an original SVG code/laptop emblem, greeting arrow, and circled accent in the hero. Pair the prominent Backend Engineer / SDET title with the primary resume action. An abstract developer illustration avoids implying a supplied headshot or copying another person's avatar.
4. Display the single real internship in a prominent gradient card. Separate development/testing focus cards from work history so they cannot look like additional employers. Render a skills constellation with visible technology labels derived from validated resume facts and decorative orbital lines; the graphic is never the only source of content.
5. Retain the quality React island, restyled to match. Use static SSR text, CSS hover/reveal transitions and reduced-motion overrides. Avoid the reference's endlessly typing role text and scroll-dependent hidden content to preserve stability and no-script access. Preload the main regular/semibold fonts and use native `content-visibility: auto` for distant home sections to reduce initial layout cost while retaining their semantic HTML, keyboard access, and no-script fallback.
6. Use the existing published-project query for selected work; retain an honest, visually composed empty state until real case studies qualify. Keep About and Resume factual, applying the shared design to their existing sections.
7. Update the social card and theme color. Retain local assets, restrictive CSP, PDF delivery, canonicals, all routes, and email-only contact. Document the visual reference and original artwork provenance.

## Risks / Trade-offs

- Dark gradients can reduce contrast → use light text, sufficiently contrasted solid controls, and run axe plus manual focus review.
- Decorative orbits can overflow small screens → constrain graphics to their container, collapse columns, and inspect 320/390/768/1440px layouts.
- New fonts and imagery can affect loading → self-host only required Latin font weights, give SVGs dimensions, and run mobile Lighthouse gates.
- The reference includes multiple projects and employers → use one factual internship, distinguish skill focus from experience, and keep unpublished projects hidden.

## Migration Plan

Validate the change before implementation, apply the UI, verify the production build and browser layouts, record results, sync/archive specifications, then commit and push to main following the existing source-delivery workflow. AWS deployment remains manual. A source revert restores the previous UI without content or infrastructure migration.
