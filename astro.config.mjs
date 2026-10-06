import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://isaczarate.com',
  output: 'static',
  markdown: { syntaxHighlight: 'prism' },
  trailingSlash: 'always',
  integrations: [mdx(), react(), sitemap({ filter: (page) => !/\/404(?:\.html|\/)?$/.test(page) })],
  security: { csp: {
    directives: ["default-src 'self'", "img-src 'self' data:", "font-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'none'"],
    scriptDirective: { resources: ["'self'"] },
    styleDirective: { resources: ["'self'"] },
  } },
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
