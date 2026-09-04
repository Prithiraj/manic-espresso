import { expect, test } from '@playwright/test';

async function waitForGallery(page) {
  await page.waitForFunction(() => document.documentElement.dataset.v3Ready === 'true');
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.v3GalleryModel));
  await page.evaluate(() => document.fonts?.ready);
  await page.waitForTimeout(350);
}

async function frameGallery(page) {
  await page.evaluate(() => {
    const section = document.getElementById('gallery');
    const header = document.querySelector('.site-header');
    const top = section ? section.offsetTop - (header?.offsetHeight || 0) : 0;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(450);
}

test('Gallery photo table static desktop 1600x1000', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForGallery(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3GalleryModel)).toBe('ready');

  const gallery = page.locator('#gallery');
  await frameGallery(page);
  await expect(gallery.locator('#gallery-canvas')).toBeVisible();
  await expect(gallery.getByRole('heading', { name: 'Coffee, breakfast, and the room around it.' })).toBeVisible();
  await expect(gallery.locator('.gallery-photo img')).toHaveCount(3);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/gallery-static-desktop-1600x1000.png', fullPage: false });
});

test('Gallery photo table static mobile 390x844', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForGallery(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3GalleryModel)).toBe('ready');

  const gallery = page.locator('#gallery');
  await frameGallery(page);
  await expect(gallery.getByRole('heading', { name: 'Coffee, breakfast, and the room around it.' })).toBeVisible();
  await expect(gallery.locator('.gallery-photo img')).toHaveCount(3);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/gallery-static-mobile-390x844.png', fullPage: false });

  await page.evaluate(() => {
    const stage = document.querySelector('[data-gallery-stage]');
    const header = document.querySelector('.site-header');
    const top = stage ? stage.offsetTop + stage.parentElement.offsetTop - (header?.offsetHeight || 0) - 18 : 0;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(450);
  await expect(gallery.locator('#gallery-canvas')).toBeVisible();
  await page.screenshot({ path: 'qa-screenshots/gallery-static-mobile-stage-390x844.png', fullPage: false });
});

test('Gallery falls back to real photos when GLB is unavailable', async ({ page }) => {
  await page.route('**/models/manic-gallery.glb', (route) => route.abort());
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForGallery(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3GalleryModel)).toBe('fallback');

  const gallery = page.locator('#gallery');
  await frameGallery(page);
  await expect(gallery.locator('.gallery-photo img')).toHaveCount(3);
  await expect(gallery.locator('.gallery-photo img').first()).toBeVisible();
  await expect(gallery.locator('.gallery-fallback-note')).toBeVisible();
});
