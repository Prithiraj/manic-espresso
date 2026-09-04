import { expect, test } from '@playwright/test';

async function waitForVisit(page) {
  await page.waitForFunction(() => document.documentElement.dataset.v3Ready === 'true');
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.v3VisitModel));
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(350);
}

async function frameVisit(page) {
  await page.evaluate(() => {
    const section = document.getElementById('visit');
    const header = document.querySelector('.site-header');
    const top = section ? section.offsetTop - (header?.offsetHeight || 0) : 0;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(450);
}

test('Visit location token static desktop 1600x1000', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForVisit(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3VisitModel)).toBe('ready');

  const visit = page.locator('#visit');
  await frameVisit(page);
  await expect(visit.locator('#visit-canvas')).toBeVisible();
  await expect(visit.getByRole('heading', { name: 'Find Manic on Murray Street.' })).toBeVisible();
  await expect(visit.locator('address').getByText('27 Murray St', { exact: true })).toBeVisible();
  await expect(visit.getByText('Monday–Saturday', { exact: true })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/visit-static-desktop-1600x1000.png', fullPage: false });
});

test('Visit location token static mobile 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForVisit(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3VisitModel)).toBe('ready');

  const visit = page.locator('#visit');
  await frameVisit(page);
  await expect(visit.getByRole('heading', { name: 'Find Manic on Murray Street.' })).toBeVisible();
  await expect(visit.locator('address').getByText('27 Murray St', { exact: true })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/visit-static-mobile-390x844.png', fullPage: false });
});

test('Visit location token falls back to real exterior and semantic contact details', async ({ page }) => {
  await page.route('**/models/manic-visit.glb', (route) => route.abort());
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForVisit(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3VisitModel)).toBe('fallback');

  const visit = page.locator('#visit');
  await frameVisit(page);
  await expect(visit.locator('.visit-real-photo img')).toBeVisible();
  await expect(visit.locator('address').getByText('27 Murray St', { exact: true })).toBeVisible();
  await expect(visit.getByRole('link', { name: '0401 866 609' })).toBeVisible();
  await expect(visit.locator('.visit-fallback-note')).toBeVisible();
});
