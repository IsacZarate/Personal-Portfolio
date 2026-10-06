# Spec Delta

## Purpose

Defines truthful, content-driven project storytelling while preventing unfinished or unsupported portfolio claims from becoming public.

## ADDED Requirements

### Requirement: Validated project content
Each project SHALL provide a slug, title, summary, role, dates, status, technology stack, responsibilities, architecture narrative, testing evidence, outcomes, images with alternative text, publication state, and optional repository and demo links.

#### Scenario: Project content is incomplete
- **WHEN** a project file does not satisfy the required content schema
- **THEN** validation fails before the production build can be accepted

### Requirement: Draft exclusion
Projects marked as drafts SHALL be excluded from public work listings, generated project routes, sitemap entries, structured metadata, and featured-work sections.

#### Scenario: Repository contains draft case studies
- **WHEN** the production site is generated with draft project files present
- **THEN** no draft title, slug, or project claim appears in public output

### Requirement: Honest empty state
The work index and homepage SHALL present a truthful editorial empty state when no verified project is public, without inventing project names, metrics, clients, or outcomes.

#### Scenario: No project is publishable
- **WHEN** every project is marked as a draft
- **THEN** the public site explains that case studies are being prepared and provides navigation to other evidence

### Requirement: Complete public case study
Each published project SHALL describe context, responsibilities, architecture decisions, implementation challenges, testing strategy, supported results, retrospective, and next improvements.

#### Scenario: Visitor opens a published project
- **WHEN** a visitor opens a generated project route
- **THEN** all required narrative sections render in a readable order with evidence labels and descriptive media

### Requirement: Optional project links
Repository and live-demo actions SHALL render only when their corresponding validated URLs are present.

#### Scenario: Project has no public repository
- **WHEN** a published project omits its repository URL
- **THEN** no empty, disabled, or misleading repository action is displayed
