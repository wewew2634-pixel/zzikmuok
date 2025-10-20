/**
 * SUGGEST AGENT
 * Generates auto-fix suggestions with confidence scores
 * 
 * KEY RESPONSIBILITIES:
 * 1. Generate fix suggestions for detected issues
 * 2. Calculate confidence scores for auto-fix safety
 * 3. Prioritize fixes by impact and safety
 * 4. Generate CSS/code patches for high-confidence fixes
 */

import { Issue, FixSuggestion, ComparisonResult } from './types';
import OpenAI from 'openai';

export class SuggestAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate fix suggestions for all issues
   */
  async generateSuggestions(
    issues: Issue[],
    comparisonResult: ComparisonResult
  ): Promise<FixSuggestion[]> {
    const suggestions: FixSuggestion[] = [];

    // Group issues by category for batch processing
    const issuesByCategory = this.groupIssuesByCategory(issues);

    for (const [category, categoryIssues] of Object.entries(issuesByCategory)) {
      const categorySuggestions = await this.generateCategorySuggestions(
        category,
        categoryIssues,
        comparisonResult
      );
      suggestions.push(...categorySuggestions);
    }

    // Sort by priority (critical issues + high confidence first)
    return suggestions.sort((a, b) => {
      const priorityA = this.calculatePriority(a);
      const priorityB = this.calculatePriority(b);
      return priorityB - priorityA;
    });
  }

  /**
   * Generate suggestions for a specific category of issues
   */
  private async generateCategorySuggestions(
    category: string,
    issues: Issue[],
    comparisonResult: ComparisonResult
  ): Promise<FixSuggestion[]> {
    const suggestions: FixSuggestion[] = [];

    for (const issue of issues) {
      let suggestion: FixSuggestion;

      // Use rule-based suggestions for high-confidence categories
      if (this.isRuleBasedCategory(category)) {
        suggestion = this.generateRuleBasedSuggestion(issue);
      } else {
        // Use AI for complex issues
        suggestion = await this.generateAISuggestion(issue, comparisonResult);
      }

      suggestions.push(suggestion);
    }

    return suggestions;
  }

  /**
   * Generate rule-based suggestion (high confidence)
   */
  private generateRuleBasedSuggestion(issue: Issue): FixSuggestion {
    const patches: string[] = [];
    let confidence = 0.9;
    let reasoning = '';

    switch (issue.category) {
      case 'color':
        if (issue.actual.includes('#010101') || issue.actual.includes('rgb(1, 1, 1)')) {
          patches.push(`background-color: #000000; /* EXACT TRUE BLACK */`);
          reasoning = 'Linear uses exactly #000000, not near-black colors';
          confidence = 0.95;
        } else if (issue.element.includes('text-')) {
          patches.push(this.generateTextColorFix(issue));
          reasoning = 'Apply Linear text hierarchy colors';
          confidence = 0.90;
        }
        break;

      case 'spacing':
        const fixedValue = this.roundToGrid(this.extractPixelValue(issue.actual));
        patches.push(`/* Original: ${issue.actual} */`);
        patches.push(`padding: ${fixedValue}px; /* 8pt grid aligned */`);
        reasoning = `Rounded to nearest 4px (${fixedValue}px). Linear uses strict 8pt grid.`;
        confidence = 0.92;
        break;

      case 'typography':
        if (issue.element.includes('heading')) {
          patches.push(`line-height: 1.4; /* Headings use tight line-height */`);
          reasoning = 'Linear uses 1.4 for headings, 1.5 for body text';
          confidence = 0.93;
        } else if (issue.element.includes('body')) {
          patches.push(`line-height: 1.5; /* Body uses comfortable line-height */`);
          reasoning = 'Linear uses 1.5 for body text readability';
          confidence = 0.93;
        }
        break;

      case 'button':
        patches.push(`min-height: 48px; /* WCAG minimum touch target */`);
        patches.push(`padding: 14px 24px; /* Visual balance */`);
        patches.push(`border-radius: 12px; /* Linear button radius */`);
        reasoning = 'Linear buttons: 48px height, 14px/24px padding, 12px radius';
        confidence = 0.88;
        break;

      case 'glass':
        patches.push(`/* WARNING: Remove glassmorphism */`);
        patches.push(`background: var(--surface-200); /* Solid surface */`);
        patches.push(`/* backdrop-filter: none; */`);
        reasoning = 'Linear limits glassmorphism to bottom nav only (battery, performance)';
        confidence = 0.85;
        break;

      case 'animation':
        if (issue.actual.includes('width') || issue.actual.includes('height')) {
          patches.push(`/* Change: ${issue.actual} */`);
          patches.push(`transition: opacity 200ms var(--ease-out);`);
          reasoning = 'Linear only animates transform/opacity for 60fps guarantee';
          confidence = 0.90;
        }
        break;

      case 'a11y':
        if (issue.element.includes('touch-target')) {
          patches.push(`min-width: 48px;`);
          patches.push(`min-height: 48px;`);
          reasoning = 'WCAG 2.1 AA requires 44px minimum, Linear uses 48px';
          confidence = 0.95;
        } else if (issue.element.includes('contrast')) {
          patches.push(`color: var(--text-primary); /* 21:1 contrast */`);
          reasoning = 'Linear uses high-contrast text colors (21:1 on true black)';
          confidence = 0.87;
        }
        break;

      default:
        patches.push(`/* Manual review required for: ${issue.category} */`);
        reasoning = 'Complex issue requiring manual analysis';
        confidence = 0.50;
    }

    return {
      issueId: this.generateIssueId(issue),
      issue,
      fixType: confidence >= 0.80 ? 'auto' : 'manual',
      confidence,
      patches,
      reasoning,
      estimatedImpact: this.estimateImpact(issue),
      requiresVerification: confidence < 0.90,
    };
  }

  /**
   * Generate AI-powered suggestion for complex issues
   */
  private async generateAISuggestion(
    issue: Issue,
    comparisonResult: ComparisonResult
  ): Promise<FixSuggestion> {
    const prompt = this.buildAISuggestionPrompt(issue, comparisonResult);

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a design system expert specializing in Linear-style dark themes...',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const aiSuggestion = JSON.parse(response.choices[0].message.content || '{}');

    return {
      issueId: this.generateIssueId(issue),
      issue,
      fixType: aiSuggestion.confidence >= 0.80 ? 'auto' : 'manual',
      confidence: aiSuggestion.confidence || 0.50,
      patches: aiSuggestion.patches || [],
      reasoning: aiSuggestion.reasoning || 'AI-generated suggestion',
      estimatedImpact: aiSuggestion.estimatedImpact || 'medium',
      requiresVerification: true,
    };
  }

  /**
   * Check if category can use rule-based suggestions
   */
  private isRuleBasedCategory(category: string): boolean {
    return ['color', 'spacing', 'typography', 'button', 'glass', 'animation', 'a11y'].includes(
      category
    );
  }

  /**
   * Group issues by category
   */
  private groupIssuesByCategory(issues: Issue[]): Record<string, Issue[]> {
    const grouped: Record<string, Issue[]> = {};
    for (const issue of issues) {
      if (!grouped[issue.category]) {
        grouped[issue.category] = [];
      }
      grouped[issue.category].push(issue);
    }
    return grouped;
  }

  /**
   * Calculate priority score for sorting (0-100)
   */
  private calculatePriority(suggestion: FixSuggestion): number {
    const severityWeight = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10,
    };

    const confidenceWeight = suggestion.confidence * 40;
    const severityScore = severityWeight[suggestion.issue.severity];
    const impactWeight = { high: 20, medium: 10, low: 5 };
    const impactScore = impactWeight[suggestion.estimatedImpact] || 10;

    return severityScore + confidenceWeight + impactScore;
  }

  /**
   * Estimate impact of fixing this issue
   */
  private estimateImpact(issue: Issue): 'high' | 'medium' | 'low' {
    if (issue.severity === 'critical' || issue.severity === 'high') {
      return 'high';
    }
    if (issue.category === 'color' || issue.category === 'a11y') {
      return 'high';
    }
    if (issue.category === 'spacing' || issue.category === 'typography') {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Generate unique issue ID
   */
  private generateIssueId(issue: Issue): string {
    return `${issue.category}-${issue.element}-${Date.now()}`;
  }

  /**
   * Round value to 8pt grid (multiples of 4)
   */
  private roundToGrid(value: number): number {
    return Math.round(value / 4) * 4;
  }

  /**
   * Extract pixel value from string
   */
  private extractPixelValue(str: string): number {
    const match = str.match(/(\d+(\.\d+)?)px/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Generate text color fix
   */
  private generateTextColorFix(issue: Issue): string {
    if (issue.element.includes('primary')) {
      return 'color: var(--text-primary); /* #FFFFFF - 21:1 contrast */';
    } else if (issue.element.includes('secondary')) {
      return 'color: var(--text-secondary); /* rgba(255,255,255,0.7) */';
    } else if (issue.element.includes('muted')) {
      return 'color: var(--text-muted); /* rgba(255,255,255,0.5) */';
    }
    return 'color: var(--text-primary);';
  }

  /**
   * Build AI suggestion prompt
   */
  private buildAISuggestionPrompt(
    issue: Issue,
    comparisonResult: ComparisonResult
  ): string {
    return `
ISSUE:
- Category: ${issue.category}
- Element: ${issue.element}
- Severity: ${issue.severity}
- Expected: ${issue.expected}
- Actual: ${issue.actual}
- Description: ${issue.suggestion}

CONTEXT:
- Current average score: ${comparisonResult.currentAvgScore}
- Trend: ${comparisonResult.trend}
- Similar issues: ${comparisonResult.details.persistingIssues.filter(i => i.category === issue.category).length}

Generate a fix suggestion with:
1. patches: Array of CSS/code changes
2. reasoning: Why this fix aligns with Linear design
3. confidence: Score 0-1 (how safe is auto-fix)
4. estimatedImpact: 'high' | 'medium' | 'low'

Return JSON format.
    `;
  }
}
