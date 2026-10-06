import { chromium } from '@playwright/test';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

// Keep one browser under Playwright's lifecycle. Lighthouse connects to it instead
// of racing Windows profile locks while launching and deleting a browser per URL.
const server = createServer();
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const port = server.address().port;
await new Promise((resolve) => server.close(resolve));
const browser = await chromium.launch({ args: [`--remote-debugging-port=${port}`] });
try {
  const require = createRequire(import.meta.url);
  const child = spawn(process.execPath, [require.resolve('@lhci/cli/src/cli.js'), 'autorun', `--collect.settings.port=${port}`], { stdio: 'inherit' });
  process.exitCode = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', (code) => resolve(code ?? 1)); });
} finally {
  await browser.close();
}
