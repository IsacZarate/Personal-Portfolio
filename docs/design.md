# Portfolio visual design

The October 2026 redesign follows the direction selected by Isac: a dark purple developer portfolio with lavender accents, soft glows, rounded typography, gradient cards, and a centered skills constellation.

## Reference and artwork

- Visual reference: [Ibrahim Memon's Figma Portfolio](https://figma-portfolio-ten.vercel.app/).
- Reference repository: [ibrahimmemonn/Figma-Portfolio](https://github.com/ibrahimmemonn/Figma-Portfolio).
- The supplied Figma Community design is associated with that reference; the live site was used for visual inspection because the Figma document was not readable through the available web tool.
- The reference README requests a remix and prohibits publishing the entire design without permission. This implementation uses original Astro markup, styles, a laptop/code SVG, feature icons, a skills orbit graphic, and an `iz.` monogram. It does not copy reference source code, personal imagery, project screenshots, employer claims, or integrations.

## Design system

The shared stylesheet uses a `#11071f` canvas, `#c799ff` accents, light text, subdued purple surfaces, and local Poppins fonts. The regular and semibold font files are preloaded so body text and headings do not wait for stylesheet discovery. Content is centered in a maximum 1080px column. A persistent header includes direct Home, About, Work, and Resume navigation; a native disclosure menu replaces it on small screens.

The home page introduces Isac with an original abstract developer illustration, followed by clearly labeled work experience, education, development focus, and quality focus. Skill labels are filtered against the validated resume data. Decorative graphics are hidden from assistive technology, and content remains available without JavaScript.

The project section intentionally shows an honest empty state. The illustration there is generic decoration, not a fabricated project screenshot. ClassSeek remains a resume overview until its individual contributions and evidence are supplied. The resume PDF and underlying facts remain unchanged by this visual update.

About, Work, Resume, project details, the recovery page, footer, and social card share the same visual language. The quality sequence retains its keyboard model. Effects use CSS and a small reveal observer, with nonessential motion disabled by the visitor's reduced-motion preference. Distant home sections use `content-visibility: auto` with a remembered intrinsic height to defer offscreen layout; their semantic content remains in the HTML, including without JavaScript. Browsers without this optimization render the sections normally.

## Review and maintenance

Run `pnpm validate` before delivery. Browser journeys cover the primary resume CTA, PDF download, email, sourced experience, skills, draft exclusion, no external asset requests, no-script access, keyboard navigation, reduced motion, metadata, and layout at mobile/desktop sizes. Visually review at 320, 390, 768, and 1440 CSS pixels whenever shared layout changes.

Local browser screenshots and reports live in ignored `test-results/` and `.lighthouseci/` directories. Keep future artwork local, decorative where appropriate, dimensioned, and light enough to preserve the mobile performance budget.
