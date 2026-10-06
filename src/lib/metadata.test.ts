import { describe, expect, it } from 'vitest';
import { buildPageMetadata } from './metadata';

describe('buildPageMetadata', () => {
  it('creates a canonical URL beneath the configured production domain', () => {
    expect(
      buildPageMetadata({
        title: 'Work',
        description: 'Selected engineering work.',
        pathname: '/work',
      }),
    ).toMatchObject({
      canonical: 'https://isaczarate.com/work/',
      socialTitle: 'Work — Isac Zarate',
    });
  });

  it('keeps the home canonical at the domain root', () => {
    expect(
      buildPageMetadata({ title: 'Portfolio', description: 'Home.', pathname: '/' }).canonical,
    ).toBe('https://isaczarate.com/');
  });
});
