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
  test('the redesigned home introduces sourced experience and working recruiter actions', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.protocol.startsWith('http') && url.hostname !== '127.0.0.1') externalRequests.push(url.href);
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Backend Engineer / SDET');
    await expect(page.getByRole('heading', { name: 'Engineering Intern · VivoSense' })).toBeVisible();
    await expect(page.getByText('June 2025–Present', { exact: true })).toBeVisible();
    const skills = page.getByRole('list', { name: 'Selected technical skills' });
    await expect(skills).toContainText('Java');
    await expect(skills).toContainText('Python');
    await expect(skills).toContainText('Selenium');
    await expect(page.getByRole('link', { name: 'Let’s connect by email' })).toHaveAttribute('href', 'mailto:isaczarate805@gmail.com');
    await expect(page.locator('iframe')).toHaveCount(0);
    expect(externalRequests).toEqual([]);
    await page.getByRole('link', { name: 'View résumé', exact: true }).click();
    await expect(page).toHaveURL(/\/resume\/$/);
    await expect(page.getByRole('link', { name: 'Download résumé PDF', exact: true })).toBeVisible();
  });

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
      if (route === '/') {
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: testInfo.outputPath('hero.png'), animations: 'disabled' });
      }
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

  test('shows an empty work state while ClassSeek remains a resume overview', async ({ page, request }) => {
    await page.goto('/work/');
    await expect(page.getByRole('heading', { name: /case studies are being prepared/i })).toBeVisible();
    await expect(page.locator('article.project-card')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /View repository|Open live project/i })).toHaveCount(0);
    await expect(page.getByText('ClassSeek')).toHaveCount(0);
    await page.goto('/');
    await expect(page.getByText('ClassSeek')).toHaveCount(0);
    expect((await request.get('/work/classseek/')).status()).toBe(404);
    expect(await (await request.get('/sitemap-0.xml')).text()).not.toContain('/work/classseek');

    await page.goto('/resume/');
    await expect(page.getByRole('heading', { name: 'ClassSeek', exact: true })).toBeVisible();
  });

  test('publishes sourced resume details and working PDF and email actions', async ({ page, request }) => {
    await page.goto('/resume/');
    await expect(page.getByRole('heading', { name: 'Engineering Intern at VivoSense' })).toBeVisible();
    await expect(page.getByText(/June 2025–Present/)).toBeVisible();
    await expect(page.getByText(/Expected graduation: May 2027/)).toBeVisible();
    const email = page.getByRole('link', { name: 'isaczarate805@gmail.com', exact: true });
    await expect(email).toHaveAttribute('href', 'mailto:isaczarate805@gmail.com');
    const view = page.getByRole('link', { name: 'View résumé PDF', exact: true });
    const download = page.getByRole('link', { name: 'Download résumé PDF', exact: true });
    await expect(view).toHaveAttribute('href', '/resume/isac-zarate-resume.pdf');
    await expect(download).toHaveAttribute('download', 'isac-zarate-resume.pdf');
    await view.focus();
    await expect(view).toBeFocused();
    const pdf = await request.get('/resume/isac-zarate-resume.pdf');
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()['content-type']).toContain('application/pdf');
    const body = await pdf.body();
    expect(body.subarray(0, 5).toString()).toBe('%PDF-');
    const downloaded = page.waitForEvent('download');
    await download.click();
    const file = await downloaded;
    expect(file.suggestedFilename()).toBe('isac-zarate-resume.pdf');
    expect(await file.failure()).toBeNull();
    await page.goto('/about/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Backend Engineer / SDET');
    await expect(page.getByText(/graduation expected in May 2027/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'isaczarate805@gmail.com', exact: true })).toBeVisible();
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
    await expect(page.getByRole('heading', { name: /a closer look at the work/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /case studies are being prepared/i })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Selected technical skills' })).toContainText('Python');
    await expect(page.getByText('Cover content rules, browser journeys, accessibility, and infrastructure output.')).toBeVisible();
    await context.close();
  });
});
