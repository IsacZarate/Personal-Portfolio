// @vitest-environment node
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { validateDeploymentConfig } from '../../scripts/deployment-config.mjs';
const read = (file: string) => readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
describe('delivery gates', () => {
  it('runs quality on main pushes and pull requests without AWS permissions', () => {
    const workflow = parse(read('.github/workflows/quality.yml'));
    expect(workflow.on.push.branches).toEqual(['main']);
    expect(workflow.on).toHaveProperty('pull_request');
    expect(workflow.permissions).toEqual({ contents: 'read' });
    const commands = workflow.jobs.quality.steps.map((step: { run?: string }) => step.run).filter(Boolean).join('\n');
    for (const command of ['openspec:validate', 'lint:content', 'check', 'test:coverage', 'build', 'test:e2e', 'test:lighthouse', 'infra:synth']) expect(commands).toContain(`pnpm ${command}`);
    expect(commands).not.toMatch(/infra:deploy|cdk deploy|aws /);
  });
  it('requires manual authorization, config and successful quality before OIDC', () => {
    const workflow = parse(read('.github/workflows/deploy.yml'));
    expect(Object.keys(workflow.on)).toEqual(['workflow_dispatch']);
    expect(workflow.on.workflow_dispatch.inputs.authorize.default).toBe(false);
    expect(workflow.jobs.deploy.needs).toEqual(['configuration', 'quality']);
    expect(workflow.jobs.configuration.permissions).toBeUndefined();
    expect(workflow.jobs.deploy.permissions['id-token']).toBe('write');
    expect(() => validateDeploymentConfig({ GITHUB_REF: 'refs/heads/main' })).toThrow('authorized');
    expect(() => validateDeploymentConfig({ GITHUB_REF: 'refs/heads/main', DEPLOY_AUTHORIZED: 'true', AWS_DEPLOYMENT_ENABLED: 'true' })).toThrow('AWS_ACCOUNT_ID');
    expect(() => validateDeploymentConfig({ GITHUB_REF: 'refs/heads/feature' })).toThrow('main');
  });
});
