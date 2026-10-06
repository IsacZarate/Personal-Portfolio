import { z } from 'zod';
import { resume } from './resume';

const httpsUrl = z.url().startsWith('https://');
export const siteConfigSchema = z.object({
  name: z.string().min(1), handle: z.string().min(1), role: z.string().min(1),
  description: z.string().min(20),
  domain: httpsUrl.refine((value) => { try { return new URL(value).pathname === '/'; } catch { return false; } }, 'Use a domain without a path.'),
  email: z.email().optional(), github: httpsUrl.optional(), linkedin: httpsUrl.optional(),
  resume: z.object({
    pdfPath: z.string().regex(/^\/(?!\/)(?!.*\.\.)[\w/-]+\.pdf$/).optional(),
    lastReviewed: z.iso.date().optional(),
  }),
});
export type SiteConfig = z.infer<typeof siteConfigSchema>;

export const siteConfig = siteConfigSchema.parse({
  name: 'Isac Zarate',
  handle: 'TheDevIsacZ',
  role: resume.headline,
  description:
    'Isac Zarate — Backend Engineer / SDET, with experience in application development, software testing, and API-based systems.',
  domain: 'https://isaczarate.com',
  github: 'https://github.com/IsacZarate',
  email: resume.email,
  resume: { pdfPath: '/resume/isac-zarate-resume.pdf', lastReviewed: resume.reviewedAt },
});

export function hasResumePdf(config: SiteConfig = siteConfig): config is SiteConfig & {
  resume: { pdfPath: string; lastReviewed?: string };
} {
  return Boolean(config.resume.pdfPath);
}
