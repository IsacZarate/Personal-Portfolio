import { z } from 'zod';

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
  role: 'Full-stack engineer with an SDET mindset',
  description:
    'A portfolio about building useful software and the quality systems that make it dependable.',
  domain: 'https://isaczarate.com',
  github: 'https://github.com/IsacZarate',
  resume: {},
});

export function hasResumePdf(config: SiteConfig = siteConfig): config is SiteConfig & {
  resume: { pdfPath: string; lastReviewed?: string };
} {
  return Boolean(config.resume.pdfPath);
}
