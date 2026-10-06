import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

export async function GET() {
  const svg = readFileSync(resolve('public/images/social-card.svg'));
  const png = await sharp(svg).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}
