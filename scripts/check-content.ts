import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { siteConfig } from '../src/config/site';
import { resume } from '../src/config/resume';
import {
  findDraftLeakage,
  formatContentIssues,
  validatePublicProject,
  validatePublicValue,
  type ContentIssue,
} from '../src/lib/content-validation';
import { projectSchema, type Project } from '../src/lib/project-schema';

const repositoryRoot = resolve(import.meta.dirname, '..');
const projectDirectory = join(repositoryRoot, 'src', 'content', 'projects');

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function parseFrontmatter(path: string): unknown {
  const source = readFileSync(path, 'utf8');
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error(`${relative(repositoryRoot, path)} :: frontmatter — Missing YAML frontmatter.`);
  }

  return parseYaml(match[1]);
}

const issues: ContentIssue[] = [
  ...validatePublicValue('src/config/site.ts', siteConfig),
  ...validatePublicValue('src/data/resume.json', resume),
];
if (siteConfig.resume.pdfPath) {
  const pdf = join(repositoryRoot, 'public', siteConfig.resume.pdfPath);
  if (!existsSync(pdf) || readFileSync(pdf).subarray(0, 5).toString() !== '%PDF-') {
    issues.push({ source: 'src/config/site.ts', field: 'resume.pdfPath', message: 'Configured résumé must reference a real PDF in public/.' });
  }
}
const drafts: Project[] = [];

for (const path of walk(projectDirectory).filter((file) => ['.md', '.mdx'].includes(extname(file)))) {
  const source = relative(repositoryRoot, path).replaceAll('\\', '/');

  try {
    const rawProject = parseFrontmatter(path);
    const parsedProject = projectSchema.safeParse(rawProject);

    if (!parsedProject.success) {
      issues.push(
        ...parsedProject.error.issues.map((issue) => ({
          source,
          field: issue.path.join('.') || 'frontmatter',
          message: issue.message,
        })),
      );
      continue;
    }

    if (parsedProject.data.draft) {
      drafts.push(parsedProject.data);
    } else {
      issues.push(...validatePublicProject(source, parsedProject.data));
      issues.push(...validatePublicValue(source, readFileSync(path, 'utf8').replace(/^---[\s\S]*?\r?\n---/, ''), 'body'));
      for (const image of parsedProject.data.images) {
        if (image.src.startsWith('//') || image.src.includes('..') || !existsSync(join(repositoryRoot, 'public', image.src))) {
          issues.push({ source, field: 'images.src', message: 'Public image must exist within public/.' });
        }
      }
    }
  } catch (error) {
    issues.push({
      source,
      field: 'frontmatter',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

const outputDirectory = join(repositoryRoot, 'dist');
if (process.argv.includes('--require-build') && !existsSync(outputDirectory)) throw new Error('Production output is required. Run the build first.');
if (!process.argv.includes('--source-only') && existsSync(outputDirectory)) {
  for (const path of walk(outputDirectory).filter((file) => ['.html', '.xml', '.json', '.js', '.svg', '.txt'].includes(extname(file)))) {
    const source = relative(repositoryRoot, path).replaceAll('\\', '/');
    const rendered = readFileSync(path, 'utf8');
    issues.push(...findDraftLeakage(source, rendered, drafts));
    if (extname(path) === '.html') issues.push(...validatePublicValue(source, rendered, 'html'));
    for (const draft of drafts) for (const image of draft.images) {
      if (source.includes(image.src.slice(1)) || rendered.includes(image.src)) issues.push({ source, field: 'images', message: 'Draft media leaked into public output.' });
    }
  }
}

if (issues.length > 0) {
  console.error(`Public content validation failed:\n${formatContentIssues(issues)}`);
  process.exitCode = 1;
} else {
  console.log(`Public content validation passed (${drafts.length} unpublished draft projects excluded).`);
}
