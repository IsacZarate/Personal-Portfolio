// @vitest-environment node
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import { projectSchema } from '../lib/project-schema';
import ProjectCaseStudy from './ProjectCaseStudy.astro';

const project = projectSchema.parse({
  slug: 'fixture-only', title: 'Fixture case study', summary: 'Synthetic test content, never registered as a public project.',
  role: 'Test fixture', dates: { start: '2025', end: '2026' }, status: 'completed', draft: false,
  stack: ['TypeScript'], responsibilities: ['Test the complete published case study.'],
  context: 'Verify rendering for a fully specified project without publishing a fictitious project.',
  architecture: 'The production template receives validated content and renders the required sections.',
  challenges: 'Exercise the real template without leaking fixture content into public output.',
  retrospective: 'Optional actions need explicit presence and absence assertions.',
  improvements: 'Extend these fixtures as future content requirements change.',
  testing: [{ label: 'Template rendering', detail: 'The actual Astro component is rendered in an isolated container.', verified: true, source: 'https://github.com/IsacZarate/Personal-Portfolio' }],
  outcomes: [{ label: 'Contract verification', detail: 'All narrative sections and evidence labels are present.', verified: true, source: 'https://github.com/IsacZarate/Personal-Portfolio' }],
  images: [{ src: '/images/social-card.svg', alt: 'A synthetic image used by the template test' }],
  verification: { reviewed: true, reviewedAt: '2026-10-05' },
});
describe('published case-study template', () => {
  it('renders the narrative, evidence and descriptive media in order', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCaseStudy, { props: { project } });
    const sections = ['Problem and context', 'Responsibilities', 'Architecture and decisions', 'Implementation challenges', 'Testing evidence', 'Supported outcomes', 'Retrospective', 'Next improvements'];
    const positions = sections.map((heading) => html.indexOf(heading));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain('alt="A synthetic image used by the template test"');
    expect(html).not.toContain('View repository');
    expect(html).not.toContain('Open live project');
  });
  it('renders configured optional actions', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ProjectCaseStudy, { props: { project: { ...project,
      repositoryUrl: 'https://github.com/IsacZarate/Personal-Portfolio', demoUrl: 'https://isaczarate.com',
    } } });
    expect(html).toContain('View repository');
    expect(html).toContain('Open live project');
  });
  it('rejects a missing narrative or evidence source before publication', () => {
    expect(projectSchema.safeParse({ ...project, challenges: undefined }).success).toBe(false);
    expect(projectSchema.safeParse({ ...project, testing: [{ ...project.testing[0], source: undefined }] }).success).toBe(false);
  });
});
