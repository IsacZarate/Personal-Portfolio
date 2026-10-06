import type { Project } from './project-schema';

export interface ProjectAction {
  label: string;
  href: string;
}

export function getProjectActions(
  project: Pick<Project, 'repositoryUrl' | 'demoUrl'>,
): ProjectAction[] {
  return [
    project.repositoryUrl ? { label: 'View repository', href: project.repositoryUrl } : undefined,
    project.demoUrl ? { label: 'Open live project', href: project.demoUrl } : undefined,
  ].filter((action): action is ProjectAction => Boolean(action));
}
