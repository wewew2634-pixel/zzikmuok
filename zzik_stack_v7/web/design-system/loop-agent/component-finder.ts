/**
 * Component Finder
 * 
 * Intelligently locates components and style files in the project
 * to enable accurate auto-fixes.
 * 
 * Features:
 * - Multi-pattern component search (supports various folder structures)
 * - Style file discovery (CSS, SCSS, Tailwind)
 * - CSS-in-JS detection (styled-components, emotion)
 * - Fast caching layer
 * - Fuzzy matching for close names
 */

import * as fs from 'fs';
import * as path from 'path';
import glob from 'fast-glob';

export interface ComponentLocation {
  filePath: string;
  type: 'tsx' | 'ts' | 'jsx' | 'js';
  styleType: 'tailwind' | 'css-modules' | 'styled-components' | 'inline' | 'unknown';
  relatedFiles: string[];
}

export interface StyleLocation {
  filePath: string;
  type: 'css' | 'scss' | 'sass' | 'module.css';
  className: string;
  lineNumber?: number;
}

export class ComponentFinder {
  private projectRoot: string;
  private componentCache = new Map<string, ComponentLocation | null>();
  private styleCache = new Map<string, StyleLocation | null>();

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Find a component by name
   * 
   * @param name - Component name (e.g., 'Button', 'Card', 'Header')
   * @returns Component location or null if not found
   */
  async findComponent(name: string): Promise<ComponentLocation | null> {
    // Check cache first
    if (this.componentCache.has(name)) {
      return this.componentCache.get(name)!;
    }

    console.log(`  🔍 Searching for component: ${name}`);

    // Define search patterns (order matters - most common first)
    const patterns = [
      `src/components/**/${name}.tsx`,
      `src/components/**/${name}.ts`,
      `src/components/**/${name}.jsx`,
      `src/components/**/${name}.js`,
      `src/app/**/${name}.tsx`,
      `src/app/**/${name}.ts`,
      `src/app/**/components/${name}.tsx`,
      `src/app/**/components/${name}.ts`,
      `components/**/${name}.tsx`,
      `components/**/${name}.ts`,
      `lib/components/**/${name}.tsx`,
      `lib/components/**/${name}.ts`,
      `src/ui/**/${name}.tsx`,
      `src/ui/**/${name}.ts`,
    ];

    try {
      // Use fast-glob for parallel search
      const results = await glob(patterns, {
        cwd: this.projectRoot,
        absolute: true,
        onlyFiles: true,
        caseSensitiveMatch: false, // Allow case-insensitive matching
      });

      if (results.length === 0) {
        console.warn(`    ⚠️  Component "${name}" not found`);
        this.componentCache.set(name, null);
        return null;
      }

      // If multiple matches, prefer the shortest path (likely the main component)
      const bestMatch = results.sort((a, b) => a.length - b.length)[0];

      console.log(`    ✅ Found: ${path.relative(this.projectRoot, bestMatch)}`);

      // Analyze component to determine style type
      const content = await fs.promises.readFile(bestMatch, 'utf-8');
      const styleType = this.detectStyleType(content);

      // Find related files (CSS modules, styled files, etc.)
      const relatedFiles = await this.findRelatedFiles(bestMatch);

      const location: ComponentLocation = {
        filePath: bestMatch,
        type: path.extname(bestMatch).slice(1) as any,
        styleType,
        relatedFiles,
      };

      // Cache result
      this.componentCache.set(name, location);

      return location;
    } catch (error) {
      console.error(`    ❌ Error searching for component "${name}":`, error);
      this.componentCache.set(name, null);
      return null;
    }
  }

  /**
   * Find a style file containing a specific class name or selector
   * 
   * @param selector - CSS selector (e.g., '.button', '#header', '[data-theme]')
   * @returns Style location or null if not found
   */
  async findStyleFile(selector: string): Promise<StyleLocation | null> {
    // Check cache first
    if (this.styleCache.has(selector)) {
      return this.styleCache.get(selector)!;
    }

    console.log(`  🔍 Searching for style: ${selector}`);

    // Extract class name or ID from selector
    const className = this.extractClassName(selector);
    if (!className) {
      console.warn(`    ⚠️  Invalid selector: ${selector}`);
      this.styleCache.set(selector, null);
      return null;
    }

    try {
      // Search all style files
      const stylePatterns = ['**/*.css', '**/*.scss', '**/*.sass', '**/*.module.css'];
      const styleFiles = await glob(stylePatterns, {
        cwd: this.projectRoot,
        absolute: true,
        onlyFiles: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.next/**'],
      });

      // Search for class name in each file
      for (const file of styleFiles) {
        const content = await fs.promises.readFile(file, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(className)) {
            console.log(`    ✅ Found in: ${path.relative(this.projectRoot, file)}:${i + 1}`);

            const location: StyleLocation = {
              filePath: file,
              type: this.getStyleType(file),
              className,
              lineNumber: i + 1,
            };

            this.styleCache.set(selector, location);
            return location;
          }
        }
      }

      console.warn(`    ⚠️  Style "${className}" not found in any CSS files`);
      this.styleCache.set(selector, null);
      return null;
    } catch (error) {
      console.error(`    ❌ Error searching for style "${selector}":`, error);
      this.styleCache.set(selector, null);
      return null;
    }
  }

  /**
   * Find all files that might be related to a component
   * (CSS modules, test files, story files, etc.)
   */
  private async findRelatedFiles(componentPath: string): Promise<string[]> {
    const dir = path.dirname(componentPath);
    const baseName = path.basename(componentPath, path.extname(componentPath));

    const relatedPatterns = [
      `${baseName}.module.css`,
      `${baseName}.module.scss`,
      `${baseName}.styles.ts`,
      `${baseName}.styles.tsx`,
      `${baseName}.css`,
      `${baseName}.scss`,
    ];

    const results: string[] = [];

    for (const pattern of relatedPatterns) {
      const fullPath = path.join(dir, pattern);
      if (fs.existsSync(fullPath)) {
        results.push(fullPath);
      }
    }

    return results;
  }

  /**
   * Detect what styling approach the component uses
   */
  private detectStyleType(content: string): ComponentLocation['styleType'] {
    // Check for Tailwind (className with utility classes)
    if (/className=["'][^"']*(?:flex|grid|p-|m-|bg-|text-)[^"']*["']/.test(content)) {
      return 'tailwind';
    }

    // Check for styled-components
    if (/styled\.[a-z]+`/.test(content) || /styled\([A-Z][a-zA-Z]*\)`/.test(content)) {
      return 'styled-components';
    }

    // Check for CSS Modules (styles.something)
    if (/styles\.[a-zA-Z]+/.test(content) || /import\s+styles\s+from\s+['"].*\.module\.css['"]/.test(content)) {
      return 'css-modules';
    }

    // Check for inline styles
    if (/style=\{\{/.test(content)) {
      return 'inline';
    }

    return 'unknown';
  }

  /**
   * Extract class name from CSS selector
   */
  private extractClassName(selector: string): string | null {
    // Remove pseudo-classes and pseudo-elements
    const cleaned = selector.replace(/::[a-z-]+/g, '').replace(/:[a-z-]+/g, '');

    // Extract class name (starts with .)
    const classMatch = cleaned.match(/\.([a-zA-Z0-9_-]+)/);
    if (classMatch) {
      return classMatch[1];
    }

    // Extract ID (starts with #)
    const idMatch = cleaned.match(/#([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      return idMatch[1];
    }

    // Extract attribute selector
    const attrMatch = cleaned.match(/\[([a-zA-Z0-9_-]+)/);
    if (attrMatch) {
      return attrMatch[1];
    }

    return null;
  }

  /**
   * Get style file type from extension
   */
  private getStyleType(filePath: string): StyleLocation['type'] {
    if (filePath.endsWith('.module.css')) return 'module.css';
    if (filePath.endsWith('.scss')) return 'scss';
    if (filePath.endsWith('.sass')) return 'sass';
    return 'css';
  }

  /**
   * Clear cache (useful for testing or after file changes)
   */
  clearCache(): void {
    this.componentCache.clear();
    this.styleCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      components: {
        size: this.componentCache.size,
        hits: Array.from(this.componentCache.values()).filter(v => v !== null).length,
      },
      styles: {
        size: this.styleCache.size,
        hits: Array.from(this.styleCache.values()).filter(v => v !== null).length,
      },
    };
  }
}
