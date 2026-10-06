# Spec Delta

## MODIFIED Requirements

### Requirement: Identity and recruiter actions
The site SHALL present `Isac Zarate` and `TheDevIsacZ` with equal prominence, lead with `Backend Engineer / SDET`, retain sourced full-stack skills, and provide a primary action to view the resume page.

#### Scenario: Recruiter follows the primary action
- **GIVEN** the approved Backend Engineer / SDET positioning
- **WHEN** a recruiter activates the primary resume action
- **THEN** the recruiter reaches the accessible HTML resume page without encountering a missing file

## ADDED Requirements

### Requirement: Published resume content
The HTML resume and About page SHALL present sourced experience and education. The resume SHALL include skills, languages, and a short ClassSeek entry without invented metrics, accomplishments, or a featured case-study link.

#### Scenario: Recruiter reads the resume
- **GIVEN** the supplied resume and confirmation that VivoSense is ongoing
- **WHEN** a recruiter opens the resume page
- **THEN** it shows the Engineering Intern role from June 2025 to Present, the Computer Science degree expected May 2027, sourced skills and languages, and the ClassSeek overview

#### Scenario: Recruiter browses featured work
- **GIVEN** ClassSeek has only a supplied resume overview
- **WHEN** a recruiter opens the home or work page
- **THEN** ClassSeek is not listed as a featured case study and no ClassSeek detail route is generated

### Requirement: Public resume and contact access
When an approved PDF is configured, the resume SHALL expose working PDF view and download actions. Public resume documents and site contact links SHALL show the approved email while omitting phone numbers, postal addresses, private metadata, and unsupplied LinkedIn links.

#### Scenario: Recruiter views or downloads the PDF
- **GIVEN** a real approved public PDF is configured
- **WHEN** a recruiter activates either PDF action
- **THEN** the PDF resolves successfully and its content matches the sourced HTML resume

#### Scenario: Visitor contacts Isac
- **GIVEN** email-only public contact approval
- **WHEN** a visitor opens About or the resume page
- **THEN** the approved email is usable as a mail link and no phone, postal address, or placeholder LinkedIn contact is shown
