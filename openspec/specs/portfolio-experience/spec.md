# portfolio-experience Specification

## Purpose

Defines the public portfolio experience recruiters and hiring teams rely on across routes, devices, input methods, and motion preferences.

## Requirements

### Requirement: Public portfolio routes
The site SHALL provide statically generated routes for the home page, work index, eligible project details, about page, resume page, and branded not-found page.

#### Scenario: Visitor navigates the core site
- **WHEN** a visitor opens `/`, `/work`, `/about`, or `/resume`
- **THEN** the requested page renders with consistent primary navigation and footer content

#### Scenario: Visitor opens an unknown route
- **WHEN** a visitor requests a route that was not generated
- **THEN** the site returns the branded not-found experience with a working route back home

### Requirement: Identity and recruiter actions
The site SHALL present `Isac Zarate` and `TheDevIsacZ` with equal prominence, describe a full-stack and SDET focus, and provide a primary action to view the resume page.

#### Scenario: Recruiter follows the primary action
- **WHEN** a recruiter activates the primary resume action
- **THEN** the recruiter reaches the accessible HTML resume page without encountering a missing file

### Requirement: Resume fallback
The resume page SHALL identify incomplete factual sections and SHALL NOT display a PDF view or download action until a real PDF is present and configured.

#### Scenario: Resume PDF is unavailable
- **WHEN** the site is built without an approved resume PDF
- **THEN** the HTML resume remains available and no broken or misleading PDF action is rendered

### Requirement: Responsive editorial presentation
The site SHALL remain readable and operable from 320-pixel mobile viewports through large desktop layouts, using the approved editorial typography, warm neutral palette, cobalt accent, and visible interactive states.

#### Scenario: Small-screen visitor browses the site
- **WHEN** the viewport is 320 pixels wide
- **THEN** navigation, content, and actions fit without unintended horizontal overflow or obscured controls

### Requirement: Motion preference
Purposeful transition and reveal effects SHALL preserve content access, and nonessential motion SHALL be removed for visitors who request reduced motion.

#### Scenario: Reduced motion is enabled
- **WHEN** the browser reports `prefers-reduced-motion: reduce`
- **THEN** nonessential transforms, smooth scrolling, and reveal animations are disabled without hiding content

### Requirement: Search and sharing metadata
Every public page SHALL emit a unique title and description, a canonical URL under `https://isaczarate.com`, suitable social-sharing metadata, and appropriate crawl directives.

#### Scenario: Search crawler inspects a public page
- **WHEN** a public page is generated
- **THEN** canonical, title, description, Open Graph, and crawl metadata match that page's public content
