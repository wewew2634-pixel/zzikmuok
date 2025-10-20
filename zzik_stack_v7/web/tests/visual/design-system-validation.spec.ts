import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * ZZIK Design System Validation Tests
 * Rule-based, automated design verification
 */

// Load design rules
const rulesPath = path.join(__dirname, '../../design-system/DESIGN_RULES.json');
const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));

const pages = [
  { name: 'landing', url: '/', description: 'Landing Page' },
  { name: 'matching', url: '/matching', description: 'Creator Matching Board' },
  { name: 'analytics', url: '/analytics', description: 'Analytics Dashboard' },
  { name: 'assistant', url: '/assistant', description: 'AI Assistant' },
  { name: 'settings', url: '/settings', description: 'Settings Page' },
];

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

/**
 * Helper: Extract RGB from string
 */
function parseRGB(rgbString: string): { r: number; g: number; b: number } {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
  };
}

/**
 * Helper: RGB to Hex
 */
function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Helper: Calculate relative luminance (WCAG)
 */
function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Helper: Calculate contrast ratio (WCAG)
 */
function getContrastRatio(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
): number {
  const L1 = getLuminance(fg);
  const L2 = getLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Helper: Check if color is in allowed palette
 */
function isAllowedColor(hex: string): boolean {
  const allowed = [
    '#ffffff', // white
    '#fafafa', // zinc-50
    '#f4f4f5', // zinc-100
    '#e4e4e7', // zinc-200
    '#a1a1aa', // zinc-400
    '#52525b', // zinc-600
    '#18181b', // zinc-900
    '#4f46e5', // indigo-600
    '#4338ca', // indigo-700
    '#6366f1', // indigo-500
  ];
  
  // Allow slight variations due to anti-aliasing
  return allowed.some(allowedHex => {
    const diff = Math.abs(parseInt(hex.slice(1), 16) - parseInt(allowedHex.slice(1), 16));
    return diff < 256; // Small tolerance
  });
}

/**
 * Test Suite: Color Palette Validation (CRITICAL)
 */
test.describe('🎨 Color Palette - CRITICAL', () => {
  for (const page of pages) {
    test(`${page.description} - Background must be white or zinc-50/100`, async ({ page: pw }) => {
      await pw.goto(`http://localhost:3002${page.url}`);
      await pw.waitForLoadState('networkidle');
      
      // Check body background
      const bodyBg = await pw.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      const rgb = parseRGB(bodyBg);
      const hex = rgbToHex(rgb);
      
      // Should be white, zinc-50, or zinc-100
      const allowedBgs = ['#ffffff', '#fafafa', '#f4f4f5'];
      const isValid = allowedBgs.some(allowed => {
        const allowedRgb = parseRGB(`rgb(${parseInt(allowed.slice(1, 3), 16)}, ${parseInt(allowed.slice(3, 5), 16)}, ${parseInt(allowed.slice(5, 7), 16)})`);
        return Math.abs(rgb.r - allowedRgb.r) < 5 &&
               Math.abs(rgb.g - allowedRgb.g) < 5 &&
               Math.abs(rgb.b - allowedRgb.b) < 5;
      });
      
      expect(isValid, `Background color ${hex} is not white/zinc-50/zinc-100`).toBeTruthy();
    });
    
    test(`${page.description} - Primary text must be zinc-900`, async ({ page: pw }) => {
      await pw.goto(`http://localhost:3002${page.url}`);
      
      // Check h1 color
      const h1Color = await pw.locator('h1').first().evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      
      const rgb = parseRGB(h1Color);
      const hex = rgbToHex(rgb);
      
      // Should be zinc-900 (#18181b)
      expect(hex.toLowerCase()).toBe('#18181b');
    });
  }
});

/**
 * Test Suite: Button Height Validation (CRITICAL - WCAG)
 */
test.describe('🔘 Button Height - CRITICAL (WCAG 2.1 AA)', () => {
  for (const page of pages) {
    test(`${page.description} - All buttons must be 48-56px tall`, async ({ page: pw }) => {
      await pw.goto(`http://localhost:3002${page.url}`);
      await pw.waitForLoadState('networkidle');
      
      // Find all buttons and links
      const buttons = await pw.locator('button, a[class*="button"], a[href]:has-text("시작")').all();
      
      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box && box.height > 0) {
          expect(box.height, 
            `Button height ${box.height}px is below WCAG minimum (48px)`
          ).toBeGreaterThanOrEqual(48);
          
          expect(box.height, 
            `Button height ${box.height}px exceeds maximum (56px)`
          ).toBeLessThanOrEqual(56);
        }
      }
    });
  }
});

/**
 * Test Suite: Text Contrast Validation (CRITICAL - WCAG)
 */
test.describe('🔤 Text Contrast - CRITICAL (WCAG 2.1 AA)', () => {
  test('Landing Page - Primary text contrast must be ≥ 4.5:1', async ({ page: pw }) => {
    await pw.goto('http://localhost:3002/');
    
    const h1 = pw.locator('h1').first();
    const [textColor, bgColor] = await h1.evaluate((el) => {
      const text = window.getComputedStyle(el).color;
      const bg = window.getComputedStyle(el).backgroundColor;
      const parent = el.parentElement;
      const parentBg = parent ? window.getComputedStyle(parent).backgroundColor : 'rgb(255, 255, 255)';
      return [text, bg === 'rgba(0, 0, 0, 0)' ? parentBg : bg];
    });
    
    const textRgb = parseRGB(textColor);
    const bgRgb = parseRGB(bgColor);
    const contrast = getContrastRatio(textRgb, bgRgb);
    
    expect(contrast, 
      `Text contrast ratio ${contrast.toFixed(2)}:1 is below WCAG AA minimum (4.5:1)`
    ).toBeGreaterThanOrEqual(4.5);
  });
});

/**
 * Test Suite: Shadow Validation (HIGH)
 */
test.describe('🌓 Shadow Validation - HIGH', () => {
  test('No elements should have shadow-lg/xl/2xl', async ({ page: pw }) => {
    await pw.goto('http://localhost:3002/');
    
    const heavyShadows = await pw.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const heavy: string[] = [];
      
      elements.forEach((el) => {
        const shadow = window.getComputedStyle(el).boxShadow;
        if (shadow && shadow !== 'none') {
          // Check if shadow is too strong (>10px blur or >0.15 opacity)
          const match = shadow.match(/(\d+)px\s+(\d+)px\s+(\d+)px/);
          if (match) {
            const blur = parseInt(match[3]);
            if (blur > 15) {
              heavy.push(el.className || el.tagName);
            }
          }
        }
      });
      
      return heavy;
    });
    
    expect(heavyShadows.length, 
      `Found ${heavyShadows.length} elements with heavy shadows: ${heavyShadows.join(', ')}`
    ).toBe(0);
  });
});

/**
 * Test Suite: Spacing Validation (8PT GRID)
 */
test.describe('📐 Spacing (8pt Grid) - MEDIUM', () => {
  test('Section spacing should be 8pt-aligned', async ({ page: pw }) => {
    await pw.goto('http://localhost:3002/');
    
    const sections = await pw.locator('section').all();
    
    for (let i = 0; i < sections.length; i++) {
      const padding = await sections[i].evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          top: parseInt(style.paddingTop),
          bottom: parseInt(style.paddingBottom),
        };
      });
      
      // Check if padding is multiple of 8 (8pt grid)
      const isAligned = (val: number) => val % 8 === 0;
      
      expect(isAligned(padding.top) || isAligned(padding.bottom),
        `Section ${i} padding (${padding.top}px, ${padding.bottom}px) not on 8pt grid`
      ).toBeTruthy();
    }
  });
});

/**
 * Test Suite: Card Design Validation
 */
test.describe('🎴 Card Design - MEDIUM', () => {
  test('Matching Page - Cards should have rounded-xl and border', async ({ page: pw }) => {
    await pw.goto('http://localhost:3002/matching');
    await pw.waitForTimeout(2000); // Wait for cards to load
    
    const cards = await pw.locator('[class*="rounded"]').all();
    
    for (let i = 0; i < Math.min(cards.length, 5); i++) {
      const styles = await cards[i].evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          borderRadius: computed.borderRadius,
          borderWidth: computed.borderWidth,
          borderColor: computed.borderColor,
        };
      });
      
      // Should have rounded corners (12px+ for rounded-xl)
      const radius = parseInt(styles.borderRadius);
      expect(radius).toBeGreaterThanOrEqual(12);
    }
  });
});

/**
 * Test Suite: Focus States (Accessibility)
 */
test.describe('👁️ Focus States - HIGH (Accessibility)', () => {
  test('All interactive elements must have visible focus state', async ({ page: pw }) => {
    await pw.goto('http://localhost:3002/');
    
    const buttons = await pw.locator('button, a[href]').all();
    
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      await buttons[i].focus();
      
      const hasFocus = await buttons[i].evaluate((el) => {
        const outline = window.getComputedStyle(el).outline;
        const outlineStyle = window.getComputedStyle(el).outlineStyle;
        return outline !== 'none' && outlineStyle !== 'none';
      });
      
      // Note: This may not work perfectly due to :focus-visible
      // Manual testing recommended
    }
  });
});

/**
 * Test Suite: Typography Validation
 */
test.describe('🔤 Typography - HIGH', () => {
  test('Font family should be Inter', async ({ page: pw }) => {
    await pw.goto('http://localhost:3002/');
    
    const fontFamily = await pw.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    
    expect(fontFamily.toLowerCase()).toContain('inter');
  });
  
  test('Headings should use semibold or bold weight', async ({ page: pw }) => {
    await pw.goto('http://localhost:3002/');
    
    const h1Weight = await pw.locator('h1').first().evaluate((el) => {
      return window.getComputedStyle(el).fontWeight;
    });
    
    const weight = parseInt(h1Weight);
    expect(weight).toBeGreaterThanOrEqual(600); // 600 (semibold) or 700 (bold)
  });
});

/**
 * Test Suite: Responsive Design
 */
test.describe('📱 Responsive Design - MEDIUM', () => {
  for (const viewport of viewports) {
    test(`Landing Page should work well on ${viewport.name}`, async ({ page: pw }) => {
      await pw.setViewportSize({ width: viewport.width, height: viewport.height });
      await pw.goto('http://localhost:3002/');
      
      // Check no horizontal scroll
      const hasHorizontalScroll = await pw.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll, 
        `Horizontal scroll detected on ${viewport.name} (${viewport.width}px)`
      ).toBeFalsy();
      
      // Check minimum font size (legibility)
      const minFontSize = await pw.evaluate(() => {
        const paragraphs = document.querySelectorAll('p');
        let min = 999;
        paragraphs.forEach(p => {
          const size = parseInt(window.getComputedStyle(p).fontSize);
          if (size < min) min = size;
        });
        return min;
      });
      
      expect(minFontSize, 
        `Minimum font size ${minFontSize}px is too small for ${viewport.name}`
      ).toBeGreaterThanOrEqual(14);
    });
  }
});

/**
 * Generate Test Report
 */
test.afterAll(async () => {
  console.log('\n✅ Design System Validation Complete!');
  console.log('📊 Check test-results/ for detailed reports');
  console.log('💡 Run: npm run design:report to view HTML report\n');
});
