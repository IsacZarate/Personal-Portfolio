import { describe, expect, it } from 'vitest';
import type { Project, ProjectEntry } from './project-schema';
import { filterPublishedProjects } from './project-schema';

function entry(slug: string, draft: boolean, reviewed: boolean): ProjectEntry {
  return {
    id: slug,
    data: {
      slug,
      title: `${slug} title`,
      summary: 'A sufficiently descriptive project summary for publication tests.',
      role: 'Engineer',
      dates: { start: '2026', end: '2026' },
      status: draft ? 'draft' : 'completed',
      stack: ['TypeScript'],
      responsibilities: ['Built a verified project responsibility'],
      architecture: 'A sufficiently detailed architecture explanation used by the filter test.',
      context: 'A synthetic testing context for publication filtering.',
      challenges: 'Keeping synthetic content outside production outputs.',
      retrospective: 'Reviewed fields pass the complete publication contract.',
      improvements: 'Add further fixtures as content requirements evolve.',
      testing: [{ label: 'Tests', detail: 'Verified quality evidence.', verified: reviewed, source: 'https://github.com/IsacZarate/Personal-Portfolio' }],
      outcomes: [{ label: 'Outcome', detail: 'Verified outcome evidence.', verified: reviewed, source: 'https://github.com/IsacZarate/Personal-Portfolio' }],
      images: [{ src: '/images/example.svg', alt: 'A descriptive project image for testing' }],
      draft,
      verification: { reviewed, ...(reviewed ? { reviewedAt: '2026-09-29' } : {}) },
    } satisfies Project,
  };
}

describe('filterPublishedProjects', () => {
  it('keeps only reviewed non-draft projects', () => {
    const published = filterPublishedProjects([
      entry('draft-project', true, false),
      entry('reviewed-project', false, true),
    ]);

    expect(published.map((project) => project.data.slug)).toEqual(['reviewed-project']);
  });

  it('returns an empty public collection when all projects are drafts', () => {
    expect(filterPublishedProjects([entry('one', true, false), entry('two', true, false)])).toEqual(
      [],
    );
  });
});
