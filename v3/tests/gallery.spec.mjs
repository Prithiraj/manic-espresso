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

async function frameGalleryStage(page) {
  await page.evaluate(() => {
    const stage = document.querySelector('[data-gallery-stage]');
    const header = document.querySelector('.site-header');
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const top = window.scrollY + rect.top - (header?.offsetHeight || 0) - 18;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(450);
}

async function frameGalleryEntering(page) {
  await page.evaluate(() => {
    const section = document.getElementById('gallery');
    if (!section) return;
    window.scrollTo({
      top: Math.max(0, section.offsetTop - window.innerHeight * 0.78),
      behavior: 'instant',
    });
  });
  await page.waitForTimeout(800);
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

  await frameGalleryStage(page);
  await expect(gallery.locator('#gallery-canvas')).toBeVisible();
  await page.screenshot({ path: 'qa-screenshots/gallery-static-desktop-stage-1600x1000.png', fullPage: false });
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

  await frameGalleryStage(page);
  await expect(gallery.locator('#gallery-canvas')).toBeVisible();
  await page.screenshot({ path: 'qa-screenshots/gallery-static-mobile-stage-390x844.png', fullPage: false });
});

test('Gallery camera and real photo cards respond to scroll when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForGallery(page);
  expect(await page.evaluate(() => document.documentElement.dataset.v3GalleryModel)).toBe('ready');

  await frameGalleryEntering(page);
  const stage = page.locator('[data-gallery-stage]');
  const wide = page.locator('.gallery-photo-wide');
  const beforeProgress = Number(await stage.getAttribute('data-gallery-progress') || 0);
  const beforeTransform = await wide.evaluate((el) => getComputedStyle(el).transform);
  expect(beforeProgress).toBeLessThan(0.30);

  await page.evaluate(() => {
    const section = document.getElementById('gallery');
    if (!section) return;
    window.scrollTo({
      top: Math.max(0, section.offsetTop - window.innerHeight * 0.10),
      behavior: 'instant',
    });
  });
  await page.waitForTimeout(1200);

  const afterProgress = Number(await stage.getAttribute('data-gallery-progress') || 0);
  const afterTransform = await wide.evaluate((el) => getComputedStyle(el).transform);
  expect(afterProgress).toBeGreaterThan(beforeProgress + 0.08);
  expect(afterTransform).not.toBe(beforeTransform);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: 'qa-screenshots/gallery-motion-mid-1600x1000.png', fullPage: false });
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
