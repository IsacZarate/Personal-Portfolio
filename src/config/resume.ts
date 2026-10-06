import { z } from 'zod';
import source from '../data/resume.json';

const text = z.string().min(1);
export const resumeSchema = z.object({
  name: text,
  headline: text,
  email: z.email(),
  website: z.url().startsWith('https://'),
  reviewedAt: z.iso.date(),
  experience: z.object({ title: text, company: text, location: text, dates: text, responsibilities: z.array(text).min(1) }),
  education: z.object({ school: text, degree: text, dates: text, expectedGraduation: text }),
  skills: z.array(z.object({ category: text, items: z.array(text).min(1) })).min(1),
  project: z.object({ title: text, dates: text, summary: text }),
  languages: z.array(text).min(1),
});

export const resume = resumeSchema.parse(source);
