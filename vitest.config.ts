import 'vitest/config';
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'infra/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: [
        'src/config/site.ts',
        'src/components/QualitySequence.tsx',
        'src/lib/content-validation.ts',
        'src/lib/metadata.ts',
        'src/lib/project-actions.ts',
        'src/lib/project-schema.ts',
      ],
      exclude: ['infra/app.ts', 'infra/tests/**'],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
});
