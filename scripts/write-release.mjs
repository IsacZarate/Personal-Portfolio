import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
writeFileSync('dist/release.json', JSON.stringify({ revision }) + '\n');
