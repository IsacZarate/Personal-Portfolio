import { describe, expect, it } from 'vitest';
import { projectSchema } from './project-schema';

const validDraft = {
  slug: 'verified-shape',
  title: 'Verified shape',
  summary: 'A sufficiently descriptive summary for schema verification.',
  role: 'Engineer',
  dates: { start: '2026', end: '2026' },
  status: 'draft' as const,
  stack: ['TypeScript'],
  responsibilities: ['Implemented the verified project behavior'],
  architecture: 'A sufficiently detailed architecture explanation used by the schema test.',
  testing: [{ label: 'Unit tests', detail: 'A reproducible testing detail.', verified: false }],
  outcomes: [{ label: 'Outcome', detail: 'A supported outcome description.', verified: false }],
  images: [{ src: '/images/example.svg', alt: 'Descriptive project image alternative text' }],
  draft: true,
  verification: { reviewed: false },
};

describe('projectSchema', () => {
  it('accepts a complete private draft', () => {
    expect(projectSchema.safeParse(validDraft).success).toBe(true);
  });

  it('rejects missing required content', () => {
    const { summary: _summary, ...incomplete } = validDraft;
    const result = projectSchema.safeParse(incomplete);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'summary')).toBe(true);
    }
  });

  it('rejects an unreviewed public project', () => {
    const result = projectSchema.safeParse({ ...validDraft, draft: false, status: 'completed' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        'Published projects require reviewed evidence.',
      );
    }
  });
});
