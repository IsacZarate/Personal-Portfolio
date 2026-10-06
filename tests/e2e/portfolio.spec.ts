import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const coreRoutes = ['/', '/work/', '/about/', '/resume/'];
const draftSlugs = ['application-case-study', 'quality-system-case-study'];
test.beforeEach(async ({ page }) => {
  page.on('pageerror', (error) => { throw error; });
  page.on('console', (message) => {
    if (message.type() === 'error' && /content security policy|violates.*directive|refused to/i.test(message.text())) {
      throw new Error(message.text());
    }
  });
});

test.describe('public portfolio', () => {
  for (const route of coreRoutes) {
    test(`${route} is responsive and exposes page metadata`, async ({ page }, testInfo) => {
      await page.goto(route);

      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('header[data-site-header]')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        route === '/' ? 'https://isaczarate.com/' : `https://isaczarate.com${route}`,
      );
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Isac Zarate/);

      const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflows).toBe(false);
      await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveAttribute('content', /sha256-/);
      await page.screenshot({ path: testInfo.outputPath('page.png'), fullPage: true, animations: 'disabled' });
    });
  }

  test('primary navigation and mobile menu remain keyboard operable', async ({ page, isMobile }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();

    if (isMobile) {
      const menu = page.getByText('Menu', { exact: true });
      await menu.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.mobile-nav')).not.toHaveAttribute('open');
      await expect(menu).toBeFocused();
      await page.keyboard.press('Enter');
      await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'About' }).click();
    } else {
      await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'About' }).click();
    }

    await expect(page).toHaveURL(/\/about\/$/);
  });

  test('shows honest work and resume fallback states', async ({ page }) => {
    await page.goto('/work/');
    await expect(page.getByRole('heading', { name: /case studies are being prepared/i })).toBeVisible();
    await expect(page.locator('article.project-card')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /View repository|Open live project/i })).toHaveCount(0);

    await page.goto('/resume/');
    await expect(page.getByRole('note')).toContainText('No PDF download is shown');
    await expect(page.getByRole('link', { name: /download résumé pdf/i })).toHaveCount(0);
  });

  test('the interactive quality sequence supports its keyboard model', async ({ page }) => {
    await page.goto('/');
    await page.locator('.technical-panel').scrollIntoViewIfNeeded();
    const specify = page.getByRole('tab', { name: /specify/i });
    await specify.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: /build/i })).toBeFocused();
    await expect(page.getByRole('tabpanel')).toContainText(/architecture/i);
  });
});

test.describe('integrity and accessibility', () => {
  for (const route of coreRoutes) {
    test(`${route} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const blocking = results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
      expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
    });
  }

  test('draft routes and identifiers stay out of public output', async ({ page, request }) => {
    test.skip(test.info().project.name !== 'desktop-chromium', 'one integrity crawl is sufficient');
    for (const slug of draftSlugs) {
      expect((await request.get(`/work/${slug}/`)).status()).toBe(404);
    }

    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    for (const slug of draftSlugs) expect(sitemap).not.toContain(slug);

    await page.goto('/');
    for (const slug of draftSlugs) expect(await page.content()).not.toContain(slug);
  });

  test('all internal links on core routes resolve', async ({ page, request }) => {
    test.skip(test.info().project.name !== 'desktop-chromium', 'one link crawl is sufficient');
    const paths = new Set<string>();

    for (const route of coreRoutes) {
      await page.goto(route);
      for (const href of await page.locator('a[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
        if (href?.startsWith('/')) paths.add(new URL(href, 'http://local.test').pathname);
      }
    }

    for (const path of paths) {
      const response = await request.get(path);
      expect(response.status(), `Broken internal link: ${path}`).toBeLessThan(400);
    }
  });

  test('unknown routes use the branded recovery page', async ({ page }) => {
    const response = await page.goto('/route-that-does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: /path didn’t make the build/i })).toBeVisible();
    await page.getByRole('link', { name: 'Return home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('reduced motion removes reveal transforms', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const reveal = page.locator('[data-reveal]').first();
    await expect(reveal).toBeVisible();
    await expect(reveal).toHaveCSS('transform', 'none');
  });

  test('public content remains visible with JavaScript disabled', async ({ browser }) => {
    test.skip(test.info().project.name !== 'desktop-chromium', 'one no-script journey is sufficient');
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4321/');
    await expect(page.getByRole('heading', { name: /evidence before embellishment/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /case studies are being prepared/i })).toBeVisible();
    await expect(page.getByText('Cover content rules, browser journeys, accessibility, and infrastructure output.')).toBeVisible();
    await context.close();
  });
});
