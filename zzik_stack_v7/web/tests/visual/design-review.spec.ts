import { test, expect } from '@playwright/test';

/**
 * ZZIK Design Review - Visual Regression Testing
 * Linear 2025 + Catalyst UI Kit compliance
 */

const pages = [
  { name: 'landing', url: '/', description: 'Landing page' },
  { name: 'matching', url: '/matching', description: 'Creator matching board' },
  { name: 'analytics', url: '/analytics', description: 'Analytics dashboard' },
  { name: 'assistant', url: '/assistant', description: 'AI Assistant' },
  { name: 'settings', url: '/settings', description: 'Settings page' },
];

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

for (const page of pages) {
  test.describe(`${page.description}`, () => {
    for (const viewport of viewports) {
      test(`${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page: pw }) => {
        // Set viewport
        await pw.setViewportSize({ 
          width: viewport.width, 
          height: viewport.height 
        });
        
        // Navigate to page
        await pw.goto(`http://localhost:3002${page.url}`, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });
        
        // Wait for fonts and images
        await pw.waitForTimeout(1000);
        
        // Disable animations for consistent screenshots
        await pw.addStyleTag({
          content: `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
            }
          `
        });
        
        // Take screenshot and compare
        await expect(pw).toHaveScreenshot(
          `${page.name}-${viewport.name}.png`,
          {
            fullPage: true,
            animations: 'disabled',
            maxDiffPixels: 100, // Allow 100px difference
            maxDiffPixelRatio: 0.01, // Allow 1% difference
            threshold: 0.2, // Tolerance for anti-aliasing
          }
        );
      });
    }
  });
}

// Design System Compliance Tests
test.describe('Design System Validation', () => {
  test('Color palette compliance', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    
    // Check if zinc colors are used
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // Should be white or zinc-50
    expect(['rgb(255, 255, 255)', 'rgb(250, 250, 250)']).toContain(bodyBg);
  });
  
  test('Button height compliance (WCAG 2.1 AA)', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    
    // Find primary CTA button
    const button = page.locator('a[href="/oauth/select"]').first();
    const box = await button.boundingBox();
    
    if (box) {
      // Should be 48-56px height
      expect(box.height).toBeGreaterThanOrEqual(48);
      expect(box.height).toBeLessThanOrEqual(56);
    }
  });
  
  test('Text contrast ratio (WCAG 2.1 AA)', async ({ page }) => {
    await page.goto('http://localhost:3002/');
    
    // Check main heading contrast
    const heading = page.locator('h1').first();
    const color = await heading.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // Should be zinc-900 or darker (high contrast)
    // rgb(24, 24, 27) = zinc-900
    expect(color).toBe('rgb(24, 24, 27)');
  });
});
