import { projectSchema, type Project } from './project-schema';

export interface ContentIssue {
  source: string;
  field: string;
  message: string;
}

const forbiddenMarkers = [
  { pattern: /\b(?:TODO|TBD|FIXME)\b/i, label: 'placeholder token' },
  { pattern: /\[\[(?:PLACEHOLDER|UNVERIFIED|DRAFT CLAIM)\]\]/i, label: 'unapproved claim marker' },
  { pattern: /\b(?:lorem ipsum|example\.com)\b/i, label: 'placeholder content' },
] as const;

function isUrlField(field: string): boolean {
  return /(?:url|href)$/i.test(field);
}

function validateString(source: string, field: string, value: string): ContentIssue[] {
  const issues: ContentIssue[] = [];

  for (const marker of forbiddenMarkers) {
    if (marker.pattern.test(value)) {
      issues.push({
        source,
        field,
        message: `Contains a forbidden ${marker.label}.`,
      });
    }
  }

  if (isUrlField(field)) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== 'https:') {
        issues.push({ source, field, message: 'Public external URLs must use HTTPS.' });
      }
    } catch {
      issues.push({ source, field, message: 'Contains a malformed URL.' });
    }
  }

  if (field === 'body' || field === 'html') {
    // Generated inline JavaScript can contain strings that resemble Markdown.
    // Inspect markup attributes separately, without treating scripts as prose.
    const markup = value.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
    const links = [...markup.matchAll(/<[a-z][^>]*>/gi)].flatMap(([tag]) =>
      [...tag.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)],
    );
    if (field === 'body') links.push(...value.matchAll(/\]\(([^\s"')>]+)/g));
    for (const [, href] of links) {
      if (href.startsWith('#') || /^\/(?!\/)/.test(href)) continue;
      try {
        const parsed = new URL(href);
        if (!['https:', 'mailto:'].includes(parsed.protocol)) throw new Error('Unsupported URL protocol');
      } catch {
        issues.push({ source, field, message: `Malformed or unsafe public link: ${href}` });
      }
    }
  }

  return issues;
}

export function validatePublicValue(
  source: string,
  value: unknown,
  field = '$',
): ContentIssue[] {
  if (typeof value === 'string') {
    return validateString(source, field, value);
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      validatePublicValue(source, item, `${field}[${index}]`),
    );
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) =>
      validatePublicValue(source, item, field === '$' ? key : `${field}.${key}`),
    );
  }

  return [];
}

export function validatePublicProject(source: string, value: unknown): ContentIssue[] {
  const parsed = projectSchema.safeParse(value);

  if (!parsed.success) {
    return parsed.error.issues.map((issue) => ({
      source,
      field: issue.path.join('.') || '$',
      message: issue.message,
    }));
  }

  if (parsed.data.draft) {
    return [{ source, field: 'draft', message: 'A draft project entered the public collection.' }];
  }

  return validatePublicValue(source, parsed.data);
}

export function findDraftLeakage(
  source: string,
  renderedPublicContent: string,
  drafts: Pick<Project, 'slug' | 'title'>[],
): ContentIssue[] {
  const normalized = renderedPublicContent.toLocaleLowerCase();

  return drafts.flatMap((draft) =>
    [
      { field: 'slug', value: draft.slug },
      { field: 'title', value: draft.title },
    ].flatMap(({ field, value }) =>
      normalized.includes(value.toLocaleLowerCase())
        ? [{ source, field, message: `Draft ${field} leaked into public output.` }]
        : [],
    ),
  );
}

export function formatContentIssues(issues: ContentIssue[]): string {
  return issues.map((issue) => `${issue.source} :: ${issue.field} — ${issue.message}`).join('\n');
}
