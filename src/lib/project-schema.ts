import { z } from 'zod';

const evidenceSchema = z.object({
  label: z.string().min(3),
  detail: z.string().min(12),
  verified: z.boolean(),
  source: z.url().startsWith('https://').optional(),
});

export const projectSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(3),
    summary: z.string().min(24),
    role: z.string().min(3),
    dates: z.object({
      start: z.string().min(4),
      end: z.string().min(4),
    }),
    status: z.enum(['completed', 'ongoing', 'draft']),
    stack: z.array(z.string().min(1)).min(1),
    responsibilities: z.array(z.string().min(8)).min(1),
    architecture: z.string().min(40),
    context: z.string().min(20).optional(),
    challenges: z.string().min(20).optional(),
    retrospective: z.string().min(20).optional(),
    improvements: z.string().min(20).optional(),
    testing: z.array(evidenceSchema).min(1),
    outcomes: z.array(evidenceSchema).min(1),
    images: z
      .array(
        z.object({
          src: z.string().startsWith('/'),
          alt: z.string().min(12),
        }),
      )
      .min(1),
    draft: z.boolean(),
    repositoryUrl: z.url().startsWith('https://').optional(),
    demoUrl: z.url().startsWith('https://').optional(),
    verification: z.object({
      reviewed: z.boolean(),
      reviewedAt: z.iso.date().optional(),
    }),
  })
  .superRefine((project, context) => {
    if (!project.draft && !project.verification.reviewed) {
      context.addIssue({
        code: 'custom',
        path: ['verification', 'reviewed'],
        message: 'Published projects require reviewed evidence.',
      });
    }

    if (!project.draft && !project.verification.reviewedAt) {
      context.addIssue({
        code: 'custom',
        path: ['verification', 'reviewedAt'],
        message: 'Published projects require a review date.',
      });
    }

    if (!project.draft) {
      for (const field of ['context', 'challenges', 'retrospective', 'improvements'] as const) {
        if (!project[field]) context.addIssue({ code: 'custom', path: [field], message: 'Published case studies require this narrative section.' });
      }
      if (project.status === 'draft') context.addIssue({ code: 'custom', path: ['status'], message: 'A published project cannot have draft status.' });
      [...project.testing, ...project.outcomes].forEach((evidence, index) => {
        if (!evidence.verified) {
          context.addIssue({
            code: 'custom',
            path: ['evidence', index, 'verified'],
            message: 'Every published evidence item must be verified.',
          });
        }
        if (!evidence.source) context.addIssue({ code: 'custom', path: ['evidence', index, 'source'], message: 'Published evidence requires a supporting source URL.' });
      });
    }
  });

export type Project = z.infer<typeof projectSchema>;

export interface ProjectEntry<TData extends Project = Project> {
  id: string;
  data: TData;
}

export function isPublishedProject(entry: ProjectEntry): boolean {
  return !entry.data.draft && projectSchema.safeParse(entry.data).success;
}

export function filterPublishedProjects<TEntry extends ProjectEntry>(entries: TEntry[]): TEntry[] {
  return entries.filter(isPublishedProject);
}
