# Spec Delta

## Purpose

Defines the measurable quality, accessibility, integrity, and browser checks that must pass before portfolio changes are delivered.

## ADDED Requirements

### Requirement: Automated delivery gate
Changes delivered to `main` SHALL pass OpenSpec validation, content validation, Astro type checks, unit tests, production build, browser tests, accessibility checks, broken-link checks, and infrastructure synthesis.

#### Scenario: Required check fails
- **WHEN** any required validation or test exits unsuccessfully
- **THEN** the quality workflow fails and production deployment does not start

### Requirement: Keyboard and semantic access
Public navigation, links, controls, headings, landmarks, labels, and focus order SHALL be usable without a pointing device and SHALL expose appropriate semantic information.

#### Scenario: Keyboard-only navigation
- **WHEN** a visitor uses Tab, Shift+Tab, Enter, Space, and Escape where applicable
- **THEN** every interactive feature can be reached, identified, operated, and exited with visible focus

### Requirement: Automated accessibility coverage
Core routes SHALL pass automated axe checks with no serious or critical violations in the tested viewport profiles.

#### Scenario: Accessibility regression occurs
- **WHEN** a core page introduces a serious or critical axe violation
- **THEN** the browser test suite fails before delivery

### Requirement: Responsive browser coverage
Browser journeys SHALL verify navigation, empty project behavior, resume fallback, metadata, not-found recovery, and reduced-motion behavior at mobile and desktop sizes.

#### Scenario: Public fallback regresses
- **WHEN** a draft project becomes reachable or a missing PDF creates a broken action
- **THEN** the browser suite fails with the affected route and expectation

### Requirement: Performance targets
The deployed-equivalent production build SHALL target Lighthouse scores of at least 90 for performance and 95 for accessibility, best practices, and SEO under the configured mobile profile.

#### Scenario: Performance budget is missed
- **WHEN** Lighthouse CI records a category below its configured threshold
- **THEN** the performance check reports the category and fails

### Requirement: Content integrity
Public content SHALL reject placeholder tokens, draft leakage, malformed external URLs, and unsupported claims that have not been explicitly approved as verified evidence.

#### Scenario: Placeholder content could ship
- **WHEN** a public content file contains a forbidden placeholder or unverified-claim marker
- **THEN** content validation fails with the source file and offending field
