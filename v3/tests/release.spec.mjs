import { expect, test } from '@playwright/test';

const MODEL_DATASETS = [
  'v3Model',
  'v3WhyModel',
  'v3MenuModel',
  'v3CafeModel',
  'v3ReviewModel',
  'v3GalleryModel',
  'v3VisitModel',
  'v3FinalModel',
];

async function waitForRelease(page) {
  await page.waitForFunction(() => document.documentElement.dataset.v3Ready === 'true');
  await page.waitForFunction((keys) => keys.every((key) => Boolean(document.documentElement.dataset[key])), MODEL_DATASETS);
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(700);
}

async function assertAllModelsReady(page) {
  const states = await page.evaluate((keys) => Object.fromEntries(
    keys.map((key) => [key, document.documentElement.dataset[key] || 'missing']),
  ), MODEL_DATASETS);

  for (const key of MODEL_DATASETS) {
    expect(states[key], `${key} should load for the release render`).toBe('ready');
  }
}

test('V3 reduced-motion desktop release frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForRelease(page);
  await assertAllModelsReady(page);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get directions' }).first()).toBeVisible();

  await page.screenshot({
    path: 'qa-screenshots/release-desktop-1600x1000-full.png',
    fullPage: true,
  });
});

test('V3 reduced-motion mobile release frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForRelease(page);
  await assertAllModelsReady(page);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.screenshot({
    path: 'qa-screenshots/release-mobile-390x844-full.png',
    fullPage: true,
  });
});
