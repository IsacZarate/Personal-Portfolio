# Spec Delta

## MODIFIED Requirements

### Requirement: Responsive editorial presentation
The site SHALL remain readable and operable from 320-pixel mobile viewports through large desktop layouts, using the selected dark purple visual direction: rounded sans-serif typography, lavender accents, soft glows, gradient cards, and visible interactive states consistently across all public routes.

#### Scenario: Small-screen visitor browses the site
- **GIVEN** the redesigned public portfolio
- **WHEN** the viewport is 320 pixels wide
- **THEN** navigation, content, and actions fit without unintended horizontal overflow or obscured controls

#### Scenario: Visitor moves between pages
- **GIVEN** the selected purple portfolio reference
- **WHEN** a visitor moves between Home, Work, About, Resume, and the not-found page
- **THEN** the dark background, typography, accent colors, and navigation remain visually consistent

## ADDED Requirements

### Requirement: Sourced home page overview
The home page SHALL introduce Isac Zarate and TheDevIsacZ, retain Backend Engineer / SDET positioning and resume access, and present sourced experience and skills in the selected visual direction. Decorative artwork SHALL NOT imply unverified personal details, employers, projects, or results.

#### Scenario: Recruiter scans the home page
- **GIVEN** the approved resume facts
- **WHEN** a recruiter reads the introduction, experience, and skills sections
- **THEN** the ongoing VivoSense Engineering Intern role and sourced technologies are visible, the resume CTA resolves, and no reference-author identity or accomplishments are presented as Isac's

#### Scenario: No public case studies are ready
- **GIVEN** all case studies remain drafts
- **WHEN** a visitor reaches selected work on the home page
- **THEN** an honest empty state is displayed without fabricated thumbnails, project names, or case-study links

#### Scenario: Decorative graphics are unavailable
- **GIVEN** images or client-side JavaScript are unavailable
- **WHEN** a visitor reads the home page
- **THEN** identity, skills, experience, resume navigation, and contact remain available as semantic text and links
