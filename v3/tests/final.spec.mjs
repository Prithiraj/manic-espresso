import { expect, test } from '@playwright/test';

async function waitForFinal(page) {
  await page.waitForFunction(() => document.documentElement.dataset.v3Ready === 'true');
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.v3FinalModel));
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(350);
}

async function frameFinal(page) {
  await page.evaluate(() => {
    const section = document.querySelector('.final-cta');
    const header = document.querySelector('.site-header');
    const top = section ? section.offsetTop - (header?.offsetHeight || 0) : 0;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(450);
}

test('Final ceramic callback static desktop 1600x1000', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForFinal(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3FinalModel)).toBe('ready');

  await frameFinal(page);
  await expect(page.locator('#final-canvas')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Found your next breakfast spot?' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get directions' }).last()).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/final-static-desktop-1600x1000.png', fullPage: false });
});

test('Final ceramic callback static mobile 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForFinal(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3FinalModel)).toBe('ready');

  await frameFinal(page);
  await expect(page.locator('#final-canvas')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Found your next breakfast spot?' })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/final-static-mobile-390x844.png', fullPage: false });
});

test('Final callback falls back to real coffee and semantic CTA', async ({ page }) => {
  await page.route('**/models/manic-final.glb', (route) => route.abort());
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForFinal(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3FinalModel)).toBe('fallback');

  await frameFinal(page);
  await expect(page.locator('.final-real-photo img')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Found your next breakfast spot?' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get directions' }).last()).toBeVisible();
  await expect(page.locator('.final-fallback-note')).toBeVisible();
});
