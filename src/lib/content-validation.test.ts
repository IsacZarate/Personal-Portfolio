import { describe, expect, it } from 'vitest';
import {
  findDraftLeakage,
  formatContentIssues,
  validatePublicProject,
  validatePublicValue,
} from './content-validation';
import type { Project } from './project-schema';

const validProject: Project = {
  slug: 'verified-project',
  title: 'Verified project',
  summary: 'A supported summary describing the verified project and its purpose.',
  role: 'Full-stack engineer',
  dates: { start: '2025', end: '2026' },
  status: 'completed',
  stack: ['Astro'],
  responsibilities: ['Implemented the accessible public experience.'],
  architecture: 'A static architecture keeps delivery reliable while minimizing browser JavaScript.',
  context: 'A synthetic fixture for testing the public case-study contract.',
  challenges: 'Keeping test fixtures isolated from the production portfolio.',
  retrospective: 'The rendered sections are inspected as an explicit contract.',
  improvements: 'Extend the fixture as future narrative requirements are introduced.',
  testing: [{ label: 'Browser checks', detail: 'Navigation behavior is covered by Playwright.', verified: true, source: 'https://github.com/IsacZarate/Personal-Portfolio' }],
  outcomes: [{ label: 'Verified result', detail: 'The production build passes its documented checks.', verified: true, source: 'https://github.com/IsacZarate/Personal-Portfolio' }],
  images: [{ src: '/images/project.svg', alt: 'Diagram of the verified project architecture' }],
  draft: false,
  repositoryUrl: 'https://github.com/IsacZarate/Personal-Portfolio',
  verification: { reviewed: true, reviewedAt: '2026-10-05' },
};

describe('public content validation', () => {
  it('rejects malformed Markdown and unsafe HTML links', () => {
    expect(validatePublicValue('project.mdx', '[Evidence](https://)', 'body')).toHaveLength(1);
    expect(validatePublicValue('page.html', '<a href="javascript:alert(1)">link</a>', 'html')).toHaveLength(1);
    expect(validatePublicValue('project.mdx', '[Work](/work/) and [source](https://github.com/IsacZarate)', 'body')).toEqual([]);
    expect(validatePublicValue('page.html', '<script>const code = "] (ignored)"; items[0](async()=>{});</script><a href="/work/">Work</a>', 'html')).toEqual([]);
  });
  it('accepts reviewed public project data', () => {
    expect(validatePublicProject('project.mdx', validProject)).toEqual([]);
  });

  it('reports the source and nested field for forbidden markers and malformed links', () => {
    const issues = validatePublicValue('fixture.mdx', {
      summary: '[[UNVERIFIED]] claimed outcome',
      repositoryUrl: 'not-a-url',
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: 'fixture.mdx', field: 'summary' }),
        expect.objectContaining({ source: 'fixture.mdx', field: 'repositoryUrl' }),
      ]),
    );
    expect(formatContentIssues(issues)).toContain('fixture.mdx :: summary');
  });

  it('rejects a draft that enters the public collection', () => {
    const issues = validatePublicProject('draft.mdx', {
      ...validProject,
      draft: true,
      status: 'draft',
      verification: { reviewed: false },
      testing: [{ ...validProject.testing[0], verified: false }],
      outcomes: [{ ...validProject.outcomes[0], verified: false }],
    });

    expect(issues).toContainEqual({
      source: 'draft.mdx',
      field: 'draft',
      message: 'A draft project entered the public collection.',
    });
  });

  it('detects draft identifiers in generated HTML', () => {
    const issues = findDraftLeakage('dist/work/index.html', '<h2>Private draft title</h2>', [
      { slug: 'private-draft', title: 'Private draft title' },
    ]);

    expect(issues[0]).toMatchObject({ source: 'dist/work/index.html', field: 'title' });
  });
});
