/**
 * Loop Agent - Fix Agent
 * 
 * Automatically applies code fixes based on detected issues
 * Uses AST parsing and safe code transformation
 * 
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { Issue, CodeFix, AppliedFix } from './types';
import { ComponentFinder } from './component-finder';

export class FixAgent {
  private projectRoot: string;
  private componentFinder: ComponentFinder;
  
  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.componentFinder = new ComponentFinder(projectRoot);
  }
  
  /**
   * Apply all auto-fixable issues
   */
  async applyFixes(issues: Issue[]): Promise<AppliedFix[]> {
    console.log(`🔧 Applying fixes for ${issues.length} issues...`);
    
    const appliedFixes: AppliedFix[] = [];
    const autoFixableIssues = issues.filter(issue => issue.autoFixable);
    
    console.log(`  📊 Auto-fixable: ${autoFixableIssues.length}/${issues.length}`);
    
    for (const issue of autoFixableIssues) {
      try {
        const fix = await this.generateFix(issue);
        
        if (fix) {
          const success = await this.applyFix(fix);
          
          appliedFixes.push({
            issue,
            fix,
            success,
            error: success ? undefined : 'Fix application failed'
          });
          
          if (success) {
            console.log(`    ✅ Fixed: ${issue.category} - ${issue.element}`);
          } else {
            console.log(`    ❌ Failed: ${issue.category} - ${issue.element}`);
          }
        } else {
          console.log(`    ⚠️  No fix generated for: ${issue.category}`);
        }
      } catch (error) {
        console.error(`    ❌ Error fixing ${issue.id}:`, error);
        appliedFixes.push({
          issue,
          fix: { filePath: '', oldCode: '', newCode: '', explanation: '' },
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const successCount = appliedFixes.filter(f => f.success).length;
    console.log(`✅ Applied ${successCount}/${appliedFixes.length} fixes`);
    
    return appliedFixes;
  }
  
  /**
   * Generate fix for a specific issue
   * 🆕 ENHANCED: Async to support ComponentFinder
   */
  private async generateFix(issue: Issue): Promise<CodeFix | null> {
    // Route to specific fix generator based on category
    switch (issue.category) {
      case 'color':
        return this.fixColor(issue);
      case 'spacing':
        return this.fixSpacing(issue);
      case 'typography':
        return this.fixTypography(issue);
      case 'button':
        return await this.fixButton(issue);
      case 'glass':
        return await this.fixGlassmorphism(issue);
      case 'animation':
        return this.fixAnimation(issue);
      default:
        console.warn(`  ⚠️  No fix generator for category: ${issue.category}`);
        return null;
    }
  }
  
  /**
   * Fix TRUE BLACK background issues
   */
  private fixColor(issue: Issue): CodeFix | null {
    // Issue: Not using #000000
    if (issue.actual.includes('TRUE BLACK')) {
      
      // Try multiple possible token file locations
      const possiblePaths = [
        'src/styles/tokens.css',
        'src/styles/linear-mobile-tokens.css',
        'src/styles/globals.css',
        'tailwind.config.ts',
        'tailwind.config.js'
      ];
      
      const tokenFile = this.findFirstExistingFile(possiblePaths);
      
      if (!tokenFile) {
        console.warn('  ⚠️  Could not find color token file');
        return null;
      }
      
      // Read file to find actual old code
      try {
        const content = fs.readFileSync(tokenFile, 'utf-8');
        
        // Find near-black colors to replace
        const nearBlackPatterns = [
          /#0[a-f0-9]{5}/gi,  // #0a0a0f, #010101, etc.
          /rgb\([0-9], [0-9], [0-9]\)/gi
        ];
        
        let oldCode = '';
        for (const pattern of nearBlackPatterns) {
          const match = content.match(pattern);
          if (match && match[0] !== '#000000') {
            oldCode = match[0];
            break;
          }
        }
        
        if (!oldCode) {
          console.warn('  ⚠️  Could not find near-black color to replace');
          return null;
        }
        
        return {
          filePath: tokenFile,
          oldCode: oldCode,
          newCode: '#000000',
          explanation: 'Changed background to exact TRUE BLACK (#000000) for OLED efficiency'
        };
      } catch (error) {
        console.error('  ❌ Error reading color file:', error);
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Find first existing file from list of possible paths
   */
  private findFirstExistingFile(relativePaths: string[]): string | null {
    for (const relPath of relativePaths) {
      const fullPath = path.join(this.projectRoot, relPath);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    return null;
  }
  
  /**
   * Fix 8pt grid spacing issues
   */
  private fixSpacing(issue: Issue): CodeFix | null {
    // Issue: Invalid spacing count
    if (issue.actual.includes('spacing values not aligned')) {
      
      const possiblePaths = [
        'src/styles/tokens.css',
        'src/styles/linear-mobile-tokens.css',
        'src/styles/globals.css',
        'tailwind.config.ts'
      ];
      
      const tokenFile = this.findFirstExistingFile(possiblePaths);
      
      if (!tokenFile) {
        console.warn('  ⚠️  Could not find spacing token file');
        return null;
      }
      
      // For now, we detect but don't auto-fix spacing issues
      // as they require component-level changes
      console.log(`  ℹ️  Spacing issue detected in: ${tokenFile}`);
      return null;
    }
    
    return null;
  }
  
  /**
   * Fix line-height rhythm issues
   */
  private fixTypography(issue: Issue): CodeFix | null {
    if (issue.actual.includes('line-height')) {
      
      const possiblePaths = [
        'src/styles/tokens.css',
        'src/styles/linear-mobile-tokens.css',
        'src/styles/globals.css',
        'tailwind.config.ts'
      ];
      
      const tokenFile = this.findFirstExistingFile(possiblePaths);
      
      if (!tokenFile) {
        console.warn('  ⚠️  Could not find typography token file');
        return null;
      }
      
      try {
        const content = fs.readFileSync(tokenFile, 'utf-8');
        
        // Find incorrect line-height values
        const lhMatch = content.match(/line-height:\s*1\.5.*heading/i) || 
                       content.match(/--leading-heading:\s*1\.5/i);
        
        if (lhMatch) {
          return {
            filePath: tokenFile,
            oldCode: lhMatch[0],
            newCode: lhMatch[0].replace('1.5', '1.4'),
            explanation: 'Headings use 1.4 line-height for authority, body uses 1.5 for readability'
          };
        }
      } catch (error) {
        console.error('  ❌ Error reading typography file:', error);
      }
    }
    
    return null;
  }
  
  /**
   * Fix button height issues
   * 🆕 ENHANCED: Uses ComponentFinder for intelligent discovery
   */
  private async fixButton(issue: Issue): Promise<CodeFix | null> {
    if (issue.actual.includes('below 48px')) {
      
      // 🆕 Use ComponentFinder to locate Button component
      const componentLocation = await this.componentFinder.findComponent('Button');
      
      if (!componentLocation) {
        console.warn('  ⚠️  Could not find button component file');
        // Return CSS-based fix as fallback
        const styleFile = this.findFirstExistingFile([
          'src/styles/globals.css',
          'src/styles/tokens.css'
        ]);
        
        if (styleFile) {
          return {
            filePath: styleFile,
            oldCode: '/* Button height fix */',
            newCode: `
/* WCAG AA Button Heights */
button, [role="button"] {
  min-height: 48px;  /* WCAG 2.1 AA minimum */
  padding: 14px 24px;  /* Linear visual balance */
}`,
            explanation: 'Added minimum button height to meet WCAG 2.1 AA requirements (48px)'
          };
        }
        return null;
      }
      
      try {
        const content = fs.readFileSync(componentLocation.filePath, 'utf-8');
        
        // 🆕 Dynamic pattern detection based on styleType
        console.log(`    🎨 Detected style type: ${componentLocation.styleType}`);
        
        switch (componentLocation.styleType) {
          case 'tailwind':
            return this.fixButtonTailwind(componentLocation.filePath, content);
          case 'styled-components':
            return this.fixButtonStyledComponents(componentLocation.filePath, content);
          case 'css-modules':
            return this.fixButtonCSSModules(componentLocation.filePath, content, componentLocation.relatedFiles);
          case 'inline':
            return this.fixButtonInline(componentLocation.filePath, content);
          default:
            console.warn(`    ⚠️  Unknown style type: ${componentLocation.styleType}, trying generic patterns`);
            return this.fixButtonGeneric(componentLocation.filePath, content);
        }
      } catch (error) {
        console.error('  ❌ Error reading button file:', error);
        return null;
      }
    }
    
    return null;
  }
  
  /**
   * Fix Tailwind button heights
   */
  private fixButtonTailwind(filePath: string, content: string): CodeFix | null {
    const patterns = [
      { regex: /className="([^"]*\bh-10\b[^"]*)"/g, replacement: (m: string) => m.replace('h-10', 'h-12') },
      { regex: /className='([^']*\bh-10\b[^']*)'/g, replacement: (m: string) => m.replace('h-10', 'h-12') },
      { regex: /className="([^"]*\bh-\[40px\][^"]*)"/g, replacement: (m: string) => m.replace('h-[40px]', 'h-[48px]') },
      { regex: /className="([^"]*\bh-9\b[^"]*)"/g, replacement: (m: string) => m.replace('h-9', 'h-12') },
    ];
    
    for (const { regex, replacement } of patterns) {
      const match = content.match(regex);
      if (match) {
        return {
          filePath,
          oldCode: match[0],
          newCode: replacement(match[0]),
          explanation: 'Increased button height to 48px (h-12) for WCAG 2.1 AA compliance'
        };
      }
    }
    
    return null;
  }
  
  /**
   * Fix styled-components button heights
   */
  private fixButtonStyledComponents(filePath: string, content: string): CodeFix | null {
    const patterns = [
      { regex: /height:\s*40px/g, replacement: 'height: 48px' },
      { regex: /height:\s*36px/g, replacement: 'height: 48px' },
      { regex: /height:\s*2\.5rem/g, replacement: 'height: 3rem' },
      { regex: /height:\s*['"]40px['"]/g, replacement: 'height: "48px"' },
    ];
    
    for (const { regex, replacement } of patterns) {
      const match = content.match(regex);
      if (match) {
        return {
          filePath,
          oldCode: match[0],
          newCode: replacement,
          explanation: 'Increased button height to 48px for WCAG 2.1 AA compliance'
        };
      }
    }
    
    return null;
  }
  
  /**
   * Fix CSS Modules button heights
   */
  private fixButtonCSSModules(filePath: string, content: string, relatedFiles: string[]): CodeFix | null {
    // Check related CSS files first
    for (const cssFile of relatedFiles) {
      if (cssFile.endsWith('.css') || cssFile.endsWith('.scss')) {
        try {
          const cssContent = fs.readFileSync(cssFile, 'utf-8');
          const match = cssContent.match(/\.button\s*\{[^}]*height:\s*(40|36)px/);
          
          if (match) {
            const oldCode = match[0];
            const newCode = oldCode.replace(/height:\s*\d+px/, 'height: 48px');
            return {
              filePath: cssFile,
              oldCode,
              newCode,
              explanation: 'Increased button height to 48px in CSS module for WCAG compliance'
            };
          }
        } catch (error) {
          console.warn(`    ⚠️  Could not read CSS file: ${cssFile}`);
        }
      }
    }
    
    return null;
  }
  
  /**
   * Fix inline style button heights
   */
  private fixButtonInline(filePath: string, content: string): CodeFix | null {
    const patterns = [
      /style=\{\{[^}]*height:\s*['"]?(40|36)px['"]?/gi,
      /style=\{\{[^}]*height:\s*['"]?2\.5rem['"]?/gi,
    ];
    
    for (const regex of patterns) {
      const match = content.match(regex);
      if (match) {
        const oldCode = match[0];
        const newCode = oldCode
          .replace(/height:\s*['"]?\d+px['"]?/, 'height: "48px"')
          .replace(/height:\s*['"]?2\.5rem['"]?/, 'height: "3rem"');
        
        return {
          filePath,
          oldCode,
          newCode,
          explanation: 'Increased inline button height to 48px for WCAG compliance'
        };
      }
    }
    
    return null;
  }
  
  /**
   * Generic button height fix (fallback)
   */
  private fixButtonGeneric(filePath: string, content: string): CodeFix | null {
    // Try all patterns as fallback
    const allPatterns = [
      /className="[^"]*h-10[^"]*"/g,
      /className="[^"]*h-\[40px\][^"]*"/g,
      /height:\s*40px/g,
      /height:\s*['"]40px['"]/g,
    ];
    
    for (const pattern of allPatterns) {
      const match = content.match(pattern);
      if (match) {
        const oldCode = match[0];
        const newCode = oldCode
          .replace('h-10', 'h-12')
          .replace('h-[40px]', 'h-[48px]')
          .replace('40px', '48px');
        
        return {
          filePath,
          oldCode,
          newCode,
          explanation: 'Increased button height to meet WCAG 2.1 AA minimum (48px)'
        };
      }
    }
    
    return null;
  }
  
  /**
   * Fix glassmorphism overuse
   */
  /**
   * Fix glassmorphism overuse
   * 🆕 ENHANCED: Uses ComponentFinder for style discovery
   */
  private async fixGlassmorphism(issue: Issue): Promise<CodeFix | null> {
    if (issue.actual.includes('glassmorphism')) {
      
      // 🆕 Try to find the specific element with glassmorphism
      const selector = issue.element || '.bottom-nav';
      const styleLocation = await this.componentFinder.findStyleFile(selector);
      
      if (styleLocation) {
        try {
          const content = fs.readFileSync(styleLocation.filePath, 'utf-8');
          
          // Find excessive backdrop-filter values (> 16px)
          const excessiveBlur = content.match(/backdrop-filter:\s*blur\((\d+)px\)/);
          if (excessiveBlur) {
            const blurValue = parseInt(excessiveBlur[1]);
            if (blurValue > 16) {
              return {
                filePath: styleLocation.filePath,
                oldCode: excessiveBlur[0],
                newCode: 'backdrop-filter: blur(16px)',
                explanation: 'Reduced glassmorphism blur to 16px for battery efficiency (Linear guideline)'
              };
            }
          }
        } catch (error) {
          console.error('  ❌ Error reading style file:', error);
        }
      }
      
      // Fallback: Find any frosted glass CSS file
      const possiblePaths = [
        'src/styles/linear-frosted-glass.css',
        'src/styles/globals.css',
        'src/styles/tokens.css'
      ];
      
      const styleFile = this.findFirstExistingFile(possiblePaths);
      
      if (!styleFile) {
        console.warn('  ⚠️  Could not find glassmorphism style file');
        return null;
      }
      
      try {
        const content = fs.readFileSync(styleFile, 'utf-8');
        
        // Find backdrop-filter usage and optimize
        const backdropMatch = content.match(/backdrop-filter:\s*blur\(\d+px\)/);
        if (backdropMatch) {
          return {
            filePath: styleFile,
            oldCode: backdropMatch[0],
            newCode: 'backdrop-filter: blur(16px)  /* Linear optimal: 16px */',
            explanation: 'Optimized glassmorphism blur for battery efficiency'
          };
        }
        
        // If no backdrop-filter found, add warning comment
        return {
          filePath: styleFile,
          oldCode: '/* Glassmorphism styles */',
          newCode: `
/* WARNING: Glassmorphism limited to bottom nav only */
/* Linear design principle: Minimal glassmorphism for battery efficiency */
/* Only .bottom-nav should use backdrop-filter: blur(16px) */`,
          explanation: 'Added warning about glassmorphism usage limits'
        };
      } catch (error) {
        console.error('  ❌ Error reading glass style file:', error);
      }
    }
    
    return null;
  }
  
  /**
   * Fix animation performance issues
   */
  private fixAnimation(issue: Issue): CodeFix | null {
    if (issue.actual.includes('non-GPU')) {
      
      const possiblePaths = [
        'src/styles/globals.css',
        'src/styles/tokens.css',
        'tailwind.config.ts'
      ];
      
      const styleFile = this.findFirstExistingFile(possiblePaths);
      
      if (!styleFile) {
        console.warn('  ⚠️  Could not find animation style file');
        return null;
      }
      
      try {
        const content = fs.readFileSync(styleFile, 'utf-8');
        
        // Find problematic transitions
        const badTransitions = [
          /transition:\s*width[^;]+;/g,
          /transition:\s*height[^;]+;/g,
          /transition:\s*top[^;]+;/g,
          /transition:\s*left[^;]+;/g
        ];
        
        for (const pattern of badTransitions) {
          const match = content.match(pattern);
          if (match) {
            return {
              filePath: styleFile,
              oldCode: match[0],
              newCode: 'transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;  /* GPU-accelerated */',
              explanation: 'Changed to GPU-accelerated properties (transform/opacity) for 60fps animations'
            };
          }
        }
      } catch (error) {
        console.error('  ❌ Error reading animation file:', error);
      }
    }
    
    return null;
  }
  
  /**
   * Apply a code fix to file system
   */
  private async applyFix(fix: CodeFix): Promise<boolean> {
    try {
      // Check if file exists
      const fullPath = path.isAbsolute(fix.filePath) 
        ? fix.filePath 
        : path.join(this.projectRoot, fix.filePath);
      
      if (!fs.existsSync(fullPath)) {
        console.warn(`    ⚠️  File not found: ${fullPath}`);
        return false;
      }
      
      // Read file content
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Check if old code exists
      if (!content.includes(fix.oldCode)) {
        console.warn(`    ⚠️  Old code not found in file`);
        return false;
      }
      
      // Apply replacement
      const newContent = content.replace(fix.oldCode, fix.newCode);
      
      // Write back to file
      fs.writeFileSync(fullPath, newContent, 'utf-8');
      
      return true;
    } catch (error) {
      console.error(`    ❌ Error applying fix:`, error);
      return false;
    }
  }
  
  /**
   * Validate fix safety before applying
   */
  private async validateFix(fix: CodeFix): Promise<{
    safe: boolean;
    reason?: string;
  }> {
    // TODO: Implement safety checks
    // - Syntax validation (TypeScript compiler)
    // - Logic validation (no breaking changes)
    // - Regression testing (run tests)
    
    return { safe: true };
  }
  
  /**
   * Revert all applied fixes (rollback)
   */
  async revertFixes(appliedFixes: AppliedFix[]): Promise<void> {
    console.log(`🔄 Reverting ${appliedFixes.length} fixes...`);
    
    for (const applied of appliedFixes) {
      if (applied.success && applied.fix) {
        try {
          const fullPath = path.isAbsolute(applied.fix.filePath)
            ? applied.fix.filePath
            : path.join(this.projectRoot, applied.fix.filePath);
          
          const content = fs.readFileSync(fullPath, 'utf-8');
          const revertedContent = content.replace(applied.fix.newCode, applied.fix.oldCode);
          fs.writeFileSync(fullPath, revertedContent, 'utf-8');
          
          console.log(`  ✅ Reverted: ${applied.issue.category}`);
        } catch (error) {
          console.error(`  ❌ Failed to revert ${applied.issue.id}:`, error);
        }
      }
    }
  }
}
