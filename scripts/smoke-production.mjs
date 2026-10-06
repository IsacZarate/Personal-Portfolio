import assert from 'node:assert/strict';
const origin = 'https://isaczarate.com';
for (const route of ['/', '/work', '/about', '/resume']) {
  const response = await fetch(origin + route);
  assert.equal(response.status, 200, route);
  assert.match(response.headers.get('strict-transport-security') ?? '', /max-age=/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.match(response.headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/);
  assert.match(response.headers.get('cache-control') ?? '', /max-age=60/);
  assert.match(await response.text(), /http-equiv="content-security-policy"/i);
}
const www = await fetch('https://www.isaczarate.com/work?source=smoke', { redirect: 'manual' });
assert.equal(www.status, 301);
assert.equal(www.headers.get('location'), origin + '/work?source=smoke');
const http = await fetch('http://isaczarate.com/', { redirect: 'manual' });
assert.ok([301, 302, 307, 308].includes(http.status));
assert.equal((await fetch(origin + '/missing-production-smoke-page/')).status, 404);
const release = await (await fetch(origin + '/release.json', { cache: 'no-store' })).json();
assert.equal(release.revision, process.env.RELEASE_SHA);
console.log(`Production smoke checks passed for ${release.revision}.`);
