import { describe, expect, it } from 'vitest';
import { hasResumePdf, siteConfig, siteConfigSchema, type SiteConfig } from './site';

describe('resume configuration', () => {
  it('rejects malformed social links and unsafe PDF paths', () => {
    expect(siteConfigSchema.safeParse({ ...siteConfig, github: 'not a URL' }).success).toBe(false);
    expect(siteConfigSchema.safeParse({ ...siteConfig, resume: { pdfPath: '//elsewhere/resume.pdf' } }).success).toBe(false);
  });
  it('uses the accessible HTML fallback when no PDF is configured', () => {
    expect(hasResumePdf(siteConfig)).toBe(false);
  });

  it('recognizes a configured PDF without inventing a default path', () => {
    const configured: SiteConfig = { ...siteConfig, resume: { pdfPath: '/resume.pdf' } };
    expect(hasResumePdf(configured)).toBe(true);
  });
});
