/**
 * Loop Agent - Capture Agent
 * 
 * Captures screenshots using Playwright with Retina support
 * 
 * @version 1.0.0
 */

import { chromium, Browser, Page } from 'playwright';
import { PageConfig, Screenshot } from './types';
import crypto from 'crypto';

export class CaptureAgent {
  private browser: Browser | null = null;
  
  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
  
  /**
   * Capture screenshots for all pages (parallel)
   */
  async captureAll(pages: PageConfig[]): Promise<Screenshot[]> {
    if (!this.browser) {
      await this.initialize();
    }
    
    console.log(`📸 Capturing ${pages.length} pages...`);
    
    // Parallel capture with Promise.all
    const screenshots = await Promise.all(
      pages.map(page => this.capturePage(page))
    );
    
    console.log(`✅ Captured ${screenshots.length} screenshots`);
    
    return screenshots;
  }
  
  /**
   * Capture single page with Retina support
   */
  async capturePage(pageConfig: PageConfig): Promise<Screenshot> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
    
    const viewport = pageConfig.viewport || {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2  // Retina
    };
    
    console.log(`  📸 ${pageConfig.name} (${pageConfig.url})`);
    
    // Create context with geolocation permission granted
    const context = await this.browser.newContext({ 
      viewport,
      geolocation: { latitude: 37.4979, longitude: 127.0276 }, // 강남 좌표
      permissions: ['geolocation'], // 위치 권한 자동 허용
    });
    const page = await context.newPage();
    
    try {
      // Navigate to page
      await page.goto(pageConfig.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // Wait for critical elements
      if (pageConfig.waitForSelectors && pageConfig.waitForSelectors.length > 0) {
        await Promise.all(
          pageConfig.waitForSelectors.map(selector =>
            page.waitForSelector(selector, { timeout: 5000 }).catch(() => {
              console.warn(`    ⚠️  Selector not found: ${selector}`);
            })
          )
        );
      }
      
      // Additional wait for animations
      await page.waitForTimeout(500);
      
      // Capture screenshot
      const buffer = await page.screenshot({
        fullPage: true,
        type: 'png'
      });
      
      // 🆕 DOM 정보 수집
      const domInfo = await this.collectDOMInfo(page);
      
      const screenshot: Screenshot = {
        pageId: pageConfig.id,
        buffer,
        url: pageConfig.url,
        timestamp: Date.now(),
        viewport,
        hash: this.generateHash(buffer),
        domInfo  // 추가
      };
      
      console.log(`    ✅ Captured (${Math.round(buffer.length / 1024)}KB)`);
      
      return screenshot;
      
    } catch (error) {
      console.error(`    ❌ Failed to capture ${pageConfig.name}:`, error);
      throw error;
    } finally {
      await context.close();
    }
  }
  
  /**
   * 🆕 DOM 정보 수집 (정확한 측정)
   */
  private async collectDOMInfo(page: Page): Promise<any> {
    // Use string-based evaluation to avoid tsx __name injection
    const scriptString = `
      (function() {
        // RGB를 HEX로 변환
        function rgbToHex(rgb) {
          var match = rgb.match(/^rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)$/);
          if (!match) return rgb;
          
          function hex(x) {
            var h = x.toString(16);
            return h.length === 1 ? '0' + h : h;
          }
          
          return '#' + hex(parseInt(match[1])) + hex(parseInt(match[2])) + hex(parseInt(match[3]));
        }
        
        // 픽셀 값 추출
        function extractPixels(value) {
          var match = value.match(/(\\d+(\\.\\d+)?)px/);
          return match ? parseFloat(match[1]) : 0;
        }
      
      var backgrounds = [];
      var spacing = [];
      var typography = [];
      var glassmorphism = [];
      var animations = [];
      var buttons = [];
      
      var exactBlackCount = 0;
      var invalidSpacingCount = 0;
      var glassmorphismCount = 0;
      var invalidAnimationCount = 0;
      var smallButtonCount = 0;
      
      // 모든 요소 순회 (traditional for loop to avoid bundler issues)
      var elements = document.querySelectorAll('*');
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var computed = window.getComputedStyle(el);
        var classList = [];
        for (var j = 0; j < el.classList.length; j++) {
          classList.push(el.classList[j]);
        }
        var selector = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (classList.length ? '.' + classList.join('.') : '');
        
        // 1. 배경색 분석
        var bgColor = computed.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          var hex = rgbToHex(bgColor);
          var isExactBlack = hex === '#000000';
          
          if (isExactBlack) exactBlackCount++;
          
          backgrounds.push({
            selector: selector.substring(0, 100),
            color: bgColor,
            hex: hex,
            isExactBlack: isExactBlack
          });
        }
        
        // 2. 간격 분석 (padding)
        var padding = computed.padding;
        if (padding && padding !== '0px') {
          var pixels = extractPixels(padding.split(' ')[0]);
          var isMultipleOf4 = pixels % 4 === 0 || pixels === 14; // 14px는 예외
          
          if (!isMultipleOf4) invalidSpacingCount++;
          
          spacing.push({
            selector: selector.substring(0, 100),
            property: 'padding',
            value: padding,
            pixels: pixels,
            isMultipleOf4: isMultipleOf4
          });
        }
        
        // 3. 타이포그래피 분석
        var fontSize = parseFloat(computed.fontSize);
        var lineHeight = parseFloat(computed.lineHeight) / fontSize;
        var isHeading = el.tagName.match(/^H[1-6]$/);
        
        if (fontSize > 0) {
          var expectedLineHeight = isHeading ? 1.4 : 1.5;
          var correctLineHeight = Math.abs(lineHeight - expectedLineHeight) < 0.1;
          
          typography.push({
            selector: selector.substring(0, 100),
            fontSize: fontSize,
            lineHeight: lineHeight,
            fontWeight: parseInt(computed.fontWeight),
            isHeading: !!isHeading,
            correctLineHeight: correctLineHeight
          });
        }
        
        // 4. 글래스모피즘 분석
        var backdropFilter = computed.backdropFilter || computed.webkitBackdropFilter;
        if (backdropFilter && backdropFilter !== 'none') {
          glassmorphismCount++;
          glassmorphism.push({
            selector: selector.substring(0, 100),
            backdropFilter: backdropFilter,
            hasBlur: backdropFilter.includes('blur')
          });
        }
        
        // 5. 애니메이션 분석
        var transition = computed.transition;
        if (transition && transition !== 'all 0s ease 0s') {
          var invalidProps = ['width', 'height', 'top', 'left', 'margin', 'padding'];
          var hasInvalidProps = false;
          for (var k = 0; k < invalidProps.length; k++) {
            if (transition.includes(invalidProps[k])) {
              hasInvalidProps = true;
              break;
            }
          }
          
          if (hasInvalidProps) invalidAnimationCount++;
          
          var transitionParts = transition.split(',');
          var properties = [];
          for (var k2 = 0; k2 < transitionParts.length; k2++) {
            properties.push(transitionParts[k2].trim().split(' ')[0]);
          }
          
          animations.push({
            selector: selector.substring(0, 100),
            properties: properties,
            hasInvalidProps: hasInvalidProps
          });
        }
        
        // 6. 버튼 분석
        if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') {
          var height = parseFloat(computed.height);
          var paddingTop = extractPixels(computed.paddingTop);
          var paddingBottom = extractPixels(computed.paddingBottom);
          var paddingLeft = extractPixels(computed.paddingLeft);
          var paddingRight = extractPixels(computed.paddingRight);
          var borderRadius = extractPixels(computed.borderRadius);
          var meetsMinHeight = height >= 48;
          
          if (!meetsMinHeight) smallButtonCount++;
          
          buttons.push({
            selector: selector.substring(0, 100),
            height: height,
            paddingY: (paddingTop + paddingBottom) / 2,
            paddingX: (paddingLeft + paddingRight) / 2,
            borderRadius: borderRadius,
            meetsMinHeight: meetsMinHeight
          });
        }
      }
      
        return {
          backgrounds: backgrounds.slice(0, 50),
          spacing: spacing.slice(0, 50),
          typography: typography.slice(0, 50),
          glassmorphism: glassmorphism,
          animations: animations.slice(0, 20),
          buttons: buttons,
          stats: {
            totalElements: elements.length,
            exactBlackCount: exactBlackCount,
            invalidSpacingCount: invalidSpacingCount,
            glassmorphismCount: glassmorphismCount,
            invalidAnimationCount: invalidAnimationCount,
            smallButtonCount: smallButtonCount
          }
        };
      })();
    `;
    
    return await page.evaluate(scriptString);
  }
  
  /**
   * Generate hash for screenshot (for caching/comparison)
   */
  private generateHash(buffer: Buffer): string {
    return crypto
      .createHash('sha256')
      .update(buffer)
      .digest('hex')
      .substring(0, 16);
  }
  
  /**
   * Compare two screenshots by hash
   */
  areIdentical(screenshot1: Screenshot, screenshot2: Screenshot): boolean {
    return screenshot1.hash === screenshot2.hash;
  }
  
  /**
   * Retry capture with exponential backoff
   */
  async captureWithRetry(
    pageConfig: PageConfig,
    maxRetries = 3
  ): Promise<Screenshot> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.capturePage(pageConfig);
      } catch (error) {
        lastError = error as Error;
        console.warn(`    🔄 Retry ${attempt}/${maxRetries} for ${pageConfig.name}`);
        
        if (attempt < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
        }
      }
    }
    
    throw lastError || new Error('Capture failed after retries');
  }
}
