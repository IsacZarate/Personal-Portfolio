// @vitest-environment node
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
const code = readFileSync(new URL('../edge.js', import.meta.url), 'utf8').replace('__DOMAIN__', 'isaczarate.com');
function route(uri: string, host = 'isaczarate.com', querystring = {}) {
  return runInNewContext(`${code}\nhandler(event)`, { event: { request: { uri, headers: { host: { value: host } }, querystring } } });
}
describe('CloudFront request routing', () => {
  it.each([['/', '/index.html'], ['/about', '/about/index.html'], ['/work/one/', '/work/one/index.html'], ['/404', '/404.html']])('rewrites %s', (uri, expected) => expect(route(uri).uri).toBe(expected));
  it.each(['/robots.txt', '/_astro/app.hash.js', '/images/portrait.webp', '/resume.pdf', '/404.html'])('preserves %s', (uri) => expect(route(uri).uri).toBe(uri));
  it('redirects www, preserving path and encoded repeated query parameters', () => {
    const response = route('/work/', 'www.isaczarate.com', { tag: { multiValue: [{ value: 'full%20stack' }, { value: 'tests' }] } });
    expect(response.statusCode).toBe(301);
    expect(response.headers.location.value).toBe('https://isaczarate.com/work/?tag=full%20stack&tag=tests');
  });
  it('does not expose archived builds', () => expect(route('/_releases/abc/site.tar.gz').statusCode).toBe(404));
});
