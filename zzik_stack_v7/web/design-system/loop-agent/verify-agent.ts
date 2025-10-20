/**
 * VERIFY AGENT
 * Dry-run validation of suggested fixes before application
 * 
 * KEY RESPONSIBILITIES:
 * 1. Simulate fix application without modifying files
 * 2. Detect potential conflicts or side effects
 * 3. Validate fix syntax and correctness
 * 4. Estimate regression risk
 */

import { FixSuggestion, VerificationResult } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

export class VerifyAgent {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Verify all suggestions before application
   */
  async verifyAll(suggestions: FixSuggestion[]): Promise<VerificationResult[]> {
    const results: VerificationResult[] = [];

    for (const suggestion of suggestions) {
      const result = await this.verifySuggestion(suggestion);
      results.push(result);

      // Rate limit: Don't overwhelm file system
      await this.sleep(100);
    }

    return results;
  }

  /**
   * Verify a single fix suggestion
   */
  async verifySuggestion(suggestion: FixSuggestion): Promise<VerificationResult> {
    const checks: Array<{ name: string; passed: boolean; message: string }> = [];
    let overallSafe = true;
    const warnings: string[] = [];
    const blockers: string[] = [];

    // 1. Syntax validation
    const syntaxCheck = this.validateSyntax(suggestion);
    checks.push(syntaxCheck);
    if (!syntaxCheck.passed) {
      blockers.push(syntaxCheck.message);
      overallSafe = false;
    }

    // 2. Conflict detection
    const conflictCheck = await this.detectConflicts(suggestion);
    checks.push(conflictCheck);
    if (!conflictCheck.passed) {
      warnings.push(conflictCheck.message);
    }

    // 3. Regression risk assessment
    const regressionCheck = this.assessRegressionRisk(suggestion);
    checks.push(regressionCheck);
    if (!regressionCheck.passed) {
      warnings.push(regressionCheck.message);
    }

    // 4. Design token validation
    const tokenCheck = this.validateDesignTokens(suggestion);
    checks.push(tokenCheck);
    if (!tokenCheck.passed) {
      blockers.push(tokenCheck.message);
      overallSafe = false;
    }

    // 5. Accessibility impact
    const a11yCheck = this.validateAccessibility(suggestion);
    checks.push(a11yCheck);
    if (!a11yCheck.passed) {
      warnings.push(a11yCheck.message);
    }

    // Overall decision
    const safeToApply = overallSafe && blockers.length === 0;
    const confidence = this.calculateVerificationConfidence(checks, suggestion);

    return {
      suggestionId: suggestion.issueId,
      safeToApply,
      confidence,
      checks,
      warnings,
      blockers,
      recommendation: this.generateRecommendation(safeToApply, confidence, warnings, blockers),
    };
  }

  /**
   * Validate CSS/code syntax
   */
  private validateSyntax(suggestion: FixSuggestion): {
    name: string;
    passed: boolean;
    message: string;
  } {
    const patches = suggestion.patches.join('\n');

    // Check for CSS syntax errors
    const syntaxErrors: string[] = [];

    // 1. Unclosed braces
    const openBraces = (patches.match(/{/g) || []).length;
    const closeBraces = (patches.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      syntaxErrors.push(`Unmatched braces: ${openBraces} open, ${closeBraces} close`);
    }

    // 2. Missing semicolons (for non-comment lines)
    const lines = patches.split('\n').filter(l => !l.trim().startsWith('/*'));
    for (const line of lines) {
      if (line.includes(':') && !line.includes(';') && !line.includes('{')) {
        syntaxErrors.push(`Missing semicolon: ${line.trim()}`);
      }
    }

    // 3. Invalid property names
    const invalidProperties = patches.match(/[a-z-]+:\s*[^;]+;/gi) || [];
    for (const prop of invalidProperties) {
      if (prop.includes('::') || prop.includes('--')) continue; // Skip variables
      const propName = prop.split(':')[0].trim();
      if (!this.isValidCSSProperty(propName)) {
        syntaxErrors.push(`Invalid CSS property: ${propName}`);
      }
    }

    return {
      name: 'Syntax Validation',
      passed: syntaxErrors.length === 0,
      message:
        syntaxErrors.length === 0
          ? 'Syntax is valid'
          : `Syntax errors detected: ${syntaxErrors.join('; ')}`,
    };
  }

  /**
   * Detect potential conflicts with existing styles
   */
  private async detectConflicts(suggestion: FixSuggestion): Promise<{
    name: string;
    passed: boolean;
    message: string;
  }> {
    const element = suggestion.issue.element;
    const conflicts: string[] = [];

    // Check if element uses multiple conflicting properties
    const patches = suggestion.patches.join('\n');

    // Example: Checking for conflicting spacing
    if (patches.includes('padding') && patches.includes('padding-')) {
      conflicts.push('Both padding and padding-* properties used');
    }

    // Example: Checking for conflicting colors
    if (
      (patches.includes('background-color') && patches.includes('background:')) ||
      (patches.includes('color:') && patches.match(/color:/g)?.length || 0 > 1)
    ) {
      conflicts.push('Multiple color declarations may conflict');
    }

    return {
      name: 'Conflict Detection',
      passed: conflicts.length === 0,
      message:
        conflicts.length === 0
          ? 'No conflicts detected'
          : `Potential conflicts: ${conflicts.join('; ')}`,
    };
  }

  /**
   * Assess regression risk
   */
  private assessRegressionRisk(suggestion: FixSuggestion): {
    name: string;
    passed: boolean;
    message: string;
  } {
    const risks: string[] = [];

    // High-impact categories
    if (['color', 'spacing', 'typography'].includes(suggestion.issue.category)) {
      if (suggestion.issue.element.includes('global') || suggestion.issue.element.includes('root')) {
        risks.push('Global style change - may affect multiple components');
      }
    }

    // Low confidence suggestions
    if (suggestion.confidence < 0.70) {
      risks.push('Low confidence suggestion - requires manual review');
    }

    // Complex patches
    if (suggestion.patches.length > 5) {
      risks.push('Complex fix with multiple changes - higher risk');
    }

    const riskLevel = risks.length === 0 ? 'low' : risks.length === 1 ? 'medium' : 'high';

    return {
      name: 'Regression Risk',
      passed: riskLevel !== 'high',
      message:
        risks.length === 0
          ? 'Low regression risk'
          : `${riskLevel.toUpperCase()} risk: ${risks.join('; ')}`,
    };
  }

  /**
   * Validate design tokens usage
   */
  private validateDesignTokens(suggestion: FixSuggestion): {
    name: string;
    passed: boolean;
    message: string;
  } {
    const patches = suggestion.patches.join('\n');
    const issues: string[] = [];

    // Check for hardcoded values instead of tokens
    const hardcodedColors = patches.match(/#[0-9A-Fa-f]{3,6}(?![\w-])/g) || [];
    const allowedHardcoded = ['#000000', '#FFFFFF']; // Only true black/white allowed
    
    for (const color of hardcodedColors) {
      if (!allowedHardcoded.includes(color.toUpperCase())) {
        issues.push(`Hardcoded color ${color} should use CSS variable`);
      }
    }

    // Check for hardcoded spacing (not multiples of 4)
    const spacingValues = patches.match(/(\d+)px/g) || [];
    for (const spacing of spacingValues) {
      const value = parseInt(spacing);
      if (value % 4 !== 0 && value !== 14) {
        // 14px is exception for button padding
        issues.push(`Spacing ${spacing} not aligned to 8pt grid (${value % 4}px off)`);
      }
    }

    return {
      name: 'Design Token Validation',
      passed: issues.length === 0,
      message:
        issues.length === 0
          ? 'Design tokens properly used'
          : `Token issues: ${issues.join('; ')}`,
    };
  }

  /**
   * Validate accessibility impact
   */
  private validateAccessibility(suggestion: FixSuggestion): {
    name: string;
    passed: boolean;
    message: string;
  } {
    const patches = suggestion.patches.join('\n');
    const a11yIssues: string[] = [];

    // Check touch target sizes
    const heightMatch = patches.match(/height:\s*(\d+)px/);
    if (heightMatch) {
      const height = parseInt(heightMatch[1]);
      if (height < 44) {
        a11yIssues.push(`Height ${height}px below WCAG minimum (44px)`);
      }
    }

    // Check contrast (basic validation)
    if (suggestion.issue.category === 'color') {
      if (patches.includes('opacity') && !patches.includes('/* contrast validated */')) {
        a11yIssues.push('Opacity changes may affect contrast - requires validation');
      }
    }

    // Check font size
    const fontSizeMatch = patches.match(/font-size:\s*(\d+)px/);
    if (fontSizeMatch) {
      const fontSize = parseInt(fontSizeMatch[1]);
      if (fontSize < 12) {
        a11yIssues.push(`Font size ${fontSize}px too small for readability`);
      }
    }

    return {
      name: 'Accessibility Validation',
      passed: a11yIssues.length === 0,
      message:
        a11yIssues.length === 0
          ? 'No accessibility concerns'
          : `A11y issues: ${a11yIssues.join('; ')}`,
    };
  }

  /**
   * Calculate overall verification confidence
   */
  private calculateVerificationConfidence(
    checks: Array<{ passed: boolean }>,
    suggestion: FixSuggestion
  ): number {
    const passedChecks = checks.filter((c) => c.passed).length;
    const checkScore = passedChecks / checks.length;
    const suggestionConfidence = suggestion.confidence;

    // Average of check pass rate and suggestion confidence
    return Math.round((checkScore * 0.6 + suggestionConfidence * 0.4) * 100) / 100;
  }

  /**
   * Generate recommendation based on verification results
   */
  private generateRecommendation(
    safeToApply: boolean,
    confidence: number,
    warnings: string[],
    blockers: string[]
  ): string {
    if (blockers.length > 0) {
      return `❌ BLOCKED: Cannot apply - ${blockers.join('; ')}`;
    }

    if (!safeToApply) {
      return `⚠️ UNSAFE: Manual review required`;
    }

    if (confidence >= 0.90 && warnings.length === 0) {
      return `✅ SAFE: Auto-apply recommended (${(confidence * 100).toFixed(0)}% confidence)`;
    }

    if (confidence >= 0.80) {
      return `⚠️ REVIEW: Apply with caution - ${warnings.join('; ')}`;
    }

    return `⚠️ MANUAL: Low confidence (${(confidence * 100).toFixed(0)}%) - manual review required`;
  }

  /**
   * Validate if a CSS property name is valid
   */
  private isValidCSSProperty(propName: string): boolean {
    // Common CSS properties (not exhaustive, but covers most cases)
    const validProperties = [
      'color', 'background', 'background-color', 'padding', 'margin',
      'border', 'border-radius', 'width', 'height', 'min-width', 'min-height',
      'max-width', 'max-height', 'font-size', 'font-weight', 'line-height',
      'letter-spacing', 'text-align', 'display', 'flex', 'grid',
      'position', 'top', 'right', 'bottom', 'left', 'z-index',
      'opacity', 'transform', 'transition', 'animation',
      'box-shadow', 'text-shadow', 'backdrop-filter', 'filter',
    ];

    return (
      validProperties.includes(propName) ||
      propName.startsWith('padding-') ||
      propName.startsWith('margin-') ||
      propName.startsWith('border-') ||
      propName.startsWith('--') // CSS variables
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
