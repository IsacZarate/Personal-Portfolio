import { getCollection, type CollectionEntry } from 'astro:content';
import { filterPublishedProjects } from './project-schema';

export type PortfolioProject = CollectionEntry<'projects'>;

export async function getPublishedProjects(): Promise<PortfolioProject[]> {
  const projects = await getCollection('projects');
  return filterPublishedProjects(projects).sort((left, right) =>
    right.data.dates.end.localeCompare(left.data.dates.end),
  );
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  return (await getPublishedProjects()).map((project) => project.data.slug);
}
