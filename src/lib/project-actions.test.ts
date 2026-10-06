import { describe, expect, it } from 'vitest';
import { getProjectActions } from './project-actions';

describe('getProjectActions', () => {
  it('omits unavailable optional links', () => {
    expect(getProjectActions({})).toEqual([]);
  });

  it('returns only configured project actions', () => {
    expect(getProjectActions({ repositoryUrl: 'https://github.com/example/project' })).toEqual([
      { label: 'View repository', href: 'https://github.com/example/project' },
    ]);
    expect(getProjectActions({
      repositoryUrl: 'https://github.com/example/project',
      demoUrl: 'https://project.example.org',
    })).toHaveLength(2);
  });
});
